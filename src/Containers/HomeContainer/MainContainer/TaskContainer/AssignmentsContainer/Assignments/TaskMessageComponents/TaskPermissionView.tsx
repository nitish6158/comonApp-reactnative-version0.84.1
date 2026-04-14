import { StyleSheet, View, ViewStyle, Text } from "react-native";

import Colors from "@/Constants/Colors";
import React from "react";

type props = {
  message: string;
  icon: any;
};
export default function TaskPermissionView({ message, icon }: props) {
  return (
    <View style={style.viewstyle}>
      {icon && icon}
      <Text style={{ fontSize: 14, color: "gray", marginLeft: 5, lineHeight: 22 }}>{message && message}</Text>
    </View>
  );
}
const style = StyleSheet.create({
  viewstyle: {
    alignItems: "flex-start",
    backgroundColor: Colors.light.LightBlue,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
});
