import {
  Dimensions,
  Image,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text as RNText,
  TextInput,
  View,
} from "react-native";
import { FetchDraft, StoreDraft } from "@Util/draftMessageHandler";
import {
  IsAttachmentSelectionVisibleAtom,
  IsAudioRecordingVisibleAtom,
  IsMessageReplyVisibleAtom,
  chatMode,
  scheduleMessageModalAtom,
  selectedMessageAtom,
} from "@Atoms/ChatMessageEvents";
import {
  replaceTriggerValues,
  useMentions,
} from "react-native-controlled-mentions";
import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SendChatHelper, { whoosh } from "@Util/helpers/SendChatHelper";
import { useDispatch, useSelector } from "react-redux";

import AntDesign from "react-native-vector-icons/AntDesign";
import AudioGreen from "@Images/AudioGreen.svg";
import Colors from "@/Constants/Colors";
import CrossGray from "@Images/CrossGray.svg";
import ReplymsgView from "@Util/helpers/replymsgview";
import { RoomParticipantData } from "@Store/Models/ChatModel";
import { RootState } from "@Store/Reducer";
import { ScrollView } from "react-native-gesture-handler";
import SendIconGreen from "@Images/SendIconGreen.svg";
import SendMoreOptionModal from "./SendMoreOptionsModal";
import Text from "@Components/Text";
import { isEmpty } from "lodash";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useNetInfo } from "@react-native-community/netinfo";
import {
  RecurrentTypes,
  useSendChatMutation,
} from "@Service/generated/room.generated";
import { useTranslation } from "react-i18next";
import useUpdateChat from "@/hooks/useUpdateChat";
import FastImage from "@d11/react-native-fast-image";
import Icon from "@Assets/images/Icon";
import { EventType } from "@/graphql/generated/types";
import { navigate } from "@/navigation/utility";
import dayjs from "dayjs";
import { useAppSelector } from "@/redux/Store";
import Octicons from "react-native-vector-icons/Octicons";
import Feather from "react-native-vector-icons/Feather";
import { Alert } from "react-native";
import ToastMessage from "@/utils/ToastMesage";
import { InternetAtom, currentUserIdAtom } from "@/Atoms";
import Modal from "react-native-modal";
import {
  askCameraPermission,
  askMediaPermission,
  checkCameraPermission,
  checkMediaPermission,
  permissionAlert,
} from "@/utils/permission";
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from "react-native-image-picker";
import { generateThumbnail } from "@/utils/genrateThumbNail";
import ModalTextInput from "@/Containers/HomeContainer/SeniorContainer/components/ModalTextInput";
import ModalCaptionInput, {
  messageType,
} from "@/Containers/HomeContainer/SeniorContainer/components/ModalCaptionInput";
import { Button } from "react-native-ui-lib";
import { socketManager } from "@/utils/socket/SocketManager";
import { socketConnect } from "@/utils/socket/SocketConnection";
import uuid from "react-native-uuid";
import RNFS from "react-native-fs";
import { ChatContext } from "@/Context/ChatProvider";


const screenWidth = Dimensions.get("window").width;
const empty = new RegExp(/^[ \t\r\n]*$/);

async function persistImageUri(uri?: string, fileName?: string) {
  if (!uri || !uri.startsWith("file://")) return uri ?? "";
  try {
    const sourcePath = decodeURIComponent(uri.replace("file://", ""));
    const exists = await RNFS.exists(sourcePath);
    if (!exists) return uri;

    const directoryPath = `${RNFS.DocumentDirectoryPath}/comon-upload`;
    await RNFS.mkdir(directoryPath);

    const fileExt = sourcePath.split(".").pop() || "jpg";
    const baseName = (fileName || `image-${Date.now()}`)
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_");
    const targetPath = `${directoryPath}/${baseName}-${Date.now()}.${fileExt}`;

    await RNFS.copyFile(sourcePath, targetPath);
    return `file://${targetPath}`;
  } catch (error) {
    console.error("Failed to persist selected image", error);
    return uri;
  }
}

export default function SendChatContainer() {
  const { MyProfile } = useAppSelector((state) => state.Chat);

  if (MyProfile?.mode == "SENIORCITIZEN") {
    return <SeniorBottomBox />;
  }

  return (
    <View style={styles.container}>
      <MessageReplyBox />
      <ChatInputBox />
      <SendMoreOptionModal />
    </View>
  );
}

