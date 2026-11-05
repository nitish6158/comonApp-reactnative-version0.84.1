import { View, ImageBackground } from "react-native";
import React from "react";
import FastImage from "@d11/react-native-fast-image";

type Props = {
  children: any;
  type: string;
  bgImage?: {
    fileName: string;
    opacity: number;
  } | null;
};
export default function ChatMessageWrapper({ bgImage, children, type }: Props) {
  return bgImage?.fileName ? (
    <FastImage
      style={{ flex: 1 }}
      source={{
        uri: `https://storage.googleapis.com/comon-bucket/${bgImage?.fileName}`,
        priority: "high",
      }}
    >
      <View style={{ flex: 1, zIndex: 2 }}>{children}</View>
      <View
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          zIndex: 1,
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: `rgba(0, 0, 0, ${bgImage.opacity})`,
        }}
        pointerEvents="none"
      />
    </FastImage>
  ) : (
    <View style={{ flex: 1, backgroundColor: type == "call" ? "#b4e8ff" : "#fff" }}>{children}</View>
  );
}
