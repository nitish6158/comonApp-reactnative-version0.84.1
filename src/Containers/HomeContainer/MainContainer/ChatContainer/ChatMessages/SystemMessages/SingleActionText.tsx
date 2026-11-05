import { View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { Conversation } from "@/models/chatmessage";
import { useAtomValue } from "jotai";
import { singleRoom } from "@/Atoms";
import { useTranslation } from "react-i18next";
import WarnMessage from "./WarnMessage";

type SingleActionTextType = {
  message: Conversation;
};

export default function SingleActionText({ message }: SingleActionTextType) {
  const display = useAtomValue(singleRoom);
  const [singleActionUserName, setSingleActionUserName] = useState<string>("");
  const [action,setAction] = useState<string>(message.message)

  const { t } = useTranslation();

  useEffect(() => {
    if (message?.type == "videoCall") {
      setAction("Started Video Call")
    }
    if (message?.type == "audioCall") {
      setAction("Started Audio Call")
    }

    if (message.sender == display.currentUserUtility.user_id) {
      setSingleActionUserName(t("navigation.you"));
    } else {
      const senddata = display?.participants?.filter((roomitem) => roomitem?.user_id == message.sender);
      if (senddata.length > 0) {
        setSingleActionUserName(senddata[0].firstName + " " + senddata[0].lastName);
      }
    }

    if (message?.type == "taskAssigned") {
      const orgName = typeof message?.message == "string" ? JSON.parse(message?.message) : message?.message;

      if (message.sender == display.currentUserUtility.user_id) {
        if (display?.participants[0]?.firstName) {
          const name = `${display?.participants[0].firstName} ${display?.participants[0].lastName}`;
          setSingleActionUserName(`${t("assignedNewTask")} ${orgName?.scenarioName} ${t("to")} ${name}`);
        } else {
          setSingleActionUserName(
            `${t("assignedNewTask")} ${orgName?.scenarioName} ${t("to")} ${display?.participants[0]?.phone}`
          );
        }
      } else {
        if (display?.participants[0]?.firstName) {
          const name = `${display?.participants[0]?.firstName} ${display?.participants[0]?.lastName}`;
          setSingleActionUserName(`${name} ${t("hasAssigned")} ${orgName?.scenarioName}`);
        } else {
          setSingleActionUserName(`${display?.participants[0]?.phone} ${t("hasAssigned")} ${orgName?.scenarioName}`);
        }
      }
    }
  }, []);

  return (
    <WarnMessage
      Message={message?.type == "taskAssigned" ? "" : `${action}`}
      userone={singleActionUserName}
      fullMessage={undefined}
      usertwo={""}
      isInvitation={false}
      onPress={() => {}}
      invitationRenderer={false}
      loader={undefined}
    />
  );
}
