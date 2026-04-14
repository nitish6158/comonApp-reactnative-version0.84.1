import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import React, { useEffect, useState } from "react";

import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import useFileSystem from "@Hooks/useFileSystem";
import { useAtomValue } from "jotai";
import { singleRoom } from "../Atoms/singleRoom";

type props = {
  item: Conversation;
};

export default function VideoDownloadView({ item }: props) {
  const display = useAtomValue(singleRoom);
  const isSaveToCameraRollActive = display?.isCurrentRoomSavetoCameraRollActive ?? false;
  const { downloadMediaToCameraRoll } = useFileSystem();
  const [loading, setloading] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android" && isSaveToCameraRollActive) {
      setloading(true);
      downloadMediaToCameraRoll(item?.fileURL, isSaveToCameraRollActive).then((res) => {
        if (res) {
          setloading(false);
        }
      });
    }
  }, [isSaveToCameraRollActive]);

  return (
    <Pressable
      onPress={() => {
        setloading(true);
        downloadMediaToCameraRoll(item?.fileURL, isSaveToCameraRollActive).then((res) => {
          if (res) {
            setloading(false);
          }
        });
      }}
      style={{ height: 300, width: 200, position: "absolute", justifyContent: "center", alignItems: "center" }}
    >
      <View
        style={{
          height: 70,
          width: 70,
          backgroundColor: Colors.light.Hiddengray,
          borderRadius: 70,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="ios-play-sharp" size={30} color="white" />
      </View>
      <View
        style={{
          position: "absolute",
          height: 35,
          width: 35,
          backgroundColor: Colors.light.Hiddengray,
          bottom: 40,
          borderRadius: 50,
          left: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!loading ? <Feather name="download" size={17} color="white" /> : <ActivityIndicator color="white" />}
      </View>
    </Pressable>
  );
}
