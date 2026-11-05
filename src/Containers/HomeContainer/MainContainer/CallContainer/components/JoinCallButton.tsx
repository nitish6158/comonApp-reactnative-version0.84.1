import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/Constants/Colors";
import { TouchableOpacity } from "react-native";

export default function JoinCallButton({ onPress }: { onPress: Function }) {
  return (
    <TouchableOpacity style={styles.buttonStyle} activeOpacity={0.7} onPress={onPress}>
      <Text style={styles.textStyle}>Join</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonStyle: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 20,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  textStyle: {
    fontSize: 14,
    // fontFamily: fonts.Lato,
    lineHeight: 18,
    color: Colors.light.White,
    // fontWeight: "700",
    letterSpacing: 0.5,
    fontStyle: "normal",
  },
});
