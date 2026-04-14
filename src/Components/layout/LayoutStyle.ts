import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

export const layoutStyle = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
  },
  containerBackground: {
    backgroundColor: Colors.light.background,
  },
  end: {
    justifyContent: "flex-end",
  },
  start: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  wrapper: {
    backgroundColor: Colors.light.background,
    width: "100%",
  },
  wrapperPadding: {
    paddingHorizontal: 15,
  },
});
