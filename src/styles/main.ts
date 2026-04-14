import { $space_lg, $space_md, $space_xl, $space_xxl } from "@/Constants/Spaces";

import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

export const mainStyles = StyleSheet.create({
  alignCenter: {
    alignItems: "center",
  },
  alignSelfEnd: {
    alignSelf: "flex-end",
  },
  bold: {
    fontWeight: "700",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  flex1: {
    flex: 1,
  },
  flexWrap: {
    flexWrap: "wrap",
  },
  heightMax: {
    height: "100%",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  link: {
    color: Colors.light.link,
  },
  offsetBottomMd: {
    marginBottom: $space_md,
  },
  offsetBottomXxl: {
    marginBottom: $space_xxl,
  },
  offsetLeftXl: {
    marginLeft: $space_xl,
  },
  offsetRightMd: {
    marginRight: $space_md,
  },
  offsetTopLg: {
    marginTop: $space_lg,
  },
  offsetTopMd: {
    marginTop: $space_md,
  },
  paddingBottomLg: {
    paddingBottom: $space_lg,
  },
  paddingLeftMd: {
    paddingLeft: $space_md,
  },
  paddingTopBottomLg: {
    paddingBottom: $space_lg,
    paddingTop: $space_lg,
  },
  rotate: {
    transform: [{ rotate: "180deg" }],
  },
  row: {
    flexDirection: "row",
  },
  bottom: {
    bottom: 20,
  },
});

export const typographyStyles = (fontScale: number) =>
  StyleSheet.create({
    lg: {
      fontSize: 18 / fontScale,
    },
    md: {
      fontSize: 16 / fontScale,
    },
    sm: {
      fontSize: 14 / fontScale,
    },
    xl: {
      fontSize: 20 / fontScale,
    },
    xs: {
      fontSize: 12 / fontScale,
    },
    xxl: {
      fontSize: 22 / fontScale,
    },
    xxs: {
      fontSize: 10 / fontScale,
    },
  });
