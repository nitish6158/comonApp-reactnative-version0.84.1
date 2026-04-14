import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

type props = {
  isVisible: boolean;
};

export default function RetryOverlay({ isVisible }: props) {
  if (!isVisible) {
    return null;
  } else {
    return (
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.retryContainer}>
          <MaterialCommunityIcons name="upload" size={32} color="white" />
        </TouchableOpacity>
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
  retryContainer: {
    backgroundColor: "rgba(51,51,51,.8)",
    borderRadius: 40,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
});
