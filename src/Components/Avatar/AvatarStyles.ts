import { $text_md } from "@/Constants/TextSizes";
import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

export const avatarStyle = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderColor: Colors.light.link,
    borderWidth: 2,
  },
  title: {
    color: Colors.light.text,
    fontSize: $text_md,
  },
});
