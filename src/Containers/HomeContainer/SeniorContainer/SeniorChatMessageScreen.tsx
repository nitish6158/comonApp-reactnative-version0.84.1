import { View, Text, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { SeniorChatMessageScreenProps } from "@/navigation/screenPropsTypes";
import { useAtomValue, useSetAtom } from "jotai";
import { chatSearchEnabledAtom, singleRoom } from "@/Atoms";
import { Colors } from "@/Constants";
import DeleteForwardModal from "../MainContainer/ChatContainer/ChatMessages/DeleteMessageModal";
import ChatMessageHeader from "../MainContainer/ChatContainer/ChatMessages/Header";
import ChatMessageWrapper from "../MainContainer/ChatContainer/ChatMessages/ChatMessageWrapper";
import ChatListData from "../MainContainer/ChatContainer/ChatMessages/ChatListItem";
import ChatBottomView from "../MainContainer/ChatContainer/ChatMessages/ChatBottomView";
import { ListItem } from "react-native-elements";
import AntDesign from "react-native-vector-icons/AntDesign";
import { AvtaarWithoutTitle } from "@/Components";
import { DefaultImageUrl, ImageUrl } from "@/graphql/provider/endpoints";
import HeaderLeftActions from "../MainContainer/ChatContainer/ChatMessages/Header/HeaderLeftActions";
import { useNavigation } from "@react-navigation/core";
import HeaderRightActions from "../MainContainer/ChatContainer/ChatMessages/Header/HeaderRightActions";
import ModalTextInput from "./components/ModalTextInput";
import useRoomDataFormatter from "@/hooks/useRoomDataFormatter";
import LottieView from "lottie-react-native";
import { ChatContext } from "@/Context/ChatProvider";

export default function SeniorChatMessageScreen({ navigation, route }: SeniorChatMessageScreenProps) {
  global.roomId = route.params?.roomId;
  const display = useRoomDataFormatter(route.params?.roomId);
  const setChatSearch = useSetAtom(chatSearchEnabledAtom);
  const { setRoomId } = React.useContext(ChatContext);

  useEffect(() => {
    if (route?.params?.roomId) {
      setRoomId(route.params.roomId);
    }
  }, [route?.params?.roomId, setRoomId]);

  useEffect(() => {
    return () => {
      setChatSearch(false);
    };
  }, [setChatSearch]);


  if (!display) {
    return <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
      <LottieView style={{ height: 300, width: 300 }} source={require("../../../../assets/lottie/chatloading.json")} autoPlay loop />
    </View>
  }


  return (
    <View style={styles.main}>
      <View style={styles.container}>
        <View style={styles.header}>
          <HeaderLeftActions
            onBackPress={() => {
              navigation.replace("SeniorChatScreen", {});
            }}
            onProfilePress={() => { }}
          />
          <HeaderRightActions isCalling={true} isSetting={false} />
        </View>
        <ChatMessageWrapper
          type="chat"
          bgImage={{ opacity: display.roomWallpaper.opacity, fileName: display.roomWallpaper.url }}
        >
          <ChatListData />
        </ChatMessageWrapper>
        <ChatBottomView />

        <DeleteForwardModal />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  main: {
    backgroundColor: "white",
    flex: 1,
  },
  container: {
    backgroundColor: Colors.light.White,
    flex: 1,
  },
  header: {
    height: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
