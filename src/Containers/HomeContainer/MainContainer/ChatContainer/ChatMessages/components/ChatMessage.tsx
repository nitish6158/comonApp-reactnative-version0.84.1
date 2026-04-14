import React, { memo, useCallback, useEffect, useMemo } from "react";
import { View, Pressable, StyleSheet, Alert } from "react-native";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useNavigation } from "@react-navigation/core";
import HapticFeedback from "react-native-haptic-feedback";
import { useTranslation } from "react-i18next";
import { useCreateRoomMutation } from "@Service/generated/room.generated";
import { produce } from "immer";

import {
  IsMessageDeleteSelectionVisibleAtom,
  IsMessageForwardSelectionVisibleAtom,
  IsMessageOptionModelVisible,
  IsMessageReplyVisibleAtom,
  MultiSelectionAtom,
  chatSearchTextMessage,
  selectedForwardMessagesListAtom,
  selectedMessageAtom,
} from "@Atoms/ChatMessageEvents";
import { singleRoom } from "@Atoms/singleRoom";
import { useAppSelector } from "@Store/Store";
import Colors from "@/Constants/Colors";
import ToastMessage from "@Util/ToastMesage";

// Message components
import ReplyButton from "../ReplyButton";
import SenderImage from "../MessageComponents/SenderImage";
import ReplyMessageComponent from "../MessageComponents/ReplyMessageComponent";
import ImageMessageComponent from "../MessageComponents/ImageMessageComponent";
import ImageUploadComponent from "../MessageComponents/ImageUploadComponent";
import VideoUploadComponent from "../MessageComponents/VideoUploadComponent";
import VideoMessageComponent from "../MessageComponents/VideoMessageComponent";
import PollMessageComponent from "../MessageComponents/PollMessageComponent";
import ContactMessageComponent from "../MessageComponents/ContactMessageComponent";
import DocumentUploadComponent from "../MessageComponents/DocumentUploadComponent";
import DocumentMessageComponent from "../MessageComponents/DocumentMessageComponent";
import AudioMessageComponent from "../MessageComponents/AudioMessageComponent";
import TextMessageComponent from "../MessageComponents/TextMessageComponent";
import { CheckMark, UnCheckMark } from "@Components/CheckMark";
import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import SenderAvatar from "./SenderAvatar";
import ReadByView from "./ReadByView";
import Text from "@Components/Text";

// Haptic feedback options
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Component for handling individual chat message rendering and interactions
 */
