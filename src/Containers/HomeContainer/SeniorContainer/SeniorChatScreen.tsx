import { View, Text, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import React, { useMemo, useState } from "react";
import SeniorHeader from "./components/SeniorHeader";
import { SeniorChatScreenProps } from "@/navigation/screenPropsTypes";
import { useAppSelector } from "@/redux/Store";
import { useAtom, useAtomValue } from "jotai";
import { AllChatRooms, callAtom, InternetAtom } from "@/Atoms";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";
import { Button } from "react-native-ui-lib";
import { Colors } from "@/Constants";
import { RoomData } from "@/redux/Models/ChatModel";
import { useTranslation } from "react-i18next";
import { useSendChatMutation } from "@/graphql/generated/room.generated";
import ToastMessage from "@/utils/ToastMesage";
import { checkCallPermissions } from "@/utils/permission";
import ModalTextInput from "./components/ModalTextInput";
import { ChatRoom } from "@/models/chatrooms";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Modal from "react-native-modal";

export default function SeniorChatScreen({ navigation }: SeniorChatScreenProps) {
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const chatRooms = useAtomValue(AllChatRooms);
  const { t } = useTranslation();
  const [sendChat] = useSendChatMutation();
  const [callRequest, setCallRequest] = useAtom(callAtom);
  const internet = useAtomValue(InternetAtom);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [selectedCall, setSelectedCall] = useState<RoomData | null>(null);

  const seniorChatRoom = useMemo(() => {
    return chatRooms.filter((v) => {
      let find = MyProfile?.seniorCitizenRoom.find((sc) => sc.roomId == v._id);
      if (find) {
        return true;
      } else {
        return false;
      }
    });
  }, [chatRooms, MyProfile?.seniorCitizenRoom]);

  return (
    <View style={styles.main}>
      <SeniorHeader />
      <FlatList
        data={seniorChatRoom}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          let isBlocked = MyProfile?.blockedRooms.find((v) => v.room_Id == item._id);

          return (
            <Pressable style={styles.roomContainer} key={index} onPress={() => navigateToMessageScreen(item._id)}>
              <View style={styles.roomDetails}>
                <FastImage style={styles.profile} source={{ uri: `${DefaultImageUrl}${item.display.UserImage}` }} />
              </View>
              <View style={{ marginLeft: 10, flexGrow: 1 }}>
                <Text style={styles.roomName}>{`${item.display.UserName}`}</Text>
                <View style={[styles.roomDetails, { marginTop: 5 }]}>
                  <Button
                    onPress={() => setSelectedRoom(item)}
                    label={`${t("seniorMode.write-text")}`}
                    size={Button.sizes.xSmall}
                    backgroundColor={"white"}
                    disabled={isBlocked ? true : false}
                    labelStyle={{ color: isBlocked ? "white" : Colors.light.PrimaryColor, fontSize: 15 }}
                    style={{
                      borderColor: isBlocked ? "white" : Colors.light.PrimaryColor,
                      borderWidth: 1,
                      marginRight: 5,
                      height: 30,
                      borderRadius: 10,
                      flex: 1,
                    }}
                  />
                  <Button
                    onPress={() => setSelectedCall(item)}
                    label={`${t("reminders.call")}`}
                    size={Button.sizes.xSmall}
                    backgroundColor={Colors.light.PrimaryColor}
                    labelStyle={{ fontSize: 15 }}
                    style={{ height: 30, borderRadius: 10, flex: 1 }}
                    disabled={isBlocked || item.participants.length == 1 ? true : false}
                  />
                </View>
              </View>
            </Pressable>
          );
        }}
        ListFooterComponent={<View style={{ marginBottom: 100 }} />}
      />

      <ModalTextInput
        isVisible={selectedRoom != null}
        onClose={() => {
          setSelectedRoom(null);
        }}
        room={selectedRoom}
      />
      <Modal
        isVisible={selectedCall !== null}
        onBackdropPress={() => setSelectedCall(null)}
        onBackButtonPress={() => setSelectedCall(null)}
      >
        <View style={{ paddingHorizontal: 20, paddingVertical: 20, backgroundColor: "white", borderRadius: 5 }}>
          <Text style={{ textAlign: "center", fontSize: 18, fontWeight: "500", paddingHorizontal: 20 }}>{`${t(
            "seniorMode.start-call"
          )} ${selectedCall?.display.UserName}?`}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginTop: 30 }}>
            <Button
              label={`${t("calls.audio-call")}`}
              onPress={async () => {
                const res = await checkCallPermissions("audio");
                if (res === true) {
                  if (internet) {
                    if (callRequest == null) {
                      setCallRequest({
                        callType: "audio",
                        roomType: selectedCall?.type,
                        roomId: selectedCall?._id,
                        callBackground: selectedCall?.display.UserImage,
                        roomName: selectedCall?.display.UserName,
                        participants: [],
                        isReceiver: false,
                      });
                    } else {
                      ToastMessage(`${t("toastmessage.incall-already-message")}`);
                    }
                  } else {
                    Alert.alert(
                      "",
                      t("others.Couldn't place call. Make sure your device have an internet connection and try again")
                    );
                  }
                }
                setSelectedCall(null);
              }}
              backgroundColor={Colors.light.PrimaryColor}
              size={Button.sizes.medium}
              style={{ width: 140 }}
            />

            <Button
              label={`${t("calls.video-call")}`}
              onPress={async () => {
                const res = await checkCallPermissions("video");
                if (res === true) {
                  if (internet) {
                    if (callRequest == null) {
                      setCallRequest({
                        callType: "video",
                        roomType: selectedCall?.type,
                        roomId: selectedCall?._id,
                        callBackground: selectedCall?.display.UserImage,
                        roomName: selectedCall?.display.UserName,
                        participants: [],
                        isReceiver: false,
                      });
                    } else {
                      ToastMessage(`${t("toastmessage.incall-already-message")}`);
                    }
                  } else {
                    Alert.alert(
                      "",
                      t("others.Couldn't place call. Make sure your device have an internet connection and try again")
                    );
                  }
                }
                setSelectedCall(null);
              }}
              backgroundColor={Colors.light.PrimaryColor}
              size={Button.sizes.medium}
              style={{ width: 140 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );

  function navigateToMessageScreen(id: string) {
    navigation.navigate("SeniorChatMessageScreen", { roomId: id });
  }

  function writeText(room: RoomData) {
    Alert.prompt(`${t("seniorMode.write-text-prompt")} ${room.display.UserName}`, "", [
      {
        text: t("btn.cancel"),
        onPress: () => {},
        style: "destructive",
      },
      {
        text: t("seniorMode.send-text"),
        onPress: (text) => {
          if (!internet) {
            ToastMessage(t("others.No internet connection, try again"));
            return;
          } else {
            if (text) {
              sendChat({
                variables: {
                  input: {
                    data: {
                      roomId: room._id,
                      type: "text",
                      fileURL: "",
                      isForwarded: false,
                      message: text.trim(),
                      fontStyle: "",
                      thumbnail: "",
                      duration: 0,
                    },
                    reply_msg: null,
                  },
                },
              }).then((res) => {
                if (res.data?.sendChat) {
                  ToastMessage(`${t("seniorMode.message-sended")} ${room.display.UserName}`);
                }
              });
              console.log(text);
            }
          }
        },
      },
    ]);
  }

  function startNewCall(room: RoomData) {
    Alert.alert(`${t("seniorMode.start-call")} ${room.display.UserName}?`, "", [
      {
        text: t("btn.cancel"),
        onPress: () => {},
        style: "destructive",
      },
      {
        text: t("calls.audio-call"),
        onPress: async () => {
          const res = await checkCallPermissions("audio");
          if (res === true) {
            if (internet) {
              if (callRequest == null) {
                setCallRequest({
                  callType: "audio",
                  roomType: room.type,
                  roomId: room._id,
                  callBackground: room.display.UserImage,
                  roomName: room.display.UserName,
                  participants: [],
                  isReceiver: false,
                });
              } else {
                ToastMessage(`${t("toastmessage.incall-already-message")}`);
              }
            } else {
              Alert.alert(
                "",
                t("others.Couldn't place call. Make sure your device have an internet connection and try again")
              );
            }
          }
        },
      },
      {
        text: t("calls.video-call"),
        onPress: async () => {
          const res = await checkCallPermissions("video");
          if (res === true) {
            if (internet) {
              if (callRequest == null) {
                setCallRequest({
                  callType: "video",
                  roomType: room.type,
                  roomId: room._id,
                  callBackground: room.display.UserImage,
                  roomName: room.display.UserName,
                  participants: [],
                  isReceiver: false,
                });
              } else {
                ToastMessage(`${t("toastmessage.incall-already-message")}`);
              }
            } else {
              Alert.alert(
                "",
                t("others.Couldn't place call. Make sure your device have an internet connection and try again")
              );
            }
          }
        },
      },
    ]);
  }
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: "white",
    flex: 1,
    paddingHorizontal: 10,
  },
  roomContainer: {
    marginTop: 15,
    // paddingBottom:5,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "center",
    // borderBottomColor:'gray',
    // borderBottomWidth:.2
  },
  roomDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  roomName: {
    fontSize: 17,
    // fontWeight: "500",
  },
  profile: {
    height: 40,
    width: 40,
    borderRadius: 30,
    marginRight: 15,
  },
});
