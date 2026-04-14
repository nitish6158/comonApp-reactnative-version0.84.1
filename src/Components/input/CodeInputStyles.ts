/* eslint-disable react-native/sort-styles */
/* eslint-disable react-native/no-color-literals */
import { Platform, StyleSheet } from "react-native";

import Colors from "@/Constants/Colors";

export const CELL_SIZE = 70;
export const CELL_BORDER_RADIUS = 8;
export const DEFAULT_CELL_BG_COLOR = "#fff";
export const NOT_EMPTY_CELL_BG_COLOR = Colors.dark.background;
export const ACTIVE_CELL_BG_COLOR = Colors.light.tableHeadBg;

const styles = StyleSheet.create({
  codeFieldRoot: {
    height: CELL_SIZE,
    justifyContent: "center",
    marginTop: 30,
    paddingHorizontal: 20,
  },
  cell: {
    height: CELL_SIZE,
    lineHeight: CELL_SIZE + 8,
    marginHorizontal: 8,
    width: CELL_SIZE,
    ...Platform.select({ web: { lineHeight: 65 } }),
    fontSize: 30,
    textAlign: "center",
    borderRadius: CELL_BORDER_RADIUS,
    color: Colors.light.text,
    backgroundColor: "#fff",

    // IOS
    shadowColor: Colors.dark.background,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    // Android
    elevation: 3,
  },

  root: {
    minHeight: 800,
    padding: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    paddingBottom: 40,
    paddingTop: 50,
    textAlign: "center",
  },
  icon: {
    height: 158 / 2.4,
    marginLeft: "auto",
    marginRight: "auto",
    width: 217 / 2.4,
  },
  subTitle: {
    paddingTop: 30,
    textAlign: "center",
  },
  nextButton: {
    marginTop: 30,
    height: 48,
    borderRadius: 60,
  },
  resendButton: {
    backgroundColor: Colors.dark.background,
    borderRadius: 60,
    height: 48,
  },
});

export default styles;
