import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/Constants/Colors";

import React from "react";
import { ShowCallTimeUI } from "./CallTimer";

import { VectorIconCompat } from "@/Components/icons";

type miniModeProps = {
  switchToFullMode: (value: boolean) => void;
  userName: string;
  duration: string;
};

export default function MiniCallMode({ switchToFullMode, userName, duration }: miniModeProps) {
  return (
    <Pressable onPress={() => switchToFullMode(true)} style={miniModeStyle.container}>
      <Text style={miniModeStyle.userName}>{userName}</Text>
      <View style={miniModeStyle.callDetailsContainer}>
        <VectorIconCompat name="ios-call" size={16} color="white" />
        <ShowCallTimeUI color="white" />
      </View>
    </Pressable>
  );
}

const miniModeStyle = StyleSheet.create({
  callDetailsContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  callDurationText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  container: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  userName: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
