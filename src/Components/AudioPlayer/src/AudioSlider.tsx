import { Animated, Pressable, Text, TouchableOpacity, View } from "react-native";
//import liraries
import React, { useEffect, useRef, useState } from "react";

import Colors from "@/Constants/Colors";
import DigitalTimeString from "./DigitalTimeString";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Slider from "@react-native-community/slider";
import Sound from "react-native-sound";
import ToastMessage from "@Util/ToastMesage";
import { callAtom } from "@Atoms/callAtom";
import { useAtom } from "jotai";
import { windowWidth } from "@Util/ResponsiveView";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import { useTranslation } from "react-i18next";

// create a component
type props = {
  senderProfileUrl: string;
  duration?: string;
  audio: string;
  topColor: string;
  UserImage: string;
  backgroundColor: string;
  withoutWrapper?: boolean;
};

export default function AudioSlider(props: props) {
  const [playing, setPlaying] = useState(false);
  const [movingduration, setmovingduration] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState<boolean>(false);
  const [callRequest] = useAtom(callAtom);
  const SoundRef = useRef<Sound | null>(null);
  const {t} = useTranslation()

  useEffect(() => {
    if (props.audio.length) {
      prepareAudioDuration();
    }
  }, [props.audio]);

  async function prepareAudioDuration() {
    const sound = new Sound(props.audio, "", (err) => {
      SoundRef.current = sound;
      if (err) {
        // console.log("Audio Error", err, props.audio);
        // setAudioError(true);
        // ToastMessage("Audio loading failed");
      }
      const duration = sound.getDuration() * 1000;

      if (duration) {
        setDuration(duration);
      }
    });
  }

  const onPressPlayPause = async () => {
    if (callRequest == null) {
      setPlaying(!playing);
      try {
        if (!playing) {
          fadeIn();
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
          fadeOut();
          await audioPlayer.pausePlayer();
          audioPlayer.removePlayBackListener();

          // await TrackPlayer.pause();
        }
      } catch (error) {}
    } else {
      ToastMessage(t("label.can-not-play-audio"));
      setPlaying(false);
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    // Will change fadeAnim value to 0 in 3 seconds
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View
      style={{
        flexDirection: "column",
        // alignItems: "flex-end",
        width: props?.withoutWrapper ? windowWidth - 40 : windowWidth / 2,
        // paddingVertical: 5,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: audioError ? "rgba(200,0,0,.1)" : Colors.light.LightBlue,
          borderRadius: 10,
          borderWidth: 0.3,
          borderColor: "rgba(51,51,51,.4)",
          paddingHorizontal: 10,
          paddingVertical: 5,
        }}
      >
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            backgroundColor: audioError ? "red" : props.topColor,
            position: "absolute",
            height: 22,
            width: 22,
            bottom: -8,
            left: props?.withoutWrapper ? 0 : -2,
            borderRadius: 50,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome5 name="microphone" size={7} color={props.backgroundColor} />
        </View>

        <View>
          <FastImage
            source={{ uri: `${DefaultImageUrl}${props.senderProfileUrl}` }}
            style={{ width: 30, height: 30, borderRadius: 20 }}
          />
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
          onPress={() => {
            if (!audioError) {
              onPressPlayPause();
            } else {
              ToastMessage(t("label.can-not-play-this-file"));
            }
          }}
        >
          {playing ? (
            <MaterialIcons name="pause" size={30} color={props.topColor} />
          ) : (
            <Entypo
              name={audioError ? "sound-mute" : "controller-play"}
              size={audioError ? 20 : 30}
              color={audioError ? "red" : props.topColor}
            />
          )}
        </Pressable>
        <View style={{ flex: 8 }}>
          <Slider
            minimumValue={0}
            minimumTrackTintColor={audioError ? "red" : props.topColor}
            maximumTrackTintColor={audioError ? "red" : props.topColor}
            maximumValue={duration ?? 0}
            value={movingduration ?? 0}
            thumbTintColor={audioError ? "red" : props.topColor}
            onValueChange={async (value) => {
              await audioPlayer.pausePlayer();
            }}
            onSlidingComplete={async (value) => {
              setPlaying(false);
              audioPlayer.seekToPlayer(value);
              await audioPlayer.resumePlayer();
            }}
          />
        </View>
      </View>
      <View>
        {playing ? (
          duration != 0 && (
            <Animated.View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 10,
                marginLeft: 20,
                opacity: fadeAnim,
              }}
            >
              <DigitalTimeString
                time={movingduration ?? ""}
                timeStyle={{ fontSize: 12, color: Colors.light.Hiddengray }}
              />
              <Text style={{ fontSize: 12, color: Colors.light.Hiddengray }}> / </Text>
              <DigitalTimeString time={duration} timeStyle={{ fontSize: 12, color: Colors.light.Hiddengray }} />
            </Animated.View>
          )
        ) : (
          <View style={{ marginTop: 10 }}>
            <DigitalTimeString
              time={props.duration ?? ""}
              timeStyle={{ fontSize: 12, color: Colors.light.Hiddengray }}
            />
          </View>
        )}
      </View>
    </View>
  );
}
