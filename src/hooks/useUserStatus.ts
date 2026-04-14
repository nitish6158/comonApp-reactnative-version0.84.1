import { useState, useEffect, useMemo } from "react";
import useTimeHook from "./useTimeHook";
import { UserContact } from "@/graphql/generated/types";

interface UseUserStatusProps {
  roomType: string;
  participants: Array<any>;
  myProfileId: string;
  roomStatus: string;
  contactReminders?: Array<UserContact>;
}

function getParticipantId(user: any): string {
  return String(
    user?.user_id?._id ??
      user?.user_id ??
      user?._id ??
      user?.userId?._id ??
      user?.pid ??
      ""
  );
}

function normalizePhone(value: any): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function findReminderForUser(
  contactReminders: Array<UserContact> = [],
  otherUser: any
): UserContact | null {
  if (!otherUser || contactReminders.length === 0) return null;

  const otherUserId = getParticipantId(otherUser);
  const otherUserPhone = normalizePhone(otherUser?.phone);

  const byId = contactReminders.find((item: any) => String(item?._id ?? "") === otherUserId);
  if (byId) return byId;

  if (!otherUserPhone) return null;

  return (
    contactReminders.find((item: any) => {
      const reminderPhone = normalizePhone(item?.phone);
      if (!reminderPhone) return false;
      return (
        reminderPhone === otherUserPhone ||
        reminderPhone.endsWith(otherUserPhone) ||
        otherUserPhone.endsWith(reminderPhone)
      );
    }) || null
  );
}

export default function useUserStatus({
  roomType,
  participants,
  myProfileId,
  roomStatus,
  contactReminders = [],
}: UseUserStatusProps) {
  const [lastSeen, setLastSeen] = useState({
    time: undefined,
    status: "offline",
    isBlocked: false,
  });
  const [isReminder, setIsReminder] = useState<UserContact | null>(null);

  const otherUser = useMemo(() => {
    if (roomType !== "individual") return null;
    return participants.find((user) => getParticipantId(user) !== String(myProfileId ?? ""));
  }, [roomType, participants, myProfileId]);

  const userPresence = useMemo(() => {
    if (roomType !== "individual" || !otherUser) return null;

    const statusRaw = String(otherUser?.status ?? roomStatus ?? "").toLowerCase();
    const status = statusRaw === "online" ? "online" : "offline";
    const lastSeen =
      otherUser?.lastSeen ??
      otherUser?.onlineTime ??
      otherUser?.userId?.lastSeen ??
      otherUser?.userId?.onlineTime;

    return { status, lastSeen };
  }, [roomType, otherUser, roomStatus]);

  const { time } = useTimeHook(userPresence?.lastSeen || "");

  useEffect(() => {
    setIsReminder(findReminderForUser(contactReminders, otherUser));
  }, [contactReminders, otherUser]);

  useEffect(() => {
    setLastSeen({
      time,
      status: userPresence?.status ?? "offline",
      isBlocked: roomStatus === "blocked",
    });
  }, [userPresence?.status, time, roomStatus]);

  return {
    lastSeen,
    isReminder,
    otherUser,
  };
}
