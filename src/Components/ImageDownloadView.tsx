import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import React, { useEffect, useState } from "react";

import Colors from "@/Constants/Colors";
import Feather from "react-native-vector-icons/Feather";
import useFileSystem from "@Hooks/useFileSystem";
import { Conversation } from "@/models/chatmessage";
import { useAtomValue } from "jotai";
import { singleRoom } from "@/Atoms";

type props = {
  item: Conversation;
};

export default function ImageDownloadView({ item }: props) {
  const display = useAtomValue(singleRoom);
  const isSaveToCameraRollActive = display?.isCurrentRoomSavetoCameraRollActive ?? false;
  const { downloadMediaToCameraRoll } = useFileSystem();
  const [loading, setloading] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android" && isSaveToCameraRollActive) {
      setloading(true);
      downloadMediaToCameraRoll(
        item?.fileURL,
        isSaveToCameraRollActive
      ).then((res) => {
        if (res) {
          setloading(false);
        }
      });
    }
  }, [isSaveToCameraRollActive]);

  return (
    <Pressable
      onPress={() => {
        if (!loading) {
          setloading(true);
          downloadMediaToCameraRoll(
            item?.fileURL,
            isSaveToCameraRollActive
          ).then((res) => {
            if (res) {
              setloading(false);
            }
          });
        }
      }}
      style={{
        height: 300,
        width: 200,
        position: "absolute",
        justifyContent: "center",
        alignItems: "center",
      }}
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
        {!loading ? (
          <Feather name="download" size={25} color="white" />
        ) : (
          <ActivityIndicator color="white" />
        )}
      </View>
    </Pressable>
  );
}
