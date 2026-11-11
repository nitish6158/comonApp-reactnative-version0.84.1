import { client as apolloClient } from "@/graphql/provider/authLink";
import {
  CREATE_STATUS_ITEM,
  DELETE_STATUS_ITEM,
  GET_MY_STATUS_PRIVACY,
  GET_STATUS_FEED,
  GET_STATUS_ITEMS,
  GET_STATUS_VIEWERS,
  MARK_STATUS_VIEWED,
  MUTE_STATUS_AUTHOR,
  REPLY_TO_STATUS,
  UNMUTE_STATUS_AUTHOR,
  UPDATE_MY_STATUS_PRIVACY,
} from "@/graphql/status";
import { UploadFiles } from "@/graphql/room";

export type StatusPrivacyMode = "contacts" | "contacts_except" | "only_share_with";
export type StatusItemType = "TEXT" | "IMAGE" | "VIDEO";

export type StatusPrivacy = {
  _id: string;
  userId: string;
  mode: StatusPrivacyMode;
  exceptUserIds: string[];
  onlyUserIds: string[];
  mutedAuthorIds: string[];
};

export type StatusItemView = {
  _id: string;
  authorId: string;
  type: StatusItemType;
  text?: string | null;
  bgColor?: string | null;
  fontStyle?: string | null;
  fileURL?: string | null;
  thumbnail?: string | null;
  duration?: number | null;
  mime?: string | null;
  createdAt: string;
  expiresAt: string;
  seen: boolean;
  viewCount?: number | null;
};

export type StatusFeedRow = {
  authorId: string;
  items: StatusItemView[];
  unseenCount: number;
  lastUpdated: string;
};

export type StatusFeed = {
  myStatus: StatusFeedRow | null;
  rows: StatusFeedRow[];
};

export type StatusViewer = { viewerId: string; viewedAt: string };

export type UpdateStatusPrivacyInput = {
  mode?: StatusPrivacyMode;
  exceptUserIds?: string[];
  onlyUserIds?: string[];
};

export type CreateStatusItemInput = {
  type: StatusItemType;
  text?: string;
  bgColor?: string;
  fontStyle?: string;
  fileURL?: string;
  thumbnail?: string;
  duration?: number;
  mime?: string;
};

async function query<T>(document: any, variables?: Record<string, any>): Promise<T> {
  const res = await apolloClient.query<T>({ query: document, variables, fetchPolicy: "network-only" });
  if (res.errors?.length) throw new Error(res.errors[0].message);
  return res.data as T;
}

async function mutate<T>(document: any, variables?: Record<string, any>): Promise<T> {
  const res = await apolloClient.mutate<T>({ mutation: document, variables });
  if (res.errors?.length) throw new Error(res.errors[0].message);
  return res.data as T;
}

const stripTypename = <T>(value: T): T => {
  if (Array.isArray(value)) return value.map(stripTypename) as any;
  if (value && typeof value === "object") {
    const { __typename, ...rest } = value as any;
    return Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, stripTypename(v)])) as T;
  }
  return value;
};

// ───────────── Privacy ─────────────

export async function getMyStatusPrivacy(): Promise<StatusPrivacy> {
  const data = await query<any>(GET_MY_STATUS_PRIVACY);
  return stripTypename(data.getMyStatusPrivacy.privacy);
}

export async function updateMyStatusPrivacy(input: UpdateStatusPrivacyInput): Promise<StatusPrivacy> {
  const data = await mutate<any>(UPDATE_MY_STATUS_PRIVACY, { input });
  return stripTypename(data.updateMyStatusPrivacy.privacy);
}

export async function muteStatusAuthor(authorId: string): Promise<StatusPrivacy> {
  const data = await mutate<any>(MUTE_STATUS_AUTHOR, { input: { authorId } });
  return stripTypename(data.muteStatusAuthor.privacy);
}

export async function unmuteStatusAuthor(authorId: string): Promise<StatusPrivacy> {
  const data = await mutate<any>(UNMUTE_STATUS_AUTHOR, { input: { authorId } });
  return stripTypename(data.unmuteStatusAuthor.privacy);
}

// ───────────── Items ─────────────

export async function createStatusItem(input: CreateStatusItemInput): Promise<StatusItemView> {
  const data = await mutate<any>(CREATE_STATUS_ITEM, { input });
  return stripTypename(data.createStatusItem.item);
}

export async function deleteStatusItem(itemId: string): Promise<void> {
  await mutate(DELETE_STATUS_ITEM, { input: { itemId } });
}

export async function getStatusFeed(): Promise<StatusFeed> {
  const data = await query<any>(GET_STATUS_FEED);
  const feed = data.getStatusFeed;
  return stripTypename({ myStatus: feed.myStatus ?? null, rows: feed.rows ?? [] });
}

export async function getStatusItems(authorId: string): Promise<StatusItemView[]> {
  const data = await query<any>(GET_STATUS_ITEMS, { input: { authorId } });
  return stripTypename(data.getStatusItems.items ?? []);
}

export async function markStatusViewed(itemId: string): Promise<void> {
  await mutate(MARK_STATUS_VIEWED, { input: { itemId } });
}

export async function getStatusViewers(itemId: string): Promise<{ viewers: StatusViewer[]; viewCount: number }> {
  const data = await query<any>(GET_STATUS_VIEWERS, { input: { itemId } });
  const { viewers, viewCount } = data.getStatusViewers;
  return stripTypename({ viewers: viewers ?? [], viewCount: viewCount ?? 0 });
}

export async function replyToStatus(
  itemId: string,
  message: string,
): Promise<{ roomId?: string | null; conversationId?: string | null }> {
  const data = await mutate<any>(REPLY_TO_STATUS, { input: { itemId, message } });
  const { roomId, conversationId } = data.replyToStatus;
  return { roomId, conversationId };
}

// ───────────── Upload ─────────────

/** Signed PUT url for `status/{userId}/{filename}` (same storage flow as chat media). */
export async function getStatusUploadUrl(path: string, contentType: string): Promise<string> {
  const data = await query<any>(UploadFiles, { input: { path, contentType } });
  return data.getUploadSignedUrl.url;
}