function MessageReplyBox() {
  const [SelectedOptionItem, setSelectedOptionItem] =
    useAtom(selectedMessageAtom);
  const [ReplyVisible, setReplyVisible] = useAtom(IsMessageReplyVisibleAtom);
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const { t } = useTranslation();

  if (!ReplyVisible) {
    return null;
  } else {
    return (
      <View
        style={{
          backgroundColor: Colors.light.LightBlue,
          marginHorizontal: 10,
          paddingBottom: 10,
          paddingHorizontal: 10,
          borderTopRightRadius: 5,
          borderTopLeftRadius: 5,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 19,
          }}
        >
          <Text size="sm">
            {SelectedOptionItem?.sender !== MyProfile?._id
              ? SelectedOptionItem?.UserName
              : `${t("navigation.you")}`}
          </Text>
          <Pressable
            style={{ padding: 5 }}
            onPress={() => {
              setReplyVisible(false);
            }}
          >
            <CrossGray />
          </Pressable>
        </View>
        <ReplymsgView
          mode="active"
          SelectedOptionItem={{
            ...SelectedOptionItem,
            file_URL: SelectedOptionItem?.fileURL,
          }}
        />
      </View>
    );
  }
}

function ChatInputBox() {
  const mentionRef = useRef<any>(null);
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const currentUser = useAtomValue(currentUserIdAtom) as any;
  const [display, setDisplay] = useAtom(singleRoom);
  const { roomId: contextRoomId, setConversation } = useContext(ChatContext);
  const activeRoomId = display?.roomId || contextRoomId;
  const senderId =
    display?.currentUserUtility?.user_id ?? MyProfile?._id ?? currentUser?._id ?? "";
  const [messageValue, setMessageValue] = useState("");
  const messageValueRef = useRef("");
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [suggestions, setSuggestions] = useState([]);
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const triggersConfig = useMemo(
    () => ({
      mention: {
        trigger: "@",
        isInsertSpaceAfterMention: true,
        textStyle: {
          fontWeight: "bold" as const,
          color: Colors.light.PrimaryColor,
        },
      },
    }),
    []
  );
  const { triggers, textInputProps } = useMentions({
    value: messageValue,
    onChange: handleMessageChange,
    triggersConfig,
    onSelectionChange: setSelection,
  });

  const [audioRecordVisible, setAudioRecordVisible] = useAtom(
    IsAudioRecordingVisibleAtom
  );
  const [attachmentVisible, setAttachmentVisible] = useAtom(
    IsAttachmentSelectionVisibleAtom
  );
  const [replyMessage, setSelectedOptionItem] = useAtom(selectedMessageAtom);
  const [messageIsReply, setReplyVisible] = useAtom(IsMessageReplyVisibleAtom);
  const [mode, setChatMode] = useAtom(chatMode);

  const { sendBroadcastChat, sendChatToRooms } = useUpdateChat();

  const { isConnected } = useNetInfo();

  const { t } = useTranslation();

  useEffect(() => {
    messageValueRef.current = messageValue;
  }, [messageValue]);

  useEffect(() => {
    const keyboardShowSubscriber = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setAttachmentVisible(false);
      }
    );

    return () => {
      keyboardShowSubscriber.remove();
      setAttachmentVisible(false);
    };
  }, []);

  useEffect(() => {
    const result: any = [];
    if (display.participantsNotLeft) {
      display.participantsNotLeft.forEach((one: RoomParticipantData) => {
        if (one.user_id !== MyProfile?._id) {
          result.push({
            id: one.user_id,
            name: one.firstName + " " + one.lastName,
            profile: one.profile_img,
            displayName: one.firstName + " " + one.lastName,
            phone: one.phone,
          });
        }
      });
      setSuggestions(result);
    }
  }, [display.participantsNotLeft]);

  useEffect(() => {
    let isMounted = true;

    const loadRoomDraft = async () => {
      try {
        const existingDraft = await FetchDraft();
        if (!isMounted) return;

        if (!existingDraft) {
          setMessageValue("");
          return;
        }

        const parsedDraft = JSON.parse(existingDraft);
        if (!Array.isArray(parsedDraft)) {
          setMessageValue("");
          return;
        }

        const currentRoomDraft = parsedDraft.find(
          (item) => item?.id === activeRoomId
        );
        setMessageValue(currentRoomDraft?.message || "");
      } catch (error) {
        setMessageValue("");
      }
    };

    loadRoomDraft();

    return () => {
      isMounted = false;
      clearTimeout(expireTimeout);
    };
  }, [activeRoomId]);

  useEffect(() => {
    setSelection({ start: 0, end: 0 });
    setIsComposerFocused(false);
  }, [activeRoomId]);

  useEffect(() => {
    return () => {
      clearTimeout(expireTimeout);
      const latestMessage = messageValueRef.current;
      draftMessageHandler(latestMessage);
    };
  }, []);

  async function sendchatHelp(messageText = messageValue) {
    let Replymessage = null;
    if (messageIsReply == true) {
      let sendmessage = "";
      if (replyMessage?.type == "VIDEO") {
        sendmessage = replyMessage.thumbnail;
      } else if (replyMessage?.type == "IMAGE") {
        sendmessage = replyMessage.fileURL;
      } else if (replyMessage?.type == "text") {
        sendmessage = replyMessage.message;
      } else if (replyMessage?.type == "contact") {
        sendmessage = replyMessage.message;
      }
      Replymessage = {
        cid: replyMessage?._id?.toString(),
        type: replyMessage?.type,
        sender: replyMessage?.sender,
        name: "",
        message: formateMessage(sendmessage.trim()),
        fontStyle: "normal",
        url: replyMessage?.fileURL,
        created_at: Date.now(),
      };
      if (isConnected) {
        Replymessage["type"] = replyMessage?.type;
        Replymessage["url"] = replyMessage.fileURL;
      } else {
        Replymessage["type"] = replyMessage?.type;
        Replymessage["file_URL"] = replyMessage.fileURL;
      }
    }

    let message = formateMessage(messageText.trim());

    if (!message) {
      return;
    }

    if (!activeRoomId) {
      console.warn("Cannot send chat without active room id");
      return;
    }

    const idLocal = String(uuid.v4());
    const optimisticMessage = {
      roomId: activeRoomId,
      type: "text",
      fileURL: "",
      isForwarded: false,
      message,
      fontStyle: "",
      thumbnail: "",
      duration: 0,
      sender: senderId,
      _id: idLocal,
      id_local: idLocal,
      local_Id: idLocal,
      created_at: Date.now(),
      updated_at: Date.now(),
      isSent: false,
      __local: true,
      deleted: [],
      delivered_to: [],
      read_by: [],
      favourite_by: [],
      downloadBy: [],
      PinBy: [],
      reply_msg: Replymessage ? Replymessage : null,
    };

    setConversation((previous: any[]) => {
      if (
        previous.some(
          (item: any) =>
            item?._id === idLocal ||
            item?.id_local === idLocal ||
            item?.local_Id === idLocal
        )
      ) {
        return previous;
      }
      return [optimisticMessage, ...previous];
    });

    if (isConnected) {
      const payload = {
        data: {
          roomId: activeRoomId,
          type: "text",
          fileURL: "",
          isForwarded: false,
          message: message,
          fontStyle: "",
          thumbnail: "",
          duration: 0,
          sender: senderId,
          id_local: idLocal,
        },
        reply_msg: Replymessage ? Replymessage : null,
      };

      // console.log(payload)
      // return

      if (display.roomType == "broadcast") {
        sendBroadcastChat(payload)
          .then((response) => {
            socketManager.conversation.sendChat(payload);
            if (response?._id) {
              whoosh.play((success) => {
                if (success) {
                  console.log("successfully finished playing");
                } else {
                  console.log("playback failed due to audio decoding errors");
                }
              });
            }
          })
          .catch((err) => {
            console.error("Error in sending chat", err);
          });
      } else {
        socketManager.conversation.sendChat(payload);
        // const messages = await conversationService.getMessagesByRoomId(
        //   display?.roomId
        // );
        // console.log("before clear--->", messages);

        // await database.write(async () => {
        //   await database.unsafeResetDatabase();
        // });
        // const messages2 = await conversationService.getMessagesByRoomId(
        //   display?.roomId
        // );
        // console.log("after clear-------->", messages2);

        // sendChatToRooms(payload).then((res) => {
        //   if (res?._id) {
        //     whoosh.play((success) => {
        //       if (success) {
        //         console.log("successfully finished playing");
        //       } else {
        //         console.log("playback failed due to audio decoding errors");
        //       }
        //     });
        //   }
        // });
      }
    } else {
      const currentTimestamp = Date.now();

      const payload = {
        data: {
          roomId: activeRoomId,
          type: "text",
          fileURL: "",
          isForwarded: false,
          message: message,
          fontStyle: "",
          thumbnail: "",
          duration: 0,
          sender: senderId,
          id_local: idLocal,
        },
        reply_msg: Replymessage ? Replymessage : null,
      };

      socketManager.conversation.sendChat(payload);

    }
  }
  const SendChatHandler = async (messageText = messageValue) => {
    await createRoomAndSendChat(messageText);
  };

  const renderSuggestions = ({ keyword, onSuggestionPress }: any) => {
    if (keyword == null) {
      return null;
    }

    return (
      <View
        style={{
          position: "absolute",
          bottom: 65,
          backgroundColor: Colors.light.LightBlue,
          minWidth: 250,
          maxHeight: 270,
          borderRadius: 5,
          zIndex: 9999,
          elevation: 10,
        }}
      >
        <ScrollView showsVerticalScrollIndicator={true}>
          {suggestions
            .filter((one: any) => {
              if (typeof one.name == "string") {
                return one.name
                  .toLocaleLowerCase()
                  .includes(keyword.toLocaleLowerCase());
              } else {
                return true;
              }
            })
            .map((one: any) => (
              <Pressable
                key={one.id}
                onPress={() => onSuggestionPress(one)}
                style={{
                  padding: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Image
                  source={{
                    uri: `https://storage.googleapis.com/comon-bucket/${one.profile}`,
                  }}
                  style={{ width: 30, height: 30, borderRadius: 20 }}
                />
                <Text style={{ marginLeft: 10, fontSize: 14 }}>
                  {one.displayName}
                </Text>
              </Pressable>
            ))}
        </ScrollView>
      </View>
    );
  };

  const hasActiveSelection = selection.start !== selection.end;

  const applyTextFormat = (wrapper: "*" | "_" | "~") => {
    const start = Math.min(selection.start, selection.end);
    const end = Math.max(selection.start, selection.end);

    if (start === end) {
      return;
    }

    const selectedText = messageValue.slice(start, end);
    if (!selectedText.trim()) {
      return;
    }

    const nextMessage = `${messageValue.slice(0, start)}${wrapper}${selectedText}${wrapper}${messageValue.slice(end)}`;
    const caretPosition = end + wrapper.length * 2;

    clearTimeout(expireTimeout);
    setMessageValue(nextMessage);
    setSelection({ start: caretPosition, end: caretPosition });
    draftMessageHandler(nextMessage);
    mentionRef.current?.focus();
  };

  return (
    <View style={styles.innerContainer}>
      <Pressable
        onPress={() => {
          mentionRef.current?.blur();
          Keyboard.dismiss();
          // console.log("attachmentVisible", attachmentVisible);
          if (Platform.OS == "ios") {
            setTimeout(() => {
              setAttachmentVisible(!attachmentVisible);
            }, 500);
          } else {
            setAttachmentVisible(!attachmentVisible);
          }
        }}
      >
        <AntDesign
          name="pluscircle"
          size={38}
          color={Colors.light.PrimaryColor}
          style={{
            transform: [{ rotate: attachmentVisible ? "45deg" : "0deg" }],
          }}
        />
      </Pressable>

      <View
        style={{
          flexDirection: "row",
          flex: 1,
          marginLeft: 5,
          marginRight: 5,
          // justifyContent: "flex-end",
          alignItems: "center",
          minHeight: 54,
        }}
      >
        <View
          style={{
            alignSelf: "flex-end",
            flex: 1,
            minWidth: 0,
            backgroundColor: Colors.light.LightBlue,
            borderColor: "rgba(51,51,51,.06)",
            borderRadius: 22,
            borderWidth: StyleSheet.hairlineWidth,
            justifyContent: "center",
            maxWidth:
              display.roomType !== "self"
                ? screenWidth - (!isEmpty(messageValue) ? 170 : 115)
                : screenWidth - 115,
            height: 50,
            minHeight: 50,
            maxHeight: 200,
            // marginLeft: 10,
            zIndex: 9999,
          }}
        >
          {triggers.mention?.keyword != null &&
            renderSuggestions({
              keyword: triggers.mention.keyword,
              onSuggestionPress: triggers.mention.onSelect,
            })}
          {isEmpty(messageValue) && (
            <RNText
              pointerEvents="none"
              style={{
                color: Colors.light.PhoneNoColor,
                fontSize: 16,
                left: 24,
                position: "absolute",
                top: Platform.OS === "ios" ? 15 : 14,
                zIndex: 2,
              }}
            >
              Your message
            </RNText>
          )}
          <TextInput
            ref={mentionRef}
            {...textInputProps}
            maxLength={4096}
            onFocus={() => {
              setIsComposerFocused(true);
              setChatMode("text");
              setAttachmentVisible(false);
            }}
            onBlur={() => {
              setChatMode("scroll");
              setTimeout(() => {
                setIsComposerFocused(false);
              }, 150);
            }}
            autoFocus={false}
            multiline
            placeholder=""
            placeholderTextColor={Colors.light.PhoneNoColor}
            selection={selection}
            style={{
              color: Colors.light.black,
              fontSize: 16,
              height: 50,
              lineHeight: 20,
              paddingLeft: 24,
              paddingRight: 18,
              paddingTop: Platform.OS === "ios" ? 14 : 8,
              paddingBottom: Platform.OS === "ios" ? 12 : 8,
              textAlignVertical: "center",
              zIndex: 1,
            }}
          />
          {isComposerFocused && hasActiveSelection && (
            <View style={styles.formatToolbar}>
              <Pressable
                onPress={() => applyTextFormat("*")}
                style={styles.formatAction}
              >
                <Text style={styles.formatActionText}>Bold</Text>
              </Pressable>
              <Pressable
                onPress={() => applyTextFormat("_")}
                style={styles.formatAction}
              >
                <Text style={styles.formatActionText}>Italic</Text>
              </Pressable>
              <Pressable
                onPress={() => applyTextFormat("~")}
                style={styles.formatAction}
              >
                <Text style={styles.formatActionText}>Strike</Text>
              </Pressable>
            </View>
          )}
        </View>
        <View style={{ marginLeft: 3 }}>
          {!isEmpty(messageValue) ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable
                style={{
                  backgroundColor: Colors.light.LightBlue,
                  borderRadius: 50,
                  height: 50,
                  width: 50,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={async () => {
                  // setIsSending(true);
                  const message = messageValue?.trim();

                  if (!message) {
                    return;
                  }

                  setMessageValue("");
                  setSelection({ start: 0, end: 0 });
                  await removeDraftIfExist(
                    replaceTriggerValues(message, ({ id }) => `@${id}`)
                  );

                  await SendChatHandler(message);
                }}
              >
                <SendIconGreen />
              </Pressable>
              <View style={{ width: 5 }} />
              {display.roomType !== "self" && (
                <Pressable
                  onPress={async () => {
                    const message = messageValue?.trim();

                    if (!message) {
                      return;
                    }

                    setMessageValue("");
                    setSelection({ start: 0, end: 0 });
                    await removeDraftIfExist(
                      replaceTriggerValues(message, ({ id }) => `@${id}`)
                    );
                    onMessageSchedule(message);
                  }}
                  style={{
                    backgroundColor: Colors.light.LightBlue,
                    borderRadius: 50,
                    height: 50,
                    width: 50,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <FastImage
                    source={Icon.ScheduleIcon}
                    style={{ height: 28, width: 28, marginHorizontal: 10 }}
                  />
                </Pressable>
              )}
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setAttachmentVisible(false);
                setAudioRecordVisible(true);
              }}
              style={{
                backgroundColor: Colors.light.LightBlue,
                borderRadius: 50,
                height: 50,
                width: 50,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <AudioGreen />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );

  function formateMessage(message: string) {
    const regex = /@\[([^\]]+)\]\(([a-zA-Z0-9]{24})\)/g;
    let resultMessage = message;
    const matches = resultMessage.match(regex) ?? [];
    const changeMatch = [];

    // console.log(message, matches);
    if (matches.length > 0) {
      // const ids = [];
      for (let i = 0; i < matches?.length; i++) {
        const start = matches[i].indexOf("(");
        const end = matches[i].indexOf(")");
        const userID = matches[i].slice(start + 1, end);
        const phoneStart = matches[i].indexOf("[");
        const phoneEnd = matches[i].indexOf("]");
        const phone = matches[i].slice(phoneStart + 1, phoneEnd - 1);

        if (display.currentUserUtility.user_id == userID) {
          changeMatch.push(
            matches[i].replace(phone, display.currentUserUtility.phone)
          );
        } else {
          const isExist = display.participants.find(
            (contact) => contact.user_id == userID
          );
          if (isExist) {
            changeMatch.push(matches[i].replace(phone, isExist.phone));
          } else {
            changeMatch.push(matches[i].replace(phone, phone));
          }
        }
        // console.log(ids,matches[i])
      }

      for (let i = 0; i < matches.length; i++) {
        resultMessage = resultMessage?.replace(matches[i], changeMatch[i]);
      }
    }

    return resultMessage;
  }

  function onMessageSchedule(messageText = messageValue) {
    navigate("CreateScheduleMessage", {
      type: EventType["Schedule"],
      roomId: activeRoomId,
      roomType: display.roomType,
      mode: "create",
      startDate: dayjs().add(30, "minutes").toISOString(),
      daylyParams: null,
      monthlyParams: null,
      endDate: dayjs().toISOString(),
      recursive: RecurrentTypes["Once"],
      time: dayjs().add(30, "minutes").toISOString(),
      approvalReminderTime: [],
      isApprovalNeeded: false,
      message: [
        {
          roomId: activeRoomId,
          type: "text",
          fileURL: "",
          isForwarded: false,
          message: formateMessage(messageText.trim()),
          fontStyle: "",
          thumbnail: "",
          duration: 0,
        },
      ],
    });
  }

  async function createRoomAndSendChat(messageText = messageValue) {
    if (mode !== "text") setChatMode("text");
    setReplyVisible(false);
    await sendchatHelp(messageText);

    const leftAt = display.currentUserUtility?.left_at ?? 0;
    if (leftAt > 0) {
      ensureRoomCanSend()
        .then((canSendNow) => {
          if (!canSendNow) {
            socketManager.conversation.failOutboxForRoom?.(activeRoomId);
            ToastMessage(t("noLongerParticipant"));
            return;
          }
          socketManager.conversation.flushOutbox?.();
        })
        .catch((err) => {
          console.log("ensureRoomCanSend failed:", err);
        });
    }
  }

  async function ensureRoomCanSend() {
    if ((display.currentUserUtility?.left_at ?? 0) <= 0) {
      return true;
    }

    // Attempt undelete/restore for this room (works for individual + group when the user was
    // incorrectly marked as "left" by a delete/undelete flow). Backend will not override a
    // real leave timestamp.
    // Some socket backends expect object payload and some expect raw id.
    await socketConnect.emit("undeleteRoom", { roomId: activeRoomId } as any);
    await socketConnect.emit("undeleteRoom", activeRoomId as any);
    socketManager.chatRoom.fetchAndUpdateRooms(() => {});

    for (let attempt = 0; attempt < 8; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const roomData = await new Promise<any>((resolve) => {
        let settled = false;
        const settleOnce = (data: any) => {
          if (!settled) {
            settled = true;
            resolve(data);
          }
        };
        socketManager.chatRoom.getFormattedRoomById(activeRoomId, (data) => {
          settleOnce(data);
        });
        setTimeout(() => settleOnce(null), 1200);
      });

      if (roomData?.room) {
        setDisplay(roomData.room);
      }

      const leftAt = roomData?.room?.currentUserUtility?.left_at ?? display.currentUserUtility?.left_at ?? 0;
      if (leftAt <= 0) {
        return true;
      }
    }
    return false;
  }

  async function removeDraftIfExist(message: string) {
    const draftData = JSON.parse(await retrieveDraftData(message));
    const index = draftData.findIndex((item) => item.id === activeRoomId);

    if (index >= 0) {
      draftData.splice(index, 1);
      StoreDraft(JSON.stringify(draftData));
    }
  }

  async function retrieveDraftData(message: string) {
    //get draft from async-storage
    const existingDraft = await FetchDraft();
    if (existingDraft) {
      return existingDraft;
    } else {
      return JSON.stringify([
        {
          id: activeRoomId,
          message: message,
        },
      ]);
    }
  }

  async function updateDraft(message: string, roomId: string) {
    const draftData = JSON.parse(await retrieveDraftData(message));
    const index = draftData.findIndex((item) => item.id === roomId);

    if (index === -1) {
      draftData.push({ id: roomId, message: message });
    } else {
      draftData.splice(index, 1, { id: roomId, message: message });
    }
    //update draft from async-storage
    StoreDraft(JSON.stringify(draftData));
  }

  async function draftMessageHandler(message: string) {
    await updateDraft(message, activeRoomId);
  }

  async function handleMessageChange(message: string) {
    const isEmpty = empty.test(message);
    if (mode !== "text") setChatMode("text");
    if (!isEmpty) {
      clearTimeout(expireTimeout);
      expireTimeout = setTimeout(() => {
        // console.log("Here");
        draftMessageHandler(message);
      }, 1000);
      // console.log(message)
      setMessageValue(message);
    } else {
      draftMessageHandler("");
      setMessageValue("");
      setSelection({ start: 0, end: 0 });
    }
  }
}

function SeniorBottomBox() {
  const room = useAtomValue(singleRoom);
  const { t } = useTranslation();
  const [enableText, setEnableText] = useState<boolean>(false);
  const [attachment, setAttachment] = useState<messageType | null>(null);
  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          marginTop: 5,
          borderTopColor: "rgba(51,51,51,.1)",
          borderTopWidth: 1,
        },
      ]}
    >
      <Pressable
        onPress={() => setEnableText(true)}
        style={{ flex: 1, alignItems: "center" }}
      >
        <Octicons name="pencil" size={22} />
        <Text
          size="sm"
          lineNumber={3}
          style={{ textAlign: "center", marginTop: 5 }}
        >
          {t("seniorMode.write-message")}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => {
          pickImage("Camera");
        }}
        style={{ flex: 1, alignItems: "center" }}
      >
        <AntDesign name="camerao" size={22} />
        <Text
          size="sm"
          lineNumber={3}
          style={{ textAlign: "center", marginTop: 5 }}
        >
          {t("seniorMode.take-photo")}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => {
          pickImage("Gallery");
        }}
        style={{ flex: 1, alignItems: "center" }}
      >
        <Feather name="image" size={22} />
        <Text
          size="sm"
          lineNumber={3}
          style={{ textAlign: "center", marginTop: 5 }}
        >
          {t("seniorMode.take-photo-gallery")}
        </Text>
      </Pressable>
      <ModalTextInput
        isVisible={enableText}
        onClose={() => {
          setEnableText(false);
        }}
        room={{ display: { UserName: room.roomName }, _id: room.roomId }}
      />
      <ModalCaptionInput
        isVisible={attachment != null}
        onClose={() => {
          setEnableText(false);
          setAttachment(null);
        }}
        room={{ display: { UserName: room.roomName }, _id: room.roomId }}
        conversation={attachment}
      />
    </View>
  );

  async function pickImage(type: "Gallery" | "Camera" | "Video") {
    switch (type) {
      case "Gallery":
        const resultGallery = await pickGallery();
        await OpenSelectedModel(resultGallery);
        break;
      case "Camera":
        Alert.alert(`${t("seniorMode.ask-capture-image")}`, "", [
          {
            text: "Cancel",
            onPress: () => { },
            style: "destructive",
          },
          {
            text: `${t("Utils.Image")}`,
            onPress: async () => {
              const resultCamera = await pickCamera("Image");
              await OpenSelectedModel(resultCamera);
            },
          },
          {
            text: `${t("Utils.Video")}`,
            onPress: async () => {
              const resultCamera = await pickCamera("Video");
              await OpenSelectedModel(resultCamera);
            },
          },
        ]);

        break;
      default:
        break;
    }
  }

  async function pickCamera(type: "Image" | "Video") {
    const checkCamera = await checkCameraPermission();
    console.log("checkCamera", checkCamera);
    if (checkCamera) {
      const result = await launchCamera({
        mediaType: type == "Image" ? "photo" : "video",
        quality: 1,
        videoQuality: "high",
        durationLimit: 1200,
        cameraType: "back",
        formatAsMp4: Platform.OS == "ios" ? true : false,
      });

      return result;
    } else {
      const askCamera = await askCameraPermission();
      console.log("askCamera", askCamera);
      if (askCamera) {
        const result = await launchCamera({
          mediaType: type == "Image" ? "photo" : "video",
          quality: 1,
          videoQuality: "high",
          durationLimit: 1200,
          cameraType: "back",
          formatAsMp4: Platform.OS == "ios" ? true : false,
        });
        return result;
      } else {
        permissionAlert("Camera");
        return {};
      }
    }
  }
  async function pickGallery() {
    const checkGallery = await checkMediaPermission();
    if (checkGallery) {
      return await launchImageLibrary({
        // mediaTypes: MediaTypeOptions.All,
        mediaType: "mixed",
        presentationStyle: "popover",
        selectionLimit: 1,
        // allowsMultipleSelection: true,
        // quality: 1,
      });
    } else {
      const askGallery = await askMediaPermission();
      if (askGallery) {
        return await launchImageLibrary({
          // mediaTypes: MediaTypeOptions.All,
          mediaType: "mixed",
          presentationStyle: "popover",
          selectionLimit: 1,
          // allowsMultipleSelection: true,
          // quality: 1,
        });
      } else {
        permissionAlert("Camera");
        return {};
      }
    }
  }

  async function OpenSelectedModel(result: ImagePickerResponse) {
    // console.log("result", result);
    if (result.didCancel) {
    } else if (result.assets?.length > 0) {
      let file = result.assets[0];
      const stableUri = file?.type?.includes("image")
        ? await persistImageUri(file.uri, file.fileName)
        : file.uri;
      const conversation = {
        _id: uuid.v4(),
        roomId: room.roomId,
        type: `LOADING/${file.type}`,
        sender: room.currentUserUtility.user_id,
        message: "",
        fileURL: stableUri,
        duration: 0,
        thumbnail: "",
        favourite_by: [],
        isForwarded: false,
        fontStyle: "",
        created_at: Date.now(),
        updated_at: 0,
        readByIds: "",
        read_by: [],
        deleted: [],
        downloadBy: [],
        PinBy: [],
        isSent: false,
        deliveredToIds: "",
        delivered_to: [],
        __v: 0,
      };

      setAttachment(conversation);
    } else {
      console.log("result", result);
    }
  }
}

