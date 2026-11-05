import { Block, Center, HStack, Typography } from "rnmuilib";
import { DefaultImageUrl, GroupUrl, ImageUrl } from "@Service/provider/endpoints";
import { Alert, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { RtcSurfaceView, RtcTextureView, VideoViewSetupMode } from "react-native-agora";

import AntDesign from "react-native-vector-icons/AntDesign";
import CallBackground from "./CallBackground";
import Colors from "@/Constants/Colors";
import Icon from "@Images/Icon";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ShowCallTimeUI } from "./CallTimer";
import SwitchToVideoPromt from "./SwitchToVideoPromt";
import VideoDisableBlock from "./VideoDisableBlock";
import { callAtomType } from "@Atoms/callAtom";
import { useTranslation } from "react-i18next";
import FastImage from "@d11/react-native-fast-image";

type fullModeProps = {
  callRequest: callAtomType;
  SwitchToMiniMode: () => void;
  muteAudio: boolean;
  toggleMute: () => Promise<void>;
  toggleSpeaker: () => Promise<void>;
  speakerEnabled: boolean;
  peerIds: number[];
  currentCallType: string;
  toggleCamera: () => Promise<void>;
  joined: boolean;
  toggleVideoOnOff: () => Promise<void>;
  videoCameraOn: boolean;
  disabledRemoteVideo: number[];
  switchToVideoCall: () => Promise<void>;
  videoCallRejected: () => Promise<void>;
  closeCall: () => void;
  duration: string;
  showCallParticipants: () => void;
  callStatusText: string;
  addParticipants: () => {};
  isBluetoothEnabled: boolean;
  callState: string;
};

