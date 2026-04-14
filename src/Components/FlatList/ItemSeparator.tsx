import { View, Text } from "react-native";
import React from "react";
import { Colors } from "@/Constants";

export default function ItemSeparator() {
  return <View style={{ backgroundColor: Colors.light.backgroundMessageQuestion, height: 1, width: "100%" }} />;
}
