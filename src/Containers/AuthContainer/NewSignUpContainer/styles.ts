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
    height: 85,
    marginBottom: $space_md,
    marginLeft: "auto",
    marginRight: "auto",
    width: 85,
    resizeMode: "contain",
  },
  subtitleStyle: {
    fontSize: 13,
    fontFamily: fonts.Lato,
    textAlign: "center",
    color: "#64748B",
    fontWeight: "400",
    lineHeight: 18,
  },
  welcomeStyle: {
    fontSize: 13,
    fontFamily: fonts.Lato,
    textAlign: "center",
    color: Colors.light.black,
    fontWeight: "600",
    lineHeight: 18,
  },
  helperText: {
    fontSize: 11,
    fontFamily: fonts.Lato,
    color: "#64748B",
    fontWeight: "400",
    lineHeight: 15,
    marginTop: -8,
    marginBottom: 14,
  },
});

export default styles;
