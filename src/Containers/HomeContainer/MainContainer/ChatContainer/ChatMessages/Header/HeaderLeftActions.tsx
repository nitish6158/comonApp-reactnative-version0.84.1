import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useAtomValue } from "jotai";

import AvtaarWithoutTitle from "@Components/AvtaarWithoutTitle";
import Colors from "@/Constants/Colors";
import { ListItem } from "react-native-elements";
import Text from "@Components/Text";
import { mainStyles } from "../../../../../../styles/main";
import { singleRoom } from "@Atoms/singleRoom";
import { useTranslation } from "react-i18next";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { socketManager } from "@/utils/socket/SocketManager";
import { socket } from "@/redux/Reducer/SocketSlice";
import dayjs from "dayjs";
import { useAppSelector } from "@/redux/Store";

type Props = {
  onBackPress: () => void;
  onProfilePress: () => void;
};

type PresenceState = {
  status: "online" | "offline";
  lastSeenAt?: number;
  isBlocked: boolean;
};
const ONLINE_STALE_MS = 12 * 1000;
const OFFLINE_GRACE_MS = 8 * 1000;
const PRESENCE_SYNC_GRACE_MS = 3000;
const PRESENCE_DEBUG = false;

const toNumberTime = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
    const asDate = Date.parse(value);
    if (Number.isFinite(asDate)) return asDate;
  }
  return undefined;
};
const normalizeTimestamp = (value?: number): number | undefined => {
  if (!value || !Number.isFinite(value) || value <= 0) return undefined;
  // Backend may send unix seconds, convert to milliseconds.
  if (value < 1_000_000_000_000) return value * 1000;
  return value;
};

const resolveUserId = (value: any): string => {
  return String(
    value?.user_id?._id ??
      value?.user_id ??
      value?._id ??
      value?.userId?._id ??
      value?.user?._id ??
      value?.pid ??
      value?.uid ??
      value?.contactId ??
      value?.id ??
      ""
  );
};

const getActiveContactCandidateIds = (item: any): string[] => {
  const candidates = [
    item?.userId?._id,
    item?.user_id?._id,
    item?.user_id,
    item?.user?._id,
    item?.pid,
    item?.uid,
    item?.contactId,
    item?._id,
    item?.id,
  ]
    .map((v) => String(v ?? ""))
    .filter(Boolean);

  return Array.from(new Set(candidates));
};

const getSocketEventCandidateIds = (payload: any): string[] => {
  const candidates = [
    payload?.user_id?._id,
    payload?.user_id,
    payload?.userId?._id,
    payload?.userId,
    payload?.user?._id,
    payload?.data?.user_id?._id,
    payload?.data?.user_id,
    payload?.data?.userId?._id,
    payload?.data?.userId,
    payload?.pid,
    payload?.uid,
    payload?.contactId,
    payload?._id,
    payload?.id,
    payload?.targetUserId,
    payload?.toUserId,
    payload?.receiverId,
  ]
    .map((v) => String(v ?? ""))
    .filter(Boolean);

  return Array.from(new Set(candidates));
};

const getParticipantCandidateIds = (participant: any): string[] => {
  const candidates = [
    participant?.user_id?._id,
    participant?.user_id,
    participant?.userId?._id,
    participant?.user?._id,
    participant?.pid,
    participant?.contactId,
    participant?.uid,
    participant?._id,
    participant?.id,
  ]
    .map((v) => String(v ?? ""))
    .filter(Boolean);

  return Array.from(new Set(candidates));
};

const normalizePhone = (value: any): string => String(value ?? "").replace(/\D/g, "");

const getParticipantPhones = (participant: any): string[] => {
  const phones = [
    participant?.phone,
    participant?.userId?.phone,
    participant?.user?.phone,
    participant?.data?.phone,
  ]
    .map(normalizePhone)
    .filter(Boolean);

  return Array.from(new Set(phones));
};

