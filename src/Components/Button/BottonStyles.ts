import { $space_lg, $space_sm, $space_xl } from "@/Constants/Spaces";

import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";
import { padding } from "@Util/styleUtils";

export const buttonStyles = StyleSheet.create({
  containerButton: {
    backgroundColor: Colors.light.link,
    borderRadius: 5,
    minHeight: 55,
    justifyContent: "center",
    alignItems: "center",
    minWidth: "40%",
    ...padding($space_xl - $space_lg, $space_sm),
  },
  disabledContainer: { backgroundColor: Colors.light.backgroundMessageQuestion },
  disabledText: { color: Colors.light.text },
  textButton: { color: Colors.light.lightText, textAlign: "center", fontSize: 18 },
});
