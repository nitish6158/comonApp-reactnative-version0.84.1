import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Vibration,
} from "react-native";
import React from "react";
import { CreateChatPollScreenProps } from "@/navigation/screenPropsTypes";
import { HeaderWithScreenName } from "@/Components/header";
import { Controller, useForm } from "react-hook-form";
import { uuidv4 } from "react-native-compressor";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { windowHeight, windowWidth } from "@/utils/ResponsiveView";
import { Checkbox, TextField } from "react-native-ui-lib";
import AntDesign from "react-native-vector-icons/AntDesign";
import { Colors } from "@/Constants";
import Ionicons from "react-native-vector-icons/Ionicons";
import ToastMessage from "@/utils/ToastMesage";
import { useAtomValue } from "jotai";
import { singleRoom } from "@/Atoms";
import useUpdateChat from "@/hooks/useUpdateChat";
import { whoosh } from "@/utils/helpers/SendChatHelper";
import { useSendChatMutation } from "@/graphql/generated/room.generated";
import { useTranslation } from "react-i18next";
import { socketManager } from "@/utils/socket/SocketManager";

type option = {
  _id: string;
  name: string;
  value: string[];
};

export type questionType = {
  _id: string;
  title: string;
  options: Array<option>;
  isMultiAnswerAllow: boolean;
};

type formType = {
  questions: Array<questionType>;
};

const defaultQuestion: questionType = {
  _id: uuidv4(),
  title: "",
  isMultiAnswerAllow: false,
  options: [
    { _id: uuidv4(), name: "", value: [] },
    { _id: uuidv4(), name: "", value: [] },
  ],
};