export default function SeniorCallMode({
  closeCall,
  SwitchToMiniMode,
  muteAudio,
  toggleMute,
  toggleSpeaker,
  speakerEnabled,
  peerIds,
  currentCallType,
  toggleCamera,
  joined,
  toggleVideoOnOff,
  videoCameraOn,
  disabledRemoteVideo,
  switchToVideoCall,
  videoCallRejected,
  duration,
  callRequest,
  showCallParticipants,
  callStatusText,
  addParticipants,
  isBluetoothEnabled,
  callState,
}: fullModeProps) {
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  const backgroundHandler = useMemo(() => {
    if (callRequest?.callBackground === ImageUrl || callRequest?.callBackground === GroupUrl) {
      return "";
    } else {
      return callRequest?.callBackground;
    }
  }, [callRequest?.callBackground]);
  console.log("Peer id", peerIds);
 

  function onCancelCallPressed() {
    Alert.alert(t("seniorCall.cancel-call"), "", [
      { text:t("seniorCall.yes"), onPress: closeCall },
      { text: t("seniorCall.no"), onPress: () => {} },
    ]);
  }

  const color = backgroundHandler?.length == 0 ? "black" : "white";

  return (
    <CallBackground
      bgImage={{ fileName: null, opacity: 0 }}
      callType={callRequest && callRequest?.callType}
      currentUserUid={0}
      participantsUid={peerIds}
      disabledRemoteVideo={disabledRemoteVideo}
    >
      {backgroundHandler && backgroundHandler?.length > 0 && (
        <View
          style={{
            zIndex: 1,
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            
          }}
        />
      )}
      <View style={{ flex: 1, zIndex: 11,backgroundColor: callRequest?.callType == 'audio'? "#2F3645":"transparent" }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingHorizontal: 15,
            alignItems: "center",
            marginTop: 20,
            marginBottom: 15,
          }}
        >
          <Pressable onPress={SwitchToMiniMode} style={{ flexDirection: "row", alignItems: "center" }}>
            <Icons name="chevron-left" style={{ color: Colors.light.White }} size={26} />
            <Text style={{ color: 'white', fontSize: 16 }}>{t("navigation.back")}</Text>
          </Pressable>
        </View>
        <View style={{ alignItems: "center" }}>
          <FastImage
            source={{ uri: `${DefaultImageUrl}${callRequest?.callBackground}` }}
            style={{ borderRadius: 80, height: 80, width: 80 }}
          />
          <HStack alignItems="center" justifyContent="center" marginTop={15}>
            <Typography
              width={300}
              numberOfLines={2}
              fontSize={20}
              textAlign="center"
              color={Colors.light.White}
            >
              {`${t("seniorCall.talking-to")} ${callRequest?.roomName}`}
            </Typography>
          </HStack>
          {callRequest?.callType == "video" && (
            <HStack alignItems="center" justifyContent="center" marginTop={15}>
              <Typography
                width={300}
                numberOfLines={2}
                fontSize={16}
                textAlign="center"
                color={Colors.light.White}
              >
                {`${t("seniorCall.video-mode")}`}
              </Typography>
            </HStack>
          )}
        </View>

        <Block height={12} />
        {callRequest?.callId != undefined ? (
          <>
            <View style={{ flexGrow: Platform.OS === "ios" ? 0.8 : 0.9 }}>
              {!joined ? (
                <Typography
                  fontSize={16}
                  textAlign="center"
                  color={Colors.light.White}
                >
                  {t(`${callStatusText}`)}
                </Typography>
              ) : (
                <ShowCallTimeUI color={Colors.light.White} />
              )}
              <Block height={42} />

              <Block height={64} />
              {currentCallType === "video" && (
                <Fragment>
                  {joined && currentCallType === "video" && (
                    <Block
                      overflow="hidden"
                      position="absolute"
                      height={140}
                      width={100}
                      zIndex={9999}
                      bottom={90}
                      right={30}
                    >
                      {!videoCameraOn ? (
                        <VideoDisableBlock height={140} width={100} borderRadius={24} />
                      ) : Platform.OS === "android" ? (
                        <RtcTextureView
                          canvas={{ uid: 0, setupMode: VideoViewSetupMode.VideoViewSetupAdd }}
                          style={{ height: 140, width: 100 }}
                        />
                      ) : (
                        <RtcSurfaceView
                          canvas={{ uid: 0, setupMode: VideoViewSetupMode.VideoViewSetupAdd }}
                          style={{ height: 140, width: 100 }}
                        />
                      )}
                    </Block>
                  )}
                </Fragment>
              )}
            </View>
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              {currentCallType === "audio" && (
                <Pressable style={styles.button} onPress={toggleSpeaker} disabled={isBluetoothEnabled}>
                  {isBluetoothEnabled ? (
                    <Text style={{ fontSize: 18, color: "white" }}>{`${t("seniorCall.bluetooth-on")}`}</Text>
                  ) : speakerEnabled ? (
                    <Text style={{ fontSize: 18, color: "white" }}>{`${t("seniorCall.off-speaker")}`}</Text>
                  ) : (
                    <Text style={{ fontSize: 18, color: "white" }}>{`${t("seniorCall.on-speaker")}`}</Text>
                  )}
                </Pressable>
              )}
              {currentCallType === "video" && (
                <Fragment>
                  <View style={{ alignItems: "center", marginTop: 5 }}>
                    <Pressable style={styles.button} onPress={toggleCamera}>
                      <Text style={{ fontSize: 18, color: "white" }}>{t("seniorCall.change-camera")}</Text>
                    </Pressable>
                  </View>

                  <View style={{ alignItems: "center", marginTop: 5 }}>
                    <Pressable style={styles.button} onPress={toggleVideoOnOff}>
                      <Text style={{ fontSize: 18, color: "white" }}>
                        {videoCameraOn ? t("seniorCall.off-camera") : t("seniorCall.on-camera")}
                      </Text>
                    </Pressable>
                  </View>
                </Fragment>
              )}

              <View style={{ alignItems: "center", marginTop: 5 }}>
                <Pressable style={styles.button} onPress={toggleMute} disabled={!joined}>
                  <Text style={{ fontSize: 18, color: "white" }}>{muteAudio ? t("seniorCall.unmute") : t("seniorCall.mute")}</Text>
                </Pressable>
              </View>
              <View style={{ alignItems: "center", marginTop: 5 }}>
                <Pressable
                  style={styles.button}
                  onPress={onCancelCallPressed}
                >
                  <Text style={{ fontSize: 18, color: "white" }}>{t("seniorCall.cancel")}</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <View style={{ width: width, justifyContent: "center" }}>
            <Text style={{ color: color, textAlign: "center" }} onPress={() => {}}>
              {t("connecting")}...
            </Text>
          </View>
        )}

        <SwitchToVideoPromt switchToVideoCall={switchToVideoCall} videoCallRejected={videoCallRejected} />
      </View>
    </CallBackground>
  );
}

const styles = StyleSheet.create({
  rowDirection: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderColor: "white",
    borderWidth: 1,
    width: 320,
    height: 45,
  },
});
