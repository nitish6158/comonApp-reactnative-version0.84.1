import { Text as TextNative, TextProps as TextPropsNative } from "react-native-elements";

import React from "react";
import fonts from "@/Constants/fonts";
import { typographyStyles } from "../../styles/main";
import { useWindowDimensions } from "react-native";

interface TextProps extends TextPropsNative {
  size?: "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
  lineNumber?: {};
}

const Text = ({ size = "md", style, children, lineNumber, ...props }: TextProps) => {
  const { fontScale } = useWindowDimensions();
  const styles = typographyStyles(fontScale);
  return (
    <TextNative
      {...props}
      ellipsizeMode="tail"
      style={[styles[size], { fontFamily: fonts.Lato }, style]}
      numberOfLines={lineNumber ?? 1}
    >
      {children}
    </TextNative>
  );
};

export default Text;
