import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/Constants/Colors";

export default function InCallButton() {
  return (
    <View style={styles.buttonStyle}>
      <Text style={styles.textStyle}>In call</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonStyle: {
    alignItems: "center",
    backgroundColor: "rgba(60,200,60,1)",
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
