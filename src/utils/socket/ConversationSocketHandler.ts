import { BaseSocketHandler, SocketCallback } from "./BaseSocketHandler";
import store from "@/redux/Store";
import { socket } from "@/redux/Reducer/SocketSlice";
import SendChatHelper from "@/utils/helpers/SendChatHelper";
import { client } from "@/graphql/provider/authLink";
import { SendNewChatMessage } from "@/graphql/room";
import { socketConnect } from "./SocketConnection";
import { conversations } from "@/schemas/schema";
import uuid from "react-native-uuid";
import { storage as mmkvStorage } from "@/redux/backup/mmkv";
import { keys } from "@/redux/backup/keys";


type ConversationCallback<T = any> = SocketCallback<T>;

type chatdata = {
    roomId: string;
    type: string;
    message?: string;
    fileURL?: string;
    isForwarded?: boolean;
    fontStyle?: string;
    thumbnail?: string;
    duration?: number;
    sender?: string;
    created_at?: number;
    updated_at?: number;
    data?: {
        sender?: string;
        type?: string;
    };
};

const getCurrentUserId = (): string => {
    const reduxUserId = store.getState().Chat.MyProfile?._id;
    const payloadUser = (() => {
        try {
            const rawUser = mmkvStorage.getString(keys.user);
            return rawUser ? JSON.parse(rawUser)?._id : undefined;
        } catch {
            return undefined;
        }
    })();
    const storedUserId = mmkvStorage.getString(keys.userId);
    return String(reduxUserId ?? storedUserId ?? payloadUser ?? "");
};

/**
 * All available event types for conversation socket events
 */
export enum ConversationEventType {
    SEND_CHAT = "sendChat",
    DELETE_CHAT = "deleteChat",
    FORWARD_CHAT = "forwardChat",
    SET_CHAT_READ = "setChatReadBy",
    SET_CHAT_DELIVERED = "setChatDelivered",
    GET_CHATS_BY_ROOM_ID = "getChatsByRoomId",
    SEARCH_CHATS_BY_ROOM_ID = "searchChatsByRoomId",
    DELIVERED_CHAT = "onDeliveredChat",
    MARK_SEEN = "MarkSeen",
    NEW_MESSAGE = "newMessage",
    CLEAR_ALL_CHAT = "clearAllChat",
    PIN_MESSAGE = "pinMessage",
    MESSAGE = "message",
    GET_PIN_CHATS = "getPinChats",
    GET_FAVOURITE_CHATS = "getFavoritesInRoom"
}

export class ConversationSocketHandler extends BaseSocketHandler {
    private conversationCallbacks: Map<string, Set<ConversationCallback>> =
        new Map();

    constructor() {
        super();
    }

    protected async handleMessage(type: string, data: any): Promise<void> {
        const callbacks = this.conversationCallbacks.get(type);
        const parsedData = typeof data === "string" ? JSON.parse(data) : data;

        // If server confirms a locally-created message, remove it from outbox.
        if (type === ConversationEventType.SEND_CHAT) {
            const localId = String((parsedData as any)?.id_local ?? (parsedData as any)?.local_Id ?? "");
            if (localId.length > 0) {
                this.consumeOutboxByLocalId(localId);
            }
        }

        if (callbacks) {
            callbacks.forEach((callback) => callback(parsedData));
        }
    }

    private static readonly OUTBOX_KEY = "chat_outbox_v1";

