/**
 * Centralized Typography & Font Sizes
 * Fully backwards-compatible with legacy $text_* variables.
 */

// Legacy size exports
export const $text_xxs = 10;
export const $text_tiny = 12;
export const $text_xs = 14;
export const $text_regular = 15;
export const $text_sm = 16;
export const $text_sub = 17;
export const $text_md = 18;
export const $text_xl = 20;
export const $text_h3 = 22;
export const $text_h2 = 24;
export const $text_lg = 25;
export const $text_h1 = 28;
export const $text_xxl = 32;

// Semantic Typography Tokens
export const Typography = {
  // Font Sizes
  size: {
    micro: 10,
    caption: 12,
    small: 14,
    regular: 15,
    body: 16,
    subheading: 17,
    titleSmall: 18,
    titleMedium: 20,
    titleLarge: 22,
    heading: 24,
    displaySmall: 28,
    displayLarge: 32,
  },

  // Line Heights
  lineHeight: {
    micro: 14,
    caption: 16,
    small: 18,
    regular: 20,
    body: 22,
    subheading: 24,
    titleSmall: 26,
    titleMedium: 28,
    titleLarge: 30,
    heading: 32,
    displaySmall: 36,
    displayLarge: 40,
  },
} as const;

export default Typography;
