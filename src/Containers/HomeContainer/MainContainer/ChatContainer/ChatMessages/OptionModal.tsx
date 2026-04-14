import {
  Clipboard,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  IsMessageForwardSelectionVisibleAtom,
  IsMessageOptionModelVisible,
  IsMessageReplyVisibleAtom,
  MultiSelectionAtom,
  MultiSelectionTypeAtom,
  PinedMessagesAtom,
  chatMode,
  chatSearchEnabledAtom,
  chatSearchResultAtom,
  selectedForwardMessagesListAtom,
  selectedMessageAtom,
} from "@Atoms/ChatMessageEvents";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Copy from "@Images/copy.svg";
import Delete from "@Images/delete.svg";
import Favouites from "@Images/favouites.svg";
import Forward from "@Images/forward.svg";
import InfoChat from "@Images/InfoChat.svg";
import PinChat from "@Images/PinChat.svg";
import Reply from "@Images/reply.svg";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { navigate, navigationRef } from "@Navigation/utility";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import Feather from "react-native-vector-icons/Feather";
import { RootState } from "@/redux/Reducer";
import { Colors } from "@/Constants";
import { socket } from "@/redux/Reducer/SocketSlice";
import { useAppSelector } from "@/redux/Store";
import { socketManager } from "@/utils/socket/SocketManager";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { ChatContext } from "@/Context/ChatProvider";
import { usePinnedMessages } from "@/hooks/conversations/usePinnedMessages";

export default function OptionModal() {
  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);

  const setReplyVisible = useSetAtom(IsMessageReplyVisibleAtom);
  const SelectedOptionItem = useAtomValue(selectedMessageAtom);

  const [, setCid] = useAtom(selectedForwardMessagesListAtom);
  const [visible, setOptionModelVisiblity] = useAtom(
    IsMessageOptionModelVisible
  );
