/* eslint-disable react-native/no-inline-styles */
import * as React from "react";

import { View, useWindowDimensions } from "react-native";
import { mainStyles, typographyStyles } from "../../styles/main";

import { $space_xs } from "@/Constants/Spaces";
import Colors from "@/Constants/Colors";
import { IconOutline } from "@ant-design/icons-react-native";
import { OutlineGlyphMapType } from "@ant-design/icons-react-native/lib/outline";
import Text from "../Text";

export const BottomTab = ({ focused, icon, label }: { focused: boolean; icon: OutlineGlyphMapType; label: string }) => {
  const { fontScale } = useWindowDimensions();
  const styles = typographyStyles(fontScale);
  return (
    <View style={{ ...mainStyles.center }}>
      <IconOutline name={icon} style={[{ color: focused ? Colors.light.link : Colors.light.tintText }, styles.xl]} />
      <Text
        size="sm"
        style={{
          color: focused ? Colors.light.link : Colors.light.tintText,
          marginTop: $space_xs,
          width: "100%",
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </View>
  );
};
