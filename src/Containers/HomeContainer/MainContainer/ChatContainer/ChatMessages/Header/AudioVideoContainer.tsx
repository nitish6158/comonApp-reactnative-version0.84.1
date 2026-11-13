import { Alert, Keyboard, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAtom, useAtomValue } from "jotai";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import Call from "@Images/Call.svg";
import VideoCallChat from "@Images/VideoCallChat.svg";
import ToastMessage from "@Util/ToastMesage";
import { callAtom } from "@Atoms/callAtom";
import { InternetAtom } from "@Atoms/InternetAtom";
import { singleRoom } from "@Atoms/singleRoom";
import { checkCallPermissions } from "@Util/permission";

export default function AudioVideoContainer() {
  const display = useAtomValue(singleRoom);
  const [callRequest, setCallRequest] = useAtom(callAtom);
  const [internet] = useAtom(InternetAtom);
  const { t } = useTranslation();

  const isMySelf = display.roomType === "self";

  const hideAudioAndVideo = useMemo(() => {
    if (display.roomType === "individual") {
      return Boolean(display.isCurrentRoomBlocked && !isMySelf);
    }
    if (display.roomType === "self") {
      return true;
    }
    if (display.roomType === "group") {
      return display.participantsNotLeft.length === 1;
    }
    return false;
  }, [display.roomType, display.isCurrentRoomBlocked, display.participantsNotLeft, isMySelf]);

  const startCall = async (callType: "audio" | "video") => {
    Keyboard.dismiss();
    const res = await checkCallPermissions(callType);
    if (res !== true) {
      return;
    }
    if (!internet) {
      Alert.alert(
        "",
        t("others.Couldn't place call. Make sure your device have an internet connection and try again")
      );
      return;
    }
    if (callRequest != null) {
      ToastMessage(`${t("toastmessage.incall-already-message")}`);
      return;
    }
    setCallRequest({
      callType,
      roomType: display.roomType,
      roomId: display.roomId,
      callBackground: display.roomImage,
      roomName: display.roomName,
      participants: [],
      isReceiver: false,
    });
  };

  if (hideAudioAndVideo) {
    return null;
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.buttonContainer}
        onPress={() => {
          void startCall("video");
        }}
        disabled={isMySelf}
      >
        <VideoCallChat />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.buttonContainer}
        onPress={() => {
          void startCall("audio");
        }}
        disabled={isMySelf}
      >
        <Call style={styles.callIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContainer: {
    alignItems: "center",
    height: 35,
    justifyContent: "center",
    marginHorizontal: 3,
    width: 35,
  },
  callIcon: {
    marginHorizontal: 15,
  },
});
