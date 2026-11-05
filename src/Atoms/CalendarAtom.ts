import { ParticipantAcceptStatus } from "@/graphql/generated/topics.generated";
import { reminder } from "@/schemas/schema";
import { atom } from "jotai";
import { TimelineListProps } from "react-native-calendars";
import type { Event } from "react-native-calendars/src/timeline/EventBlock";
export interface IAllCalendarData {
  _id: string;
  type: "REMINDER" | "TASK";
  title: string;
  recurrent: string;
  startDate: number;
  startTimeInMs: number;
  endDate: number;
  label: string;
  isAllDay: boolean;
  description: string;
  completeTime: number | null;
  daylyParams?: {
    everyWeek: number;
    dayOfWeeks: string[];
  };
  montlyParams?: {
    months: [];
    twicePerMonth: boolean;
  };
  dateTimeInput: Array<{
    date: string;
  }>;
  members: Array<{
    member: string;
    memberRole: "ACTIVE" | "PASSIVE";
    roomId: string;
    completeTime: null | string;
    reportsCount: number;
  }>;
  tasks: Array<string>;
  organization: {
    _id: string;
    deleted: false;
    description: string;
    name: string;
    masterOrg: string;
  };
  extraData: reminder | string;
}

export interface IDailyModeData {
  start: string;
  end: string;
  title: string;
  summary: string;
  color?: string;
}

export const CalendarMode = atom<number>(1);
export const AllCalendarData = atom<TimelineListProps["events"]>({});
export const CalendarLoader = atom<boolean>(true);
export const ReminderEventData = atom<{ [x: string]: Event[] }>({});
export const CalendarNotifications = atom<reminder[]>([]);
export const CalendarScheduleMessage = atom<reminder[]>([]);
export const CalendarDotAtom = atom<{ [x: string]: { dots: Array<{ key: string; color: string }> } }>({});

export const notificationCount = atom<number>(0);
export const calendarGlobalReminder = atom<reminder | null>(null);
export const eventDeleteRequestAtom = atom<reminder | null>(null);
export const eventStatusRequestAtom = atom<{
  reminder: reminder;
  status: ParticipantAcceptStatus;
  title: string;
} | null>(null);
export const calendarRefreshAtom = atom(0);
export const globalCalendarLoaderAtom = atom(false);
