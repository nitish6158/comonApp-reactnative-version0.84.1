import type { User } from "@/graphql/generated/types";
import type { Conversation } from "@/models/chatmessage";

type AnyRecord = Record<string, any>;

// Realm has been removed from the app. These aliases keep older screens typed
// while data now comes from GraphQL, sockets, Redux, MMKV, or route params.
export type user = User & AnyRecord;
export type conversations = Conversation & AnyRecord;
export type call = AnyRecord;
export type reminder = AnyRecord;
export type reminder_attachment = AnyRecord;
export type reminder_participants = AnyRecord;
export type versionmanagement = AnyRecord;
