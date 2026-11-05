import { Text, View } from "react-native";

import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";
import Entypo from "react-native-vector-icons/Entypo";
import React from "react";
import ReplymsgView from "@Util/helpers/replymsgview";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";

type props = {
  isVisible: boolean;
  isMessageDeletedForEveryOne: boolean;
  replyUserName: string;
  message: Conversation;
};

export default function ReplyMessageComponent({
  isVisible,
  isMessageDeletedForEveryOne,
  replyUserName,
  message,
}: props) {
  const [display] = useAtom(singleRoom);

  const { t } = useTranslation();


  if (!isVisible) {
    return null;
  } else if (isMessageDeletedForEveryOne) {
    return null;
  } else {
    return (
      <View style={{ marginBottom: 5 }}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Entypo name="reply" size={15} style={{ marginRight: 5 }} color={Colors.light.black} />
          <Text style={{ fontSize: 12, marginVertical: 5 }}>{t("repliedOn")}</Text>
        </View>
        <View
          style={{
            backgroundColor: display.currentUserUtility.user_id !== message.sender ? "#e0e0e0" : "#b9ecf6",
            // backgroundColor: Colors.light.White,
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderLeftColor: "white",
            borderLeftWidth: 2,
            // marginBottom: 6,
          }}
        >
          <Text style={{ fontWeight: "500", fontStyle: "italic", color: Colors.light.PrimaryColor }}>
            {replyUserName}
          </Text>
          <ReplymsgView SelectedOptionItem={message.reply_msg} mode="list" />
        </View>
      </View>
    );
  }
}
