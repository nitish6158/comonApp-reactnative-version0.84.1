import { atom } from "jotai";

export interface IOngoingCall {
  _id: string;
  type: string;
  channelName: string;
  roomType: string;
  roomId?: {
    _id?: string | null;
    name?: string | null;
    profile_img?: string | null;
  } | null;
  callParticipants: Array<{
    callStatus: string;
    uid?: number | null;
    userId: {
      _id: string;
      phone: string;
      firstName: string;
      lastName: string;
      profile_img: string;
      lastSeen?: number | null;
    };
    callHistory: Array<{ callEndedAt?: string | null; callJoinedAt: string }>;
  }>;
}

const isGroupCallActive: Array<IOngoingCall> = [];

export const groupCallActiveData = atom(isGroupCallActive);
