export interface Message {
  _id: string;
  roomId: string;
  type: string;
  sender: string;
  message: string;
  fileURL: string;
  thumbnail: string;
  favourite_by: string[];
  isForwarded: boolean;
  fontStyle: string;
  created_at: number;
  updated_at: number;
  readByIds: string;
  read_by: string[];
  deleted: string[];
  downloadBy: string[];
  PinBy: string[];
  isSent: boolean;
  deliveredToIds: string;
  delivered_to: string[];
  __v: number;
}

export interface Chat {
  myMessage: Message;
  profile_img: string;
  sound: string;
  subtitle: string;
  notification: Notification;
}

interface Data {
  data: Chat | string;
  type: string;
  token: string;
}

interface Notification {
  body: string;
  title: string;
}

export interface MessageData {
  data: Data;
  from: string;
  messageId: string;
}