let expireTimeout: NodeJS.Timeout | undefined = undefined;

const styles = StyleSheet.create({
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 120,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: "white",
    borderRadius: 10,
    // height: 300,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(140,140,140,1)",
    width: 150,
  },
  pickerError: {
    borderColor: "red",
  },
  RightIconContainer: {
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    right: 16,
    width: 70,
    zIndex: 9999,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  TextInputStyle: {
    backgroundColor: Colors.light.LightBlue,
    borderRadius: 6,
    flex: 1,
    maxHeight: 150,
    // height:199,
    // eslint-disable-next-line react-native/sort-styles
    marginLeft: 10,
    paddingLeft: 10,
    paddingRight: 100,
    paddingTop: Platform.OS == "ios" ? 15 : 0,
  },
  container: {
    alignSelf: "baseline",
    backgroundColor: Colors.light.White,
    justifyContent: "center",
    paddingVertical: 12,
    width: "100%",
  },
  innerContainer: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    width: "100%",
  },
  formatToolbar: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.White,
    borderColor: "rgba(51,51,51,.12)",
    borderRadius: 16,
    borderWidth: 1,
    bottom: 104,
    elevation: 8,
    flexDirection: "row",
    left: 12,
    paddingHorizontal: 6,
    paddingVertical: 6,
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    zIndex: 10000,
  },
  formatAction: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  formatActionText: {
    color: Colors.light.black,
    fontSize: 13,
    fontWeight: "600",
  },
  // unActivecon: {
  //   bottom: Platform.OS == "android" ? -(windowHeight / DynamicHeight) : -(windowHeight / 9),
  // },
});
