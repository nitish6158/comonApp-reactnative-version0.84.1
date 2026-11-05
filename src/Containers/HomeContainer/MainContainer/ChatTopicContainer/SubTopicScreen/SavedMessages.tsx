import { Pressable, Text, View, StyleSheet, Clipboard } from "react-native";
import React from "react";
import { useAppSelector } from "@/redux/Store";
import { Chats } from "@/graphql/generated/types";
import { useTranslation } from "react-i18next";
// import RealmContext from "@/schemas";
import { useSetAtom } from "jotai";
import { chatIndexForScroll, chatMode } from "@/Atoms";
import { Hidemessage } from "@Types/types";
import FastImage from "@d11/react-native-fast-image";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import IonIcon from "react-native-vector-icons/Ionicons";
import { Colors, fonts } from "@/Constants";
import { getFileName } from "@/utils/helpers/FilePathUtility";
import { useNavigation } from "@react-navigation/core";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";
import { useRemoveMsgsFromTopicMutation } from "@/graphql/generated/topics.generated";
import { windowWidth } from "@/utils/ResponsiveView";
import dayjs from "dayjs";
import { ChatContactView } from "@/Components";
import { VideoComponent } from "../../ChatContainer/ChatMessages/MessageComponents/VideoMessageComponent";
import { AudioComponent } from "../../ChatContainer/ChatMessages/MessageComponents/AudioMessageComponent";
import { FileIconView } from "@/Components/DocumentPreview";

// const { useQuery, useRealm } = RealmContext;

type props = {
  messages: Chats[];
  onMessageDelete: () => void;
  topicId:string | null
};

