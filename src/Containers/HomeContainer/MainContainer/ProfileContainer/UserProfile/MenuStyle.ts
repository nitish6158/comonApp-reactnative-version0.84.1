import Colors from "@/Constants/Colors";
/* eslint-disable react-native/no-color-literals */
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  accounts: {
    paddingLeft: 12,
    paddingTop: 12,
  },
  avatar: {
    backgroundColor: "#284b63",
    paddingBottom: 18,
    paddingHorizontal: 12,
    paddingTop: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: Colors.light.background,
    flex: 1,
    justifyContent: "space-between",
  },
  info: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  links: {
    marginTop: 24,
    paddingLeft: 12,
  },
});

export default styles;
