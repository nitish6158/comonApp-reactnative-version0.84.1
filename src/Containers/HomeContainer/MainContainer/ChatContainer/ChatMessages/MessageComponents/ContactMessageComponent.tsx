import { Text, View } from "react-native";

import ChatContactView from "@Components/ChatContactView";
import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";
import DeleteMessageText from "@Util/chatUtils/deleteMessageText";
import MessageCommonWrapper from "./MessageCommonWrapper";
import React from "react";
import { RootState } from "@Store/Reducer";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

type props = {
  isVisible: boolean;
  isMessageDeletedForEveryOne: boolean;
  isMessageForwarded: boolean;
  message: Conversation;
  searchText: string;
};

export default function ContactMessageComponent({
  isVisible,
  isMessageDeletedForEveryOne,
  isMessageForwarded,
  message,
  searchText,
}: props) {
  const [display] = useAtom(singleRoom);
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const { t } = useTranslation();

  if (!isVisible) {
    return null;
  } else if (isMessageDeletedForEveryOne) {
    return (
      <Text style={{ color: Colors.light.black, fontStyle: "italic", fontSize: 13 }}>
        {DeleteMessageText(message, display.currentUserUtility.user_id, t)}
      </Text>
    );
  } else {
    return (
      <MessageCommonWrapper
        isMessageForwarded={isMessageForwarded}
        message={message}
        showMessageText={false}
        searchText={searchText}
      >
        <ChatContactView
       
          ContactInfo={JSON.parse(message.message)}
          MyProfile={MyProfile}
          item={message}
        />
      </MessageCommonWrapper>
    );
  }
}
