import { BaseSocketHandler, SocketCallback } from "./BaseSocketHandler";
import { AllChatRooms, ArchiveRoomsAtom } from "@Atoms/allRoomsAtom";
import { produce } from "immer";
import { SetStateAction } from "jotai";
import _ from "lodash";
import { createStorage } from "@/utils/mmkvStorage";

type RoomCallback<T = any> = SocketCallback<T>;
type SetAtom<T> = (update: SetStateAction<T>) => void;

export const CHATlIST = createStorage();

/**
 * All available event types for chat room socket events
 */
export enum ChatRoomEventType {
  CREATE_ROOM = "createRoom",
  JOIN_ROOM = "joinRoom",
  SET_ROOM_NAME = "setRoomName",
  SET_ROOM_DESCRIPTION = "setRoomDescription",
  SET_ROOM_PICTURE = "setRoomPicture",
  ARCHIVE_ROOM = "archiveRoom",
  UNARCHIVE_ROOM = "unArchiveRoom",
  MUTE_ROOM = "muteRoom",
  UNMUTE_ROOM = "unmuteRoom",
  DELETE_ROOM = "deleteRoom",
  UNDELETE_ROOM = "undeleteRoom",
  BLOCK_ROOM = "blockRoom",
  UNBLOCK_ROOM = "unblockRoom",
  GET_ALL_ROOMS = "GetAllFormattedRooms",
  GET_ROOM_BY_ID = "GetRoomById",
  GET_FREQUENT_ROOMS = "getFrequentRooms",
  GET_FORMATTED_ROOM = "GetFormattedRoomById",
  GET_CHATMESSAGE_BY_DAYS = "getChatMeesagesByDays",
  GET_ACTIVE_GROUP_CALLS = 'getActiveGroupCalls'
}

export class ChatRoomSocketHandler extends BaseSocketHandler {
  private roomCallbacks: Map<string, Set<RoomCallback>> = new Map();
  private currentUserId: string | null = null;
  private roomStorage = createStorage({ id: 'chatrooms' });

  constructor() {
    super();
  }

  // public async fetchAndUpdateRooms(callback: RoomCallback) {
  //   // Create a wrapper callback that will be called only once and then remove itself
  //   const oneTimeCallback = (data: any) => {
  //     // Call the original callback with the data
  //     console.log(`Received all rooms: ${data}`);
  //     callback(data);

  //     // Immediately unsubscribe after receiving data
  //     if (unsubscribe) {
  //       unsubscribe();
  //       console.log(`Listener closed to get all rooms`);
  //     }
  //   };

  //   // Register the one-time callback
  //   const unsubscribe = this.addSocketCallback(
  //     ChatRoomEventType.GET_ALL_ROOMS,
  //     this.roomCallbacks,
  //     oneTimeCallback
  //   );

  //   // Emit the event to request room data
  //   await this.socket.emit(ChatRoomEventType.GET_ALL_ROOMS, {});

  //   return unsubscribe;
  // }

  public async fetchAndUpdateRooms(callback: RoomCallback) {

    const oneTimeCallback = (data: any) => {
      if (unsubscribe) {
        unsubscribe();
        console.log(`Listener closed to get all rooms`);
      }
      // const updatedRooms = JSON.parse(JSON.stringify(data.rooms)); // deep copy

      // console.log("Updated rooms (deep clone):", updatedRooms);
      // callback({rooms: updatedRooms});
      callback({ rooms: [...data.rooms] }); // shallow copy 
      // callback({ ...data, rooms: updatedRooms });
    };

    const unsubscribe = this.addSocketCallback(
      ChatRoomEventType.GET_ALL_ROOMS,
      this.roomCallbacks,
      oneTimeCallback
    );

    await this.socket.emit(ChatRoomEventType.GET_ALL_ROOMS, {});
    return unsubscribe;
  }

  protected async handleMessage(type: string, data: any): Promise<void> {
    const callbacks = this.roomCallbacks.get(type);
    const parsedData = typeof data === "string" ? JSON.parse(data) : data;

    // Handle caching in MMKV storage instead of using services
    try {
      switch (type) {
        case ChatRoomEventType.CREATE_ROOM:
          this.cacheRoom(parsedData);
          break;
        case ChatRoomEventType.JOIN_ROOM:
          // Cache updated room data if available
          if (parsedData && parsedData.room) {
            this.cacheRoom(parsedData.room);
          }
          break;
        case ChatRoomEventType.SET_ROOM_NAME:
          // Update cached room name
          this.updateRoomName(parsedData.roomId, parsedData.name);
          break;
        case ChatRoomEventType.DELETE_ROOM:
          this.removeRoom(parsedData);
          break;
      }
    } catch (error) {
      console.error(`Error handling ${type} in ChatRoomSocketHandler:`, error);
    }
    if (callbacks) {
      // Then notify all callbacks
      callbacks.forEach((callback) => callback(parsedData));
    }
  }

