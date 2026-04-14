import { Block, Center, HStack, Typography } from "rnmuilib";
import { GroupUrl, ImageUrl } from "@Service/provider/endpoints";
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
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
import { useAppSelector } from "@/redux/Store";

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

export default function FullCallMode({
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
  const { MyProfile } = useAppSelector((state) => state.Chat);

  const backgroundHandler = useMemo(() => {
    if (callRequest?.callBackground === ImageUrl || callRequest?.callBackground === GroupUrl) {
      return "";
    } else {
      return callRequest?.callBackground;
    }
  }, [callRequest?.callBackground]);

 

  const color = backgroundHandler?.length == 0 ? "black" : "white";

  return (
    <CallBackground
      bgImage={{ fileName: backgroundHandler, opacity: 0 }}
      callType={callRequest && callRequest.callType}
      currentUserUid={0}
      participantsUid={peerIds}
      disabledRemoteVideo={disabledRemoteVideo}
      mode={MyProfile?.mode}
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
            backgroundColor: `rgba(0, 0, 0, ${0.5})`,
          }}
        />
      )}
      <View style={{ flex: 1, zIndex: 11 }}>
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
            <Icons name="chevron-left" style={{ color: color }} size={26} />
            <Text style={{ color: color, fontSize: 16 }}>{t("navigation.back")}</Text>
          </Pressable>
          {/* {callState && (
            <View style={{ backgroundColor: "rgb(180,231,255)", padding: 5 }}>
              <Text style={{ color: Colors.light.black, fontSize: 14, fontWeight: "700" }}>{callState}</Text>
            </View>
          )} */}
          {/* {callRequest?.roomType == "contact_group" && callRequest?.callId && ( */}
          {peerIds.length && callRequest?.roomType != "group" ? (
            <Pressable onPress={addParticipants}>
              <AntDesign name="adduser" size={28} color={color} />
            </Pressable>
          ) : (
            <></>
          )}
          {/* )} */}
        </View>
        <HStack marginHorizontal={width / 4.5} alignItems="center" justifyContent="center">
          <Typography
            numberOfLines={1}
            fontSize={18}
            textAlign="center"
            color={backgroundHandler?.length ? Colors.light.White : Colors.light.black}
          >
            {callRequest?.roomName}
          </Typography>
          {peerIds.length > 0 && (
            <Pressable onPress={showCallParticipants} style={{ marginLeft: 10 }}>
              <Ionicons name="information-circle-outline" size={24} color={color} />
            </Pressable>
          )}
        </HStack>

        <Block height={12} />
        {callRequest?.callId != undefined ? (
          <>
            <View style={{ flexGrow: Platform.OS === "ios" ? 0.8 : 0.8 }}>
              {!joined ? (
                <Typography
                  fontSize={16}
                  textAlign="center"
                  color={backgroundHandler?.length > 0 ? Colors.light.White : Colors.light.black}
                >
                  {t(`${callStatusText}`)}
                </Typography>
              ) : (
                <ShowCallTimeUI color={backgroundHandler?.length > 0 ? Colors.light.White : Colors.light.black} />
              )}
              <Block height={42} />
              {currentCallType === "audio" && (
                <Center>
                  {backgroundHandler?.length == 0 && (
                    <Block height={120} width={120} borderRadius={120}>
                      <Icon.UserAvatar />
                    </Block>
                  )}
                </Center>
              )}

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
            <View style={[styles.rowDirection, { justifyContent: "space-evenly" }]}>
              {currentCallType === "audio" && (
                <Pressable style={{ borderRadius: 32 }} onPress={toggleSpeaker} disabled={isBluetoothEnabled}>
                  <Block height={64} width={64} borderRadius={32}>
                    {isBluetoothEnabled ? (
                      <View
                        style={{
                          height: 60,
                          width: 60,
                          borderRadius: 50,
                          backgroundColor: Colors.light.PrimaryColor,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Ionicons name="bluetooth" size={50} color={Colors.light.White} />
                      </View>
                    ) : speakerEnabled ? (
                      <Icon.SpeakerOn />
                    ) : (
                      <Icon.SpeakerOff />
                    )}
                  </Block>
                </Pressable>
              )}
              {currentCallType === "video" && (
                <Fragment>
                  <Pressable style={{ borderRadius: 32 }} onPress={toggleCamera}>
                    <Block height={64} width={64} borderRadius={32}>
                      <Icon.SwitchCamera />
                    </Block>
                  </Pressable>

                  <Pressable
                    style={{ borderRadius: 32 }}
                    onPress={() => {
                      toggleVideoOnOff();
                    }}
                  >
                    <Block height={64} width={64} borderRadius={32}>
                      {videoCameraOn ? <Icon.VideoOn /> : <Icon.VideoOff />}
                    </Block>
                  </Pressable>
                </Fragment>
              )}
              <Pressable style={{ borderRadius: 32 }} onPress={toggleMute} >
                <Block height={64} width={64} borderRadius={32}>
                  {muteAudio ? <Icon.MuteOn /> : <Icon.MuteOff />}
                </Block>
              </Pressable>
              <Block>
                <Center>
                  <Pressable
                    style={{ borderRadius: 32 }}
                    onPress={() => {
                      closeCall();
                    }}
                  >
                    <Block height={64} width={64} borderRadius={32}>
                      <Icon.CloseCall />
                    </Block>
                  </Pressable>
                </Center>
              </Block>
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
});
