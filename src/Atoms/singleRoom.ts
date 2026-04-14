import { GroupRoomPermission, RoomParticipantData, logType } from "@Store/Models/ChatModel";

import { atom } from "jotai";

export interface singleRoomType {
  roomId: string;
  roomType: "group" | "individual" | "self" | "broadcast";
  roomName: string;
  roomImage: string;
  roomDescription: string;
  roomWallpaper: {
    url: string;
    opacity: number;
  };
  roomSound: {
    url: string;
    title: string;
  };
  roomStatus: "online" | "offline" | string;
  roomLastSeen: number;
  participants: RoomParticipantData[];
  participantsNotLeft: RoomParticipantData[];
  roomPermission: GroupRoomPermission;
  isCurrentUserBlocked: boolean;
  isCurrentRoomBlocked: boolean;
  isCurrentUserLeftRoom: boolean;
  isCurrentUserAdmin: boolean;
  isCurrentRoomMuted: boolean;
  isCurrentRoomSavetoCameraRollActive: boolean;
  isCurrentRoomDisappearedMessageOn: boolean;
  currentUserUtility: RoomParticipantData;
  isMyself: Boolean;
  log: {
    type: logType;
    created_at: string;
  };
  cacheTime: number;
  ringtone: Array<{
    userId: string;
    ringtone: string;
  }>;
  receipts: Array<{
    user_id: string;
    receipt: boolean;
  }>;
}
export const defaultgroupPermission = {
  EditInfoPermission: { permit: "common", type: "editInfo" },
  PinPermission: { permit: "common", type: "pinMessage" },
  SendMessagePermission: { permit: "common", type: "sendMessage" },
};

export  const initialDisplayState: singleRoomType = {
  roomId: "",
  roomType: "",
  roomName: "",
  roomImage: "",
  roomDescription: "",
  roomWallpaper: {
    url: "",
    opacity: 0,
  },
  roomSound: {
    title: "",
    url: "",
  },
  roomStatus: "",
  roomLastSeen: 0,
  participants: [],
  participantsNotLeft: [],
  roomPermission: defaultgroupPermission,
  isCurrentUserBlocked: false,
  isCurrentRoomBlocked: false,
  isCurrentUserLeftRoom: false,
  isCurrentUserAdmin: false,
  isCurrentRoomMuted: false,
  isCurrentRoomSavetoCameraRollActive: false,
  isCurrentRoomDisappearedMessageOn: false,
  currentUserUtility: {} as RoomParticipantData,
  isMyself: false,
  cacheTime: 0,
  ringtone: [],
  receipts: [],
};

export const singleRoom = atom(initialDisplayState);
