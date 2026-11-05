import { Assignment, Scenario, Report, Member } from "@/graphql/generated/types";
import { atom } from "jotai";

export const activeReportAtom = atom<Report | null>(null);
export const activeAssignmentAtom = atom<Assignment | null>(null);
export const activeScenarioAtom = atom<Scenario | null>(null);
export const taskNotificationLoader = atom<null | string>(null);
