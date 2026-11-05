/**
 * Centralized Font Family and Weight Configuration
 */

const fonts = {
  // Font Families
  Lato: "Lato",
  LatoRegular: "Lato-Regular",
  LatoBold: "Lato-Bold",
  LatoLight: "Lato-Light",
  LatoBlack: "Lato-Black",
  LatoThin: "Lato-Thin",
  mono: "SpaceMono-Regular",

  // Font Weights (Type-safe font weight presets)
  weights: {
    thin: "100" as const,
    light: "300" as const,
    regular: "400" as const,
    medium: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
    black: "900" as const,
  },
} as const;

export default fonts;
