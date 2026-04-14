import { StyleSheet, View } from "react-native";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import ChatSearchTopBar from "./ChatSearchTopBar";
import HeaderLeftActions from "./HeaderLeftActions";
import HeaderRightActions from "./HeaderRightActions";
//import liraries
import React, { useContext } from "react";
import { chatSearchEnabledAtom } from "@Atoms/ChatMessageEvents";
import { useNavigation } from "@react-navigation/core";
import {
  IsAttachmentSelectionVisibleAtom,
  MultiSelectionAtom,
  MultiSelectionTypeAtom,
  selectedForwardMessagesListAtom,
  selectedMessageAtom,
} from "@Atoms/ChatMessageEvents";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { ChatContext } from "@/Context/ChatProvider";

export default function ChatMessageHeader() {
  const searchEnable = useAtomValue(chatSearchEnabledAtom);
  const navigation = useNavigation();

  const { setRoomId } = useContext(ChatContext);
  const setSelectedOptionItem = useSetAtom(selectedMessageAtom);
  const setCidList = useSetAtom(selectedForwardMessagesListAtom);
  const setMultiSelectionType = useSetAtom(MultiSelectionTypeAtom);
  const setMultiSelection = useSetAtom(MultiSelectionAtom);
  const setVisibleMore = useSetAtom(IsAttachmentSelectionVisibleAtom);

  if (searchEnable) {
    return <ChatSearchTopBar />;
  } else {
    return (
      <View style={styles.container}>
        <HeaderLeftActions
          onBackPress={() => {
            setCidList([]);
            setSelectedOptionItem(null);
            setMultiSelectionType("");
            setMultiSelection(false);
            setVisibleMore(false);
            global.roomId = null;
            setRoomId("");
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("BottomTabScreen", {
                screen: "ChatListScreen",
              });
            }
          }}
          onProfilePress={() => {
            navigation.navigate("ChatProfileScreen", {});
            socketConnect.emit("getFavouriteChats", { roomId: global.roomId });
          }}
        />
        <HeaderRightActions isCalling={true} isSetting={true} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    // backgroundColor: "green",
    flexDirection: "row",
    height: 60,
  },
}); 
