import React from "react";
import { StyleProp, ViewStyle } from "react-native";
import type { IconName } from "./iconNames";
import { iconRegistry } from "./iconRegistry";

export type AppIconProps = {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * App-wide SVG icon renderer. Screens depend on this only — never on vector-icon libs or raw SVG imports.
 */
export function AppIcon({ name, size = 24, color = "#000000", style, testID }: AppIconProps) {
  const Icon = iconRegistry[name];
  if (!Icon) {
    return null;
  }
  return (
    <Icon
      width={size}
      height={size}
      color={color}
      // RN SVG transformer often honors fill for currentColor glyphs
      fill={color}
      style={style as any}
      testID={testID}
    />
  );
}

export default AppIcon;
