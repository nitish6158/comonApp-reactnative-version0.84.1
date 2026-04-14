import { call } from './../../schemas/schema';
import { getSession } from "../session";
import { SOCKET_URL } from "@Service/provider/endpoints";
import io, { Socket } from "socket.io-client";
import store, { RootState } from "../../redux/Store";
import ToastMessage from "@/utils/ToastMesage";

interface ChatEvents {
  // Chat Message Events
  sendChat: (data: {
    roomId: string;
    type: string;
    message?: string;
    fileURL?: string;
    isForwarded?: boolean;
    fontStyle?: string;
    thumbnail?: string;
    duration?: number;
  }) => void;
  sendBroadcastChat: (data: {
    roomId: string;
    type: string;
    message?: string;
    fileURL?: string;
  }) => void;
  forwardChat: (data: { roomId: string; messageIds: string[] }) => void;
  messageSent: (response: { id: string; status: string }) => void;

  // Chat Room Events
  connectToRoom: (roomId: string) => void;
  createRoom: (data: {
    name: string;
    type: string;
    participants: string[];
  }) => void;
  joinRoom: (data: { roomId: string; userId: string }) => void;
  deleteRoom: (roomId: string) => void;
  undeleteRoom: (roomId: string) => void;
  blockRoom: (roomId: string) => void;
  unblockRoom: (roomId: string) => void;

  // Room Settings Events
  setRoomName: (data: { roomId: string; name: string }) => void;
  setRoomDescription: (data: { roomId: string; description: string }) => void;
  setRoomPicture: (data: { roomId: string; imageURL: string }) => void;
  changeRoomPermission: (data: { roomId: string; permission: string }) => void;
  updateRoomAdmin: (data: {
    roomId: string;
    userId: string;
    isAdmin: boolean;
  }) => void;

  // Room Status Events
  archiveRoom: (roomId: string) => void;
  unArchiveRoom: (roomId: string) => void;
  muteRoom: (data: { roomId: string; duration?: number }) => void;
  unmuteRoom: (roomId: string) => void;
  fixRoom: (roomId: string) => void;
  unfixRoom: (roomId: string) => void;

  // Message Actions
  pinChat: (data: { roomId: string; messageId: string }) => void;
  unpinChat: (data: { roomId: string; messageId: string }) => void;
  deleteChat: (data: { roomId: string; messageId: string }) => void;
  clearAllChats: (roomId: string) => void;

  // Message Status
  setChatReadBy: (data: { roomId: string; messageIds: string[] }) => void;
  setChatDelivered: (data: { roomId: string; messageId: string }) => void;
  markRoomUnread: (roomId: string) => void;

  // Favorites
  addChatsToFavourite: (data: { messageIds: string[] }) => void;
  removeChatsFromFavourite: (data: { messageIds: string[] }) => void;
  getFavouriteChats: () => void;

  // Folders
  createFolder: (data: { name: string; roomIds?: string[] }) => void;
  editFolder: (data: { folderId: string; name: string }) => void;
  deleteFolder: (folderId: string) => void;
  addRoomToFolder: (data: { folderId: string; roomId: string }) => void;
  deleteRoomFromFolder: (data: { folderId: string; roomId: string }) => void;
  reArrangeFolder: (data: {
    folders: Array<{ id: string; order: number }>;
  }) => void;

  // Queries
  getChatsByRoomId: (roomId: string) => void;
  searchChatsByRoomId: (data: { roomId: string; query: string }) => void;
  getBlockedContact: () => void;
  getRoomInComon: (userId: string) => void;
  getPinChats: (roomId: string) => void;
  getUserMediaByRoomId: (roomId: string) => void;
  getChatReadBy: (messageId: string) => void;

  // Media Settings
  setCameraRoll: (data: { roomId: string; enabled: boolean }) => void;
  changeRoomWallpaper: (data: {
    roomId: string;
    wallpaper: string;
    opacity?: number;
  }) => void;
  changeNotificationSound: (data: { roomId: string; sound: string }) => void;

  // Disappearing Messages
  setChatDisappeared: (data: { roomId: string; duration: number }) => void;
  removeDisappearedChats: (roomId: string) => void;

  // User Status
  changeUserStatus: (status: string) => void;
  sendStatusToAUser: (data: { userId: string; status: string }) => void;

  // Organization
  connectMyOrganizations: () => void;
  GetParentChildOrganizations: () => void;

  // Others
  getProfile: () => void;
  getFrequentRooms: () => void;
  setBio: (bio: string) => void;
  GetAllRooms: () => void;
  GetRoomById: (roomId: string) => void;
  findUsersByContacts: (contacts: string[]) => void;
  setDownloadMediaChat: (data: { messageId: string; deviceId: string }) => void;
  exportChatsByRoomId: (roomId: string) => void;
  exportFavouriteChats: () => void;
  shareContact: (data: { roomId: string; contactIds: string[] }) => void;
  removeUserFromRoom: (data: { roomId: string; userId: string }) => void;
  reportRoom: (data: { roomId: string; reason: string }) => void;
  sendNotify: (data: { userId: string; message: string }) => void;
  getRemindersById: (userId: string) => void;
  SCREENSHARE: (data: any) => void;

