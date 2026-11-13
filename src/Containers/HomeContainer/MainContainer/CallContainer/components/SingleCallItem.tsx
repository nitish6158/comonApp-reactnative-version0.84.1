// @ts-nocheck
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { MyCallListReponse } from "@Service/generated/call.generated";
import { ParticipantType } from "@Service/generated/types";
import { GroupUrl, ImageUrl } from "@Service/provider/endpoints";
import { RootState } from "@Store/Store";
import { incoming, outgoing } from "@Util/CallHistoryIcon";
import CallParticipant from "./CallParticipant";

type SingleCallItemProps = {
  item: MyCallListReponse;
  isAllCalls?: boolean;
};

function getCallParticipantDisplayDetails(
  item: MyCallListReponse,
  participants: ParticipantType[],
  myProfileId?: string
) {
  switch (item?.call?.roomType) {
    case "group":
      return {
        name: item.call.roomId != null ? item.call.roomId.name : "Group call",
        profile_img: item.call.roomId != null ? item.call.roomId.profile_img : GroupUrl,
        phone: "",
        lastSeen: "",
        callRequestData: {
          callType: item.call.type,
          roomType: item.call.roomType,
          roomId: item.call.roomId?._id,
          callBackground: item.call.roomId != null ? item.call.roomId.profile_img : "",
          roomName: item.call.roomId != null ? item.call.roomId.name : "Group call",
          participants: [],
          isReceiver: false as const,
        },
      };

    case "contact_group": {
      const participantNames = participants.reduce<string | null>((acc, participant, index) => {
        if (index === 0) {
          return participant.userId.firstName;
        }
        return `${acc}, ${participant.userId.firstName}`;
      }, null);

      const resolvedName = participantNames ?? "Contact Group call";
      return {
        name: resolvedName,
        profile_img: `${ImageUrl}`,
        phone: "",
        lastSeen: "",
        callRequestData: {
          callType: item.call.type,
          roomType: item.call.roomType,
          roomId: null,
          callBackground: `${ImageUrl}`,
          roomName: resolvedName,
          participants: participants.map((par) => par.userId._id),
          isReceiver: false as const,
        },
      };
    }

    case "contact": {
      const others = participants.filter((e) => e?.userId?._id != myProfileId);
      const baseName = `${participants[0]?.userId?.firstName ?? ""} ${participants[0]?.userId?.lastName ?? ""}`.trim();
      const participantName =
        others.length > 1 ? `${baseName}(+${others.length - 1})` : baseName;
      return {
        name: participantName,
        profile_img: participants.length > 0 ? participants[0].userId.profile_img : "",
        phone: participants.length > 0 ? participants[0].userId.phone : "",
        lastSeen: participants.length > 0 ? participants[0].userId.lastSeen : "0",
        callRequestData: {
          callType: item.call.type,
          roomType: item.call.roomType,
          roomId: null,
          callBackground: participants.length > 0 ? participants[0].userId.profile_img : "",
          roomName: baseName,
          participants: participants.map((par) => par.userId._id),
          isReceiver: false as const,
        },
      };
    }

    case "individual": {
      const others = participants.filter((e) => e?.userId?._id != myProfileId);
      const baseName = `${participants[0]?.userId?.firstName ?? ""} ${participants[0]?.userId?.lastName ?? ""}`.trim();
      const name = others.length > 1 ? `${baseName}(+${others.length - 1})` : baseName;
      return {
        name,
        profile_img: participants.length > 0 ? participants[0].userId.profile_img : "",
        phone: participants.length > 0 ? participants[0].userId.phone : "",
        lastSeen: participants.length > 0 ? participants[0].userId.lastSeen : "0",
        callRequestData: {
          callType: item.call.type,
          roomType: item.call.roomType,
          roomId: others.length > 1 ? null : item.call.roomId?._id,
          callBackground: participants.length > 0 ? participants[0].userId.profile_img : "",
          roomName: baseName,
          participants: others.length > 1 ? item?.call?.callParticipants.map((e) => e.userId._id) : [],
          isReceiver: false as const,
        },
      };
    }

    default:
      return {
        name: "",
        profile_img: "",
        phone: "",
        lastSeen: "",
        callRequestData: {
          callType: "",
          roomType: "",
          roomId: null,
          callBackground: "",
          roomName: "",
          participants: [],
          isReceiver: false as const,
        },
      };
  }
}

export default function SingleCallItem({ item, isAllCalls = false }: SingleCallItemProps) {
  const MyProfile = useSelector((state: RootState) => state.Chat.MyProfile);
  const { comonContact } = useSelector((state: RootState) => state.Contact);

  const { initiator, status, participants } = useMemo(() => {
    const resolved: ParticipantType[] = [];
    let isInitiator = false;
    let callStatusValue = "";

    item?.call?.callParticipants.forEach((it) => {
      if (it.userId._id != MyProfile?._id) {
        const contactMatch = comonContact.find((c) => c.userId?._id == it.userId._id);
        if (contactMatch) {
          resolved.push({
            ...it,
            userId: {
              ...it.userId,
              firstName: contactMatch.firstName || "",
              lastName: contactMatch.lastName || "",
            },
          });
        } else {
          resolved.push({
            ...it,
            userId: {
              ...it.userId,
              firstName: it.userId.phone,
              lastName: "",
            },
          });
        }
      } else {
        isInitiator = MyProfile?._id === item?.call?.origin;
        callStatusValue = it.callStatus;
      }
    });

    if (!isAllCalls && !callStatusValue && resolved.length > 0) {
      isInitiator = MyProfile?._id === item?.call?.origin;
      callStatusValue = resolved[0].callStatus;
    }

    return { initiator: isInitiator, status: callStatusValue, participants: resolved };
  }, [item?.call?.callParticipants, item?.call?.origin, comonContact, MyProfile?._id, isAllCalls]);

  const callStatus = useMemo(() => {
    if (initiator) {
      return outgoing[isAllCalls && status === "missed" ? "initiator" : status];
    }
    return incoming[status];
  }, [initiator, status, isAllCalls]);

  const type = useMemo(() => item?.call?.type.toUpperCase(), [item?.call?.type]);

  const { name, phone, profile_img, callRequestData, lastSeen } = useMemo(
    () => getCallParticipantDisplayDetails(item, participants, MyProfile?._id),
    [item, participants, MyProfile?._id]
  );

  return (
    <CallParticipant
      item={item}
      name={name}
      phone={phone}
      lastSeen={lastSeen}
      ProfileImage={profile_img}
      callCount={item.count ? item.count.toString() : 0}
      type={callStatus}
      roomType={item?.call?.roomType}
      callRequestData={callRequestData}
      mode={type}
      time={item.call?.callStartedAt ? item.call?.callStartedAt.toString() : ""}
      categoryId={item.categoryId ? item.categoryId : ""}
      isAllCalls={isAllCalls}
    />
  );
}

