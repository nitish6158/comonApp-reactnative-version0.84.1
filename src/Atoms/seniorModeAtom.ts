import { CallData } from "@/notification/Interfaces/Call";
import { RoomData } from "@/redux/Models/ChatModel";
import { atom } from "jotai";

export const seniorChatAlertAtom = atom<null | RoomData>(null)