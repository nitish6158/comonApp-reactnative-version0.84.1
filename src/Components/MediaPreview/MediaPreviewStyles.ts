import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  close: { position: "absolute", right: -10, top: -10, zIndex: 100 },
  video: { backgroundColor: Colors.light.text, borderRadius: 5, height: 200, width: 200 },
});