    private loadOutbox(): any[] {
        try {
            const raw = mmkvStorage.getString(ConversationSocketHandler.OUTBOX_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    private saveOutbox(items: any[]): void {
        try {
            mmkvStorage.set(ConversationSocketHandler.OUTBOX_KEY, JSON.stringify(items));
        } catch (e) {
            console.error("Failed to save outbox:", e);
        }
    }

    private enqueueOutbox(item: any): void {
        const outbox = this.loadOutbox();
        const existingIndex = outbox.findIndex((i) => i?.id_local === item?.id_local);
        if (existingIndex !== -1) {
            outbox[existingIndex] = { ...outbox[existingIndex], ...item };
        } else {
            outbox.push(item);
        }
        this.saveOutbox(outbox);
    }

    private consumeOutboxByLocalId(idLocal: string): void {
        if (!idLocal) return;
        const outbox = this.loadOutbox();
        const next = outbox.filter((i) => String(i?.id_local) !== String(idLocal));
        if (next.length !== outbox.length) {
            this.saveOutbox(next);
        }
    }

    public async flushOutbox(): Promise<void> {
        const outbox = this.loadOutbox();
        if (outbox.length === 0) return;

        const status = socketConnect.getConnectionStatus();
        if (status !== "connected") {
            if (status === "connecting") return;
            try {
                await socketConnect.connect();
            } catch {
                return;
            }
        }

        const now = Date.now();
        const updated: any[] = [];
        for (const item of outbox) {
            try {
                if (!item?.payload) continue;
                const attempts = typeof item?.attempts === "number" ? item.attempts : 0;
                if (attempts >= 12) {
                    const idLocal = String(item?.id_local ?? item?.payload?.data?.id_local ?? "");
                    if (idLocal.length > 0) {
                        socketConnect.dispatchLocalMessage("updateMessage", {
                            _id: idLocal,
                            id_local: idLocal,
                            isSent: false,
                            sendFailed: true,
                            updated_at: Date.now(),
                        });
                    }
                    continue;
                }
                const lastAttemptAt = typeof item?.last_attempt_at === "number" ? item.last_attempt_at : 0;
                if (lastAttemptAt > 0 && now - lastAttemptAt < 5000) {
                    updated.push(item);
                    continue;
                }

                await socketConnect.emit(ConversationEventType.SEND_CHAT as any, item.payload as any);
                updated.push({
                    ...item,
                    last_attempt_at: now,
                    attempts: (typeof item?.attempts === "number" ? item.attempts : 0) + 1,
                });
            } catch (e) {
                updated.push(item);
            }
        }
        this.saveOutbox(updated);
    }

    public failOutboxForRoom(roomId: string): void {
        if (!roomId) return;
        const outbox = this.loadOutbox();
        const remaining: any[] = [];
        for (const item of outbox) {
            const itemRoomId = item?.roomId ?? item?.payload?.data?.roomId;
            if (String(itemRoomId) === String(roomId)) {
                const idLocal = String(item?.id_local ?? item?.payload?.data?.id_local ?? "");
                if (idLocal.length > 0) {
                    socketConnect.dispatchLocalMessage("updateMessage", {
                        _id: idLocal,
                        id_local: idLocal,
                        isSent: false,
                        sendFailed: true,
                        updated_at: Date.now(),
                    });
                }
            } else {
                remaining.push(item);
            }
        }
        this.saveOutbox(remaining);
    }

    // Message Actions
    public onSendChat(
        callback: ConversationCallback<{
            roomId: string;
            type: string;
            message?: string;
            fileURL?: string;
            isForwarded?: boolean;
            fontStyle?: string;
            thumbnail?: string;
            duration?: number;
        }>
    ): () => void {
        return this.addCallback(ConversationEventType.SEND_CHAT, callback);
    }

    public async sendChat(data: chatdata): Promise<void> {
        const userId = String((data as any)?.data?.sender ?? getCurrentUserId());
        if (!userId) throw new Error("User not logged in");

        try {
            const messageType = (data as any)?.data?.type;
            const hasServerMessageId =
                Boolean((data as any)?.data?.server_id) ||
                Boolean((data as any)?.data?._id);
            const isLoadingMedia =
                typeof messageType === "string" && messageType.startsWith("LOADING/");
            const isOptimisticType =
                messageType === "text" ||
                messageType === "poll" ||
                messageType === "contact" ||
                messageType === "IMAGE" ||
                messageType === "VIDEO" ||
                messageType === "DOCUMENT" ||
                messageType === "AUDIO" ||
                isLoadingMedia;

            if (
                !hasServerMessageId &&
                isOptimisticType
            ) {
                const idLocal =
                    typeof (data as any)?.data?.id_local === "string" && (data as any).data.id_local.length > 0
                        ? (data as any).data.id_local
                        : String(uuid.v4());

                const now = Date.now();
                (data as any).data = { ...(data as any).data, id_local: idLocal };

                const optimisticMessage = {
                    roomId: (data as any)?.data?.roomId ?? "",
                    type: (data as any)?.data?.type ?? "text",
                    message: (data as any)?.data?.message ?? "",
                    fileURL: (data as any)?.data?.fileURL ?? "",
                    isForwarded: Boolean((data as any)?.data?.isForwarded),
                    fontStyle: (data as any)?.data?.fontStyle ?? "",
                    thumbnail: (data as any)?.data?.thumbnail ?? "",
                    duration: Number((data as any)?.data?.duration ?? 0),
                    reply_msg: (data as any)?.reply_msg ?? null,
                    _id: idLocal,
                    id_local: idLocal,
                    local_Id: idLocal,
                    sender: userId,
                    created_at: now,
                    updated_at: now,
                    isSent: false,
                    __local: true,
                    deleted: [],
                    delivered_to: [],
                    read_by: [],
                    favourite_by: [],
                    downloadBy: [],
                    PinBy: [],
                };

                // Optimistic UI: show message immediately (even offline).
                socketConnect.dispatchLocalMessage(ConversationEventType.SEND_CHAT, optimisticMessage);

                const payload = {
                    ...data,
                    data: {
                        ...data.data,
                        sender: userId,
                        id_local: idLocal,
                    },
                };

                if (socketConnect.getConnectionStatus() !== "connected") {
                    // Keep a local retry copy, then try to send immediately if the socket can reconnect.
                    this.enqueueOutbox({
                        id_local: idLocal,
                        roomId: payload?.data?.roomId,
                        created_at: now,
                        payload,
                    });
                    await this.flushOutbox();
                    return;
                }

                await socketConnect.emit(ConversationEventType.SEND_CHAT as any, payload as any);
                await socketConnect.emit("GetAllRooms" as any, undefined as any);
            }
        } catch (err) {
            console.error("sendChat error:", err);

            const failedIdLocal = (data as any)?.data?.id_local;
            if (typeof failedIdLocal === "string" && failedIdLocal.length > 0) {
                socketConnect.dispatchLocalMessage("updateMessage", {
                    _id: failedIdLocal,
                    id_local: failedIdLocal,
                    isSent: false,
                    sendFailed: true,
                    updated_at: Date.now(),
                });
            }

            // Best effort: keep it in outbox so it can be retried.
            try {
                const idLocal =
                    typeof (data as any)?.data?.id_local === "string" && (data as any).data.id_local.length > 0
                        ? (data as any).data.id_local
                        : String(uuid.v4());
                const payload = {
                    ...data,
                    data: {
                        ...(data as any).data,
                        id_local: idLocal,
                    },
                };
                this.enqueueOutbox({
                    id_local: idLocal,
                    roomId: payload?.data?.roomId,
                    created_at: Date.now(),
                    payload,
                });
            } catch { }
            return;
        }
    }

    public async saveBackgroundMessage(data: chatdata): Promise<void> {
        const userId = store.getState().Chat.MyProfile?._id;
        if (!userId) throw new Error("User not logged in");

        try {
            // Create message locally
            const payload = {
                ...data,
                sender: data?.data?.sender ?? userId,
                created_at: data?.created_at ?? Date.now(),
                updated_at: data?.updated_at ?? Date.now(),
                isSend: true,
            };

            // Return instead of creating in conversation service
            if (
                !data?.data?.sender &&
                (data?.data?.type === "text" ||
                    data?.data?.type === "poll" ||
                    data?.data?.type === "contact")
            ) {
                // No need to access response._raw.id since we're not creating in service
            }
        } catch (err) {
            console.error("sendChat error:", err);
            throw err;
        }
    }

    public async updateMessage(messageId: string, payload: any): Promise<any> {
        const userId = store.getState().Chat.MyProfile?._id;
        if (!userId) throw new Error("User not logged in");
        try {
            // Return empty result since service is removed
            return {};
        } catch (err) {
            console.log("updateMessage err: ", err);
            throw err;
        }
    }

    public async getMessageByServerId(messageId: string): Promise<any> {
        const userId = store.getState().Chat.MyProfile?._id;
        if (!userId) throw new Error("User not logged in");
        try {
            // Return empty result since service is removed
            return {};
        } catch (err) {
            console.log("updateMessage err: ", err);
            throw err;
        }
    }

    public async updateMessageByServerId(
        messageId: Array<string>,
        payloads: any
    ): Promise<any> {
        try {
            // Return empty result since service is removed
            return {};
        } catch (err) {
            console.log("updateMessage err: ", err);
            throw err;
        }
    }

    public async updateMessageDeliveryAndReadStatus(data: {
        delivered_to: Array<{
            __typename?: string;
            user_id: string;
            delivered_at: number;
            messageId: string;
        }>;
        read_by: Array<{
            __typename?: string;
            user_id: string;
            read_at: number;
            messageId: string;
        }>;
    }): Promise<void> {
        try {
            // Process delivery status updates and read status updates removed
            // since conversationService is no longer available
        } catch (err) {
            console.error("updateMessageDeliveryAndReadStatus err: ", err);
            throw err;
        }
    }

    public async updateDeliveryStatus(
        serverId: string,
        userId: string
    ): Promise<void> {
        try {
            // Functionality removed since conversationService is no longer available
        } catch (err) {
            console.error("Update delivery status error:", err);
            throw err;
        }
    }

    public async favoriteChat(roomId: string, messageId: string): Promise<void> {
        const userId = store.getState().Chat.MyProfile?._id;
        if (!userId) throw new Error("User not logged in");
        // conversationService removed
    }

    public onForwardChat(
        callback: ConversationCallback<{
            roomId: string;
            messageIds: string[];
        }>
    ): () => void {
        return this.addCallback(ConversationEventType.FORWARD_CHAT, callback);
    }

    public async forwardChat(
        roomId: string,
        messageIds: string[]
    ): Promise<void> {
        // conversationService removed
        socketConnect.emit(ConversationEventType.FORWARD_CHAT, {
            roomId,
            messageIds,
        });
    }

    public onDeleteChat(
        callback: ConversationCallback<{
            roomId: string;
            messageId: string;
        }>
    ): () => void {
        return this.addCallback(ConversationEventType.DELETE_CHAT, callback);
    }

    public async deleteChat({
        type,
        cause,
        roomId,
        messageId,
    }: any): Promise<void> {
        const userId = store.getState().Chat.MyProfile?._id;
        // conversationService removed
        // await socketConnect.emit("deleteChat", { roomId, messageId });
    }

    public async clearAllChat({ roomId }: any): Promise<void> {
        const userId = store.getState().Chat.MyProfile?._id;

        // conversationService removed
        // socketConnect.emit("clearAllChat", { roomId, userId });
    }

    public async pinMessage(roomId: any, messageId: any): Promise<void> {
        const userId = store.getState().Chat.MyProfile?._id;

        // conversationService removed
        // socketConnect.emit("clearAllChat", { roomId, userId });
    }

    // Message Status
    public onSetChatReadBy(
        callback: ConversationCallback<{
            roomId: string;
            messageIds: string[];
        }>
    ): () => void {
        return this.addCallback(ConversationEventType.SET_CHAT_READ, callback);
    }

    public async markMessagesRead(
        roomId: string,
        messageIds: string[]
    ): Promise<void> {
        const userId = store.getState().Chat.MyProfile?._id;
        if (!userId) return;
        // conversationService removed
        socketConnect.emit(ConversationEventType.SET_CHAT_READ, {
            roomId,
            messageIds: messageIds,
        });
    }

    public onSetChatDelivered(
        callback: ConversationCallback<{
            roomId: string;
            messageId: string;
        }>
    ): () => void {
        return this.addCallback(ConversationEventType.SET_CHAT_DELIVERED, callback);
    }

    public async markMessageDelivered(
        roomId: string,
        messageId: string
    ): Promise<void> {
        const userId = store.getState().Chat.MyProfile?._id;
        if (!userId) return;
        // conversationService removed
        socketConnect.emit(ConversationEventType.SET_CHAT_DELIVERED, {
            roomId,
            messageId,
        });
    }

    // Message Queries
    public onGetChatsByRoomId(
        callback: ConversationCallback<string>
    ): () => void {
        return this.addCallback(
            ConversationEventType.GET_CHATS_BY_ROOM_ID,
            callback
        );
    }

    public async getChatsByRoomId(roomId: string): Promise<any> {
        // conversationService removed
        socketConnect.emit(ConversationEventType.GET_CHATS_BY_ROOM_ID, roomId);
        return [];
    }

    public async getFavoriteChat(roomId: string, userId: string): Promise<any> {
        if (!userId) return [];
        // conversationService removed
        return [];
    }

    public onSearchChatsByRoomId(
        callback: ConversationCallback<{
            roomId: string;
            query: string;
        }>
    ): () => void {
        return this.addCallback(
            ConversationEventType.SEARCH_CHATS_BY_ROOM_ID,
            callback
        );
    }

    /**
     * Search for messages in a specific room with pagination
     * @param roomId The ID of the room to search messages in
     * @param _id The user's ID
     * @param input The search query string
     * @param skip Number of records to skip for pagination
     * @param limit Maximum number of records to return
     * @returns Promise with search results
     */
    public searchChatsByRoomId(
        roomId: string,
        _id: string,
        input: string,
        skip: number = 0,
        limit: number = 20
    ): Promise<any> {
        if (!roomId || !_id) {
            console.warn("Missing required parameters for chat search");
            return Promise.resolve([]);
        }

        console.log(`Searching for "${input}" in room ${roomId} (skip: ${skip}, limit: ${limit})`);

        return new Promise((resolve, reject) => {
            try {
                // Create a wrapper callback that will be called only once and then remove itself
                const oneTimeCallback = (data: any) => {
                    // Call with the search results
                    console.log(`Received search results for "${input}"`);
                    resolve(data || []);

                    // Immediately unsubscribe after receiving data
                    if (unsubscribe) {
                        unsubscribe();
                        console.log(`Listener closed for search: "${input}"`);
                    }

                    // Also clear the timeout since we got our response
                    clearTimeout(timeoutId);
                };

                // Register the one-time callback
                const unsubscribe = this.addSocketCallback(
                    ConversationEventType.SEARCH_CHATS_BY_ROOM_ID,
                    this.conversationCallbacks,
                    oneTimeCallback
                );

                // Set up timeout to avoid hanging if server doesn't respond
                const timeoutId = setTimeout(() => {
                    if (unsubscribe) {
                        unsubscribe();
                        console.log(`Search timeout for "${input}" in room ${roomId}`);
                    }
                    reject(new Error('Search request timed out after 15 seconds'));
                }, 15000);

                // Create search payload
                const searchPayload = {
                    roomId,
                    _id,
                    input,
                    skip,
                    limit
                };

                // Send the search request
                socketConnect.emit(ConversationEventType.SEARCH_CHATS_BY_ROOM_ID, searchPayload);
            } catch (error) {
                reject(error instanceof Error ? error : new Error('Unknown error during search'));
            }
        });
    }

    public onDeliveredChat(
        callback: ConversationCallback<{
            roomId: string;
            query: string;
        }>
    ): () => void {
        return this.addSocketCallback(
            ConversationEventType.DELIVERED_CHAT,
            this.conversationCallbacks,
            callback
        );
    }

    public onMarkSeen(
        callback: ConversationCallback<{
            roomId: string;
            query: string;
        }>
    ): () => void {
        return this.addSocketCallback(
            ConversationEventType.MARK_SEEN,
            this.conversationCallbacks,
            callback
        );
    }

    public onMessage(
        callback: ConversationCallback<{
            type: string;
            msg: any;
        }>
    ): () => void {
        // Add to socket callbacks
        const socketCallback = this.addSocketCallback(
            ConversationEventType.MESSAGE,
            this.conversationCallbacks,
            callback
        );

        // Add to message handlers
        const messageHandler = (type: string, data: any) => {
            try {
                callback({ type, msg: data });
            } catch (error) {
                console.error(`Error in onMessage callback for type ${type}:`, error);
            }
        };
        socketConnect.addMessageHandler(messageHandler);

        // Return cleanup function
        return () => {
            socketCallback();
            socketConnect.removeMessageHandler(messageHandler);
        };
    }

    public onNewMessage(
        callback: ConversationCallback<{
            roomId: string;
            messageId: string;
        }>
    ) {
        const oneTimeCallback = (data: any) => {
            callback(data);
        };
        const unsubscribe = this.addSocketCallback(
            ConversationEventType.NEW_MESSAGE,
            this.conversationCallbacks,
            oneTimeCallback
        );

        return unsubscribe;
    }

    /**
     * Helper method specifically for React hooks integration
     * @param type Event type to subscribe to
     * @param callback Function to call when the event occurs
     * @example
     * // Usage in a React component:
     * useEffect(() => {
     *   const unsubscribe = socketManager.conversation.useConversationEvent(
     *     ConversationEventType.NEW_MESSAGE,
     *     (data) => {
     *       console.log('New message received:', data);
     *     }
     *   );
     *
     *   return unsubscribe;
     * }, []);
     */
    public useConversationEvent<T>(
        type: ConversationEventType,
        callback: ConversationCallback<T>
    ): () => void {
        return this.useSocketEvent(type, this.conversationCallbacks, callback);
    }

    private addCallback<T>(
        type: string,
        callback: ConversationCallback<T>
    ): () => void {
        return this.addSocketCallback(type, this.conversationCallbacks, callback);
    }

    /**
     * Register message event handlers with built-in logic for processing
     * This method sets up automatic handling of delivery status and read receipts
     *
     * @param fetchRoomsCallback Callback function to refresh rooms after handling
     */
    public registerMessageHandlers(fetchRoomsCallback: () => void): void {
        // Setup internal handlers that will be called when events are received
        this.setupDeliveryHandler(fetchRoomsCallback);
        this.setupReadReceiptHandler(fetchRoomsCallback);
        this.setupNewMessageHandler(fetchRoomsCallback);
    }

    /**
     * Setup automatic handling of message delivery status events
     * @private
     */
    private setupDeliveryHandler(refreshRooms: () => void): () => void {
        return this.onDeliveredChat(async (data: any) => {
            try {
                await this.updateDeliveryStatus(data?.cid, data?.delivered_to?.user_id);
                // Refresh rooms data to reflect the updated delivery status
                refreshRooms();
            } catch (error) {
                console.error("Error handling message delivery status:", error);
            }
        });
    }

    /**
     * Setup automatic handling of message read receipt events
     * @private
     */
    private setupReadReceiptHandler(refreshRooms: () => void): () => void {
        return this.onMarkSeen(async (data: any) => {
            try {
                const messageIds = Array.isArray(data.cid) ? data.cid : [data.cid];
                await this.updateMessageByServerId(messageIds, {
                    user_id: data.data.user_id,
                    read_at: data.data.read_at,
                });
                // Refresh rooms data to reflect the updated read status
                refreshRooms();
            } catch (error) {
                console.error("Error handling message read status:", error);
            }
        });
    }

    /**
     * Setup automatic handling of new message events
     * @private
     */
    private setupNewMessageHandler(refreshRooms: () => void): () => void {
        return this.onNewMessage(async (data: any) => {
            if (data.type !== "newMessage") return;

            try {
                // Parse the message data
                const newMessage = JSON.parse(data.msg?.message || "{}");
                const userId = store.getState().Chat.MyProfile?._id;
                const isSelf = newMessage?.sender === userId;

                // Create message payload
                const payload = {
                    data: {
                        roomId: newMessage?.roomId,
                        type: newMessage?.type,
                        fileURL: newMessage?.fileURL ?? "",
                        isForwarded: false,
                        message: newMessage?.message ?? "",
                        fontStyle: "",
                        thumbnail: newMessage.thumbnail ?? "",
                        duration: newMessage.duration ?? 0,
                        sender: newMessage?.sender,
                        isSent: isSelf && !newMessage?.id_local ? true : false,
                        server_id: newMessage?._id,
                    },
                    reply_msg: newMessage?.reply_msg?.cid
                        ? newMessage?.reply_msg?.cid
                        : null,
                };

                if (!isSelf || newMessage?.refId) {
                    await this.sendChat(payload);
                    return;
                }

                if (isSelf && !newMessage?.id_local) {
                    await this.sendChat(payload);
                    return;
                }

                if (isSelf) {
                    this.socket.emit("setChatDelivered", {
                        roomId: newMessage?.roomId,
                        cid: newMessage?._id,
                    });

                    await this.updateMessage(newMessage?.id_local, {
                        isSent: true,
                        server_id: newMessage?._id,
                    });
                }

                // Refresh rooms data to show the new message
                refreshRooms();
            } catch (error) {
                console.error("Error handling new message:", error);
            }
        });
    }



    /**
     * Get pinned messages for a specific room
     * @param roomId The ID of the room to get pinned messages for
     * @param callback Function to call with the pinned messages when received
     * @returns Cleanup function to unsubscribe
     */
    public getPinChats(
        roomId: string,
        callback: (data: any) => void
    ): () => void {
        if (!roomId) {
            console.warn("Missing roomId for getPinChats");
            callback([]);
            return () => { };
        }

        console.log(`Fetching pinned messages for room ${roomId}`);

        // Create a wrapper callback that will be called only once and then remove itself
        const oneTimeCallback = (data: any) => {
            // Call the original callback with the pinned messages
            console.log(`Received pinned messages for room ${roomId}`);
            callback(data || []);

            // Immediately unsubscribe after receiving data
            if (unsubscribe) {
                unsubscribe();
                console.log(`Listener closed for pinned messages in room ${roomId}`);
            }

            // Clear timeout since we got our response
            clearTimeout(timeoutId);
        };

        // Register the one-time callback
        const unsubscribe = this.addSocketCallback(
            ConversationEventType.GET_PIN_CHATS,
            this.conversationCallbacks,
            oneTimeCallback
        );

        // Set up timeout to avoid hanging if server doesn't respond
        const timeoutId = setTimeout(() => {
            if (unsubscribe) {
                unsubscribe();
                console.log(`Timeout while fetching pinned messages for room ${roomId}`);
            }
            // Call the callback with an empty array in case of timeout
            callback([]);
        }, 15000);

        // Send the request for pinned messages
        socketConnect.emit(ConversationEventType.GET_PIN_CHATS, {
            roomId
        });

        // Return the unsubscribe function
        return unsubscribe;
    }

    /**
     * Get favorite messages for a specific room
     * @param roomId The ID of the room to get favorite messages for
     * @param callback Function to call with the favorite messages when received
     * @param skip Number of records to skip for pagination
     * @param limit Maximum number of records to return
     * @returns Cleanup function to unsubscribe
     */
    public getFavouriteChats(
        roomId: string,
        callback: (data: any) => void,
        skip: number = 0,
        limit: number = 20
    ) {
        if (!roomId) {
            console.warn("Missing roomId for getFavouriteChats");
            callback([]);
            return () => { };
        }

        console.log(`Fetching favorite messages for room ${roomId} (skip: ${skip}, limit: ${limit})`);

        // Create a timeout to handle case where server doesn't respond
        const timeoutId = setTimeout(() => {
            console.log(`Timeout while fetching favorite messages for room ${roomId}`);
            callback({ messages: [], totalPages: 0 }); // Return empty data on timeout
        }, 10000);

        // Emit the event and receive response directly in the callback parameter
        socketConnect.emit(
            ConversationEventType.GET_FAVOURITE_CHATS,
            {
                roomId,
                skip,
                limit
            },
            // Handle the direct response from server in the callback
            (data: any) => {
                console.log(`Received favorite messages for room ${roomId}`);
                clearTimeout(timeoutId);
                callback(data || { messages: [], totalPages: 0 });
            }
        );
    }
}