const getActiveContactPhones = (item: any): string[] => {
  const phones = [
    item?.phone,
    item?.userId?.phone,
    item?.user?.phone,
    item?.data?.phone,
  ]
    .map(normalizePhone)
    .filter(Boolean);

  return Array.from(new Set(phones));
};

const getOtherParticipant = (display: any, myProfileId?: string) => {
  const participants = Array.isArray(display?.participants) ? display.participants : [];
  const myId = String(
    myProfileId ??
      display?.currentUserUtility?.user_id?._id ??
      display?.currentUserUtility?.user_id ??
      display?.currentUserUtility?._id ??
      ""
  );
  if (!myId) return null;

  return (
    participants.find((participant: any) => resolveUserId(participant) !== myId) ??
    participants[0] ??
    null
  );
};

const toOnlineOffline = (value: unknown): "online" | "offline" => {
  const normalized = String(value ?? "").toLowerCase();
  if (normalized === "online" || normalized === "available" || normalized === "active") {
    return "online";
  }
  return "offline";
};

const getStatusFromEvent = (
  type: string,
  payload: any
): "online" | "offline" | undefined => {
  const normalizedType = String(type ?? "").toLowerCase();
  const status = String(payload?.status ?? payload?.type ?? "").toLowerCase();
  if (status === "online" || status === "available" || status === "active") return "online";
  if (status === "offline") return "offline";

  if (
    normalizedType === "online" ||
    normalizedType === "useronline" ||
    normalizedType === "ack_online"
  ) {
    return "online";
  }
  if (normalizedType === "offline" || normalizedType === "useroffline") return "offline";

  return undefined;
};

