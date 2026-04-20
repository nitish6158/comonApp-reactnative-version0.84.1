import { Pressable, View, Text, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";
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
import NetInfo from "@react-native-community/netinfo";
import FastImage from "@d11/react-native-fast-image";
import { t } from "i18next";

export default function SeniorChatMessageScreen({ navigation, route }: SeniorChatMessageScreenProps) {
  global.roomId = route.params?.roomId;
  const currentRoomId = route.params?.roomId;
  const display = useRoomDataFormatter(currentRoomId);
  const setChatSearch = useSetAtom(chatSearchEnabledAtom);
  const { setRoomId } = React.useContext(ChatContext);
  const [networkOffline, setNetworkOffline] = useState<boolean>(false);
  const isDisplayReady = !!display && display.roomId === currentRoomId;

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

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkOffline(!state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (networkOffline && !isDisplayReady) {
    return (
      <>
        <Pressable
          onPress={() => {
            navigation.replace("SeniorChatScreen", {});
          }}
          style={styles.backContainer}
        >
          <AntDesign name="arrowleft" size={30} color="black" />
        </Pressable>
        <View style={[styles.container, styles.center]}>
          <FastImage
            style={styles.avatar}
            source={require("../../../../assets/images/avatar/IndivitualAvtaar.png")}
          />
          <Text style={styles.titleText}>
            {t("chat-screen.unable-to-load-message-from-storage")}
          </Text>
          <Text style={styles.subtitleText}>{t("chat-screen.try-again")}</Text>
        </View>
      </>
    );
  }

  if (!isDisplayReady) {
    return (
      <View style={[styles.container, styles.center]}>
        <LottieView
          style={{ height: 300, width: 300 }}
          source={require("../../../../assets/lottie/chatloading.json")}
          autoPlay
          loop
        />
        <FastImage
          style={styles.avatar}
          source={require("../../../../assets/images/avatar/IndivitualAvtaar.png")}
        />
        <Text style={styles.titleText}>{t("chat-screen.loading-messages")}</Text>
        <Text style={styles.subtitleText}>{t("chat-screen.fetch-messages")}</Text>
      </View>
    );
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
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  backContainer: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 30,
    marginBottom: 30,
  },
  titleText: {
    fontSize: 18,
    color: "rgba(51,51,51,1)",
    marginTop: 5,
  },
  subtitleText: {
    fontSize: 14,
    color: "rgba(51,51,51,.7)",
    marginTop: 5,
  },
});
