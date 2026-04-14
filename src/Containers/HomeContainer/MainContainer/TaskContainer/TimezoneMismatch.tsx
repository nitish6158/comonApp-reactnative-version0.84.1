import { BackHandler, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";

import Colors from "@/Constants/Colors";
import ToastMessage from "@Util/ToastMesage";
import fonts from "@/Constants/fonts";
import { useNavigation } from "@react-navigation/core";

export default function TimezoneMismatch() {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      swipeEnabled: false,
    });
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      ToastMessage("Please set the timezone first.");
      return true;
    });
    return () => subscription.remove();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text
        style={{ color: Colors.light.black, fontSize: 16, lineHeight: 18, fontFamily: fonts.Lato, fontWeight: "600" }}
      >
        Please set the correct timezone on your device, or if you did set it correctly, then please restart your
        application.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: Colors.light.White,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
});
