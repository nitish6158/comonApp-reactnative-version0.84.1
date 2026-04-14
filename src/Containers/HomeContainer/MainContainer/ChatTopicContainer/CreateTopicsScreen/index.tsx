import { View, Text, Pressable, ActivityIndicator, StyleSheet, TextInput } from "react-native";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAddMsgToTopicMutation, useCreateTopicMutation } from "@/graphql/generated/topics.generated";
import { CreateTopicsScreenProps } from "@/navigation/screenPropsTypes";
import ToastMessage from "@Util/ToastMesage";
import { TextField } from "react-native-ui-lib";
import { Button } from "@/Components/Button/Button";
import {HeaderWithScreenName} from "@Components/header/HeaderWithScreenName"
import { Colors, fonts } from "@/Constants";
import { useUpdateTopicMutation } from "@/graphql/generated/room.generated";
import { windowWidth } from "@Util/ResponsiveView";
import { useTranslation } from "react-i18next";

type formType = {
  name: string;
};

export default function CreateTopicsScreen({ route, navigation }: CreateTopicsScreenProps) {
  const [createRequest, createResponse] = useCreateTopicMutation();
  const [updateRequest, updateResponse] = useUpdateTopicMutation();
  const [addMessageRequest, addMessageResponse] = useAddMsgToTopicMutation();
  const { t } = useTranslation();

  const { parentId, name, mode, text = null, chatId, roomId } = route?.params || {};

  const { control, getValues, setValue, handleSubmit } = useForm<formType>();

  useEffect(() => {
    if (mode == "UPDATE" || mode == "MAKE_TOPIC")
      setValue("name", mode == "MAKE_TOPIC" ? text?.substring(0, 50) : name);
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <HeaderWithScreenName title={t("topics.makeTopic")} />
      <Controller
        defaultValue=""
        control={control}
        name="name"
        rules={{
          required: t("topics.topicRequired"),
        }}
        render={({ field: { value, onChange }, fieldState: { error }, formState }) => {
          return (
            <>
              <TextField
                editable={!createResponse.loading || !updateResponse.loading}
                value={value}
                placeholder={`${t("topics.enterTopic")}`}
                onChangeText={onChange}
                maxLength={50}
                style={styles.textInput}
                containerStyle={styles.containerStyle}
              />
              <View style={styles.bottomBox}>
                <Text style={styles.error}>{error?.message ?? ""}</Text>
                <Text style={styles.count}>{value?.length}/50</Text>
              </View>
            </>
          );
        }}
      />

      {mode == "MAKE_TOPIC" ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 15,
            position: "absolute",
            bottom: 0,
            paddingVertical: 15,
            width: windowWidth,
          }}
        >
          <View style={{ width: (windowWidth - 45) / 2 }}>
            <Button
              title={t("btn.cancel")}
              variant="gray"
              containerStyle={{ borderRadius: 7, backgroundColor: "red" }}
              loader={false}
              disabled={createResponse.loading || updateResponse.loading || addMessageResponse.loading}
              onPress={() => navigation.goBack()}
            />
          </View>
          <View style={{ width: (windowWidth - 45) / 2 }}>
            <Button
              title={t("btn.save")}
              containerStyle={{ borderRadius: 7 }}
              loader={createResponse.loading || updateResponse.loading || addMessageResponse.loading}
              disabled={createResponse.loading || updateResponse.loading || addMessageResponse.loading}
              onPress={handleSubmit(formSubmit, console.log)}
            />
          </View>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <Button
            title={t("btn.save")}
            containerStyle={{ borderRadius: 7 }}
            loader={createResponse.loading || updateResponse.loading || addMessageResponse.loading}
            disabled={createResponse.loading || updateResponse.loading || addMessageResponse.loading}
            onPress={mode == "UPDATE" ? handleSubmit(formEdit, console.log) : handleSubmit(formSubmit, console.log)}
          />
        </View>
      )}
    </View>
  );

  function formEdit(data: formType) {
    updateRequest({
      variables: {
        input: {
          _id: parentId,
          name: data.name,
        },
      },
    }).then((res) => {
      if (res.data?.updateTopic) {
        ToastMessage(t("topics.topicCreated"));
        navigation.goBack();
      }
    });
  }

  function formSubmit(data: formType) {
    createRequest({
      variables: {
        input: {
          name: data.name,
          parent: parentId,
        },
      },
    }).then((res) => {
      if (res.data?.createTopic) {
        if (mode == "MAKE_TOPIC") {
          addMessage(res?.data?.createTopic?._id);
        } else {
          ToastMessage(t("topics.topicCreated"));
          navigation.goBack();
        }
      }
    });
  }

  function addMessage(topicId: string) {
    addMessageRequest({
      variables: {
        input: {
          chatId: chatId,
          roomId: roomId,
          topicId: topicId,
        },
      },
    }).then((res) => {
      if (res.data?.addMsgToTopic.success) {
        ToastMessage(res.data.addMsgToTopic.message);
        navigation.replace("ViewTopicsScreen", {
          chatData: null,
        });
      } else {
        ToastMessage(res?.data?.addMsgToTopic?.message);
      }
    });
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 15,
    paddingBottom: 15,
    elevation: 1,
    shadowColor: Colors.light.PrimaryColor,
  },
  containerStyle: {
    // borderWidth: 1,
    paddingHorizontal: 15,
    paddingBottom: 0,
    paddingTop: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "gray",
    paddingHorizontal: 20,
    height: 45,
    borderRadius: 10,
  },
  error: {
    color: Colors.light.error,
    fontSize: 14,
    fontFamily: fonts.Lato,
  },
  count: {
    color: Colors.light.tintText,
    fontSize: 14,
    fontFamily: fonts.Lato,
  },
  bottomBox: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: 2 },
});
