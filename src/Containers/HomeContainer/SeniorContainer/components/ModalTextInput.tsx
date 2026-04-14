import { View, Text, Pressable } from "react-native";
import React, { useContext, useState } from "react";
import Modal from "react-native-modal";
import { TextField } from "react-native-ui-lib";
import { useTranslation } from "react-i18next";
import ToastMessage from "@/utils/ToastMesage";
import { useAtomValue } from "jotai";
import { InternetAtom } from "@/Atoms";
import { RoomData } from "@/redux/Models/ChatModel";
import { socketManager } from "@/utils/socket/SocketManager";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { ChatContext, storage as chatStorage } from "@/Context/ChatProvider";
import { useAppSelector } from "@/redux/Store";

type props = {
  isVisible: boolean;
  onClose: () => void;
  room: RoomData;
};
export default function ModalTextInput({ isVisible, onClose, room }: props) {
  const { t } = useTranslation();
  const [text, setText] = useState<string>("");
  const { roomId: activeRoomId, setConversation } = useContext(ChatContext);
  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);

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
        avoidKeyboard={true}
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
              "seniorMode.write-text-prompt"
            )} ${room.display.UserName}`}</Text>
            <View
              style={{
                marginVertical: 15,
                minHeight: 150,
                borderColor: "gray",
                borderRadius: 5,
                borderWidth: 0.2,
              }}
            >
              <TextField
                placeholder={`${t("chat-screen.your-message")}`}
                onChangeText={(value) => {
                  setText(value);
                }}
                autoFocus={true}
                multiline={true}
                numberOfLines={3}
                style={{
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
                onPress={() => {
                  setText("");
                  onClose();
                }}
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
                    const trimmedText = text.trim();
                    if (trimmedText.length > 0) {
                      const localId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
                      const payload = {
                        data: {
                          roomId: room._id,
                          id_local: localId,
                          type: "text",
                          fileURL: "",
                          isForwarded: false,
                          message: trimmedText,
                          fontStyle: "",
                          thumbnail: "",
                          duration: 0,
                        },
                        reply_msg: null,
                      };

                      // Optimistic local update for sender-side immediate reflection.
                      const optimisticMessage: any = {
                        _id: localId,
                        id_local: localId,
                        local_Id: localId,
                        roomId: room._id,
                        sender: MyProfile?._id,
                        type: "text",
                        message: trimmedText,
                        fileURL: "",
                        isForwarded: false,
                        fontStyle: "",
                        thumbnail: "",
                        duration: 0,
                        created_at: Date.now(),
                        updated_at: Date.now(),
                        deleted: [],
                        delivered_to: [],
                        read_by: [],
                      };

                      const cachedRaw = chatStorage.getString(`conversations_${room._id}`);
                      let cachedMessages: any[] = [];
                      try {
                        cachedMessages = cachedRaw ? JSON.parse(cachedRaw) : [];
                      } catch (_error) {
                        cachedMessages = [];
                      }
                      const updatedMessages = [optimisticMessage, ...cachedMessages];
                      chatStorage.set(`conversations_${room._id}`, JSON.stringify(updatedMessages.slice(0, 100)));

                      if (activeRoomId === room._id) {
                        setConversation((prev: any[]) => [optimisticMessage, ...(prev || [])]);
                      }

                      socketManager.conversation.sendChat(payload);
                      ToastMessage(
                        `${t("seniorMode.message-sended")} ${room.display.UserName}`
                      );
                      setText("");
                      onClose();
                      console.log(trimmedText);
                    }
                  }
                }}
              >
                <Text style={{ fontSize: 16 }}>{t("seniorMode.send-text")}</Text>
              </Pressable>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>
    </View>
  );
}
