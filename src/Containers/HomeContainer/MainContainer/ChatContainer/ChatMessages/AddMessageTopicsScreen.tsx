import { singleRoom } from "@/Atoms";
import { Colors } from "@/Constants";
import { useUpdateTopicMutation } from "@/graphql/generated/room.generated";
import { AddMessageTopicsScreenProps } from "@/navigation/screenPropsTypes";
import { navigateBack } from "@/navigation/utility";
import ToastMessage from "@Util/ToastMesage";
import { useAtomValue } from "jotai";
import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { TextField, Button } from "react-native-ui-lib";
import _ from "lodash";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next";

export default function AddMessageTopicsScreen({ route, navigation }: AddMessageTopicsScreenProps) {
  const display = useAtomValue(singleRoom);
  const [headingText, setHeadingText] = useState<string>(route.params?.text ?? "");
  const [updateTopicRequest, updateTopicResponse] = useUpdateTopicMutation();
  const { t } = useTranslation();
  return (
    <View style={styles.main}>
      <Pressable style={styles.headerContainer} onPress={navigation.goBack}>
        <AntDesign name="arrowleft" size={25} color="black" />
        <Text style={styles.headingText}>{t("titles.make-headings")}</Text>
      </Pressable>
      <View style={styles.container}>
        <TextField
          style={styles.textInput}
          placeholder="Enter message heading"
          onChangeText={setHeadingText}
          defaultValue={headingText}
          showCharCounter
          maxLength={200}
          autoFocus={true}
          // multiline={true}
        />
        <View style={styles.actionContainer}>
          <Button
            disabled={updateTopicResponse.loading}
            onPress={navigateBack}
            style={styles.action_cancel}
            label={`${t("btn.cancel")}`}
            size={Button.sizes.medium}
          />
          {updateTopicResponse.loading ? (
            <View style={styles.action_save}>
              <ActivityIndicator />
            </View>
          ) : (
            <Button
              onPress={updateTopic}
              style={styles.action_save}
              label={`${t("btn.save")}`}
              size={Button.sizes.medium}
              disabled={updateTopicResponse.loading}
              backgroundColor={Colors.light.PrimaryColor}
            />
          )}
        </View>
      </View>
    </View>
  );

  function updateTopic() {
    if (headingText.length > 0) {
      //Remove Old Heading
      const updated = display.currentUserUtility?.topic.filter((item) => item !== route.params.text);

      updated.push(headingText.trim());

      const uniqueTopic = _.uniq(updated);

      updateTopicRequest({
        variables: {
          input: {
            roomId: display.roomId,
            topic: uniqueTopic,
          },
        },
      }).then((res) => {
        if (res.data?.updateTopic) {
          setHeadingText("");
          navigation.replace("ShowMessageTopicsScreen", {});
          ToastMessage(`${t("Message")} Topic ${route.params?.mode == "add" ? "Added" : "Updated"} successfully.`);
        }
      });
    } else {
      ToastMessage(t("label.your-topic-is-empty"));
    }
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    // paddingHorizontal: 20,
    // marginBottom: 20,
  },
  headingText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "gray",
    paddingHorizontal: 20,
    height: 45,
    borderRadius: 10,
    marginBottom: 2,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  action_cancel: {
    height: 45,
    width: 150,
    backgroundColor: "rgba(51,51,51,.3)",
  },
  action_save: {
    height: 45,
    width: 150,
  },
});
