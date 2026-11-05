import { z } from "zod";

interface Origin {
  _id: string;
  phone: string;
  firstName: string;
  lastName: string;
  profile_img: string;
}

interface Participant {
  _id: string;
  firstName: string;
}

interface UserId {
  _id: string;
}

interface CallParticipant {
  callStatus: string;
  uid: string;
  userId: string;
}

export interface CallData {
  callId: string;
  channelName: string;
  type: string;
  roomType: string;
  callBackground: string;
  roomName: string;
  callParticipants: CallParticipant[];
  roomId?: string;
  origin: string;
  ringtone?: string;
}

const CallParticipantSchema = z.object({
  callStatus: z.enum(["missed", "accepted", "rejected"]),
  uid: z.number(),
  userId: z.string(),
});

const CallDataSchema = z.object({
  callStartedAt: z.string(),
  callId: z.string(),
  channelName: z.string(),
  type: z.string(),
  roomType: z.string(),
  callBackground: z.string(),
  roomName: z.string(),
  callParticipants: z.array(CallParticipantSchema),
  roomId: z.string(),
  origin: z.string(),
});

export const CallNotificationSchema = z.object({
  notificationType: z.string(),
  data: CallDataSchema,
  notification: z.object({
    body: z.string(),
    title: z.string(),
  }),
  device: z.object({
    token: z.string(),
    type: z.string(),
  }),
});

export type CallNotificationSchemaType = z.infer<typeof CallNotificationSchema>;

export interface CallNotification {
  notificationType: string;
  data: CallData;
  notification: {
    body: string;
    title: string;
  };
  device: {
    token: string;
    type: string;
  };
}

export interface CallNotificationData {
  data: {
    data: CallNotification | string;
    type: string;
    token: string;
  };
  from: string;
  messageId: string;
}

const CallParticipantSocketSchema = z.object({
  uid: z.number(),
  callHistory: z.array(
    z.object({
      callJoinedAt: z.string(),
      callEndedAt: z.string(),
    })
  ),
  callStatus: z.enum(["missed", "accepted", "rejected"]),
  userId: z.object({
    _id: z.string(),
    phone: z.string(),
    profile_img: z.string(),
  }),
});

const OriginSchema = z.object({
  _id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  profile_img: z.string(),
});

const RoomIdSchema = z.object({
  __v: z.number(),
  _id: z.string(),
  access: z.array(
    z.object({
      permit: z.string(), // Adjust the type if it's not always a string
      type: z.string(), // Adjust the type if it's not always a string
    })
  ),
  archivedBy: z.array(z.string()), // Adjust the type if it's not always an array
  bio: z.object({
    status: z.string(),
    time: z.number(),
  }),
  cameraRollOffBy: z.array(z.string()), // Adjust the type if it's not always an array
  created_at: z.number(),
  deletedBy: z.array(z.string()), // Adjust the type if it's not always an array
  disappearedOnBy: z.array(z.string()), // Adjust the type if it's not always an array
  fixedBy: z.array(z.string()), // Adjust the type if it's not always an array
  last_msg: z.array(
    z.object({
      created_at: z.number(),
      deletedBy: z.array(z.string()), // Adjust the type if it's not always an array
      id: z.string(),
      message: z.string(),
      sender: z.string(),
      type: z.string(),
    })
  ),
  log: z.object({
    created_at: z.number(),
    type: z.string(),
  }),
  mutedBy: z.array(z.string()), // Adjust the type if it's not always an array
  name: z.string(),
  organization: z.string(),
  participantIds: z.string(),
  participants: z.array(
    z.object({
      added_at: z.number(),
      firstName: z.string(),
      lastName: z.string(),
      lastSeen: z.number(),
      left_at: z.number(),
      phone: z.number(),
      profile_img: z.string(),
      status: z.string(),
      unread_cid: z.array(z.string()), // Adjust the type if it's not always an array
      user_id: z.string(),
      user_type: z.string(),
      wallpaper: z.object({
        // Define the properties within the "wallpaper" object if known
      }),
    })
  ),
  pin_count: z.number(),
  profile_img: z.string(),
  type: z.union([z.literal("individual"), z.literal("group")]), // Assuming "individual" is a fixed value.
  unreadBy: z.array(z.string()), // Adjust the type if it's not always an array
});

const CallResultSchema = z.literal("Call Ended!"); // Assuming "Call Ended!" is a fixed value.

// Define a literal for the room types
const RoomTypeSchema = z.enum(["individual", "group", "contact", "contact_group"]);

const CallTypeSchema = z.enum(["audio", "video"]);

const DataSchema = z.object({
  callId: z.string(),
  callStartedAt: z.string(),
  callParticipants: z.array(CallParticipantSocketSchema),
  channelName: z.string(),
  origin: OriginSchema,
  roomId: RoomIdSchema,
  type: CallTypeSchema,
  roomType: RoomTypeSchema,
  // Define other properties within data if known
});

export const SocketCallEnd = z.object({
  callType: CallResultSchema,
  data: DataSchema,
});

export type SocketCallEndType = z.infer<typeof SocketCallEnd>;
