import { Report } from "@/graphql/generated/types";
import { atom } from "jotai";

export const MyReportAtom = atom([] as Report[]);
export const CurrentActiveOrganization = atom("");
