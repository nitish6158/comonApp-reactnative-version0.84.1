import { View, Text, Pressable } from "react-native";
import React, { useState } from "react";
import Modal from "react-native-modal";
import { TextField } from "react-native-ui-lib";
import { useTranslation } from "react-i18next";
import ToastMessage from "@/utils/ToastMesage";
import { useSendChatMutation } from "@/graphql/generated/room.generated";
import { useAtomValue } from "jotai";
import { InternetAtom } from "@/Atoms";
import { RoomData } from "@/redux/Models/ChatModel";
import { ImagePickerResponse } from "react-native-image-picker";
import FastImage from "@d11/react-native-fast-image";
import { windowHeight } from "@/utils/ResponsiveView";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Video from "react-native-video";
import { socketManager } from "@/utils/socket/SocketManager";

export type messageType = {
  type: string;
  sender: string;
  message: string;
  fileURL: string;
};

type props = {
  isVisible: boolean;
  onClose: () => void;
  room: RoomData;
  conversation: messageType | null;
};
export default function ModalCaptionInput({
  isVisible,
  onClose,
  room,
  conversation,
}: props) {
  const { t } = useTranslation();

  const internet = useAtomValue(InternetAtom);

  if (!isVisible) {
    return <></>;
  }

  return (
    <View>
      <Modal
        isVisible={isVisible}
        onBackdropPress={onClose}
        onBackButtonPress={onClose}
      >
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 15,
            paddingVertical: 20,
            borderRadius: 15,
          }}
        >
          <KeyboardAwareScrollView
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            extraScrollHeight={50}
          >
            <Text style={{ fontSize: 18, textAlign: "center" }}>{`${t(
              "seniorMode.write-text-prompt",
            )} ${room.display.UserName}`}</Text>
            {renderAttachment(
              conversation?.type ?? "",
              conversation?.fileURL ?? "",
            )}

            <View style={{ marginVertical: 15 }}>
              <TextField
                placeholder={`${t("chat-screen.your-message")}`}
                onChangeText={(text) => {
                  if (conversation) {
                    conversation["message"] = text.trim();
                  }
                }}
                autoFocus={true}
                // multiline={true}
                // numberOfLines={3}
                style={{
                  borderColor: "gray",
                  borderRadius: 10,
                  borderWidth: 0.2,
                  height: 50,
                  paddingHorizontal: 15,
                  paddingVertical: 5,
                }}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Pressable
                onPress={onClose}
                style={{ flex: 1, alignItems: "center" }}
              >
                <Text style={{ fontSize: 16, color: "red" }}>
                  {t("btn.cancel")}
                </Text>
              </Pressable>
              <Pressable
                style={{ flex: 1, alignItems: "center" }}
                onPress={() => {
                  if (!internet) {
                    ToastMessage(t("others.No internet connection, try again"));
                    return;
                  } else {
                    // realm.write(() => {
                    //   realm.create("conversations", {
                    //     ...conversation,
                    //     message: conversation?.message ?? "",
                    //   });
                    // });
                    const payload = {
                      data: {
                        roomId: room?._id,
                        type: conversation?.type ?? "",
                        fileURL: conversation?.fileURL ?? "",
                        isForwarded: false,
                        message: conversation?.message ?? "",
                        fontStyle: "",
                        thumbnail: conversation?.thumbnail ?? "",
                        duration: conversation?.duration ?? 0,
                      },
                      reply_msg: null,
                    };

                    console.log("conversation====>", payload);
                    socketManager.conversation.sendChat(payload);

                    onClose();
                  }
                }}
              >
                <Text style={{ fontSize: 16 }}>
                  {t("seniorMode.send-text")}
                </Text>
              </Pressable>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>
    </View>
  );

  function renderAttachment(type: string, uri: string) {
    if (type.includes("LOADING/image")) {
      return (
        <View style={{ alignItems: "center", marginVertical: 10 }}>
          <FastImage
            style={{ height: windowHeight / 1.5, width: 300 }}
            source={{ uri }}
          />
        </View>
      );
    } else if (type.includes("LOADING/video")) {
      return (
        <View style={{ alignItems: "center", marginVertical: 10 }}>
          <Video
            source={{ uri: uri }}
            controls
            style={{
              height: windowHeight / 1.5,
              width: "100%",
              backgroundColor: "black",
            }}
            paused={true}
            resizeMode="stretch"
          />
        </View>
      );
    } else {
      return <></>;
    }
  }
}
