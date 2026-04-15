import { Dimensions, StyleSheet, View } from "react-native";
import React, { useCallback, useMemo } from "react";

import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";
import FormatTextRender from "@Components/formatTextRender";
import Text from "@Components/Text";
import dayjs from "dayjs";
import isActiveAction from "@Util/helpers/isActionActive";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom, useAtomValue } from "jotai";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Reducer";
import DoubleCheckChatMessage from "@Images/DoubleCheckChatMessage.svg";
import Check from "@Images/Check.svg";
import { useTranslation } from "react-i18next";
import Octicons from "react-native-vector-icons/Octicons";
import { useAppSelector } from "@/redux/Store";

const { height, width } = Dimensions.get("window");

type props = {
  isMessageForwarded: boolean;
  message: Conversation;
  searchText: string;
  showMessageText: boolean;
  showForwardBadge?: boolean;
  showStatusRow?: boolean;
  children: JSX.Element;
};

export default function MessageCommonWrapper({
  isMessageForwarded,
  message,
  searchText,
  showMessageText,
  showForwardBadge = true,
  showStatusRow = true,
  children,
}: props) {
  const display = useAtomValue(singleRoom);
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const { comonContact } = useSelector((state: RootState) => state.Contact);

  const { t } = useTranslation();

  const UnixTime = useCallback(() => {
    const time = dayjs(message.created_at).format("HH:mm");
    return (
      <View>
        <Text
          size={MyProfile?.mode == "CLASSIC" ? "xs" : "md"}
          style={styles.recevierTime}
          lineNumber={4}
        >
          {time}
        </Text>
      </View>
    );
  }, [message.created_at]);

  const isFavoriteMessage = useMemo(() => {
    return (
      isActiveAction(
        message.favourite_by,
        display.currentUserUtility.user_id
      ) && message?.deleted[0]?.type !== "everyone"
    );
  }, [message.favourite_by, message?.deleted[0]?.type]);

  const FormattedMessage = useMemo(() => {
    const regex = /@\[([^\]]+)\]\(([a-zA-Z0-9]{24})\)/g;
    let resultMessage = message.message;
    const matches = resultMessage.match(regex) ?? [];

    // console.log(message, matches);
    if (matches.length > 0) {
      const ids = [];
      for (let i = 0; i < matches?.length; i++) {
        const start = matches[i].indexOf("(");
        const end = matches[i].indexOf(")");
        const userID = matches[i].slice(start + 1, end);
        const phoneStart = matches[i].indexOf("[");
        const phoneEnd = matches[i].indexOf("]");
        const phone = matches[i].slice(phoneStart + 1, phoneEnd - 1);

        if (display.currentUserUtility.user_id == userID) {
          ids?.push("You");
        } else {
          const isExist = comonContact.find(
            (contact) => contact.userId?._id == userID
          );
          if (isExist) {
            ids?.push(`${isExist.firstName} ${isExist.lastName}`);
          } else {
            ids?.push(phone);
          }
        }
      }

      for (let i = 0; i < matches.length; i++) {
        resultMessage = resultMessage?.replace(matches[i], ` @${ids[i]} @`);
      }
    }

    return resultMessage;
  }, [display.roomType, message.message, display.participants, comonContact]);

  const doubleCheckVisibility = useMemo(() => {
    if (display.roomType == "group") {
      return (
        message?.delivered_to.length == display.participantsNotLeft.length - 1
      );
    } else if (display.roomType == "self") {
      return true;
    } else {
      return message.delivered_to.length > 0;
    }
  }, [display.roomType, message.delivered_to, display.participantsNotLeft]);

  const readView = useMemo(() => {
    if (
      message?.receipts == false &&
      message.sender == display.currentUserUtility.user_id
    ) {
      return true;
    }
    if (message.read_by.length > 0 && display.roomType != "self") {
      return false;
    } else if (message.sender == display.currentUserUtility.user_id) {
      return true;
    } else {
      return false;
    }
  }, [message.read_by, message.sender, display.roomType]);


  return (
    <View>
      {showForwardBadge && isMessageForwarded && (
        <View style={styles.replyCon}>
          <Entypo
            name="forward"
            size={15}
            style={{ marginRight: 5 }}
            color={Colors.light.black}
          />
          <Text style={{ color: Colors.light.black }} size="xs">{`${t(
            "forwarded"
          )}`}</Text>
        </View>
      )}
      {children}

      {FormattedMessage.length > 0 && showMessageText && (
        <View style={{ marginBottom: 3 }}>
          <FormatTextRender
            searchText={searchText}
            message={FormattedMessage}
          />
        </View>
      )}
      {showStatusRow && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-end",
            marginTop: 5,
          }}
        >
          {isFavoriteMessage && <Entypo name="star" size={14} color="gray" />}
          <UnixTime />
          {readView && (
            <View style={{ marginLeft: 5 }}>
              {doubleCheckVisibility ? (
                <DoubleCheckChatMessage />
              ) : message?.isSent ? (
                <Check height={9} />
              ) : (
                <Ionicons name="time-outline" size={14} color="gray" />
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    backgroundColor: Colors.light.gray,
    borderRadius: 12,
    height: 245,
    overflow: "hidden",
    width: 185,
  },
  recevierTime: {
    color: "rgba(51,51,51,.8)",
    marginLeft: 4,
    textAlign: "right",
  },
  replyCon: {
    alignItems: "center",
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 2,
    paddingVertical: 3,
    width: width / 4.5,
  },
});
