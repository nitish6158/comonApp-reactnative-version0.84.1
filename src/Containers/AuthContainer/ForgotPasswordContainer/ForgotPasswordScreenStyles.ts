import { $space_lg, $space_md } from "@/Constants/Spaces";

import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

export const IMAGE_HEIGHT = 200;
export const IMAGE_HEIGHT_SMALL = 70;

export const forgotPasswordScreenStyles = StyleSheet.create({
  center: {
    textAlign: "center",
  },
  countDownDigit: {
    backgroundColor: Colors.transparent,
  },
  countDownDigitTxt: {
    color: Colors.light.text,
  },
  countDownText: {
    color: Colors.light.tintText,
    textAlign: "center",
  },
  text: {
    marginBottom: $space_lg,
  },
  title: {
    marginBottom: $space_md,
  },
});
