import { StyleSheet } from "react-native";

export const arrowDownStyles = StyleSheet.create({
  box: {
    bottom: -14,
    flexDirection: "row-reverse",
    position: "absolute",
    right: 0,
    transform: [{ rotateX: "0deg" }],
    width: "100%",
  },
  boxRotate: {
    transform: [{ rotateX: "180deg" }],
  },
});