console.log("SelectedOptionItem",visible)
  const [ForwardVisible, setSetForward] = useAtom(
    IsMessageForwardSelectionVisibleAtom
  );
  const [, setMultiSelection] = useAtom(MultiSelectionAtom);
  const [, setMultiSelectionType] = useAtom(MultiSelectionTypeAtom);
  const setSearchenable = useSetAtom(chatSearchEnabledAtom);
  const [, setSearchResult] = useAtom(chatSearchResultAtom);
  const [mode, setChatMode] = useAtom(chatMode);

  const MyId = MyProfile?._id;

  const display = useAtomValue(singleRoom);
  const pinnedChats = useAtomValue(PinedMessagesAtom);
  const { t } = useTranslation();
  const { updateMessage } = useContext(ChatContext);
  const { refreshPinnedMessages } = usePinnedMessages(
    display?.roomId,
    display?.currentUserUtility
  );
  const favoriteText = useMemo(() => {
    if (SelectedOptionItem) {
      const isFavoriteByMe = SelectedOptionItem?.favourite_by?.find(
        (favBy: any) => favBy.user_id === MyProfile?._id
      );
      return isFavoriteByMe
        ? `${t("optionalModal.unfavorite")}`
        : `${t("optionalModal.favorite")}`;
    } else {
      return "";
    }
  }, [SelectedOptionItem]);

  const isPinned = useMemo(() => {
    const isalready = pinnedChats.findIndex(
      (item) => item._id == SelectedOptionItem?._id
    );
    if (isalready == -1) {
      return false;
    } else {
      return true;
    }
  }, [SelectedOptionItem, pinnedChats]);

  const Button = ({ Icon, Title, onPress, onPressButton }: any) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.buttoncon}
        onPress={onPress}
      >
        {Icon}
        <Text style={{ marginLeft: 10 }}>{Title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        setOptionModelVisiblity(!visible);
      }}
    >
      {SelectedOptionItem != null && (
        <Pressable
          onPress={() => {
            setOptionModelVisiblity(!visible);
          }}
          style={[
            styles.centeredView,
            { flexDirection: "column", alignItem: "center" },
          ]}
        >
          <View style={styles.modalView}>
            {SelectedOptionItem?.message.length > 0 &&
              SelectedOptionItem?.type != "poll" && (
                <Button
                  Icon={<Copy />}
                  Title={t("optionalModal.copy")}
                  onPress={() => {
                    Clipboard.setString(SelectedOptionItem?.message);
                    setOptionModelVisiblity(!visible);
                  }}
                />
              )}
            {MyProfile?.mode == "CLASSIC" &&
              SelectedOptionItem?.type != "poll" && (
                <Button
                  Icon={<Forward />}
                  Title={t("optionalModal.forward")}
                  onPress={() => {
                    setOptionModelVisiblity(!visible);
                    setCid([SelectedOptionItem]);
                    setMultiSelection(true);
                    setSetForward(!ForwardVisible);
                    setMultiSelectionType("FORWARD");
                  }}
                />
              )}

            {MyProfile?.mode == "CLASSIC" &&
              SelectedOptionItem?.type != "poll" && (
                <Button
                  Icon={<Reply />}
                  Title={t("optionalModal.reply")}
                  onPress={() => {
                    setReplyVisible(true);
                    setOptionModelVisiblity(!visible);
                    setSearchenable(false);
                    if (mode !== "scroll") setChatMode("scroll");
                    setSearchResult([]);
                  }}
                />
              )}

            {SelectedOptionItem?.type != "contact" &&
              SelectedOptionItem?.type != "poll" &&
              MyProfile?.mode == "CLASSIC" && (
                <Button
                  Icon={<Favouites />}
                  Title={favoriteText}
                  onPress={() => {
                    setOptionModelVisiblity(!visible);

                    if (favoriteText == "Favorite") {
                      updateMessage(SelectedOptionItem?._id, {
                        type: "favorite",
                        data: {},
                      });
                      socketConnect.emit("addChatsToFavourite", {
                        cid: SelectedOptionItem?._id,
                        roomId: display.roomId,
                      });
                    } else {
                      updateMessage(SelectedOptionItem?._id, {
                        type: "favorite",
                        data: {},
                      });
                      socketConnect.emit("removeChatsFromFavourite", {
                        cid: SelectedOptionItem?._id,
                      });
                    }
                  }}
                />
              )}

            {/* {SelectedOptionItem?.type === "text" && ( */}
            {display.roomType != "broadcast" &&
              SelectedOptionItem?.type != "contact" &&
              SelectedOptionItem?.type != "poll" &&
              MyProfile?.mode == "CLASSIC" && (
                <>
                  <Button
                    Icon={
                      <Feather
                        name="archive"
                        size={22}
                        color={Colors.light.PrimaryColor}
                      />
                    }
                    Title={t("topics.makeTopic")}
                    onPress={() => {
                      setOptionModelVisiblity(!visible);
                      setSearchenable(false);
                      setSearchResult([]);
                      setTimeout(() => {
                        console.log(
                          "SelectedOptionItem",
                          SelectedOptionItem?._id,
                          SelectedOptionItem?.roomId,
                          SelectedOptionItem.message
                        );
                        // return
                        navigate("CreateTopicsScreen", {
                          mode: "MAKE_TOPIC",
                          text:
                            SelectedOptionItem.type !== "contact"
                              ? SelectedOptionItem.message
                              : "",
                          chatId: SelectedOptionItem?._id,
                          roomId: SelectedOptionItem?.roomId,
                          parentId: null,
                        });
                      }, 1000);
                    }}
                  />
                  <Button
                    Icon={
                      <Feather
                        name="archive"
                        size={22}
                        color={Colors.light.PrimaryColor}
                      />
                    }
                    Title={t("topics.addToTopic")}
                    onPress={() => {
                      setOptionModelVisiblity(!visible);
                      navigate("ViewTopicsScreen", {
                        chatData: {
                          chatId: SelectedOptionItem?._id,
                          roomId: SelectedOptionItem?.roomId,
                        },
                      });
                    }}
                  />
                </>
              )}

            {display.roomType == "group" &&
              SelectedOptionItem?.type != "poll" &&
              SelectedOptionItem?.type != "contact" &&
              (display.roomPermission.PinPermission.permit ==
                display.currentUserUtility.user_type ||
              display.currentUserUtility.user_type == "admin" ? (
                <View style={{ width: "100%", paddingHorizontal: 15 }}>
                  <Button
                    Icon={<PinChat />}
                    Title={
                      !isPinned
                        ? t("Hidden-Files.pin")
                        : t("Hidden-Files.unpin")
                    }
                    onPress={() => {
                      if (isPinned) {
                        socketManager.conversation.pinMessage(
                          display.roomId,
                          SelectedOptionItem?._id
                        );
                        socketConnect.emit("unpinChat", {
                          cid: SelectedOptionItem?._id,
                          roomId: display.roomId,
                        });
                      } else {
                        const temp = pinnedChats;

                        const isalready = pinnedChats.find(
                          (item) => item._id == SelectedOptionItem._id
                        );

                        if (!isalready) {
                          if (pinnedChats.length !== 3) {
                            // socketConnect.emit('messagePinned');
                            temp.unshift(SelectedOptionItem);
                            socketManager.conversation.pinMessage(
                              display.roomId,
                              SelectedOptionItem?._id
                            );

                            socketConnect.emit("pinChat", {
                              cid: SelectedOptionItem?._id,
                              roomId: display.roomId,
                            });
                          } else {
                            ToastMessage(
                              `${t(
                                "optionalModal.optional-toastmessage.max-3-chats-pinned"
                              )}`
                            );
                          }
                        } else {
                          ToastMessage(
                            `${t(
                              "optionalModal.optional-toastmessage.already-pinned-message"
                            )}`
                          );
                        }
                      }
                      setOptionModelVisiblity(!visible);
                      setSearchenable(false);
                      if (mode !== "scroll") setChatMode("scroll");
                      setSearchResult([]);
                      setTimeout(() => {
                        refreshPinnedMessages();
                      }, 500);
                    }}
                  />
                </View>
              ) : null)}
            {SelectedOptionItem?.sender == MyId &&
              MyProfile?.mode == "CLASSIC" && (
                <Button
                  Icon={<InfoChat />}
                  Title={t("optionalModal.info")}
                  onPress={() => {
                    setOptionModelVisiblity(!visible);
                    setSearchenable(false);
                    if (mode !== "scroll") setChatMode("scroll");
                    setSearchResult([]);
                    setTimeout(() => {
                      navigate("ChatMessageInfoScreen", {
                        Item: SelectedOptionItem,
                      });
                    }, 100);
                  }}
                />
              )}

            <Button
              Icon={<Delete />}
              Title={t("btn.delete")}
              onPress={() => {
                setCid([SelectedOptionItem]);
                setMultiSelection(true);
                setOptionModelVisiblity(!visible);
                setMultiSelectionType("DELETE");
              }}
            />
          </View>
        </Pressable>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  buttoncon: { flexDirection: "row", paddingVertical: 10, width: "90%" },

  centeredView: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    flex: 1,
    justifyContent: "center",
    marginTop: 0,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  modalView: {
    margin: 20,
    marginTop: "-40%",
    backgroundColor: "white",
    borderRadius: 3,
    paddingVertical: 10,

    // justifyContent:'center',
    // alignItem:'center',
    width: "55%",
    maxHeight: "70%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  textStyle: {
    color: "white",
    // fontWeight: "bold",
    textAlign: "center",
  },
});
