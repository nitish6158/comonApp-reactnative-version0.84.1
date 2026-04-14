import { user } from "@/schemas/schema";
import { ProfileData } from "@Store/Models/ChatModel";
import { atom } from "jotai";

export const currentUserIdAtom = atom(null as user | null);
