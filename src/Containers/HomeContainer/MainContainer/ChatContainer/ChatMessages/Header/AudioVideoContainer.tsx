import { Alert, Keyboard, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAtom, useAtomValue } from "jotai";

import Call from "@Images/Call.svg";
import Colors from "@/Constants/Colors";
import { InternetAtom } from "@Atoms/InternetAtom";
import React, { useMemo } from "react";
import ToastMessage from "@Util/ToastMesage";
import VideoCallChat from "@Images/VideoCallChat.svg";
import { callAtom } from "@Atoms/callAtom";
import { checkCallPermissions } from "@Util/permission";
import { singleRoom } from "@Atoms/singleRoom";
import { useTranslation } from "react-i18next";

export default function AudioVideoContainer() {
  const display = useAtomValue(singleRoom);
  const [callRequest, setCallRequest] = useAtom(callAtom);
  const [internet] = useAtom(InternetAtom);
  const { t } = useTranslation();

  const isMySelf = display.roomType == "self"

  const hideAudioAndVideo = useMemo(() => {
    if (display.roomType == "individual") {
      if (display.isCurrentRoomBlocked && !isMySelf) {
        return true;
      } else {
        return false;
      }
    } else if (display.roomType == "self") {
      return true;
    } else if (display.roomType == "group") {
      if (display.participantsNotLeft.length == 1) {
        return true;
      } else {
        return false;
      }
    }
  }, [display.roomType, display.isCurrentRoomBlocked, display.participantsNotLeft]);

  if (hideAudioAndVideo) {
    return <></>;
  } else {
    return (
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.buttonContainer}
          onPress={async () => {
            Keyboard.dismiss();
            const res = await checkCallPermissions("video");
            if (res === true) {
              if (internet) {
                if (callRequest == null) {
                  setCallRequest({
                    callType: "video",
                    roomType: display.roomType,
                    roomId: display.roomId,
                    callBackground: display.roomImage,
                    roomName: display.roomName,
                    participants: [],
                    isReceiver: false,
                  });
                } else {
                  ToastMessage(`${t("toastmessage.incall-already-message")}`);
                }
              } else {
                Alert.alert(
                  "",
                  t("others.Couldn't place call. Make sure your device have an internet connection and try again")
                );
              }
            }
          }}
          disabled={isMySelf}
        >
          <VideoCallChat />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.buttonContainer}
          onPress={async () => {
            Keyboard.dismiss();
            const res = await checkCallPermissions("audio");
            // console.log(res)
            if (res === true) {
              if (internet) {
                // console.log(callRequest)
                if (callRequest == null) {
                  setCallRequest({
                    callType: "audio",
                    roomType: display.roomType,
                    roomId: display.roomId,
                    callBackground: display.roomImage,
                    roomName: display.roomName,
                    participants: [],
                    isReceiver: false,
                  });
                } else {
                  ToastMessage(`${t("toastmessage.incall-already-message")}`);
                }
              } else {
                Alert.alert(
                  "",
                  t("others.Couldn't place call. Make sure your device have an internet connection and try again")
                );
              }
            }
          }}
          disabled={isMySelf}
        >
          <Call style={{ marginHorizontal: 15 }} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  Backarrow: { transform: [{ rotate: "180deg" }] },
  OnlineStyle: {
    backgroundColor: Colors.light.onlineGreen,
    borderColor: Colors.light.background,
    borderRadius: 50,
    borderWidth: 2.4,
    height: 14,
    left: 58,
    position: "absolute",
    top: 20,
    width: 14,
  },
  buttonContainer: {
    alignItems: "center",
    height: 35,
    justifyContent: "center",
    marginHorizontal: 3,
    width: 35,
    // backgroundColor: "red",
  },
  chatsearchheader: {
    alignItems: "center",
    backgroundColor: Colors.light.LightBlue,
    elevation: 1,
    flexDirection: "row",
    height: 60,
    shadowColor: Colors.light.formItemBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  container: {
    flexDirection: "row",
    // justifyContent: "",
  },
  downArrow: { marginLeft: 20, marginRight: 10, transform: [{ rotate: "90deg" }] },
  secondryContainer: { flex: 5, flexDirection: "row" },
  upArrow: { transform: [{ rotate: "-90deg" }] },
});
