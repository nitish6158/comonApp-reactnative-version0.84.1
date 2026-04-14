import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import React, { Component, useEffect, useRef, useState } from "react";

import AudioPlayerModal from "@Components/AudioPlayerFromModal/src/AudioPlayerModal";
import Colors from "@/Constants/Colors";
import HeaderWithAction from "@Components/header/HeaderWithAction";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import ToastMessage from "@Util/ToastMesage";
import { callAtom } from "@Atoms/callAtom";
import { useAtom } from "jotai";
import { windowWidth } from "@Util/ResponsiveView";
import { useTranslation } from "react-i18next";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function AudioModal({
  setAudioVisible,
  audioVisible,
  url,
  fileName,
}) {
  const [callRequest] = useAtom(callAtom);
  const { t } = useTranslation();

  useEffect(() => {
    if (callRequest != null) {
      if (audioVisible) {
        audioPlayer.stopPlayer();
        ToastMessage(t("label.can-not-play-audio"));
        setAudioVisible(false);
      }
    }
  }, [callRequest, audioVisible]);

  return (
    <Modal transparent={false} visible={audioVisible}>
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0.3,0.4,0.4,0.10)",
        }}
      >
        <View style={{ width: "100%" }}>
          <HeaderWithAction
            screenName=""
            onBackPress={() => {
              setAudioVisible(false);
              audioPlayer.stopPlayer();
            }}
            isActionVisible={false}
            ActionComponent={null}
          />
        </View>
        {fileName && (
          <View
            style={{ flex: 3, justifyContent: "center", alignItems: "center" }}
          >
            <MaterialIcons
              name="multitrack-audio"
              size={80}
              color={Colors.light.PrimaryColor}
            />
            <Text style={{ marginTop: 20 }}>{fileName}</Text>
          </View>
        )}
        <View style={{ flex: 1 }}>
          <View style={styles.centeredView}>
            <AudioPlayerModal audio={url} />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// define your styles
const styles = StyleSheet.create({
  centeredView: {
    alignItems: "center",
    backgroundColor: Colors.light.LightBlue,
    borderRadius: 20,

    height: 100,
    justifyContent: "center",
    marginTop: 22,
    width: windowWidth / 1.1,
  },
  // eslint-disable-next-line react-native/no-unused-styles
  container: { backgroundColor: "green", flex: 1 },
});

//make this component available to the app
