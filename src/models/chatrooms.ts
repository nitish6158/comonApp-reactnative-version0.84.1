interface ArchivedBy {
  user_id: string;
  archived_at: number;
}

interface Bio {
  status: string;
  time: number;
}

interface CameraRollOffBy {
  user_id: string;
  created_at: number;
}

interface DeletedBy {
  user_id: string;
  deleted_at: number;
}

interface DisappearedOnBy {
  user_id: string;
  created_at: number;
}

interface LastMessageDeleteBy {
  deleted_at: number;
  type: string;
  user_id: string;
}

interface LastMessage {
  created_at: number;
  deletedBy: LastMessageDeleteBy[];
  id: string;
  message: string;
  sender: string;
  type: string;
}

interface MutedBy {
  user_id: string;
  expired_at: number;
  muted_at: number;
}

interface Sound {
  title: string;
  url: string;
}

interface Wallpaper {
  fileName: string;
  opacity: number;
}

interface Participant {
  user_id: string;
  user_type: string;
  profile_img: string;
  phone: number;
  firstName: string;
  lastName: string;
  wallpaper: Wallpaper;
  sound: Sound;
  added_at: number;
  left_at: number;
  unread_cid: string[];
  lastSeen: number;
  status: string;
}

interface RoomAccess {
  type: string;
  permit: string;
}

interface UnreadBy {
  user_id: string;
}

interface FixedBy {
  user_id: string;
  fixed_at: number;
}

interface ChatRoom {
  _id: string;
  __v: number;
  access: RoomAccess[];
  archivedBy: ArchivedBy[];
  bio: Bio;
  organization: string;
  cameraRollOffBy: CameraRollOffBy[];
  created_at: number;
  deletedBy: DeletedBy[];
  disappearedOnBy: DisappearedOnBy[];
  last_msg: LastMessage[];
  name: string;
  participantIds: string;
  participants: Participant[];
  pin_count: number;
  profile_img: string;
  type: string;
  mutedBy: MutedBy[];
  fixedBy: FixedBy[];
  unreadBy: UnreadBy[];
}

// Define the appropriate type for FixedBy
interface FixedBy {
  user_id: string;
  fixed_at: number;
}

export type {
  ArchivedBy,
  Bio,
  CameraRollOffBy,
  DeletedBy,
  DisappearedOnBy,
  LastMessageDeleteBy,
  LastMessage,
  MutedBy,
  Sound,
  Wallpaper,
  Participant,
  RoomAccess,
  UnreadBy,
  ChatRoom,
  FixedBy,
};
