import { $BOTTOM_TABS_HEIGHT } from "@/Constants/Sizes";
import { $space_md } from "@/Constants/Spaces";
import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  cancel: {
    borderRadius: 60,
    height: 48,
  },
  container: {
    justifyContent: "space-between",
    paddingBottom: $BOTTOM_TABS_HEIGHT,
  },
  remove: {
    backgroundColor: Colors.light.error,
    borderRadius: 60,
    height: 48,
    marginTop: 30,
  },
  removeTitle: {
    marginBottom: 30,
  },
  resend: {
    backgroundColor: Colors.light.warn,
    borderRadius: 60,
    height: 48,
    marginBottom: 10,
  },
  text: {
    fontSize: 20,
    textAlign: "center",
  },
  title: {
    padding: $space_md,
    textAlign: "center",
  },
});

export default styles;
