import * as React from "react";

import { Pressable, StyleProp, TextStyle } from "react-native";

import { $space_xs } from "@/Constants/Spaces";
import { $text_md } from "@/Constants/TextSizes";
import Colors from "@/Constants/Colors";
import Feather from "react-native-vector-icons/Feather";
import { OutlineGlyphMapType } from "@ant-design/icons-react-native/lib/outline";

interface SwitchIconProps {
  active: boolean;
  icon: OutlineGlyphMapType;
  activeIcon: string;
  onPress: () => void;
  style?: StyleProp<TextStyle>;
}

export const SwitchIcon = ({
  active,
  icon,
  activeIcon,
  onPress,
  style = { color: Colors.light.tintText, fontSize: $text_md },
}: SwitchIconProps) => (
  <Pressable onPress={onPress}>
    <Feather
      name={active ? activeIcon : icon}
      style={[{ paddingHorizontal: $space_xs, paddingVertical: $space_xs }, style]}
    />
  </Pressable>
);
