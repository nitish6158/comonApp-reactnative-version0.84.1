import { DefaultImageUrl, GroupUrl, ImageUrl } from "@Service/provider/endpoints";
import { Dimensions, Image, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import RNVoipCall, { RNVoipPushKit } from "react-native-voips-calls";
import React, { useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import Colors from "@/Constants/Colors";
import PickAndDropCall from "./PickAndDropCall";
import { callAtom } from "@Atoms/callAtom";
import { callQueueAtom } from "@Navigation/Application";
import { useAppSelector } from "@/redux/Store";
import FastImage from "@d11/react-native-fast-image";

const { width, height } = Dimensions.get("screen");

type AndroidCallQueueParams = {
  onAnswer: () => void;
  onDecline: () => void;
};

export default function AndroidCallQueueModel({ onAnswer, onDecline }: AndroidCallQueueParams) {
  const [data, setData] = useAtom(callQueueAtom);
  const activeCallData = useAtomValue(callAtom);
  const { MyProfile } = useAppSelector((state) => state.Chat);

  useEffect(() => {
    if (data?.data.callId == activeCallData?.callId) {
      RNVoipCall.stopRingtune();
      RNVoipCall.endAllCalls();
      setData(null);
    }
  }, [data, activeCallData]);

  useEffect(() => {
    audioPlayer.pausePlayer();
    audioPlayer.removePlayBackListener();
  }, []);

  if (!data) {
    return <></>;
  }

  if (MyProfile?.mode == "SENIORCITIZEN" && data) {
    return (
      <View style={styles.overlay}>
        <CallBackground hasImageBackground={undefined} backgroundColor={"#2F3645"}>
          <View style={{ alignItems: "center", justifyContent: "space-between", flex: 1 }}>
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <FastImage
                style={{ borderRadius: 80, height: 80, width: 80 }}
                source={{ uri: `${DefaultImageUrl}${data?.data?.callBackground}` }}
              />
              <View style={styles.headerContainer}>
                <Text
                  style={{ color: "white", fontSize: 18, width: 350, textAlign: "center" }}
                >{`${data?.notification?.title} is calling you. Do you want to accept?`}</Text>
              </View>
            </View>
            <View style={{ alignItems: "center", marginBottom: 100 }}>
              <View style={{ alignItems: "center", marginTop: 5 }}>
                <Pressable style={styles.button} onPress={onAnswer}>
                  <Text style={{ fontSize: 18, color: "white", textAlign: "center" }}>{"Accept"}</Text>
                </Pressable>
              </View>
              <View style={{ alignItems: "center", marginTop: 5 }}>
                <Pressable style={styles.button} onPress={onDecline}>
                  <Text style={{ fontSize: 18, color: "white", textAlign: "center" }}>{"Do not Accept"}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </CallBackground>
      </View>
    );
  }

  const backgroundCheck =
    data?.data &&
    data?.data?.callBackground !== ImageUrl &&
    data?.data?.callBackground !== GroupUrl &&
    data?.data?.callBackground?.length
      ? true
      : false;

  const color = backgroundCheck ? "white" : "black";

  return (
    <View style={styles.overlay}>
      <CallBackground hasImageBackground={data?.data?.callBackground} backgroundColor="#b4e8ff">
        <View style={styles.headerContainer}>
          <Text style={{ color: color, fontSize: 18 }}>{data?.notification?.title}</Text>
        </View>
        <View style={styles.headerContainer}>
          <Text style={{ color: color, fontSize: 18 }}>{data?.notification?.body}</Text>
        </View>
        {!backgroundCheck && (
          <View style={styles.headerContainer}>
            <Image source={{ uri: DefaultImageUrl + ImageUrl }} style={{ height: 100, width: 100 }} />
          </View>
        )}
        <View style={{ marginTop: backgroundCheck ? height * 0.6 : height * 0.5, paddingHorizontal: 60 }}>
          <View style={[styles.rowDirection, { justifyContent: "space-between" }]}>
            <PickAndDropCall buttonAction={onDecline} buttonName="Decline" buttonColor={Colors.light.alertFailure} />
            <PickAndDropCall buttonAction={onAnswer} buttonName="Answer" />
          </View>
        </View>
      </CallBackground>
    </View>
  );
}

function CallBackground({
  backgroundColor,
  hasImageBackground,
  children,
}: {
  backgroundColor: string;
  hasImageBackground: string | undefined;
  children: React.ReactNode;
}) {
  if (
    hasImageBackground &&
    hasImageBackground?.length &&
    hasImageBackground !== ImageUrl &&
    hasImageBackground !== GroupUrl
  ) {
    return (
      <ImageBackground
        style={styles.basicContainer}
        source={{ uri: `https://storage.googleapis.com/comon-bucket/${hasImageBackground}` }}
      >
        {children}
      </ImageBackground>
    );
  }
  return <View style={[styles.basicContainer, { backgroundColor: backgroundColor }]}>{children}</View>;
}

const styles = StyleSheet.create({
  basicContainer: {
    bottom: 0,
    flex: 1,
    left: 0,
    padding: 10,
    paddingTop: 30,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 15,
  },
  rowDirection: {
    alignItems: "center",
    flexDirection: "row",
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    borderColor: "white",
    borderWidth: 1,
    width: 320,
    minHeight: 45,
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  overlay: {
    position: "absolute",
    height: height,
    width: width,
    zIndex: 101,
    top: 0,
  },
});
