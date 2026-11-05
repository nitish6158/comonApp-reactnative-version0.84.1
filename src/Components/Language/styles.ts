import { Platform, StyleSheet } from "react-native";

import Colors from "@/Constants/Colors";

const styles = StyleSheet.create({
  action: {
    height: 35,
    position: "absolute",
    right: 15,
    top: Platform.OS === "ios" ? 55 : 0,
    width: 35,
    zIndex: 99,
  },
  close: {
    backgroundColor: Colors.transparent,
    height: 35,
    width: 35,
  },
  list: {
    position: "relative",
    top: Platform.OS === "ios" ? 55 : 35,
    zIndex: 98,
  },
  locale: {
    padding: 12,
    width: "100%",
  },
  modal: {
    backgroundColor: Colors.light.background,
    margin: 0,
    width: "100%",
  },
});

export default styles;
