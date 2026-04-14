import { Dimensions, Pressable, View, Text } from "react-native";
import React from "react";
import { windowHeight, windowWidth } from "@/utils/ResponsiveView";
import Video from "react-native-video";

const { height } = Dimensions.get("window");

type VideoPreviewComponentProps = {
  isVisible: boolean;
  videoUrl: string;
};

export default function VideoPreviewComponent({ isVisible, videoUrl }: VideoPreviewComponentProps) {
  if (!isVisible) {
    return <></>;
  } else {
    return (
      <View style={{ flex: 1, justifyContent: "center", marginTop: 50, zIndex: 10, backgroundColor: "black" }}>
        <Video
          source={{ uri: videoUrl }}
          paused={false}
          style={{
            height: windowHeight - 150,
            width: windowWidth,
            backgroundColor: "black",
          }}
          controls
          resizeMode="contain"
        />
      </View>
    );
  }
}
