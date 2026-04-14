import { View, Text, StyleSheet, ScrollView } from "react-native";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ViewChatResultScreenProps } from "@/navigation/screenPropsTypes";
import { HeaderWithScreenName } from "@/Components/header";
import { useAtomValue } from "jotai";
import { singleRoom } from "@/Atoms";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";
import { windowWidth } from "@/utils/ResponsiveView";
import { useTranslation } from "react-i18next";
import { ChatContext } from "@/Context/ChatProvider";
import { questionType } from "./CreateChatPollScreen";
import { socketManager } from "@/utils/socket/SocketManager";

export default function ViewChatResultScreen({ navigation, route }: ViewChatResultScreenProps) {
  const display = useAtomValue(singleRoom);
  const { conversation } = useContext(ChatContext);
  const {t} = useTranslation();
  const chatId = route.params.chatId;
  const [questions, setQuestions] = useState<questionType[]>(route.params.questions);

  const updateQuestionsFromMessage = (message: any) => {
    if (!message?.message) return;
    try {
      setQuestions(JSON.parse(message.message) as questionType[]);
    } catch (error) {
      // Keep current state if parsing fails
    }
  };

  const latestQuestionsFromConversation = useMemo(() => {
    if (!chatId) return route.params.questions;

    const livePollMessage = conversation.find(
      (item) => item?._id === chatId && item?.type === "poll"
    );

    if (!livePollMessage?.message) return route.params.questions;

    try {
      return JSON.parse(livePollMessage.message) as questionType[];
    } catch (error) {
      return route.params.questions;
    }
  }, [chatId, conversation, route.params.questions]);

  useEffect(() => {
    setQuestions(latestQuestionsFromConversation);
  }, [latestQuestionsFromConversation]);

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = socketManager.conversation.onMessage((data: any) => {
      const normalizedType =
        data?.type === "message" ? data?.msg?.type : data?.type;
      const normalizedMsg =
        data?.type === "message" ? data?.msg?.msg || data?.msg : data?.msg;
      const isPollUpdateType =
        normalizedType === "poll" || normalizedType === "updateMessage";

      if (!isPollUpdateType || !normalizedMsg) return;
      if (normalizedMsg?._id !== chatId) return;
      if (
        display?.roomId &&
        normalizedMsg?.roomId &&
        normalizedMsg.roomId !== display.roomId
      ) {
        return;
      }
      if (normalizedMsg?.type !== "poll") return;

      updateQuestionsFromMessage(normalizedMsg);
    });

    return () => {
      unsubscribe?.();
    };
  }, [chatId, display?.roomId]);

  useEffect(() => {
    if (!chatId || !display?.roomId) return;

    const refreshPoll = () => {
      socketManager.chatRoom.getChatMeesagesByDays(
        display.roomId,
        1,
        100,
        (data: any) => {
          const latestPoll = data?.chats?.find(
            (item: any) => item?._id === chatId && item?.type === "poll"
          );
          if (latestPoll) {
            updateQuestionsFromMessage(latestPoll);
          }
        }
      );
    };

    const interval = setInterval(refreshPoll, 3000);

    return () => {
      clearInterval(interval);
    };
  }, [chatId, display?.roomId]);

  return (
    <View style={styles.main}>
      <HeaderWithScreenName title={t("chatPoll.poll-details")} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {questions.map((item, i) => {
          return (
            <View key={item._id} style={{ marginTop: 10 }}>
              <View style={{ backgroundColor: "white", paddingHorizontal: 20, paddingVertical: 10, marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "500" }}>
                  {i + 1}. {item.title}
                </Text>
              </View>
              {item.options.map((ans, ani) => {
                return (
                  <View
                    key={ans._id}
                    style={{ backgroundColor: "white", paddingHorizontal: 30, paddingVertical: 15, marginBottom: 2 }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ maxWidth: windowWidth - 100 }}>
                        {ani + 1}. {ans.name}
                      </Text>
                      <Text>{ans.value.length} {t("chatPoll.vote")}</Text>
                    </View>
                    <View style={{ marginTop: 10, marginLeft: 10 }}>
                      {ans.value.map((parti) => {
                        let user = [...display.participants, display.currentUserUtility].find(
                          (v) => v.user_id == parti
                        );

                        if (user) {
                          return (
                            <View key={parti} style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                              <FastImage
                                style={{ height: 30, width: 30, borderRadius: 30 }}
                                source={{ uri: DefaultImageUrl + user.profile_img }}
                              />
                              <Text style={{ marginLeft: 10,maxWidth: windowWidth - 100 }}>
                                {user.firstName + " " + user.lastName} 
                              </Text>
                            </View>
                          );
                        } else {
                          return <></>;
                        }
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    // backgroundColor: "white",
  },
});
