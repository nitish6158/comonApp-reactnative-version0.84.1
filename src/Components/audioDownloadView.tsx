/* eslint-disable react-native/no-inline-styles */

import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import React, { useEffect, useState } from "react";

import Colors from "@/Constants/Colors";
import Feather from "react-native-vector-icons/Feather";
import { Pressable } from "react-native";
import Text from "./Text";
import ToastMessage from "@Util/ToastMesage";
import useFileSystem from "@Hooks/useFileSystem";
import { useAtomValue } from "jotai";
import { singleRoom } from "@/Atoms";
import { useTranslation } from "react-i18next";

// create a component
const AudioDownloadView = ({ item, TextColor }: any) => {
  const display = useAtomValue(singleRoom);
  const isSaveToCameraRollActive = display?.isCurrentRoomSavetoCameraRollActive ?? false;
  const { donwloadFiles } = useFileSystem();
  const {t} = useTranslation()

  const [loading, setloading] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android" && isSaveToCameraRollActive) {
      downloadAudio();
    }
  }, [isSaveToCameraRollActive]);

  const downloadAudio = async () => {
    try {
      setloading(true);
      await donwloadFiles([item.fileURL]);
      setTimeout(() => {
        setloading(false);
      }, 10000);
    } catch (error) {
      setloading(false);
      ToastMessage(t("label.error-in-downloading"));
    }
  };

  return (
    <Pressable style={styles.container} onPress={downloadAudio}>
      <View style={styles.indicatorContainer}>
        {!loading ? <Feather name="download" size={25} color={TextColor} /> : <ActivityIndicator color={TextColor} />}
      </View>
      <View style={styles.contentContainer}>
        <Text style={{ color: TextColor, fontSize: 14, fontWeight: "700" }}>Audio File</Text>
        <Text style={{ color: "rgba(51,51,51,.8)", fontSize: 12 }}>{item?.fileURL?.slice(-15)}</Text>
      </View>
    </Pressable>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: Colors.light.LightBlue,
    borderColor: "rgba(51,51,51,.5)",
    borderRadius: 10,
    borderWidth: 0.3,
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: "90%",
  },
  contentContainer: {
    marginLeft: 10,
  },
  indicatorContainer: {
    marginTop: 2,
  },
});

//make this component available to the app
export default AudioDownloadView;
