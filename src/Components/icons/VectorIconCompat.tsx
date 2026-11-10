import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { AppIcon } from "./AppIcon";
import { mapVectorIconName } from "./vectorNameMap";

type Props = {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  solid?: boolean;
  light?: boolean;
  brand?: boolean;
  onPress?: () => void;
};

/**
 * Drop-in SVG stand-in for react-native-vector-icons components.
 * Maps glyph names to AppIcon semantics so screens keep the same meaning.
 */
export function VectorIconCompat({ name, size = 24, color = "#000000", style, onPress }: Props) {
  const icon = <AppIcon name={mapVectorIconName(name)} size={size} color={color} style={style} />;
  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={8}>
        {icon}
      </Pressable>
    );
  }
  return icon;
}

export default VectorIconCompat;
