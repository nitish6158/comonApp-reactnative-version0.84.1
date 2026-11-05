/* eslint-disable react-native/no-raw-text */
import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Block, Typography } from "rnmuilib";

type VIDEO_DISABLE_BLOCK = {
  height: number;
  width: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  showLabel?: boolean;
};

function VideoDisableBlock({ height, width, borderRadius, style, showLabel = false }: VIDEO_DISABLE_BLOCK) {
  return (
    <Block
      height={height}
      width={width}
      borderRadius={borderRadius ?? 0}
      style={style}
      justifyContent="center"
      alignItems="center"
      backgroundColor="black"
    >
      {showLabel ? <Typography color="white">No video</Typography> : null}
    </Block>
  );
}

export default VideoDisableBlock;
