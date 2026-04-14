import { $space_md, $space_xxl } from "@/Constants/Spaces";

import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";
import { fonts } from "@/Constants";

export const CELL_SIZE = 70;
export const CELL_BORDER_RADIUS = 8;
export const DEFAULT_CELL_BG_COLOR = "#fff";
export const NOT_EMPTY_CELL_BG_COLOR = Colors.dark.background;
export const ACTIVE_CELL_BG_COLOR = Colors.light.tableHeadBg;

const styles = StyleSheet.create({
  description: {
    marginBottom: $space_xxl,
  },
  icon: {
    height: 100,
    marginBottom: $space_md,
    marginLeft: "auto",
    marginRight: "auto",
    width: 100,
  },
  subtitleStyle: {
    fontSize: 13,
    fontFamily: fonts.Lato,
    textAlign: "center",
    color: Colors.light.black,
    fontWeight: "700",
  },
});

export default styles;
