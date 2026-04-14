import { Pressable, Text, View } from "react-native";

import ChatContactView from "@Components/ChatContactView";
import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";
import DeleteMessageText from "@Util/chatUtils/deleteMessageText";
import MessageCommonWrapper from "./MessageCommonWrapper";
import React, { useEffect, useMemo, useState } from "react";
import { RootState } from "@Store/Reducer";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom, useAtomValue } from "jotai";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { questionType } from "../../ChatPolls/CreateChatPollScreen";
import { Checkbox } from "react-native-ui-lib";
import * as Progress from "react-native-progress";
import { useUpdateChatMutation } from "@/graphql/generated/room.generated";
import _ from "lodash";
import { useAppSelector } from "@/redux/Store";
import { navigate } from "@/navigation/utility";

type props = {
  isVisible: boolean;
  isMessageDeletedForEveryOne: boolean;
  isMessageForwarded: boolean;
  message: Conversation;
  searchText: string;
};

export default function PollMessageComponent({
  isVisible,
  isMessageDeletedForEveryOne,
  isMessageForwarded,
  message,
  searchText,
}: props) {
  const display = useAtomValue(singleRoom);

  const { t } = useTranslation();
  const parsedQuestions = useMemo(() => {
    try {
      return JSON.parse(message.message) as Array<questionType>;
    } catch (error) {
      return [];
    }
  }, [message.message]);

  if (!isVisible) {
    return null;
  } else if (isMessageDeletedForEveryOne) {
    return (
      <Text
        style={{ color: Colors.light.black, fontStyle: "italic", fontSize: 13 }}
      >
        {DeleteMessageText(message, display.currentUserUtility.user_id, t)}
      </Text>
    );
  } else {
    return (
      <MessageCommonWrapper
        isMessageForwarded={isMessageForwarded}
        message={message}
        showMessageText={false}
        searchText={searchText}
      >
        <PollView questions={parsedQuestions} chatMessage={message} />
      </MessageCommonWrapper>
    );
  }
}

type PollViewType = {
  questions: Array<questionType>;
  chatMessage: Conversation;
};

function PollView({ questions, chatMessage }: PollViewType) {
  const display = useAtomValue(singleRoom);
  const [updateChat, updateChatResponse] = useUpdateChatMutation();
  const { t } = useTranslation();
  const { MyProfile } = useAppSelector((state) => state.Chat);

  const [localQuestions, setLocalQuestions] = useState(questions);

  useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  const base = useMemo(() => {
    const totalParticipants = Math.max(display?.participants?.length ?? 0, 1);
    return totalParticipants / 100;
  }, [display.participantsNotLeft, display.currentUserUtility.left_at]);

  const handleOptionChange = (
    questionId: string,
    optionId: string,
    isMultiAnswerAllow: boolean,
    isChecked: boolean
  ) => {
    const updatedQuestions = localQuestions.map((question: any) => {
      if (question._id !== questionId) return question;

      const updatedOptions = question.options.map((option: any) => {
        if (option._id === optionId) {
          if (isChecked) {
            // Checking for User has selected or not
            if (!option.value.includes(display.currentUserUtility.user_id)) {
              return {
                ...option,
                value: [...option.value, display.currentUserUtility.user_id],
              };
            }
          } else { 
            // filtering the user which has not selected
            return {
              ...option,
              value: option.value.filter(
                (uid: string) => uid !== display.currentUserUtility.user_id
              ),
            };
          }
        } else {
          // Stop User from attempting multiple selection
          if (!isMultiAnswerAllow) {
            return {
              ...option,
              value: option.value.filter(
                (uid: string) => uid !== display.currentUserUtility.user_id
              ),
            };
          }
        }
        return option;
      });

      return {
        ...question,
        options: updatedOptions,
      };
    });

    setLocalQuestions(updatedQuestions);

    const payload = {
      isSent: true,
      data: {
        _id: chatMessage?._id,
        type: chatMessage?.type,
        roomId: chatMessage?.roomId,
        message: JSON.stringify(updatedQuestions),
        duration: chatMessage?.duration,
        fileURL: chatMessage?.fileURL,
        isForwarded: chatMessage?.isForwarded,
        fontStyle: chatMessage?.fontStyle,
        thumbnail: chatMessage?.thumbnail,
      },
      reply_msg: null,
    };

    updateChat({
      variables: {
        input: payload,
      },
    });
  };

  return (
    <View>
      {localQuestions.map((item) => (
        <View
          key={item._id}
          style={{ marginHorizontal: 10, marginVertical: 10 }}
        >
          <Text style={{ fontSize: MyProfile?.mode == "CLASSIC" ? 16 : 18 }}>
            {item.title}
          </Text>
          <Text
            style={{
              fontSize: MyProfile?.mode == "CLASSIC" ? 12 : 14,
              marginTop: 5,
              color: "gray",
            }}
          >
            {item.isMultiAnswerAllow
              ? t("chatPoll.select-one-or-more")
              : t("chatPoll.select-only-one")}
          </Text>
          <View style={{ marginTop: 10 }}>
            {item.options.map((option) => {
              const isSelected = option.value.includes(
                display.currentUserUtility.user_id
              );

              return (
                <View key={option._id} style={{ marginBottom: 10 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                    }}
                  >
                    <Checkbox
                      disabled={
                        updateChatResponse.loading ||
                        display.isCurrentUserLeftRoom
                      }
                      color={Colors.light.PrimaryColor}
                      label={option.name}
                      value={isSelected}
                      style={{ borderRadius: 50 }}
                      onValueChange={(checked) =>
                        handleOptionChange(
                          item._id,
                          option._id,
                          item.isMultiAnswerAllow,
                          checked
                        )
                      }
                    />
                    <Text style={{ color: "black" }}>
                      {option.value.length}
                    </Text>
                  </View>
                  <View
                    style={{
                      marginLeft: 10,
                      marginTop: 10,
                      alignSelf: "flex-end",
                    }}
                  >
                    <Progress.Bar
                      animated={true}
                      width={180}
                      progress={option.value.length / base / 100}
                      color={Colors.light.PrimaryColor}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ))}
      <Pressable
        onPress={() => {
          navigate("ViewChatResultScreen", {
            chatId: chatMessage?._id,
            questions: localQuestions,
          });
        }}
        style={{ alignItems: "center" }}
      >
        <Text style={{ color: Colors.light.PrimaryColor }}>
          {t("chatPoll.view-result")}
        </Text>
      </Pressable>
    </View>
  );
}
