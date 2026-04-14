import { taskNotificationLoader } from "@/Atoms/AssignmentAtom";
import { Colors, fonts } from "@/Constants";
import { useAtomValue } from "jotai";
import React from "react";
import { Text } from "react-native";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function OverlayLoader() {
  const taskNotification = useAtomValue(taskNotificationLoader);
  return (
    <View style={styles.container}>
      <Text style={{ color: "black", marginBottom: 40, fontFamily: fonts.Lato, fontSize: 20, textAlign: "center" }}>
        {taskNotification}
      </Text>
      <ActivityIndicator size={20} color={Colors.light.PrimaryColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    backgroundColor: "white",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
