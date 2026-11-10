import { Report } from "@/graphql/generated/types";
import { atom } from "jotai";

export const MyReportAtom = atom<any[]>([]);
export const CurrentActiveOrganization = atom("");
