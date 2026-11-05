import { Pressable, StyleSheet, View } from "react-native";
import React, { useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";

import Colors from "@/Constants/Colors";
import CrossGray from "@Images/CrossGray.svg";
import FormatTextRender from "@Components/formatTextRender";
import PinwhiteColor from "@Images/PinwhiteColor.svg";
import Text from "@Components/Text";
import { UnixDate } from "@Util/date";
import { isEmpty } from "lodash";
import { navigate } from "@Navigation/utility";
import { singleRoom } from "@Atoms/singleRoom";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketManager } from "@/utils/socket/SocketManager";
import { socketConnect } from "@/utils/socket/SocketConnection";

interface PinChatProps {
  message: string;
  Cid: string;
  Item: any;
  ChatData: any[];
  activeRoomid: string;
  navigation: any;
  conversationMessageIndex: number | null;
  onUnpin?: (messageId: string) => void; // Added onUnpin callback
}

function PinChat({
  message,
  Cid,
  Item,
  ChatData,
  activeRoomid,
  navigation,
  conversationMessageIndex,
  onUnpin
}: PinChatProps) {
  const display = useAtomValue(singleRoom);

  const FormattedMessage = useMemo(() => {
    const regex = /@\[([^\]]+)\]\(([a-zA-Z0-9]{24})\)/g;
    let resultMessage = message;
    if (display.roomType == "group" && resultMessage) {
      const matches = resultMessage.match(regex) ?? [];

      if (matches.length > 0) {
        const ids = [];
        for (let i = 0; i < matches?.length; i++) {
          const start = matches[i].indexOf("(");
          const end = matches[i].indexOf(")");
          const userID = matches[i].slice(start + 1, end);
          const pUser = display.participants.find(
            (it: { user_id: any }) => it.user_id == userID
          );

          if (pUser?.user_id == display.currentUserUtility.user_id) {
            ids?.push("You");
          } else {
            ids?.push(`${pUser?.firstName} ${pUser?.lastName}`);
          }
        }

        for (let i = 0; i < matches.length; i++) {
          resultMessage = resultMessage?.replace(matches[i], ` @${ids[i]}  @`);
        }
      }
    }
    return resultMessage ?? "";
  }, [display.roomType, message, display.participants]);

  const renderMessage = () => {
    switch (Item.type) {
      case "text":
        return (
          <Text ellipsizeMode="tail" style={{ marginLeft: 10, fontSize: 14 }}>
            <FormatTextRender message={FormattedMessage} />
          </Text>
        );

      default:
        return (
          <Text ellipsizeMode="tail" style={{ marginLeft: 10 }}>
            <FormatTextRender message={Item.type} />
          </Text>
        );
    }
  };

  // Handle unpinning a message
  const handleUnpin = () => {
    // Call the socket API to unpin the message
    socketManager.conversation.pinMessage(activeRoomid || display.roomId, Cid);
    socketConnect.emit("unpinChat", { cid: Cid, roomId: activeRoomid || display.roomId });

    // Update the local state immediately via the callback
    if (onUnpin) {
      onUnpin(Cid);
    }
  };

  return (
    <>
      <Pressable
        key={Cid}
        style={styles.container}
        onPress={() => {
          // Use provided conversationMessageIndex if exists
          const msgIndex = conversationMessageIndex !== null
            ? conversationMessageIndex
            : ChatData.findIndex((c: { _id: any }) => c._id === Cid);

          navigate("ChatMessageScreen", {
            type: display.roomType,
            RoomId: activeRoomid || display.roomId,
            conversationMessageIndex: msgIndex,
          });
        }}
      >
        <View style={styles.pinIconContainer}>
          <PinwhiteColor color="white" />
        </View>

        <View style={styles.messageContainer}>
          {renderMessage()}

          <Text style={styles.timestampText}>
            Attached{" "}
            {isEmpty(Item?.PinBy)
              ? UnixDate(new Date().getTime())
              : UnixDate(Item?.PinBy[0]?.pin_at)}
          </Text>
        </View>
        <Pressable
          style={styles.unpinButton}
          onPress={handleUnpin}
        >
          <CrossGray />
        </Pressable>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingVertical: 10,
    backgroundColor: "#F3F9FC",
  },
  pinIconContainer: {
    height: 25,
    width: 25,
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  messageContainer: {
    flex: 3,
    marginHorizontal: 10
  },
  timestampText: {
    color: Colors.light.Hiddengray,
    marginLeft: 10,
    fontSize: 12,
  },
  unpinButton: {
    marginTop: 10,
    width: 20,
    alignSelf: "center",
    height: 20
  }
});

export default PinChat;
