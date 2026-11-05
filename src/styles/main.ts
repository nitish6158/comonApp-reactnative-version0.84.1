import {
  $space_lg,
  $space_md,
  $space_xl,
  $space_xxl,
  Spaces,
  BorderRadius,
} from "@/Constants/Spaces";
import Colors, { Palette } from "@/Constants/Colors";
import fonts from "@/Constants/fonts";
import { Typography } from "@/Constants/TextSizes";
import { StyleSheet, Platform } from "react-native";

export const mainStyles = StyleSheet.create({
  // ===================== FLEX & ALIGNMENT =====================
  flex1: {
    flex: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  alignCenter: {
    alignItems: "center",
  },
  alignSelfCenter: {
    alignSelf: "center",
  },
  alignSelfEnd: {
    alignSelf: "flex-end",
  },
  alignSelfStart: {
    alignSelf: "flex-start",
  },
  justifyCenter: {
    justifyContent: "center",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  justifyAround: {
    justifyContent: "space-around",
  },
  justifyEnd: {
    justifyContent: "flex-end",
  },
  row: {
    flexDirection: "row",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowAround: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  column: {
    flexDirection: "column",
  },
  flexWrap: {
    flexWrap: "wrap",
  },

  // ===================== SIZING =====================
  fullWidth: {
    width: "100%",
  },
  fullHeight: {
    height: "100%",
  },
  heightMax: {
    height: "100%",
  },

  // ===================== SCREEN & CONTAINERS =====================
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  screenMuted: {
    flex: 1,
    backgroundColor: Colors.light.backgroundGray,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spaces.lg,
  },
  card: {
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.card,
    padding: Spaces.lg,
    marginVertical: Spaces.xs,
    borderWidth: 1,
    borderColor: Palette.gray200,
  },
  cardElevated: {
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.card,
    padding: Spaces.lg,
    marginVertical: Spaces.xs,
    ...Platform.select({
      ios: {
        shadowColor: Palette.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: Palette.backdrop,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Palette.white,
    borderRadius: BorderRadius.modal,
    padding: Spaces.xl,
    width: "90%",
    maxWidth: 400,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.gray200,
    width: "100%",
    marginVertical: Spaces.sm,
  },

  // ===================== BACKGROUNDS =====================
  bgWhite: {
    backgroundColor: Palette.white,
  },
  bgGray: {
    backgroundColor: Palette.gray100,
  },
  bgPrimary: {
    backgroundColor: Palette.primary,
  },

  // ===================== SHADOWS =====================
  shadowSm: {
    ...Platform.select({
      ios: {
        shadowColor: Palette.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  shadowMd: {
    ...Platform.select({
      ios: {
        shadowColor: Palette.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  shadowLg: {
    ...Platform.select({
      ios: {
        shadowColor: Palette.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },

  // ===================== TYPOGRAPHY PRESETS =====================
  textH1: {
    fontFamily: fonts.Lato,
    fontSize: Typography.size.displaySmall,
    fontWeight: fonts.weights.bold,
    color: Palette.black,
  },
  textH2: {
    fontFamily: fonts.Lato,
    fontSize: Typography.size.heading,
    fontWeight: fonts.weights.bold,
    color: Palette.black,
  },
  textH3: {
    fontFamily: fonts.Lato,
    fontSize: Typography.size.titleMedium,
    fontWeight: fonts.weights.semiBold,
    color: Palette.black,
  },
  textBody: {
    fontFamily: fonts.Lato,
    fontSize: Typography.size.body,
    fontWeight: fonts.weights.regular,
    color: Colors.light.text,
  },
  textBodyBold: {
    fontFamily: fonts.Lato,
    fontSize: Typography.size.body,
    fontWeight: fonts.weights.bold,
    color: Colors.light.text,
  },
  textSmall: {
    fontFamily: fonts.Lato,
    fontSize: Typography.size.small,
    color: Palette.gray700,
  },
  textCaption: {
    fontFamily: fonts.Lato,
    fontSize: Typography.size.caption,
    color: Palette.gray500,
  },
  textMicro: {
    fontFamily: fonts.Lato,
    fontSize: Typography.size.micro,
    color: Palette.gray500,
  },
  textCenter: {
    textAlign: "center",
  },
  textRight: {
    textAlign: "right",
  },
  textMuted: {
    color: Palette.gray600,
  },
  textPrimary: {
    color: Palette.primary,
  },
  textWhite: {
    color: Palette.white,
  },
  textError: {
    color: Palette.error,
  },
  textSuccess: {
    color: Palette.success,
  },
  bold: {
    fontWeight: fonts.weights.bold,
  },
  link: {
    color: Colors.light.link,
  },

  // ===================== LEGACY MARGINS & PADDINGS =====================
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
  bottom: {
    bottom: 20,
  },
});

export const typographyStyles = (fontScale: number = 1) =>
  StyleSheet.create({
    xxs: {
      fontSize: 10 / fontScale,
      fontFamily: fonts.Lato,
    },
    xs: {
      fontSize: 12 / fontScale,
      fontFamily: fonts.Lato,
    },
    sm: {
      fontSize: 14 / fontScale,
      fontFamily: fonts.Lato,
    },
    md: {
      fontSize: 16 / fontScale,
      fontFamily: fonts.Lato,
    },
    lg: {
      fontSize: 18 / fontScale,
      fontFamily: fonts.Lato,
    },
    xl: {
      fontSize: 20 / fontScale,
      fontFamily: fonts.Lato,
    },
    xxl: {
      fontSize: 22 / fontScale,
      fontFamily: fonts.Lato,
    },
  });

export default mainStyles;
