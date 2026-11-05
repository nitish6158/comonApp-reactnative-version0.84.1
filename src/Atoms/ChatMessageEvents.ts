import { Conversation } from "@Models/chatmessage";
import { atom } from "jotai";

type selectionType = "FORWARD" | "DELETE" | "";

export const IsAudioRecordingVisibleAtom = atom(false);
export const IsMessageForwardSelectionVisibleAtom = atom(false);
export const IsMessageDeleteSelectionVisibleAtom = atom(false);
export const IsMessageSearchVisibleAtom = atom(false);
export const IsMessageSentDisabledAtom = atom(false);
export const IsMessageSendBlockedAtom = atom(false);
export const IsMessageReplyVisibleAtom = atom(false);
export const IsAttachmentSelectionVisibleAtom = atom(false);
export const IsMessageOptionModelVisible = atom(false);
export const PinedMessagesAtom = atom([] as Conversation[]);
export const MultiSelectionAtom = atom(false);
export const MultiSelectionTypeAtom = atom("" as selectionType);
export const chatSearchPaginationIndexAtom = atom(0);
export const chatSearchResultAtom = atom([]);
export const chatSearchEnabledAtom = atom(false);
export const chatIndexForScroll = atom(null);
export const chatSearchTextMessage = atom("");
export const scheduleMessageModalAtom = atom(false)

const initialMessage: Conversation | null = null;
export const selectedMessageAtom = atom(initialMessage);
export const chatMode = atom("scroll" as "text" | "scroll" | "search");
export const conversationLimit = atom(10);

export const selectedForwardMessagesListAtom = atom([] as Conversation[]);

export const RoomDocsAtom = atom([]);
export const RoomMediaAtom = atom([]);
export const RoomAudioAtom = atom([]);
export const RoomLinksAtom = atom([]);