export default function CreateChatPollScreen({
  navigation,
  route,
}: CreateChatPollScreenProps) {
  const display = useAtomValue(singleRoom);
  const [sendChat, sentChatResponse] = useSendChatMutation();
  const { t } = useTranslation();
  const {
    control,
    getValues,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<formType>({ defaultValues: { questions: [defaultQuestion] } });

  return (
    <View style={styles.main}>
      <HeaderWithScreenName title={t("chatPoll.create-new-poll")} />
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={50}
        style={{ height: windowHeight - 250 }}
      >
        <Controller
          control={control}
          name="questions"
          render={({ field, fieldState }) => {
            return (
              <View style={{ marginHorizontal: 20, marginTop: 20 }}>
                {field.value.map((item, index) => {
                  return (
                    <View
                      key={item._id}
                      style={{ marginTop: index == 0 ? 10 : 40 }}
                    >
                      <Text
                        style={{
                          fontWeight: "500",
                          color: Colors.light.PrimaryColor,
                        }}
                      >
                        {t("chatPoll.question")} {index + 1}
                      </Text>
                      <TextField
                        placeholder={`${t("chatPoll.enter-your-question")}`}
                        onChangeText={(text) => {
                          let newValue = field.value.map((question, i) => {
                            if (question._id == item._id) {
                              return { ...question, title: text.trim() };
                            } else {
                              return question;
                            }
                          });
                          field.onChange(newValue);
                        }}
                        maxLength={100}
                        showCharCounter
                        style={{
                          height: 45,
                          fontSize: 16,
                          width: windowWidth - 100,
                        }}
                        trailingAccessory={
                          index > 0 ? (
                            <Pressable
                              onPress={() => {
                                let newValue = field.value.filter(
                                  (v) => v._id !== item._id,
                                );

                                field.onChange(newValue);
                              }}
                            >
                              <AntDesign
                                name="closecircle"
                                size={22}
                                color={Colors.light.PrimaryColor}
                                style={{ marginLeft: 10 }}
                              />
                            </Pressable>
                          ) : (
                            <></>
                          )
                        }
                      />
                      <View>
                        <Text
                          style={{
                            fontWeight: "500",
                            marginBottom: 10,
                            color: Colors.light.PrimaryColor,
                          }}
                        >
                          {`${t("chatPoll.options")}`}
                        </Text>
                        {item.options.map((option, oIndex) => {
                          return (
                            <View
                              key={option._id}
                              style={{
                                paddingBottom: 10,
                                marginLeft: 15,
                              }}
                            >
                              <TextField
                                placeholder={`${t("chatPoll.enter-option")}`}
                                onChangeText={(text) => {
                                  let newValue = field.value.map(
                                    (question, i) => {
                                      if (question._id == item._id) {
                                        const newOption = question.options.map(
                                          (op) => {
                                            if (op._id == option._id) {
                                              return {
                                                ...op,
                                                name: text.trim(),
                                              };
                                            } else {
                                              return op;
                                            }
                                          },
                                        );

                                        return {
                                          ...question,
                                          options: newOption,
                                        };
                                      } else {
                                        return question;
                                      }
                                    },
                                  );
                                  field.onChange(newValue);
                                }}
                                maxLength={100}
                                style={{
                                  height: 45,
                                  borderBottomColor: "gray",
                                  borderBottomWidth: 1,
                                  width: windowWidth - 100,
                                }}
                                trailingAccessory={
                                  oIndex > 1 ? (
                                    <Pressable
                                      onPress={() => {
                                        let newValue = field.value.map(
                                          (v, i) => {
                                            if (v._id == item._id) {
                                              let options = v.options.filter(
                                                (op) => op._id != option._id,
                                              );
                                              return { ...v, options };
                                            } else {
                                              return v;
                                            }
                                          },
                                        );
                                        field.onChange(newValue);
                                      }}
                                    >
                                      <AntDesign
                                        name="closecircle"
                                        size={22}
                                        color={Colors.light.PrimaryColor}
                                        style={{ marginLeft: 10 }}
                                      />
                                    </Pressable>
                                  ) : (
                                    <></>
                                  )
                                }
                              />
                            </View>
                          );
                        })}

                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            marginTop: 10,
                            alignItems: "center",
                          }}
                        >
                          <Checkbox
                            label={`${t("chatPoll.allow-multiple-answer")}`}
                            value={item.isMultiAnswerAllow}
                            color={Colors.light.PrimaryColor}
                            onValueChange={(value) => {
                              let newValue = field.value.map((v, i) => {
                                if (v._id == item._id) {
                                  return { ...v, isMultiAnswerAllow: value };
                                } else {
                                  return v;
                                }
                              });
                              field.onChange(newValue);
                            }}
                          />
                          {item.options.length < 5 && (
                            <Pressable
                              onPress={() => {
                                let newValue = field.value.map((v, i) => {
                                  if (v._id == item._id) {
                                    v.options.push({
                                      _id: uuidv4(),
                                      name: "",
                                      value: [],
                                    });
                                    return v;
                                  } else {
                                    return v;
                                  }
                                });
                                field.onChange(newValue);
                              }}
                              style={{ alignSelf: "flex-end" }}
                            >
                              <Text
                                style={{ color: Colors.light.PrimaryColor }}
                              >{`${t("chatPoll.add-option")}`}</Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          }}
        />
      </KeyboardAwareScrollView>
      <View
        style={{
          marginHorizontal: 20,
          marginBottom: 20,
          paddingTop: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {watch("questions") && watch("questions").length != 5 ? (
          <Pressable onPress={handleNewQuestion} style={{}}>
            <Text style={{ color: Colors.light.PrimaryColor }}>{`${t(
              "chatPoll.add-question",
            )}`}</Text>
          </Pressable>
        ) : (
          <View></View>
        )}
        <Pressable
          disabled={sentChatResponse.loading}
          onPress={handleSubmit(handlePollForm)}
          style={{
            backgroundColor: Colors.light.PrimaryColor,
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {sentChatResponse.loading ? (
            <ActivityIndicator />
          ) : (
            <Ionicons name={"send"} size={22} color="white" />
          )}
        </Pressable>
      </View>
    </View>
  );

  function handlePollForm(data: formType) {
    let error = false;
    data.questions.forEach((question) => {
      if (question.title.length == 0) {
        error = true;
      }
      question.options.forEach((option) => {
        if (option.name.length == 0) {
          error = true;
        }
      });
    });

    if (error) {
      ToastMessage(`${t("chatPoll.not-empty")}`);
    } else {
      const payload = {
        data: {
          roomId: display?.roomId,
          type: "poll",
          fileURL: "",
          isForwarded: false,
          message: JSON.stringify(data.questions),
          fontStyle: "",
          thumbnail: "",
          duration: 0,
        },
        reply_msg: null,
      };
      console.log("send poll chat payload---->", payload);
      socketManager.conversation.sendChat(payload);
      navigation.goBack();
      // sendChat({
      //   variables: {
      //     input: payload,
      //   },
      // })
      //   .then((res) => {
      //     if (res?.data?.sendChat) {
      //       whoosh.play((success) => {
      //         if (success) {
      //           console.log("successfully finished playing");
      //         } else {
      //           console.log("playback failed due to audio decoding errors");
      //         }
      //       });
      //       navigation.goBack();
      //     }
      //   })
      //   .catch((err) => {
      //     console.error("Error in sending chat", err);
      //   });
    }
  }

  function handleNewQuestion() {
    Vibration.vibrate();
    let value = getValues("questions");

    setValue("questions", [
      ...value,
      {
        _id: uuidv4(),
        title: "",
        isMultiAnswerAllow: false,
        options: [
          { _id: uuidv4(), name: "", value: [] },
          { _id: uuidv4(), name: "", value: [] },
        ],
      },
    ]);
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
  },
});