  voipFailed: {
    userId: string;
    msg: any;
  };
  invited: {
    msg: any;
  };
  logout: void;
}

type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error";

type SocketEventCallback = (...args: any[]) => void;

type ReconnectConfig = {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
};

type MessageHandler = (type: keyof ChatEvents, data: any) => void;

class SocketConnection {
  private static instance: SocketConnection;
  private socket: Socket | null = null;
  public connectionStatus: ConnectionStatus = "disconnected";
  private eventCallbacks: Map<string, Set<SocketEventCallback>> = new Map();
  private connectionPromise: Promise<Socket> | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000;
  private backoffMultiplier: number = 1.5;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private manuallyDisconnected: boolean = false;
  private static readonly CONNECTION_TIMEOUT = 10000;
  private static readonly RECONNECT_DELAY_MAX = 30000;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();

  constructor() {
    this.setupReconnectConfig({
      maxRetries: 5,
      retryDelay: 5000,
      backoffMultiplier: 1.5,
    });
  }

  public static getInstance(): SocketConnection {
    if (!SocketConnection.instance) {
      SocketConnection.instance = new SocketConnection();
    }
    return SocketConnection.instance;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public getReduxStore(type: keyof RootState): RootState[keyof RootState] {
    return store.getState()[type];
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  public setupReconnectConfig(config: ReconnectConfig): void {
    if (config.maxRetries !== undefined)
      this.maxReconnectAttempts = config.maxRetries;
    if (config.retryDelay !== undefined)
      this.reconnectDelay = config.retryDelay;
    if (config.backoffMultiplier !== undefined)
      this.backoffMultiplier = config.backoffMultiplier;
  }

  private async handleDisconnect(reason: string): Promise<void> {
    this.connectionStatus = "disconnected";
    console.log(`Socket disconnected: ${reason}`);

    if (this.manuallyDisconnected) {
      console.log("Manual disconnect - not attempting reconnection");
      return;
    }

    // Add a small delay before first reconnection attempt
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await this.attemptReconnect();
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      this.connectionStatus = "error";
      // Wait for a longer period before resetting attempts
      setTimeout(() => {
        console.log("Resetting reconnection attempts after timeout");
        this.reconnectAttempts = 0;
        this.attemptReconnect();
      }, SocketConnection.RECONNECT_DELAY_MAX);
      return;
    }

    const delay = Math.min(
      this.reconnectDelay *
      Math.pow(this.backoffMultiplier, this.reconnectAttempts),
      SocketConnection.RECONNECT_DELAY_MAX
    );

    console.log(
      `Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts + 1
      }/${this.maxReconnectAttempts})`
    );

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    return new Promise((resolve) => {
      this.reconnectTimer = setTimeout(async () => {
        try {
          this.reconnectAttempts++;
          await this.reconnect();
          resolve();
        } catch (error) {
          console.error("Reconnection attempt failed:", error);
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            await this.attemptReconnect();
          }
          resolve();
        }
      }, delay);
    });
  }

