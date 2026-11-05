import { LastMessageType } from "@Types/types";

export interface BlockedRoom {
  pid: string;
  room_Id: string;
}

export interface Folder {
  _id: string;
  name: string;
  roomId: string[];
}

export interface ProfileData {
  _id: string;
  blockedRooms: BlockedRoom[];
  firstName: string;
  folders: Folder[];
  lastName: string;
  lastSeen: number;
  phone: string;
  profile_img: string;
  email: string;
  device?: {
    token: string;
    fcmToken: string;
    type: string;
  };
  receipts: boolean;
}

export interface RoomDisplayData {
  PhoneNo: string;
  UserImage: string;
  UserName: string;
  lastSeen: string;
  userStatus: boolean;
}

export interface RoomParticipantData {
  added_at: number;
  firstName: string;
  lastName: string;
  lastSeen: number;
  left_at: number;
  phone: string;
  profile_img: string;
  sound?: {
    url: string;
    title: string;
  };
  status: "online" | "offline";
  unread_cid: string[];
  user_id: string;
  user_type: string;
  topic: string[];
  wallpaper: {
    fileName: string;
    opacity: number;
  };
}
export interface GroupRoomPermission {
  EditInfoPermission: { permit: string; type: "editInfo" | string };
  PinPermission: { permit: string; type: "pinMessage" | string };
  SendMessagePermission: { permit: string; type: "sendMessage" | string };
}

export interface RoomMsgData {
  created_at: number;
  message: string;
  type: LastMessageType | string;
  sender: string;
  deletedBy: Array<{
    type: "me" | "clear" | "everyone";
    user_id: string;
    deleted_at: number;
    cause: "left_room" | "block" | "deleted";
  }>;
  id: string;
}

export interface RoomAccessData {
  permit: string;
  type: string;
}

export interface RoomActionData {
  user_id: string;
  time: number;
}

export interface RoomABioData {
  status: "online" | "offline";
  time: number;
}

export type logType =
  | "setRoomPicture"
  | "joinRoom"
  | "updateRoomAdmin"
  | "changeRoomPermission"
  | "setRoomDescription"
  | "setRoomName"
  | "removeUserFromRoom"
  | "blockRoom"
  | "unblockRoom"
  | "muteRoom"
  | "unmuteRoom"
  | "setCameraRoll"
  | "setChatDisappeared"
  | "changeRoomWallpaper"
  | "changeNotificationSound";
export interface RoomData {
  room: any;
  ActiveUserId: string;
  __v: number;
  _id: string;
  access: RoomAccessData[];
  archivedBy: RoomActionData[];
  bio: RoomABioData;
  cameraRollOffBy: RoomActionData[];
  created_at: number;
  deletedBy: RoomActionData[];
  disappearedOnBy: RoomActionData[];
  display: RoomDisplayData;
  fixedBy: RoomActionData[];
  key: string;
  last_msg: RoomMsgData[];
  LastMessageSenderName: string | undefined;
  mutedBy: RoomActionData[];
  name: string;
  participantIds: string;
  participants: RoomParticipantData[];
  pin_count: number;
  profile_img: string;
  type: "individual" | "group" | "broadcast";
  unreadBy: RoomActionData[];
  username: string;
  blocked: boolean;
  log: {
    type: logType;
    created_at: string;
  };
  ringtone: Array<{
    userId: string;
    ringtone: string;
  }>;
  receipts: Array<{
    user_id: string;
    receipt: boolean;
  }>;
}

export interface RoomsDataList extends Array<RoomData> {}

export interface FolderDataList extends Array<Folder> {}
export interface FavoriteChat {
  cid: string;
  created_at: string;
  fileURL: string;
  firstName: string;
  lastName: string;
  message: string;
  phone: string;
  reply_msg: {};
  roomId: string;
  sender: string;
  type: string;
}

export interface FavoriteChatList extends Array<FavoriteChat> {}
