import React from "react";
import { Button, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { windowHeight, windowWidth } from "@Util/ResponsiveView";

import { DefaultImageUrl } from "@Service/provider/endpoints";
import Video from "react-native-video";

type props = {
  filename: String;
  ContainerStyle?: ViewStyle;
  isFullScreen?: boolean;
  setImagePreviewImage?: ({ url, type }: any) => void;
  setImagePreviewVisible?: (v: boolean) => void;
};
export function TaskVideoPlayer({
  filename,
  ContainerStyle,
  setImagePreviewImage,
  isFullScreen,
  setImagePreviewVisible,
}: props) {
  const uri = filename.includes(DefaultImageUrl) ? filename : `${DefaultImageUrl}${filename}`;
  return (
    <View
      style={[
        {
          alignSelf: "flex-end",
          overflow: "hidden",
          borderRadius: 5,
        },
        ContainerStyle,
      ]}
    >
      <Video
        source={{ uri: uri }}
        controls
        style={{
          height: windowHeight / 4,
          width: windowWidth / 3,
          backgroundColor:'black'
        }}
        resizeMode="contain"
        paused={true}
      />
    </View>
  );
}