const ChatMessage = ({ item, index }) => {
  const setSelectedOptionItem = useSetAtom(selectedMessageAtom);
  const [optionModalVisible, setOptionModalVisible] = useAtom(
    IsMessageOptionModelVisible
  );

  const setReplyVisible = useSetAtom(IsMessageReplyVisibleAtom);
  const setDeleteState = useSetAtom(IsMessageDeleteSelectionVisibleAtom);
  const [forwardVisible, setForwardVisible] = useAtom(
    IsMessageForwardSelectionVisibleAtom
  );
  const searchText = useAtomValue(chatSearchTextMessage);
  const display = useAtomValue(singleRoom);
  const [cidList, setCidList] = useAtom(selectedForwardMessagesListAtom);
  const [showSelection, setMultiSelection] = useAtom(MultiSelectionAtom);
  const navigation = useNavigation();

  const { MyProfile } = useAppSelector((state) => state.Chat);
  const [createRoomRequest] = useCreateRoomMutation();

  const { t } = useTranslation();

  // Reply username memo
  const replyUsername = useMemo(() => {
    if (!item?.reply_msg) return "";

    const replyParticipant = display.participants.find(
      (per) => per.user_id === item.reply_msg?.sender
    );

    if (display.currentUserUtility.user_id === item.reply_msg.sender) {
      return t("navigation.you");
    } else if (replyParticipant) {
      return `${replyParticipant.firstName} ${replyParticipant.lastName}`;
    }
    return "";
  }, [
    item?.reply_msg,
    display.participants,
    display.currentUserUtility.user_id,
    t,
  ]);

  // Participant info
  const participant = useMemo(() => {
    return display?.participants?.find((p) => p?.user_id === item?.sender);
  }, [item?.sender, display?.participants]);

  const senderName = useMemo(() => {
    if (!participant) return "";
    return `${participant.firstName} ${participant.lastName}`;
  }, [participant]);

  const isDeletedForCurrentUser = useMemo(() => {
    const currentUserId = display?.currentUserUtility?.user_id;
    if (!currentUserId || !Array.isArray(item?.deleted)) {
      return false;
    }

    return item.deleted.some(
      (entry: any) => entry?.user_id === currentUserId && entry?.type === "me"
    );
  }, [item?.deleted, display?.currentUserUtility?.user_id]);

  // Check if the sender is blocked
  const isBlocked = useMemo(() => {
    if (!participant || !MyProfile?.blockedRooms) return 0;
    return MyProfile.blockedRooms.filter((br) => br.pid === participant.user_id)
      .length;
  }, [MyProfile?.blockedRooms, participant]);

  // Sender image
  const senderImage = useMemo(() => {
    if (display.roomType === "group") {
      return isBlocked > 0 ? ImageUrl : participant?.profile_img;
    }
    return display.isCurrentRoomBlocked ? ImageUrl : participant?.profile_img;
  }, [
    display.roomType,
    isBlocked,
    participant?.profile_img,
    display.isCurrentRoomBlocked,
  ]);

  const isSameUser = true; // This would typically be calculated based on previous messages

  // Check if reply button should be visible
  const isReplyVisible = useMemo(() => {
    const typeValue = String(item?.type ?? "").toUpperCase();
    const isVideoMessage =
      typeValue === "VIDEO" ||
      typeValue === "VIDEO/MP4" ||
      typeValue.includes("LOADING/VIDEO") ||
      typeValue.includes("VIDEO/");

    return (
      !isVideoMessage &&
      item?.deleted?.[0]?.type !== "everyone" && item?.fileURL &&
      (Object.keys(item?.fileURL).length > 0 || item.type === "contact") &&
      item.reply_msg === null
    );
  }, [item.deleted, item?.fileURL, item.type, item.reply_msg]);

  // Open the action modal for message options
  const openActionModal = useCallback(() => {
  
    if (item?.deleted?.[0]?.type === "everyone") {
      return;
    }

    HapticFeedback.trigger("impactHeavy", hapticOptions);
 
    setReplyVisible(false);
    
    const userData = { ...item, UserName: senderName };
   
    setSelectedOptionItem(userData);

  
    
    setOptionModalVisible(!optionModalVisible);
  }, [
    item,
    senderName,
    setReplyVisible,
    setSelectedOptionItem,
    setOptionModalVisible,
    optionModalVisible,
  ]);

  // Handle message selection for forward/delete
  const handleMessageSelection = useCallback(() => {
    if (item?.deleted?.[0]?.type === "everyone") {
      ToastMessage(t("label.cannot-select-deleted-item"));
      return;
    }

    setCidList((prevList) => {
      const index = prevList.findIndex((c) => c._id === item._id);
      const newList =
        index === -1
          ? [...prevList, item]
          : prevList.filter((c) => c._id !== item._id);

      // Update multi-selection state based on new list
      if (newList.length === 0) {
        setMultiSelection(false);
        setDeleteState(false);
        setForwardVisible(false);
      }

      return newList;
    });
  }, [
    item,
    setCidList,
    setMultiSelection,
    setDeleteState,
    setForwardVisible,
    t,
  ]);

  useEffect(() => {
    if (item?._id === "67fa540b1d3b409ea1679a5d") {
      // console.log('----------->',display);
    }
  }, [display.currentUserUtility.user_id ]);

  if (isDeletedForCurrentUser) {
    return null;
  }

  return (
    <View style={{ width: "100%", paddingHorizontal: 5 }}>
      <View
        style={
          showSelection && {
            justifyContent: "space-between",
            flexDirection: "row",
          }
        }
      >
        {showSelection && (
          <Pressable
            style={{ height: 60, width: 40 }}
            onPress={handleMessageSelection}
          >
            {cidList.findIndex((c) => c._id === item?._id) !== -1 ? (
              <CheckMark />
            ) : (
              <UnCheckMark />
            )}
          </Pressable>
        )}
        <Pressable
          onLongPress={openActionModal}
          style={{
            alignSelf:
              display.currentUserUtility.user_id !== item?.sender
                ? "flex-start"
                : "flex-end",
            width: showSelection ? "90%" : "99%",
            backgroundColor: "transparent",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignSelf: "flex-end",
              marginTop: !isSameUser ? 0 : 5,
            }}
          >
            <ReplyButton
              isVisible={
                display.currentUserUtility.user_id === item?.sender &&
                isReplyVisible &&
                !item?.type?.includes("LOADING") &&
                !forwardVisible &&
                MyProfile?.mode === "CLASSIC"
              }
              iconName="reply"
              onReplyPress={openActionModal}
            />

            {!showSelection && (
              <SenderAvatar
                url={senderImage}
                isVisible={
                  display.currentUserUtility.user_id !== item?.sender &&
                  !item?.type?.includes("LOADING")
                }
                senderId={display.roomType === "group" ? item.sender : null}
                createRoom={createRoomRequest}
                navigation={navigation}
              />
            )}

            <View
              style={[
                styles.messageContainer,
                {
                  backgroundColor:
                    display.currentUserUtility.user_id === item?.sender
                      ? "rgb(224,250,255)"
                      : "rgb(245,245,245)",
                  marginLeft:
                    display.currentUserUtility.user_id === item?.sender
                      ? 0
                      : !isSameUser
                      ? 50
                      : 10,
                  flexDirection: "column",
                  borderRadius: 12,
                },
                item?.deleted?.[0]?.type === "everyone" && {
                  backgroundColor:
                    display.currentUserUtility.user_id === item?.sender
                      ? "rgb(224,250,255)"
                      : "rgb(245,245,245)",
                },
                !item?.type?.includes("LOADING/") && {
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                },
                item.sender === display.currentUserUtility.user_id && {
                  paddingHorizontal: 10,
                  paddingVertical: 7,
                },
              ]}
            >
              <SenderImage
                isVisible={
                  display.currentUserUtility.user_id !== item?.sender &&
                  isSameUser &&
                  !item?.type?.includes("LOADING")
                }
                senderName={senderName}
              />

              <ReplyMessageComponent
                isVisible={item?.reply_msg && item?.reply_msg !== null}
                isMessageDeletedForEveryOne={
                  item?.deleted?.[0]?.type === "everyone"
                }
                replyUserName={replyUsername}
                message={item}
              />

              <ImageMessageComponent
                isVisible={
                  item?.fileURL !== null &&
                  (item.type === "IMAGE" || item.type === "image")
                }
                isMessageDeletedForEveryOne={
                  item?.deleted?.[0]?.type === "everyone"
                }
                isMessageForwarded={item.isForwarded}
                message={item}
                searchText={searchText}
              />

              <ImageUploadComponent
                isVisible={
                  item?.fileURL !== null &&
                  item?.type?.includes("LOADING/image") &&
                  item.sender === display.currentUserUtility.user_id
                }
                isMessageDeletedForEveryOne={
                  item?.deleted?.[0]?.type === "everyone"
                }
                isMessageForwarded={item.isForwarded}
                message={item}
                searchText={searchText}
              />

              <VideoUploadComponent
                isVisible={
                  item?.fileURL !== null &&
                  item?.type?.includes("LOADING/video") &&
                  item.sender === display.currentUserUtility.user_id
                }
                isMessageDeletedForEveryOne={
                  item?.deleted?.[0]?.type === "everyone"
                }
                isMessageForwarded={item.isForwarded}
                message={item}
                searchText={searchText}
              />
              {item?.fileURL !== null &&
                item?.type?.includes("LOADING/video") &&
                item.sender !== display.currentUserUtility.user_id && (
                  <View
                    style={{
                      backgroundColor: Colors.light.gray,
                      borderRadius: 8,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                      marginBottom: 5,
                      maxWidth: 220,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text style={{ color: Colors.light.black }}>
                      {t("chat.video-uploading", {
                        defaultValue: "Video is uploading...",
                      })}
                    </Text>
                  </View>
                )}

              <VideoMessageComponent
                isVisible={
                  item?.fileURL !== null &&
                  (item.type === "VIDEO" || item.type === "video")
                }
                isMessageDeletedForEveryOne={
                  item?.deleted?.[0]?.type === "everyone"
                }
                isMessageForwarded={item.isForwarded}
                message={item}
                searchText={searchText}
              />

              <PollMessageComponent
                isVisible={item?.type === "poll"}
                isMessageDeletedForEveryOne={
                  item?.deleted?.[0]?.type === "everyone"
                }
                isMessageForwarded={false}
                message={item}
                searchText={""}
              />

              <ContactMessageComponent
                isVisible={item?.type === "contact"}
                isMessageDeletedForEveryOne={
                  item?.deleted?.[0]?.type === "everyone"
                }
                isMessageForwarded={item.isForwarded}
                message={item}
                searchText={searchText}
              />

              <DocumentUploadComponent
                isVisible={
                  item?.fileURL !== null &&
                  item?.type?.includes("LOADING/DOCUMENT") &&
                  item.sender === display.currentUserUtility.user_id
                }
                isMessageDeletedForEveryOne={
                  item?.deleted?.[0]?.type === "everyone"
                }
                isMessageForwarded={item.isForwarded}
                message={item}
                searchText={searchText}
              />

              <DocumentMessageComponent
                isVisible={
                  item?.fileURL !== null &&
                  (item.type === "DOCUMENT" || item?.type === "APPLICATION")
                }
                isMessageDeletedForEveryOne={
                  item?.deleted?.[0]?.type === "everyone"
                }
                isMessageForwarded={item.isForwarded}
                message={item}
                searchText={searchText}
              />

              <AudioMessageComponent
                isVisible={item.type === "AUDIO"}
                isMessageDeletedForEveryOne={
                  item?.deleted?.[0]?.type === "everyone"
                }
                isMessageForwarded={item.isForwarded}
                message={item}
                senderImage={senderImage}
                searchText={searchText}
              />

              <TextMessageComponent
                isVisible={item?.type === "text"}
                isMessageDeletedForEveryOne={
                  item?.deleted?.[0]?.type === "everyone"
                }
                isMessageForwarded={item.isForwarded}
                message={item}
                searchText={searchText}
              />
            </View>

            <ReplyButton
              isVisible={
                display.currentUserUtility.user_id !== item?.sender &&
                isReplyVisible &&
                !item?.type?.includes("LOADING") &&
                !forwardVisible &&
                MyProfile?.mode === "CLASSIC"
              }
              iconName="forward"
              onReplyPress={openActionModal}
            />

            {display.currentUserUtility.user_id !== item?.sender && (
              <View style={styles.receiverTimeContainer} />
            )}
          </View>

          {/* Read receipt indicators */}
          {(item?.receipts || item?.receipts == null) && (
            <View style={styles.readReceiptContainer}>
              {display.currentUserUtility.user_id === item?.sender &&
                (item?.read_by.length > 0 ? (
                  <ReadByView
                    readByData={item}
                    participants={display.participants}
                    roomType={display.roomType}
                  />
                ) : null)}
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    alignSelf: "flex-end",
    borderRadius: 4.5,
    flexDirection: "row",
    marginHorizontal: 5,
    maxWidth: "70%",
  },
  readReceiptContainer: {
    flexDirection: "row",
    alignSelf: "flex-end",
    marginTop: 3,
  },
  receiverTimeContainer: {
    alignSelf: "flex-start",
    flex: 2,
    marginTop: 5,
  },
});

export default memo(ChatMessage);
