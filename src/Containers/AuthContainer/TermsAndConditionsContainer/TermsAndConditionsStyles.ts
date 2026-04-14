import { $space_lg, $space_sm, $space_xl } from "@/Constants/Spaces";

import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

export const termsAndConditionsStyles = StyleSheet.create({
  box: {
    backgroundColor: Colors.light.backgroundGray,
    borderRadius: $space_lg,
    flex: 6,
    marginBottom: $space_xl,
  },
  button: {
    borderRadius: 20,
    height: 36,
    maxHeight: 36,
    maxWidth: 100,
    minHeight: 36,
    minWidth: 20,
  },
  buttonContainer: {
    flex: 0,
    // marginBottom: $space_xl,
  },
  title: {
    color: Colors.light.grayText,
    fontWeight: "bold",
    textAlign: "center",
  },
});
