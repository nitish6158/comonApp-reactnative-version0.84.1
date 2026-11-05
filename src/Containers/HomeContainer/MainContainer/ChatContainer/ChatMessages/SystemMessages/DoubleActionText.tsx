import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Conversation } from "@/models/chatmessage";
import {
  OrganizationsQuery,
  useAcceptMutation,
  useDeclineMutation,
} from "@/graphql/generated/organization.generated";
import { useAppSelector } from "@/redux/Store";
import { useAtomValue, useSetAtom } from "jotai";
import { useDispatch } from "react-redux";
import { useOrganizations, useTaskReport } from "@/hooks";
import { useNavigation } from "@react-navigation/core";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import ToastMessage from "@/utils/ToastMesage";
import { setOrganisationInvites } from "@/redux/Reducer/OrganisationsReducer";
import WarnMessage from "./WarnMessage";
import { refreshInvite, singleRoom } from "@/Atoms";

type invited = {
  pid: string;
  orgId: string;
  orgName: string;
  inviteId: string;
  msg: string;
};

type DoubleActionTextType = {
  message: Conversation;
  OrganisationInvites: any;
};

export default function DoubleActionText({
  message,
  OrganisationInvites,
}: DoubleActionTextType) {
  const comonContacts = useAppSelector((state) => state.Contact.comonContact);
  const display = useAtomValue(singleRoom);
  const setInvitationRefresh = useSetAtom(refreshInvite);
  const [loader, setLoader] = useState<{ status?: string; id?: string }>();

  const [acceptRequest] = useAcceptMutation();
  const [declineRequest] = useDeclineMutation();
  const dispatch = useDispatch();
  const { switchOrganization, FetchAllOrganisation } = useOrganizations();
  const { fetchAllAssigment } = useTaskReport();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [warnMessageText, setWarnMessageText] = useState<any>("");
  const [senderName, setSenderName] = useState<string>("");
  const [namePid, setNamePid] = useState<string>("");

  useEffect(() => {
    const value = JSON.parse(message.message);
    const currentUserId = display.currentUserUtility.user_id;

    // Determine invitee and sender names
    const isCurrentUserReceiver = currentUserId === value.pid;
    const inviteName = isCurrentUserReceiver
      ? t("navigation.you")
      : getParticipantName(value.pid, display.participants, comonContacts, "Unknown");

    const isCurrentUserSender = currentUserId === message.sender;
    const senderName = isCurrentUserSender
      ? t("navigation.you")
      : getParticipantName(message.sender, display.participants, comonContacts, "Unknown");

    setNamePid(inviteName);
    setSenderName(senderName);

    // Determine message type
    if (message?.type === "invited") {
      setWarnMessageText({
        msg: setInvitationMessage(currentUserId, inviteName, value?.orgName),
        orgId: value.orgId,
        inviteId: value.inviteId,
      });
      setNamePid("")
    } else if (message?.type === "declined") {
      const { date, time } = formatDateTime(message?.created_at);
      setWarnMessageText({
        msg: setDeclinedMessage(currentUserId, value?.orgName, date, time),
      });
    } else if (message.type === "addedUser") {
      setWarnMessageText({ msg: "added" });
    } else if (message.type === "removedUser") {
      setWarnMessageText({ msg: "removed" });
    }
  }, [message, display, comonContacts, t]);


  const formatDateTime = (dateTime:number) => ({
    date: dayjs(dateTime).format("MMM DD, YYYY"),
    time: dayjs(dateTime).format("HH:mm "),
  });
  
  const getParticipantName = (userId, participants, contacts, defaultName) => {
    const participant = participants.find((v) => v.user_id === userId);
    if (participant) {
      const contact = contacts.find((v) => v.userId?._id === participant.user_id);
      return contact
        ? `${contact.firstName ?? ""} ${contact.lastName ?? ""}`.trim()
        : participant.phone || defaultName;
    }
    return defaultName;
  };
  
  const setInvitationMessage = ( currentUserId:string, inviteName:string, orgName:string) => {
    return message.sender === currentUserId
      ? `${t("navigation.you")} ${t("invited")} ${inviteName} ${t("toJoin")} ${orgName}`
      : `${t("task.invited you")} ${orgName}`;
  };
  
  const setDeclinedMessage = (currentUserId:string, orgName:string, date:string, time:string) => {
    return message.sender === currentUserId
      ? `${t("navigation.you")} ${t("declinedInvitationInitial")} ${orgName} ${t("chatProfile.on")} ${date} ${t("at around")} ${time}, ${t("noLongerPossible")}`
      : `${t("hasDeclined")} ${orgName} ${t("chatProfile.on")} ${date} ${t("at around")} ${time}, ${t("noLongerPossible")}`;
  };

  return (
    <WarnMessage
      fullMessage={message}
      Message={`${warnMessageText?.msg}  `}
      userone={senderName}
      usertwo={namePid}
      isInvitation={
        message.type === "invited"
          ? message?.inviteStatus !== "ACCEPTED"
          : false
      }
      onPress={onPressInvitation}
      invitationRenderer={
        message.type === "invited" &&
        warnMessageText?.orgId &&
        message?.sender !== display?.currentUserUtility?.user_id
          ? message?.inviteStatus !== "DECLINED"
          : false
      }
      loader={loader}
    />
  );

  

  async function onPressInvitation(type: "accept" | "decline" | "view") {
    if (type === "accept") {
      if (!warnMessageText?.inviteId) return;
      setLoader({ status: "accept", id: message?._id });
      try {
        const response = await acceptRequest({
          variables: {
            input: {
              _id: warnMessageText?.inviteId,
              msgId: message?._id,
              orgId: warnMessageText?.orgId,
            },
          },
        });
        if (response.errors) {
          console.error("Error accepting invitation", response.errors?.message);
          ToastMessage(t("label.error-in-accepting-invitation"));
          setLoader(undefined);
          return;
        }
        const updatedInvites = OrganisationInvites.filter(
          (value) => value._id !== warnMessageText?.inviteId
        );
        dispatch(setOrganisationInvites(updatedInvites));
        setInvitationRefresh(true);
        await FetchAllOrganisation();
        ToastMessage(t("label.invitation-accepted"));
      } catch (err) {
        console.error("Error accepting invitation", err?.message);
        const message = JSON.parse(err?.message);
        if (message?.message) ToastMessage(message?.message);
      } finally {
        setLoader(undefined);
      }
    } else if (type === "decline") {
      if (!warnMessageText?.inviteId) return;
      setLoader({ status: "decline", id: message?._id });
      try {
        const response = await declineRequest({
          variables: {
            input: {
              _id: warnMessageText?.inviteId,
              msgId: message?._id,
              orgId: warnMessageText?.orgId,
            },
          },
        });
        if (response.errors) {
          console.error("Error declining invitation", response.errors);
          ToastMessage(t("label.error-in-declining-invitation"));
          setLoader(undefined);
          return;
        }
        const updatedInvites = OrganisationInvites.filter(
          (value) => value._id !== warnMessageText?.inviteId
        );
        dispatch(setOrganisationInvites(updatedInvites));
        setInvitationRefresh(true);
        ToastMessage(t("label.invitation-declined"));
      } catch (err) {
        console.error("Error declining invitation", err);
        const message = JSON.parse(err?.message);
        if (message?.message) ToastMessage(message?.message);
      } finally {
        setLoader(undefined);
      }
    } else {
      if (!warnMessageText?.orgId) return;
      setLoader({ status: "view", id: message?._id });
      global.activeOrg = warnMessageText?.orgId;
      try {
        const res = await switchOrganization(warnMessageText?.orgId);
        await fetchAllAssigment(res);
        navigation.navigate("TaskTabScreen");
      } catch (err) {
        console.error("Error switching organization", err);
      } finally {
        setLoader(undefined);
      }
    }
  }
}