export default function HeaderLeftActions({ onBackPress, onProfilePress }: Props) {
  const { t } = useTranslation();
  const display = useAtomValue(singleRoom);
  const myProfileId = useAppSelector((state) => state.Chat.MyProfile?._id);
  const contacts = useAppSelector((state) => state.Contact.contacts);

  const otherParticipant = useMemo(
    () => getOtherParticipant(display, myProfileId),
    [display, myProfileId]
  );
  const otherParticipantId = useMemo(
    () => resolveUserId(otherParticipant),
    [otherParticipant]
  );
  const otherParticipantIds = useMemo(
    () => getParticipantCandidateIds(otherParticipant),
    [otherParticipant]
  );
  const otherParticipantPhones = useMemo(
    () => getParticipantPhones(otherParticipant),
    [otherParticipant]
  );

  const [presence, setPresence] = useState<PresenceState>({
    status: toOnlineOffline(otherParticipant?.status ?? display?.roomStatus),
    lastSeenAt: normalizeTimestamp(
      toNumberTime(otherParticipant?.lastSeen) ??
        toNumberTime(display?.roomLastSeen)
    ),
    isBlocked: display?.roomStatus === "blocked",
  });
  const [isRoomOnline, setIsRoomOnline] = useState<boolean>(
    toOnlineOffline(otherParticipant?.status ?? display?.roomStatus) === "online"
  );
  const offlinePollCountRef = useRef(0);
  const isRoomOnlineRef = useRef(
    toOnlineOffline(otherParticipant?.status ?? display?.roomStatus) === "online"
  );
  const lastOnlineConfirmedAtRef = useRef(Date.now());
  const enteredRoomAtRef = useRef(Date.now());
  const hasPresenceResolutionRef = useRef(false);

  const isWithinOfflineGraceWindow = useCallback(() => {
    return (
      isRoomOnlineRef.current &&
      Date.now() - lastOnlineConfirmedAtRef.current < OFFLINE_GRACE_MS
    );
  }, []);

  const logPresenceDebug = useCallback((label: string, payload?: any) => {
    if (!PRESENCE_DEBUG) return;
    console.log("[presence-debug]", label, {
      roomId: display?.roomId,
      otherParticipantId,
      ...payload,
    });
  }, [display?.roomId, otherParticipantId]);

  useEffect(() => {
    enteredRoomAtRef.current = Date.now();
    hasPresenceResolutionRef.current = false;
  }, [display?.roomId]);

  useEffect(() => {
    isRoomOnlineRef.current = isRoomOnline;
  }, [isRoomOnline]);

  useEffect(() => {
    const snapshotOnline =
      toOnlineOffline(otherParticipant?.status ?? display?.roomStatus) === "online";
    const snapshotLastSeen = normalizeTimestamp(
      toNumberTime(otherParticipant?.lastSeen) ?? toNumberTime(display?.roomLastSeen)
    );
    if (snapshotOnline) {
      offlinePollCountRef.current = 0;
      lastOnlineConfirmedAtRef.current = Date.now();
      hasPresenceResolutionRef.current = true;
      setIsRoomOnline(true);
    } else if (snapshotLastSeen) {
      hasPresenceResolutionRef.current = true;
    }
    setPresence((prev) => ({
      status: snapshotOnline ? "online" : prev.status,
      lastSeenAt: snapshotLastSeen ?? prev.lastSeenAt,
      isBlocked: display?.roomStatus === "blocked",
    }));
  }, [
    display?.roomId,
    display?.roomStatus,
    display?.roomLastSeen,
    otherParticipant?.status,
    otherParticipant?.lastSeen,
  ]);

  const refreshPresenceFromRoom = useCallback(() => {
    if (!display?.roomId || display?.roomType !== "individual") return;

    socketManager.chatRoom.getFormattedRoomById(display.roomId, (data: any) => {
      const room = data?.room;
      if (!room?.participants) return;

      const myId = String(
        display?.currentUserUtility?.user_id?._id ??
          display?.currentUserUtility?.user_id ??
          display?.currentUserUtility?._id ??
          ""
      );
      const other =
        room.participants.find(
          (participant: any) => resolveUserId(participant) !== myId
        ) ?? room.participants[0];

      if (!other) return;

      const nextStatus = toOnlineOffline(other?.status ?? room?.bio?.status);
      const nextLastSeen = normalizeTimestamp(
        toNumberTime(other?.lastSeen) ?? toNumberTime(room?.bio?.time)
      );
      logPresenceDebug("refreshPresenceFromRoom", {
        otherStatusRaw: other?.status ?? room?.bio?.status,
        nextStatus,
        nextLastSeen,
      });
      // Room snapshot is often stale on real devices; do not drive realtime online/offline from it.
      if (nextLastSeen) {
        setPresence((prev) => ({
          ...prev,
          lastSeenAt: nextLastSeen,
        }));
      }
    });
  }, [display?.roomId, display?.roomType, display?.currentUserUtility?.user_id, logPresenceDebug]);

  const refreshOnlineFromActiveContacts = useCallback(() => {
    if (!otherParticipantId) return;
    socketManager.chatRoom.getActiveContacts((data: any) => {
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.activeContacts)
        ? data.activeContacts
        : [];

      const matchedUser = list.find((item: any) => {
        const ids = getActiveContactCandidateIds(item);
        if (ids.some((id) => otherParticipantIds.includes(id))) return true;

        const phones = getActiveContactPhones(item);
        return phones.some((phone) => otherParticipantPhones.includes(phone));
      });

      // If the backend does not return this user in active contacts, do not force offline.
      if (!matchedUser) {
        hasPresenceResolutionRef.current = true;
        if (!isRoomOnlineRef.current) {
          setPresence((prev) => ({
            ...prev,
            status: "offline",
            lastSeenAt:
              prev.lastSeenAt ??
              normalizeTimestamp(toNumberTime(display?.roomLastSeen)) ??
              Date.now(),
          }));
        }
        logPresenceDebug("activeContacts:no-match", {
          listCount: list.length,
          otherParticipantIds,
          otherParticipantPhones,
          sampleCandidateIds: list.slice(0, 5).map((item: any) => getActiveContactCandidateIds(item)),
          samplePhones: list.slice(0, 5).map((item: any) => getActiveContactPhones(item)),
        });
        return;
      }

      const status = String(
        matchedUser?.status ?? matchedUser?.userId?.status ?? ""
      ).toLowerCase();
      const foundLastSeen = normalizeTimestamp(
        toNumberTime(
          matchedUser?.lastSeen ??
            matchedUser?.onlineTime ??
            matchedUser?.time ??
            matchedUser?.updated_at ??
            matchedUser?.userId?.onlineTime ??
            matchedUser?.userId?.lastSeen
        )
      );
      logPresenceDebug("activeContacts:matched", {
        status,
        foundLastSeen,
      });

      if (status === "online" || status === "available" || status === "active") {
        offlinePollCountRef.current = 0;
        lastOnlineConfirmedAtRef.current = Date.now();
        hasPresenceResolutionRef.current = true;
        setIsRoomOnline(true);
        return;
      }

      if (status === "offline") {
        if (isWithinOfflineGraceWindow()) return;
        offlinePollCountRef.current += 1;
        if (offlinePollCountRef.current < 2) return;
        hasPresenceResolutionRef.current = true;
        setIsRoomOnline(false);
        setPresence((prev) => ({
          ...prev,
          status: "offline",
          lastSeenAt: foundLastSeen ?? prev.lastSeenAt ?? Date.now(),
        }));
        return;
      }

      // Unknown status: prefer stability, only refresh last seen if available.
      hasPresenceResolutionRef.current = true;
      if (foundLastSeen) {
        setPresence((prev) => ({
          ...prev,
          lastSeenAt: foundLastSeen,
        }));
      }
    });
  }, [
    otherParticipantId,
    otherParticipantIds,
    otherParticipantPhones,
    isWithinOfflineGraceWindow,
    logPresenceDebug,
    display?.roomLastSeen,
  ]);

  useEffect(() => {
    if (
      display?.roomType !== "individual" ||
      !display?.roomId ||
      !otherParticipantId ||
      !myProfileId
    ) {
      return;
    }

    const handler = (type: string, rawData: any) => {
      const normalizedType = String(type ?? "").toLowerCase();
      if (
        normalizedType !== "online" &&
        normalizedType !== "offline" &&
        normalizedType !== "ack_online" &&
        normalizedType !== "useronline" &&
        normalizedType !== "useroffline" &&
        normalizedType !== "sendstatustoauser" &&
        normalizedType !== "changeuserstatus"
      ) {
        return;
      }

      const payload = rawData?.msg ?? rawData?.data ?? rawData;
      const payloadRoomId = String(payload?.roomId ?? payload?.room_id ?? "");
      const payloadCandidateIds = getSocketEventCandidateIds(payload);
      const payloadUserId = payloadCandidateIds[0] ?? "";

      if (payloadRoomId && payloadRoomId !== String(display.roomId)) return;
      const actorMatchesOtherParticipant = payloadCandidateIds.some((id) =>
        otherParticipantIds.includes(id)
      );
      // Ignore room-level or self acknowledgements: only trust events tied to the other participant.
      if (!actorMatchesOtherParticipant) {
        return;
      }

      const status = getStatusFromEvent(type, payload);
      const eventLastSeen = normalizeTimestamp(
        toNumberTime(
          payload?.time ??
            payload?.lastSeen ??
            payload?.onlineTime ??
            payload?.updated_at
        )
      );

      const markOnline =
        status === "online" ||
        normalizedType === "online" ||
        normalizedType === "useronline" ||
        normalizedType === "ack_online";
      const markOffline =
        status === "offline" ||
        normalizedType === "offline" ||
        normalizedType === "useroffline";
      logPresenceDebug("socket:event", {
        type,
        normalizedType,
        status,
        payloadRoomId,
        payloadUserId,
        eventLastSeen,
        markOnline,
        markOffline,
      });
      if (markOnline) {
        offlinePollCountRef.current = 0;
        lastOnlineConfirmedAtRef.current = Date.now();
        hasPresenceResolutionRef.current = true;
        setIsRoomOnline(true);
      }
      if (markOffline) {
        if (isWithinOfflineGraceWindow()) return;
        offlinePollCountRef.current += 1;
        if (offlinePollCountRef.current < 2) return;
        hasPresenceResolutionRef.current = true;
        setIsRoomOnline(false);
        setPresence((prev) => ({
          ...prev,
          status: "offline",
          lastSeenAt: eventLastSeen ?? prev.lastSeenAt ?? Date.now(),
        }));
      }

      setPresence((prev) => {
        if (!status && eventLastSeen === undefined) return prev;

        const nextStatus = status ?? prev.status;
        const nextLastSeen =
          nextStatus === "offline"
            ? eventLastSeen ?? prev.lastSeenAt ?? Date.now()
            : prev.lastSeenAt;

        return {
          ...prev,
          status: nextStatus === "online" ? "online" : prev.status,
          lastSeenAt: nextLastSeen,
        };
      });

    };

    const reduxSocketListener = (event: any) => {
      if (!event?.type) return;
      handler(event.type, event.msg);
    };

    socketConnect.addMessageHandler(handler);
    if (typeof socket?.on === "function") {
      socket.on("message", reduxSocketListener);
    }

    socketConnect.emit("sendStatusToAUser", {
      userId: otherParticipantId,
      user_id: otherParticipantId,
      roomId: display.roomId,
      type: "online",
      status: "online",
    } as any);
    // One-time fallback fetch for lastSeen timestamp only.
    refreshPresenceFromRoom();
    refreshOnlineFromActiveContacts();
    const interval = setInterval(refreshOnlineFromActiveContacts, 8000);
    const pingInterval = setInterval(() => {
      socketConnect.emit("sendStatusToAUser", {
        userId: otherParticipantId,
        user_id: otherParticipantId,
        roomId: display.roomId,
        type: "online",
        status: "online",
      } as any);
    }, 8000);
    const staleInterval = setInterval(() => {
      if (
        isRoomOnlineRef.current &&
        Date.now() - lastOnlineConfirmedAtRef.current > ONLINE_STALE_MS
      ) {
        if (isWithinOfflineGraceWindow()) return;
        offlinePollCountRef.current += 1;
        if (offlinePollCountRef.current < 2) return;
        hasPresenceResolutionRef.current = true;
        setIsRoomOnline(false);
        setPresence((prev) => ({
          ...prev,
          status: "offline",
          lastSeenAt: prev.lastSeenAt ?? Date.now(),
        }));
      }
    }, 5000);

    return () => {
      socketConnect.removeMessageHandler(handler);
      if (typeof socket?.off === "function") {
        socket.off("message", reduxSocketListener);
      }
      clearInterval(interval);
      clearInterval(pingInterval);
      clearInterval(staleInterval);
    };
  }, [
    display?.roomId,
    display?.roomType,
    display?.currentUserUtility?.user_id,
    otherParticipantId,
    otherParticipantIds,
    myProfileId,
    refreshOnlineFromActiveContacts,
    isWithinOfflineGraceWindow,
    refreshPresenceFromRoom,
  ]);

  const lastSeenTime = useMemo(() => {
    if (!presence.lastSeenAt) return "";
    const parsed = dayjs(presence.lastSeenAt);
    if (!parsed.isValid()) return "";

    if (dayjs().isSame(parsed, "day")) {
      return `today at ${parsed.format("HH:mm")}`;
    }

    if (dayjs().subtract(1, "day").isSame(parsed, "day")) {
      return `yesterday at ${parsed.format("HH:mm")}`;
    }

    return `${parsed.format("DD/MM/YYYY")} at ${parsed.format("HH:mm")}`;
  }, [presence.lastSeenAt]);

  const LastSeenView = useCallback(() => {
    if (!display) return null;

    if (display.roomType === "group") {
      return (
        <Text size="xs" style={{ color: Colors.light.Hiddengray }}>
          {display.participants.filter((dp: any) => dp.left_at === 0).length}{" "}
          {t("calls.participants")}
        </Text>
      );
    }

    if (display.roomType === "individual" && !presence.isBlocked) {
      if (
        !hasPresenceResolutionRef.current &&
        Date.now() - enteredRoomAtRef.current < PRESENCE_SYNC_GRACE_MS
      ) {
        return null;
      }

      const statusText = isRoomOnline
        ? t("others.Online")
        : lastSeenTime
        ? `${t("others.Last Seen")} ${lastSeenTime}`
        : "";

      logPresenceDebug("ui:statusText", {
        isRoomOnline,
        hasPresenceResolution: hasPresenceResolutionRef.current,
        statusText,
        lastSeenTime,
      });

      if (!statusText) return null;

      return (
        <Text size="xs" style={{ color: Colors.light.Hiddengray, marginTop: -2 }}>
          {statusText}
        </Text>
      );
    }

    if (display.roomType === "self") {
      return (
        <Text size="xs" style={{ color: Colors.light.Hiddengray }}>
          {t("others.Message Yourself")}
        </Text>
      );
    }

    if (display.roomType === "broadcast") {
      return (
        <Text size="xs" style={{ color: Colors.light.Hiddengray }}>
          {display?.participantsNotLeft?.length - 1} {t("participant")}
        </Text>
      );
    }

    return null;
  }, [display, isRoomOnline, lastSeenTime, presence.isBlocked, t, logPresenceDebug]);

  const showOnlineDot =
    display?.roomType === "individual" &&
    isRoomOnline &&
    !display?.isCurrentRoomBlocked;
  const liveRoomName = useMemo(() => {
    if (!display) return "";
    if (display.roomType !== "individual") return display.roomName ?? "";

    const otherParticipant = display.participants?.find(
      (p) => p.user_id !== display.currentUserUtility?.user_id
    );
    if (!otherParticipant) return display.roomName ?? "";

    const found = contacts.find((c) => c.userId?._id === otherParticipant.user_id);
    if (found) {
      const fullName = `${found.firstName ?? ""} ${found.lastName ?? ""}`.trim();
      if (fullName) return fullName;
    }

    const participantName = `${otherParticipant.firstName ?? ""} ${otherParticipant.lastName ?? ""}`.trim();
    return participantName || display.roomName || "";
  }, [display, contacts]);

  return (
    <View style={styles.container}>
      <Pressable onPress={onBackPress} style={mainStyles.center}>
        <ListItem.Chevron
          style={mainStyles.rotate}
          size={30}
          color={Colors.light.text}
        />
      </Pressable>

      <Pressable onPress={onProfilePress} style={styles.avatarContainer}>
        <AvtaarWithoutTitle
          ImageSource={{
            uri: `${DefaultImageUrl}${
              display?.isCurrentRoomBlocked ? ImageUrl : display?.roomImage
            }`,
          }}
          AvatarContainerStyle={styles.avatar}
        />
        {showOnlineDot ? <View style={styles.onlineDot} /> : null}
      </Pressable>

      <Pressable style={styles.roomInfoContainer} onPress={onProfilePress}>
        <Text numberOfLines={1} ellipsizeMode="tail">
          {liveRoomName}
        </Text>
        <LastSeenView />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
    flexGrow: 1,
  },
  avatarContainer: {
    marginLeft: 5,
    justifyContent: "center",
  },
  avatar: {
    height: 32,
    width: 32,
  },
  roomInfoContainer: {
    marginLeft: 10,
    height: "100%",
    justifyContent: "center",
    flexGrow: 1,
    paddingRight: 8,
  },
  onlineDot: {
    position: "absolute",
    bottom: 1,
    right: -1,
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.onlineGreen,
    borderWidth: 1,
    borderColor: Colors.light.White,
  },
});
