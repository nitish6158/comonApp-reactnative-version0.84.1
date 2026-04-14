import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
//import liraries
import React, { Component, useEffect, useState } from "react";

import AudioRecorderPlayer from "react-native-nitro-sound";
import AvtaarWithoutTitle from "../../AvtaarWithoutTitle";
import Colors from "@/Constants/Colors";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import DigitalTimeString from "./DigitalTimeString";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Slider from "@react-native-community/slider";
import { windowWidth } from "@Util/ResponsiveView";

// create a component
type props = {
  audio: string;
  audioRecorderPlayer: typeof AudioRecorderPlayer;
};

export default function AudioPlayerModal(props: props) {
  const [playing, setPlaying] = useState(false);
  const [movingduration, setmovingduration] = useState(0);
  const [duration, setDuration] = useState(0);

  const onPressPlayPause = async () => {
    setPlaying(!playing);
    if (!playing) {
      await audioPlayer.startPlayer(`file://${props.audio}`);
      audioPlayer.addPlayBackListener((e) => {
        setDuration(e.duration);
        setmovingduration(e.currentPosition);
        if (e.duration == e.currentPosition) {
          setPlaying(false);
          audioPlayer.removePlayBackListener();
        }
      });
      // await TrackPlayer.play();
    } else {
      await audioPlayer.pausePlayer();

      // await TrackPlayer.pause();
    }
  };

  return (
    <View
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        flexDirection: "column",
        width: windowWidth / 2,
        height: 50,
        // overflow:'hidden',
      }}
    >
      <View
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {props.UserImage && (
          <AvtaarWithoutTitle
            ImageSource={{ uri: `${DefaultImageUrl}${props.UserImage}` }}
            AvatarContainerStyle={{ height: 28, width: 28, marginLeft: 5 }}
          />
        )}

        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            backgroundColor: props.topColor,
            position: "absolute",
            height: 19,
            width: 19,
            top: 25,
            borderRadius: 50,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome5 name="microphone" size={12} color={props.backgroundColor} />
        </View>

        <Pressable
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            // flex: 1,
            width: 40,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            // paddingRight: THUMB_SIZE,
            zIndex: 2,
            marginBottom: 5,
          }}
          onPress={onPressPlayPause}
        >
          {playing ? (
            <MaterialIcons name="pause" size={30} color={props.topColor} />
          ) : (
            <Entypo name="controller-play" size={30} color={props.topColor} />
          )}
        </Pressable>
        <View style={{ flex: 8 }}>
          <Slider
            minimumValue={0}
            minimumTrackTintColor={props.topColor}
            maximumTrackTintColor={props.topColor}
            maximumValue={duration ?? 0}
            value={movingduration ?? 0}
            thumbTintColor={props.topColor}
            onValueChange={async (value) => {
              await audioPlayer.pausePlayer();
            }}
            onSlidingComplete={async (value) => {
              setPlaying(false);
              audioPlayer.seekToPlayer(value);
              audioPlayer.resumePlayer();
            }}
          />
        </View>
      </View>
      <View
        style={{
          flex: 0,
          position: "absolute",
          top: 25,
          left: 32,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <DigitalTimeString
          time={movingduration ?? ""}
          timeStyle={{ fontSize: 12, color: Colors.light.Hiddengray, marginTop: Platform.OS == "ios" ? 15 : 0 }}
        />
        {/* <Text>{position  }</Text> */}
        {/* <Text>{duration}</Text> */}
      </View>
    </View>
  );
}
