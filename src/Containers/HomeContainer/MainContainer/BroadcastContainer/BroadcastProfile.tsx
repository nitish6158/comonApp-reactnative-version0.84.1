import CommonHeader from "@Components/header/CommonHeader";
import { Colors, fonts } from "@/Constants";
import React, { useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import AnimatedTextInput from "@Components/AnimatedTextInput";
import GroupImage from "../ChatContainer/GroupsChats/GroupImage";
import { useTranslation } from "react-i18next";
import ImageSelectionView from "../ChatContainer/GroupsChats/ImageSelectionView";
import { Text } from "react-native";
import { navigate } from "@/navigation/utility";
import ToastMessage from "@Util/ToastMesage";

export default function BroadcastProfile() {
  const [broadcastImage, setBroadcastImage] = useState("");
  const [broadcastName, setBroadcastName] = useState("");

  const { t } = useTranslation();

  function handlePressContinue() {
    Keyboard.dismiss();

    if (!broadcastName) {
      ToastMessage(t("broadcastSelectName"));
      return;
    }
    navigate("BroadcastParticipant", {
      name: broadcastName,
      image: broadcastImage,
    });
  }

  return (
    <>
      <CommonHeader title={t("createBroadcastGroup")} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.contentContainer}>
            <GroupImage groupImage={broadcastImage} OldImage={""} isBroadcast={true} />
            <AnimatedTextInput
              text={t("create-user-group.Name")}
              value={broadcastName}
              onChangeText={(e: string) => {
                setBroadcastName(e);
              }}
            />
            <ImageSelectionView setGroupIcon={setBroadcastImage} GroupImage={broadcastImage} />
            <TouchableOpacity activeOpacity={1} style={styles.buttonContainer} onPress={handlePressContinue}>
              <Text style={styles.buttonTextStyle}>{t("btn.Continue")}</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.White,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 24,
  },
  buttonContainer: {
    alignSelf: "center",
    width: Dimensions.get("screen").width / 2,
    borderRadius: 13,
    borderColor: "gray",
    borderWidth: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 24,
  },
  buttonTextStyle: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
    fontSize: 15,
    lineHeight: 17,
    color: Colors.light.black,
  },
});
