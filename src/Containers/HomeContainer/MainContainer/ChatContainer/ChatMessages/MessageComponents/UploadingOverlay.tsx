import * as Progress from "react-native-progress";

import { StyleSheet, Text, View } from "react-native";

import Colors from "@/Constants/Colors";
import React from "react";

type props = {
  progress: number;
  isVisible: boolean;
};

export default function UploadingOverlay({ progress, isVisible }: props) {
  if (!isVisible) {
    return null;
  } else {
    return (
      <View style={styles.overlay}>
        <Progress.Circle
          animated={true}
          size={60}
          progress={progress}
          color={Colors.light.PrimaryColor}
          thickness={3}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(51,51,51,.5)",
    height: "100%",
    justifyContent: "center",
    position: "absolute",
    width: "100%",
  },
});
