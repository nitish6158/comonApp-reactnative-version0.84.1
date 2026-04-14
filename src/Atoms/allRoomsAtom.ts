import { RoomData, RoomsDataList } from "@Store/Models/ChatModel";

import { atom } from "jotai";
import { atomWithImmer } from "jotai-immer";

export type room = RoomData;

export const initialRooms = [] as room[];

export const AllChatRooms = atomWithImmer(initialRooms);

export const FolderAndTabsAtom = atom(0);

export const ArchiveRoomsAtom = atomWithImmer(initialRooms);
