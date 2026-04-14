import { atom } from "jotai";

export type SenderType = {
  callType: string;
  roomType: string;
  roomId: string;
  callBackground: string;
  roomName: string;
  participants:
    | Array<{
        callStatus: string;
        uid: number;
        userId: string;
      }>
    | [];
  isReceiver: false;
};

export type ReceiverType = {
  roomName: string;
  roomType: string;
  isReceiver: boolean;
  callId: string;
  channelId: string;
  channelName: string;
  callType: string;
  roomId: string;
  participants: Array<{
    callStatus: string;
    uid: number;
    userId: string;
  }>;
  callBackground: string;
};

export type callAtomType = {
  isReceiver: boolean;
  callType: string;
  token?: string;
  callId?: string;
  channelId?: string;
  roomType: string;
  roomId: string;
  participants: Array<{
    _id: string;
    uid: string;
    profile_img: string;
    userName: string;
    micEnable: boolean;
    callStatus: string;
  }>;
  callBackground: string;
  roomName: string;
  endCall?: boolean;
  appKilled?: {
    status: boolean;
    startTime: number;
    participantUid: number[];
  };
};

export const callAtom = atom<callAtomType | null>(null);