  // MMKV helper methods for room data caching
  private cacheRoom(room: any) {
    if (room && (room._id || room.id)) {
      const roomId = room._id || room.id;
      this.roomStorage.set(`room_${roomId}`, JSON.stringify(room));
    }
  }

  private updateRoomName(roomId: string, name: string) {
    const roomData = this.roomStorage.getString(`room_${roomId}`);
    if (roomData) {
      const room = JSON.parse(roomData);
      room.name = name;
      this.roomStorage.set(`room_${roomId}`, JSON.stringify(room));
    }
  }

  private removeRoom(roomId: string) {
    this.roomStorage.delete(`room_${roomId}`);
  }

  // Room Creation & Joining
  public onCreateRoom(
    callback: RoomCallback<{
      name: string;
      type: string;
      participants: string[];
    }>
  ): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.CREATE_ROOM,
      this.roomCallbacks,
      callback
    );
  }

  public async createRoom(data: {
    name: string;
    type: string;
    participants: string[];
  }): Promise<void> {
    // Emit to socket directly without service
    await this.socket.emit(ChatRoomEventType.CREATE_ROOM, data);
  }

  public async getFormattedRoomById(roomId: string, callback: RoomCallback) {
    // Create a wrapper callback that will be called only once and then remove itself
    const oneTimeCallback = (data: any) => {
      // Call the original callback with the data
      callback(data);

      // Immediately unsubscribe after receiving data
      if (unsubscribe) {
        unsubscribe();
        console.log(`Listener closed for room: ${roomId}`);
      }
    };

    // Register the one-time callback
    const unsubscribe = this.addSocketCallback(
      "GetFormattedRoomById",
      this.roomCallbacks,
      oneTimeCallback
    );

    // Emit the event to request room data
    await this.socket.emit("GetFormattedRoomById", { roomId });

    return unsubscribe;
  }

  public async getChatMeesagesByDays(
    roomId: string,
    page: number,
    messagesPerPage: number,
    callback: RoomCallback
  ) {
    const oneTimeCallback = (data: any) => {
      callback(data);
      if (unsubscribe) {
        unsubscribe();
        console.log(`Listener closed for room: ${roomId}`);
      }
    };

    const unsubscribe = this.addSocketCallback(
      "getChatMeesagesByDays",
      this.roomCallbacks,
      oneTimeCallback
    );

    await this.socket.emit("getChatMeesagesByDays", {
      roomId,
      page,
      messagesPerPage,
    });
    return unsubscribe;
  }

  public async getActiveContacts(callback: RoomCallback) {
    // Create a wrapper callback that will be called only once and then remove itself
    const oneTimeCallback = (data: any) => {
      // Call the original callback with the data
      callback(data);

      // Immediately unsubscribe after receiving data
      if (unsubscribe) {
        unsubscribe();
        // console.log(`Active contacts listener closed`);
      }
    };

    // Register the one-time callback
    const unsubscribe = this.addSocketCallback(
      "getActiveContacts",
      this.roomCallbacks,
      oneTimeCallback
    );

    // Emit the event to request active contacts
    await this.socket.emit("getActiveContacts", {});

    return unsubscribe;
  }

  public async getActiveGroupCalls(callback: RoomCallback) {
    await this.socket.emit(ChatRoomEventType.GET_ACTIVE_GROUP_CALLS, {}, callback);
  }

  public async addFolder(data) {
    await this.socket.emit("createFolder", data);
  }
  public async deleteFolder(data) {
    await this.socket.emit("deleteFolder", data);
  }
  public async editFolder(data) {
    await this.socket.emit("editFolder", data);
  }

  public async addParticioants(
    payload: { roomId: string; user_type: string; users: any[] },
    callback: RoomCallback
  ) {
    // Create a wrapper callback that will be called only once and then remove itself
    const oneTimeCallback = (data: any) => {
      // Call the original callback with the data
      callback(data);

      // Immediately unsubscribe after receiving data
      if (unsubscribe) {
        unsubscribe();
        // console.log(`Active contacts listener closed`);
      }
    };

    // Register the one-time callback
    const unsubscribe = this.addSocketCallback(
      "joinRoom",
      this.roomCallbacks,
      oneTimeCallback
    );

    // Emit the event to request active contacts
    await this.socket.emit("joinRoom", payload);

    return unsubscribe;
  }

  public onJoinRoom(
    callback: RoomCallback<{ roomId: string; userId: string }>
  ): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.JOIN_ROOM,
      this.roomCallbacks,
      callback
    );
  }

  public async joinRoom(roomId: string, userId: string): Promise<void> {
    // Send to socket directly without service
    await this.socket.emit(ChatRoomEventType.JOIN_ROOM, { roomId, userId });
  }

  // Room Settings
  public onSetRoomName(
    callback: RoomCallback<{ roomId: string; name: string }>
  ): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.SET_ROOM_NAME,
      this.roomCallbacks,
      callback
    );
  }

  public async setRoomName(roomId: string, name: string): Promise<void> {
    // Update the room name in cache
    this.updateRoomName(roomId, name);
    // Send to socket
    await this.socket.emit(ChatRoomEventType.SET_ROOM_NAME, { roomId, name });
  }

  public onSetRoomDescription(
    callback: RoomCallback<{ roomId: string; description: string }>
  ): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.SET_ROOM_DESCRIPTION,
      this.roomCallbacks,
      callback
    );
  }

  public onSetRoomPicture(
    callback: RoomCallback<{ roomId: string; imageURL: string }>
  ): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.SET_ROOM_PICTURE,
      this.roomCallbacks,
      callback
    );
  }

  // Room Status
  public onArchiveRoom(callback: RoomCallback<string>): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.ARCHIVE_ROOM,
      this.roomCallbacks,
      callback
    );
  }

  public onUnarchiveRoom(callback: RoomCallback<string>): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.UNARCHIVE_ROOM,
      this.roomCallbacks,
      callback
    );
  }

  public onMuteRoom(
    callback: RoomCallback<{ roomId: string; duration?: number }>
  ): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.MUTE_ROOM,
      this.roomCallbacks,
      callback
    );
  }

  public onUnmuteRoom(callback: RoomCallback<string>): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.UNMUTE_ROOM,
      this.roomCallbacks,
      callback
    );
  }

  // Room Management
  public onDeleteRoom(callback: RoomCallback<string>): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.DELETE_ROOM,
      this.roomCallbacks,
      callback
    );
  }

  public async deleteRoom(roomId: string): Promise<void> {
    // Remove from cache
    this.removeRoom(roomId);
    // Send to socket
    await this.socket.emit(ChatRoomEventType.DELETE_ROOM, roomId);
  }

  public onUndeleteRoom(callback: RoomCallback<string>): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.UNDELETE_ROOM,
      this.roomCallbacks,
      callback
    );
  }

  public onBlockRoom(callback: RoomCallback<string>): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.BLOCK_ROOM,
      this.roomCallbacks,
      callback
    );
  }

  public onUnblockRoom(callback: RoomCallback<string>): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.UNBLOCK_ROOM,
      this.roomCallbacks,
      callback
    );
  }

  // Room Queries
  public onGetAllRooms(callback: RoomCallback): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.GET_ALL_ROOMS,
      this.roomCallbacks,
      callback
    );
  }

  public onGetRoomById(callback: RoomCallback<string>): () => void {
    return this.addSocketCallback(
      ChatRoomEventType.GET_ROOM_BY_ID,
      this.roomCallbacks,
      callback
    );
  }

  public async onGetFrequentRooms(
    callback: RoomCallback<string[]>
  ): Promise<() => void> {
    const oneTimeCallback = (data: any) => {
      callback(data);
      if (unsubscribe) {
        unsubscribe();
        console.log(`Listener closed for room: onGetFrequentRooms`);
      }
    };

    const unsubscribe = this.addSocketCallback(
      ChatRoomEventType.GET_FREQUENT_ROOMS,
      this.roomCallbacks,
      oneTimeCallback
    );

    await this.socket.emit(ChatRoomEventType.GET_FREQUENT_ROOMS, {});
    return unsubscribe;
  }

  public async getFavoriteChats(roomId: string, callback: RoomCallback) {
    // Create a wrapper callback that will be called only once and then remove itself
    const oneTimeCallback = (data: any) => {
      callback(data);
      if (unsubscribe) {
        unsubscribe();
        console.log(`Listener closed for favorite chats in room: ${roomId}`);
      }
    };

    // Register the one-time callback
    const unsubscribe = this.addSocketCallback(
      "getFavouriteChats",
      this.roomCallbacks,
      oneTimeCallback
    );

    // Emit the event to request favorite chats with roomId
    await this.socket.emit("getFavouriteChats", { roomId });

    return unsubscribe;
  }

  public async getMediaChats(roomId: string, type: string, callback: RoomCallback) {

    await this.socket.emit("getMediaByChatRoomId", {
      roomId: roomId,
      type,
    }, callback);
  }

  public useChatRoomEvent<T>(
    type: ChatRoomEventType,
    callback: RoomCallback<T>
  ): () => void {
    return this.useSocketEvent(type, this.roomCallbacks, callback);
  }
}
