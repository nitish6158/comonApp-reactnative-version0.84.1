interface Deleted {
  type: string;
  user_id: string;
  deleted_at: number;
}

interface DeliveredTo {
  user_id: string;
  delivered_at: number;
}

interface DownloadBy {
  user_id: string;
  device_unique: string;
}

interface FavouriteBy {
  user_id: string;
  favourite_at: number;
}

interface PinBy {
  user_id: string;
  pin_at: number;
}

interface ReadBy {
  user_id: string;
  read_at: number;
}

interface ReplyMsg {
  cid: string;
  type: string;
  sender: string;
  message: string;
  file_URL: string;
  fontStyle: string;
  created_at: number;
}

interface Conversation {
  __v: number;
  _id: string;
  created_at: number;
  deleted: Deleted[];
  favourite_by: FavouriteBy[];
  fileURL: string;
  fontStyle: string;
  duration: string;
  isForwarded: boolean;
  message: string;
  readByIds: string;
  read_by: ReadBy[];
  reply_msg: ReplyMsg;
  roomId: string;
  sender: string;
  thumbnail: string;
  type:
    | "IMAGE"
    | "VIDEO"
    | "AUDIO"
    | "DOCUMENT"
    | "APPLICATION"
    | "createdRoom"
    | "changedName"
    | "changedPicture"
    | "addedUser"
    | "leftRoom"
    | "chatDisappear"
    | "removedUser"
    | "poll"
    | "contact"
    | "text"
    | "videoCall"
    | "audioCall"
    | "hidden"
    | "invited"
    | "declined"
    | "taskAssigned";
  updated_at: number;
  downloadBy: DownloadBy[];
  PinBy: PinBy[];
  isSent: boolean;
  deliveredToIds: string;
  delivered_to: DeliveredTo[];
  receipts: boolean | null;
}

export type { Deleted, DeliveredTo, DownloadBy, FavouriteBy, PinBy, ReadBy, ReplyMsg, Conversation };