export default function SavedMessages({ messages, onMessageDelete,topicId }: Readonly<props>) {
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const { comonContact } = useAppSelector((state) => state.Contact);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [removeMessageRequest] = useRemoveMsgsFromTopicMutation();

  if(!topicId){
    return <></>
  }

  return (
    <View style={{ marginBottom: 110 }}>
      {messages.map((item, ind) => {
        let senderName = "";
        let receiverName = "";
        if (item?.sender?._id == MyProfile?._id) {
          senderName = t("navigation.you");
        } else {
          const findInCommonContact = comonContact.find((e) => e.userId?._id == item?.sender?._id);
          if (findInCommonContact) {
            senderName = `${findInCommonContact?.firstName} ${findInCommonContact?.lastName}`;
          } else {
            senderName = `${item?.sender?.firstName} ${item?.sender?.lastName}`;
          }
        }

        if (item.toUser?._id == MyProfile?._id) {
          receiverName = t("navigation.you");
        } else {
          if (item?.roomId?.type == "group") {
            receiverName = `${item?.roomId?.name}`;
          } else {
            const findInCommonContact = comonContact.find((e) => e.userId?._id == item?.toUser?._id);
            if (findInCommonContact) {
              receiverName = `${findInCommonContact?.firstName} ${findInCommonContact?.lastName}`;
            } else {
              receiverName = `${item?.toUser?.firstName} ${item?.toUser?.lastName}`;
            }
          }
        }
        if (!item?.toUser) {
          receiverName = t("navigation.you");
        }
        const onPressMessage = (item) => {

          navigation.navigate("ChatMessageScreen", {
            RoomId: item?.roomId?._id,
            type: item?.roomId?.type,
          });
        };

        return (
          <Pressable key={ind} style={[{ padding: 15 }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={styles.rowDirection}>
                <FastImage
                  source={{ uri: `${DefaultImageUrl}${item.sender?.profile_img}` }}
                  style={{ height: 32, width: 32, borderRadius: 32, marginRight: 10 }}
                />
                <Text style={{ fontSize: 16, lineHeight: 20, fontFamily: fonts.Lato, color: Colors.light.black }}>
                  {senderName} <Text style={{ color: Colors.light.PrimaryColor }}>{">>"}</Text> {receiverName}{" "}
                </Text>
              </View>
              <Menu>
                <MenuTrigger>
                  <IonIcon name="ellipsis-vertical" size={20} />
                </MenuTrigger>
                <MenuOptions optionsContainerStyle={{ width: 100 }}>
                  <MenuOption
                    onSelect={() => {
                      forwardMessage(item.chatId);
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{t("optionalModal.forward")}</Text>
                  </MenuOption>
                  {item.message.type == "text" && (
                    <MenuOption
                      onSelect={() => {
                        if (item.message.message.length > 0) {
                          copyText(item.message.message);
                        }
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{t("optionalModal.copy")}</Text>
                    </MenuOption>
                  )}
                  <MenuOption onSelect={() => deleteMessage(topicId, item?.chatId)}>
                    <Text style={{ color: "red", fontSize: 16 }}>{t("btn.delete")}</Text>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>
            <View
              style={[
                styles.rowDirection,
                { marginLeft: 42, justifyContent: "space-between", marginTop: 10, alignItems: "flex-start" },
              ]}
            >
              {item?.message?.type == "text" ? (
                <Pressable style={styles.chatBackground} onPress={() => onPressMessage(item)}>
                  <Text style={styles.msgStyle}>{item.message.message}</Text>
                </Pressable>
              ) : item.message.type == "IMAGE" ? (
                <Pressable style={[styles.chatBackground, { width: "75%" }]} onPress={() => onPressMessage(item)}>
                  <FastImage
                    source={{ uri: `${DefaultImageUrl}${item.message.fileURL}` }}
                    style={{ height: 158, width: "100%", borderRadius: 8 }}
                  />
                  {item?.message?.message != "" ? <Text style={styles.msgStyle}>{item?.message?.message}</Text> : null}
                </Pressable>
              ) : item.message.type == "DOCUMENT" || item.message.type == "APPLICATION" ? (
                <Pressable onPress={() => onPressMessage(item)} style={styles.chatBackground}>
                  <Pressable style={styles.pdfView}>
                    <View style={{ marginRight: 10 }}>
                      <FileIconView type={item.message.fileURL.split(".").pop()} />
                    </View>
                    <View>
                      <Text style={{ color: Colors.light.black, marginBottom: 3 }}>
                        {getFileName(item.message.fileURL.split("/").pop())}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ fontWeight: "bold", textTransform: "uppercase", color: Colors.light.black }}>
                          {item.message.fileURL.split(".").pop()}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                  {item?.message?.message !== "" ? <Text style={styles.msgStyle}>{item?.message?.message}</Text> : null}
                </Pressable>
              ) : item.message.type == "AUDIO" ? (
                <Pressable style={styles.chatBackground}>
                  <Pressable style={{ width: "75%" }} onPress={() => onPressMessage(item)}>
                    <AudioComponent message={item.message} senderImage={item.sender.profile_img} />
                  </Pressable>
                  {item?.message?.message != "" ? <Text style={styles.msgStyle}>{item?.message?.message}</Text> : null}
                </Pressable>
              ) : item.message.type == "VIDEO" ? (
                <Pressable style={styles.chatBackground}>
                  <Pressable style={{ maxWidth: "90%" }} onPress={() => onPressMessage(item)}>
                    <VideoComponent message={item.message} />
                  </Pressable>
                  {item?.message?.message != "" ? <Text style={styles.msgStyle}>{item?.message?.message}</Text> : null}
                </Pressable>
              ) : item.message.type == "contact" ? (
                <ChatContactView
                  ContactInfo={JSON.parse(item.message.message)}
                  MyProfile={MyProfile}
                  item={item.message}
                />
              ) : (
                <></>
              )}
              <View style={{ alignItems: "center", paddingLeft: 5 }}>
                <Text style={{ fontSize: 12, lineHeight: 15, color: "rgba(130, 130, 130, 1)" }}>
                  {dayjs(item?.message.created_at).format("DD.MM.YYYY")}
                </Text>
                <Text style={{ fontSize: 12, lineHeight: 15, color: "rgba(130, 130, 130, 1)" }}>
                  {dayjs(item?.message.created_at).format("HH:mm")}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  function deleteMessage(topicId: string, chatId: string) {
    removeMessageRequest({
      variables: {
        input: {
          topicId,
          chatIds: [chatId],
        },
      },
    }).then((res) => {
      if (res.data?.removeMsgsFromTopic) {
        onMessageDelete();
      }
    });
  }

  function copyText(message: string) {
    Clipboard.setString(message);
  }

  function forwardMessage(chatId: string) {
    navigation.navigate("ForwardMessageScreen", {
      Cidlist: [chatId],
      fromScreen: "TOPIC_SCREEN",
    });
  }
}

const styles = StyleSheet.create({
  rowDirection: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatBackground: {
    padding: 10,
    backgroundColor: "rgba(243, 249, 252, 1)",
    maxWidth: "75%",
    borderRadius: 5,
  },
  pdfView: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 10,
    paddingHorizontal: 10,
    maxWidth: "100%",
    paddingVertical: 5,
    backgroundColor: Colors.light.LightBlue,
    borderColor: "rgba(51,51,51,.5)",
    borderWidth: 0.3,
  },
  msgStyle: {
    fontSize: 14,
    lineHeight: 18,
    color: "black",
    marginTop: 5,
  },
});
