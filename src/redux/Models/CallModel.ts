

type ParticipantType = {
  callStatus: string;
  callHistory: {
    callEndedAt: string;
    callJoinedAt: string;
  };
  userId: {
    _id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    profile_img: string;
    lastSeen: number;
  };
};

type RoomType = "individual" | "group" | "contact_group" | "contact";

type CallType = {
  _id: string;
  categoryId?: string;
  type: string;
  channelName: string;
  roomId: {
    _id: string;
    name: string;
    profile_img: string;
    type: string;
  } | null;
  roomType: RoomType;
  phone: string;
  callStatus: string;
  callStartedAt: string;
  origin: {
    _id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    profile_img: string;
  };
  callParticipants: Array<ParticipantType>;
};

type CallListType = Array<CallType>;
