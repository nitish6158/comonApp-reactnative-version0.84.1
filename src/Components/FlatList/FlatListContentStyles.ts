import { $space_lg, $space_xs } from "@/Constants/Spaces";

import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  itemSeparator: {
    backgroundColor: Colors.light.backgroundMessageQuestion,
    height: 1,
    width: "100%",
  },
  listItem: {
    flexGrow: 1,
    padding: $space_lg,
  },
  subtitle: {
    color: Colors.light.tintText,
    paddingTop: $space_xs,
  },
});
