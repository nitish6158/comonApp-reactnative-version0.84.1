import * as React from "react";

import { Pressable, StyleSheet, View } from "react-native";
import { RootStackScreenProps, ScreensList } from "@Types/types";

import { NotFoundScreenProps } from "@/navigation/screenPropsTypes";
import { Text } from "react-native-elements";

export default function NotFoundScreen({ navigation }: NotFoundScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This screen doesn't exist.</Text>
      <Pressable onPress={() => navigation.navigate("Login", { showModal: false })} style={styles.link}>
        <Text style={styles.linkText}>Go to home screen!</Text>
      </Pressable>
    </View>
  );
}
const $colorBlue = "#2e78b7";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: $colorBlue,
    fontSize: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
