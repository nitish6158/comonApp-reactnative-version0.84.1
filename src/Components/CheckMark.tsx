import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import Colors from "@/Constants/Colors";
import Feather from "react-native-vector-icons/Feather";
import React from "react";
interface CheckMarkProps {
  checkStyle?: ViewStyle;
  size?: number;
}
export const CheckMark = ({ checkStyle, size }: CheckMarkProps) => {
  return (
    <View style={[styles.checked, checkStyle]}>
      <Feather name="check" size={size ?? 13} color="white" />
    </View>
  );
};
interface uncheckProps {
  unCheckStyle?: ViewStyle;
}
export const UnCheckMark = ({ unCheckStyle }: uncheckProps) => {
  return <View style={[styles.unCheck, unCheckStyle]} />;
};

const styles = StyleSheet.create({
  checked: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 30,
    height: 25,

    justifyContent: "center",
    position: "absolute",
    width: 25,
    // borderColor:'#E0E0E0',
    // borderWidth:1.4,
    left: 10,
  },
  unCheck: {
    backgroundColor: Colors.light.White,
    borderColor: "#E0E0E0",
    borderRadius: 30,
    borderWidth: 1.4,
    height: 25,
    left: 10,
    position: "absolute",
    width: 25,
  },
});
