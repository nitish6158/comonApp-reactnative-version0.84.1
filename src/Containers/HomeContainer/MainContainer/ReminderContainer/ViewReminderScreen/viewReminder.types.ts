import { ParticipantAcceptStatus } from "@/graphql/generated/version.generated";
import { reminder } from "@/schemas/schema";
import dayjs from "dayjs";

export type SingleViewReminderProps = {
  onClose: () => void;
  reminder: reminder | null;
  isActionNeeded?: boolean;
  onDelete: (reminder: reminder) => void;
  onStatusChange: (payload: statusPayload) => void;
  onSuccess: () => void;
};

type statusPayload = {
  reminder: reminder;
  status: ParticipantAcceptStatus;
  title: string;
};

export type filterType = {
  from: string;
  to: string;
};

export const today = dayjs().toISOString();

export function TimeSetterToZero(date: string) {
  return dayjs(date).set("hours", 0).set("minutes", 0).toISOString();
}

export function TimeSetterToMax(date: string) {
  return dayjs(date).set("hours", 23).set("minutes", 59).toISOString();
}

export const defaultFilter = {
  from: today,
  to: today,
};
