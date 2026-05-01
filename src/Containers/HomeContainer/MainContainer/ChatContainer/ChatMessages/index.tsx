import React, { useCallback, useContext, useEffect, useState } from "react";
import { Alert, AppState, Pressable, StyleSheet, View } from "react-native";
import { useSetAtom } from "jotai";
import ChatBottomView from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/ChatBottomView";
import ChatListData from "./ChatListItem";
import ChatMessageHeader from "./Header";
import ChatMessageWrapper from "./ChatMessageWrapper";
import Colors from "@/Constants/Colors";
import DeleteForwardModal from "./DeleteMessageModal";
import { chatSearchEnabledAtom } from "@/Atoms";
import useRoomDataFormatter from "@/hooks/useRoomDataFormatter";
import { socketManager } from "@/utils/socket/SocketManager";
import { socketConnect } from "@/utils/socket/SocketConnection";
import LottieView from "lottie-react-native";
import { Text } from "react-native-elements";
import FastImage from "@d11/react-native-fast-image";
import { ChatContext } from "@/Context/ChatProvider";
import { navigateBack } from "@/navigation/utility";
import AntDesign from "react-native-vector-icons/AntDesign";
import NetInfo from "@react-native-community/netinfo";
import { t } from "i18next";

function ChatMessages({ navigation, route }: any) {
  global.roomId = route.params.RoomId;
  const currentRoomId = route?.params?.RoomId;
  const display = useRoomDataFormatter(currentRoomId);
  const {
    setRoomId,
    setConversation,
    conversation,
    isFetching,
    isFirstLoad,
  } = useContext(ChatContext);
  const setChatSearch = useSetAtom(chatSearchEnabledAtom);
  const [networkOffline, setNetworkOffline] = useState<boolean>(false);
  const isDisplayReady = !!display && display.roomId === currentRoomId;

  const refreshMessages = useCallback(() => {
    const roomId = route?.params?.RoomId;
    if (!roomId) return;
    socketManager.chatRoom.getChatMeesagesByDays(roomId, 1, 100, (data) => {
      if (Array.isArray(data?.chats)) {
        setConversation(data.chats);
      }
    });
  }, [route?.params?.RoomId, setConversation]);

  useEffect(() => {
    if (route?.params?.RoomId) {
      setRoomId(route.params.RoomId);
    }
  }, [route?.params?.RoomId, setRoomId]);

  useEffect(() => {
    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        refreshMessages();
      }
    });
    return () => {
      appStateSub.remove();
    };
  }, [refreshMessages]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkOffline(!state.isConnected);
    });

    return () => {
      unsubscribe(); // cleanup listener
    };
  }, []);
  // Get all chat functionality from ChatProvider context
  // const { conversation, isFetching } = useContext(ChatContext);

  useEffect(() => {
    return () => {
      setChatSearch(false);
    };
  }, [setChatSearch]);
  if (networkOffline && !isDisplayReady) {
    return (
      <>
      <Pressable
      onPress={navigateBack}
      style={{
        backgroundColor: "white",
        paddingHorizontal: 15,
        paddingTop: 20,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <AntDesign name="arrowleft" size={30} color="black" />
    </Pressable>
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <FastImage
          style={{ height: 40, width: 40, borderRadius: 30, marginBottom: 30 }}
          source={require("../../../../../../assets/images/avatar/IndivitualAvtaar.png")}
        />
        <>
          <Text
            style={{ fontSize: 18, color: "rgba(51,51,51,1)", marginTop: 5 }}
          >
            {t('chat-screen.unable-to-load-message-from-storage')}
          </Text>
          <Text
            style={{ fontSize: 14, color: "rgba(51,51,51,.7)", marginTop: 5 }}
          >
            {t('chat-screen.try-again')}
          </Text>
        </>
      </View>
      </>
    );
  }
  const isInitialMessageLoad =
    isDisplayReady && isFirstLoad && isFetching && conversation.length === 0;

  if (!isDisplayReady || isInitialMessageLoad) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <LottieView
          style={{ height: 300, width: 300 }}
          source={require("../../../../../../assets/lottie/chatloading.json")}
          autoPlay
          loop
        />
        <FastImage
          style={{
            height: 40,
            width: 40,
            borderRadius: 30,
            marginBottom: 30,
          }}
          source={require("../../../../../../assets/images/avatar/IndivitualAvtaar.png")}
        />
        <>
          <Text
            style={{
              fontSize: 18,
              color: "rgba(51,51,51,1)",
              marginTop: 5,
            }}
          >
            {t('chat-screen.loading-messages')}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "rgba(51,51,51,.7)",
              marginTop: 5,
            }}
          >
            {t('chat-screen.fetch-messages')}
          </Text>
        </>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ChatMessageHeader />
      <ChatMessageWrapper
        type="chat"
        bgImage={{
          opacity: display.roomWallpaper.opacity,
          fileName: display.roomWallpaper.url,
        }}
      >
        <ChatListData />
      </ChatMessageWrapper>
      <ChatBottomView />
      <DeleteForwardModal />
    </View>
  );
}

const RoomUI = React.memo(ChatMessages);
export default RoomUI;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.White,
    flex: 1,
  },
});