  private async reconnect(): Promise<void> {
    try {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }

      const socket = await this.connect();
      if (socket.connected) {
        console.log("Reconnection successful");
        this.reconnectAttempts = 0;
        this.reattachEventListeners();
      }
    } catch (error) {
      console.error("Reconnection failed:", error);
      throw error;
    }
  }

  private reattachEventListeners(): void {
    if (!this.socket) return;

    // Clear all existing listeners first
    this.eventCallbacks.forEach((_, event) => {
      this.socket!.removeAllListeners(event);
    });

    // Reattach stored event listeners
    this.eventCallbacks.forEach((callbacks, event) => {
      callbacks.forEach((callback) => {
        this.socket!.on(event, callback);
      });

      // Debug log
      console.log(`Reattached ${callbacks.size} listeners for event ${event}`);
    });
  }

  public async connect(): Promise<Socket> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.socket?.connected) {
      return this.socket;
    }

    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        const { token } = await getSession();
        if (!token) {
          throw new Error("No token found for socket connection");
        }

        const Remote = `${SOCKET_URL}${token}`;
        this.connectionStatus = "connecting";

        // Clear any existing timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
        }

        // Set connection timeout
        this.connectionTimeout = setTimeout(() => {
          if (this.socket && !this.socket.connected) {
            console.log("Connection attempt timed out");
            this.socket.close();
            reject(new Error("Connection timeout"));
          }
        }, SocketConnection.CONNECTION_TIMEOUT);

        this.socket = io(Remote, {
          path: "",
          forceNew: true,
          reconnectionAttempts: 0,
          timeout: SocketConnection.CONNECTION_TIMEOUT,
          transports: ["polling"],
          upgrade: true,
          rememberUpgrade: true,
          autoConnect: true,
          reconnection: false, // We'll handle reconnection ourselves
          query: {
            timeout: SocketConnection.CONNECTION_TIMEOUT,
          },
        });

        this.setupBaseListeners();

        this.socket.on("connect", () => {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
          }
          this.connectionStatus = "connected";
          this.connectionPromise = null;
          this.reconnectAttempts = 0;
          this.manuallyDisconnected = false;
          console.log("Socket connected successfully");
          resolve(this.socket!);
        });

        this.socket.on("connect_error", (error) => {
          console.error("Connection error:", error);
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
          }
          this.connectionStatus = "error";
          this.connectionPromise = null;
          reject(error);
        });
      } catch (error) {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
        }
        this.connectionStatus = "error";
        this.connectionPromise = null;
        console.error("Socket connection error", error);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private setupBaseListeners() {
    if (!this.socket) return;
    // console.log("Setting up base listeners");

    // Single message listener that handles all events
    this.socket.on("message", (data: { type: keyof ChatEvents; msg?: any }) => {
      // console.log(`Received message of type: ${data.type}`);
      this.messageHandlers.forEach((handler) => {
        try {
          handler(data.type, data.msg);
        } catch (error) {
          console.error(
            `Error in message handler for type ${data.type}:`,
            error
          );
        }
      });
    });

    this.socket.on("newMessage", (data: { type: keyof ChatEvents; msg?: any }) => {
      this.messageHandlers.forEach((handler) => {
        try {
          handler(data.type, data.msg);
        } catch (error) {
          console.error(
            `Error in message handler for type ${data.type}:`,
            error
          );
        }
      });

    });

    this.socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      // Only attempt reconnect for certain disconnect reasons

      this.handleDisconnect(reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      // Trigger reconnection on connection error
      if (!this.manuallyDisconnected) {
        this.handleDisconnect("connect_error");
      }
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`Socket reconnection attempt ${attemptNumber}`);
      this.connectionStatus = "connecting";
    });

    this.socket.on("reconnect_failed", () => {
      console.log("Socket reconnection failed");
      this.connectionStatus = "error";
      // Trigger our custom reconnection logic
      if (!this.manuallyDisconnected) {
        this.attemptReconnect();
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      this.connectionStatus = "connected";
      this.reconnectAttempts = 0;
    });

    this.socket.on("error", (error: any) => {
      console.error("Socket error:", error);
      const errorType = error?.type;
      const errorMessage = error?.msg || error?.message;
      if (errorType === "sendChat" && typeof errorMessage === "string") {
        const msg = errorMessage.toLowerCase();
        if (msg.includes("not allowed")) {
          ToastMessage("You can no longer send messages in this chat.");
        } else if (msg.includes("unauthorized")) {
          ToastMessage("You are no longer a participant in this group.");
        }
      }

      // Server emits many domain-level errors on the "error" event (e.g. permission checks).
      // Do not treat these as transport disconnects.
    });
  }

  public async emit<T extends keyof ChatEvents>(
    eventName: T,
    data: Parameters<ChatEvents[T]>[0],
    callback?: (response: any) => void
  ): Promise<void> {
    try {
      const socket = await this.ensureConnection();
      socket.emit(eventName, data, (response: any) => {
        if (callback) {
          callback(response);
        }
      });
    } catch (error) {
      console.error(`Error emitting ${eventName}:`, error);
      throw error;
    }
  }

  public addMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.add(handler);
  }

  public removeMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.delete(handler);
  }

  public dispatchLocalMessage(type: string, msg: any): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(type, msg);
      } catch (error) {
        console.error(`Error in local message handler for type ${type}:`, error);
      }
    });
  }

  private async ensureConnection(): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }
    return this.connect();
  }

  public disconnect(): void {
    this.manuallyDisconnected = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus = "disconnected";
      this.connectionPromise = null;
      console.log("Socket manually disconnected");
    }
  }

  public getListeners(): Map<string, Set<SocketEventCallback>> {
    return this.eventCallbacks;
  }

  public removeListeners(type: string): void {
    this.eventCallbacks.delete(type);
    if (this.socket) {
      console.log(`Removing listeners for event: ${this.socket.hasListeners(type)}`, type);
      this.socket.removeAllListeners(type);
      this.socket.off(type);
    }
  }

  public async forceReconnect(): Promise<void> {
    this.manuallyDisconnected = false;
    this.reconnectAttempts = 0;
    if (this.socket?.connected) {
      this.socket.disconnect();
    }
    await this.reconnect();
  }
}

export const socketConnect = SocketConnection.getInstance();
