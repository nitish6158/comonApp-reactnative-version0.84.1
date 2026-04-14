import {
  FlatList,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  View,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ReduxChat, UserType } from "@Types/types";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/core";

import { AllChatRooms } from "@Atoms/allRoomsAtom";
import AvtaarWithoutTitle from "@Components/AvtaarWithoutTitle";
import Colors from "@/Constants/Colors";
import CommonLoader from "@Components/CommonLoader";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import Feather from "react-native-vector-icons/Feather";
import Forward from "@Images/ForwardWhite.svg";
import { RoomData } from "@Store/Models/ChatModel";
import SelectGrupHeader from "../../ChatFolderContainer/CreateFolderScreen/Header";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import fonts from "@/Constants/fonts";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketManager } from "@/utils/socket/SocketManager";
import { socketConnect } from "@/utils/socket/SocketConnection";

interface DataMessage {
  type: string;
  msg: string[];
}

export default function ForwardChatMessage({ route }) {
  const navigation = useNavigation();
  const { Cidlist, fromScreen = null } = route.params;
  const Dispatch = useDispatch();
  const [ChatRooms] = useAtom(AllChatRooms);

  const [RoomidList, setRoomidList] = useState<string[]>([]);
  const [OtherContactId, setOtherContactId] = useState([]);
  const [loading, setLoading] = useState(false);

  const MyProfile: any = useSelector<ReduxChat>(
    (state) => state.Chat.MyProfile
  );
  const [FrequentlyList, setFrequentlyList] = useState<RoomData[]>([]);
  const [OtherList, setOtherListList] = useState<RoomData[]>([]);
  const [display] = useAtom(singleRoom);
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      fetchData();
      setRoomidList([]);
    }, [])
  );

  const CheckMark = () => {
    return (
      <View style={Styles.checked}>
        <Feather name="check" size={13} color="white" />
      </View>
    );
  };
  const UnCheckMark = () => {
    return <View style={Styles.unCheck} />;
  };

  const MAX_RETRIES = 3;

  // Optimized sendMessage function with retry mechanism
  async function sendMessage(roomId, message, attempt = 1) {
    const payload = {
      data: {
        roomId,
        type: message?.type,
        fileURL: message?.fileURL ?? "",
        isForwarded: true,
        message: message?.message,
        fontStyle: "",
        thumbnail: "",
        duration: 0,
      },
      reply_msg: null,
    };

    return new Promise((resolve) => {
      socketManager.conversation.sendChat(payload);
      // Resolve immediately after sending
      resolve();
    });
  }

  // Optimized function to send messages concurrently within a room
  async function sendMessagesToRoom(roomId, messages) {
    try {
      const results = await Promise.allSettled(
        messages.map((msg) => sendMessage(roomId, msg))
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.log(
            `⚠️ Message "${messages[index].message}" failed in room ${roomId}`
          );
        }
      });
    } catch (error) {
      console.error("Error sending messages to room:", error);
    }
  }

  // Optimized function to process all rooms sequentially
  async function sendMessagesToAllRooms(roomIdList, messages) {
    setLoading(true);

    for (const roomId of roomIdList) {
      console.log("room id forward", roomId, messages);
      await sendMessagesToRoom(roomId, messages);
    }

    finalTask(roomIdList, messages);
  }

  // Final task execution
  function finalTask(roomIdList, messages) {
    const messagesList = messages.map((msg) => msg?.server_id);

    // return
    if (RoomidList?.length > 0) {
      socketConnect.emit("forwardChat", {
        rooms: roomIdList,
        messages: messagesList,
      });
      setLoading(false);
      ToastMessage(t("label.message-forwarded"));

      if (fromScreen == null) {
        navigation.navigate("ChatMessageScreen", { RoomId: display.roomId });
      } else {
        navigation.goBack();
      }
    }
  }

  return (
    <View style={Styles.MainContainer}>
      {loading && <CommonLoader />}
      <SelectGrupHeader
        Title="Forward"
        onbackPresss={() => {
          if (fromScreen == null) {
            if (display?.roomId) {
              navigation.navigate("ChatMessageScreen", { RoomId: display.roomId });
            } else {
              navigation.goBack();
            }
          } else {
            navigation.goBack();
          }
        }}
      />

      <SectionList
        showsVerticalScrollIndicator={false}
        sections={[
          {
            key: "frequently",
            data: FrequentlyList,
            name: t("forword.frequently-contacted"),
          },
          {
            key: "others",
            data: OtherList,
            name: t("forword.other-contacted"),
          },
        ]}
        renderSectionHeader={({ section }) => {
          return (
            <View
              style={{
                marginTop: 10,
                paddingVertical: 10,
                paddingHorizontal: 15,
                backgroundColor: Colors.light.LightBlue,
                borderBottomColor: Colors.light.PrimaryColor,
                borderBottomWidth: 0.2,
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 14,
                  fontFamily: fonts.Lato,
                  color: "rgba(51,51,51,.8)",
                }}
              >
                {section.name}
              </Text>
            </View>
          );
        }}
        renderItem={({ item, index }) => {
          return (
            <Pressable
              onPress={() => {
                if (!item?.blocked) {
                  const roomExist = RoomidList.filter((rm) => rm != item?._id);
                  if (roomExist.length != RoomidList.length) {
                    setRoomidList(roomExist);
                  } else {
                    setRoomidList([...roomExist, item?._id]);
                  }
                }
              }}
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                flexDirection: "row",
                height: 50,
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={Styles.RightSideCont}>
                <AvtaarWithoutTitle
                  ImageSource={{
                    uri: `${DefaultImageUrl}${item.display.UserImage}`,
                  }}
                  AvatarContainerStyle={{ height: 32, width: 32 }}
                />
                <Text
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{ marginLeft: 15 }}
                >{`${item.display.UserName}`}</Text>
              </View>
              {item.blocked ? (
                <View
                  style={{
                    backgroundColor: "gray",
                    paddingHorizontal: 10,
                    paddingVertical: 2,
                    borderRadius: 2,
                    marginRight: 5,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 11 }}>Blocked</Text>
                </View>
              ) : (
                <View style={{ marginRight: 15 }}>
                  {RoomidList.indexOf(item?._id) !== -1 ? (
                    <CheckMark />
                  ) : (
                    <UnCheckMark />
                  )}
                  {/* <Text>{JSON.stringify(RoomidList)}</Text> */}
                </View>
              )}
            </Pressable>
          );
        }}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      {RoomidList.length + OtherContactId.length > 0 && (
        <View style={Styles.container}>
          <Text>{RoomidList.length + OtherContactId.length} Selected</Text>
          <View
            style={[
              Styles.iconcontainer,
              { backgroundColor: Colors.light.LightBlue },
            ]}
          ></View>
          <Pressable
            style={Styles.iconcontainer}
            onPress={() => {
              // sendMessagesToAllRooms(RoomidList, Cidlist);
              // socketConnect.emit("forwardChat", { rooms: RoomidList, messages: Cidlist });

              // return;
              setLoading(true);

              // const payload = {
              //   data: {
              //     roomId: display?.roomId,
              //     type: "text",
              //     fileURL: "",
              //     isForwarded: false,
              //     message: message,
              //     fontStyle: "",
              //     thumbnail: "",
              //     duration: 0,
              //   },
              //   reply_msg: null,
              // };

              if (RoomidList.length > 0) {
                socketConnect.emit("forwardChat", {
                  rooms: RoomidList,
                  messages: Cidlist,
                });
                setLoading(false);
                ToastMessage(t("label.message-forwarded"));
                if (fromScreen == null) {
                  navigation.navigate("ChatMessageScreen", {
                    RoomId: display.roomId,
                  });
                } else {
                  navigation.goBack();
                }
              }
            }}
          >
            <Forward />
          </Pressable>
        </View>
      )}
    </View>
  );

  async function fetchData() {
    try {
      // socketConnect.emit("getFrequentRooms", "");

      socketManager.chatRoom.onGetFrequentRooms((data) => {
        const getlist = data
          .map((room) => {
            const isExist = ChatRooms.find((al) => al._id === room);
            return isExist;
          })
          .filter((item) => item !== undefined)
          .filter((e) => e.type != "broadcast") as RoomData[];

        const otherList = ChatRooms.filter((ar) => {
          const isAR = data?.filter((dm) => dm === ar._id).length;
          return isAR === 0;
        }).filter((e) => e.type != "broadcast");

        setFrequentlyList(getlist);
        setOtherListList(otherList);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
}

// define your Styles
const Styles = StyleSheet.create({
  MainContainer: {
    backgroundColor: Colors.light.White,
    flex: 1,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  RightIconContainer: {
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    right: 16,
    width: 70,
    zIndex: 999,
  },
  RightSideCont: {
    alignItems: "center",
    flexDirection: "row",
    // justifyContent: "space-between",
    marginLeft: 10,
    // width: 200,
  },

  checked: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 10,
    height: 20,

    justifyContent: "center",
    width: 20,
  },
  container: {
    alignItems: "center",
    backgroundColor: Colors.light.LightBlue,
    bottom: 0,
    flexDirection: "row",
    height: 60,
    justifyContent: "space-between",
    left: 0,
    paddingHorizontal: 30,
    position: "absolute",
    right: 0,
    width: "100%",
  },
  iconcontainer: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 50,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  unCheck: {
    backgroundColor: Colors.light.White,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    borderWidth: 1.4,
    height: 20,
    //   left: 10,
    //   position: "absolute",
    width: 20,
  },
});
