/**
 * Centralized Spacing and Layout Constants
 * Fully backwards-compatible with legacy $space_* variables.
 */

// Legacy exports
export const $space_xxs = 2;
export const $space_xs = 4;
export const $space_sm = 8;
export const $space_md = 12;
export const $space_lg = 16;
export const $space_xl = 20;
export const $space_xxl = 32;

// Semantic Spacing Scale (8-point grid compatible)
export const Spaces = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 48,
} as const;

// Border Radius Tokens
export const BorderRadius = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  card: 14,
  modal: 16,
  button: 10,
  input: 8,
  round: 9999,
} as const;
