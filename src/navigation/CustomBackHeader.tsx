import { View, useWindowDimensions } from "react-native";
import { mainStyles, typographyStyles } from "../styles/main";

import { Block } from "rnmuilib";
import Colors from "@/Constants/Colors";
import { GoBackComponent } from "@Components/goBack";
import { ListItem } from "react-native-elements";
import React from "react";
import { headerStyle } from "@Components/header/HeaderStyle";
import { layoutStyle } from "@Components/layout/LayoutStyle";
import { useTranslation } from "react-i18next";

function CustomBackHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: any }) {
  const { t } = useTranslation();
  const { fontScale } = useWindowDimensions();
  const typography = typographyStyles(fontScale);

  return (
    <View
      style={[headerStyle.header, mainStyles.row, layoutStyle.containerBackground, headerStyle.headerWithScreenName]}
    >
      <GoBackComponent />
      <ListItem.Content>
        <ListItem.Title style={typography.md}>{t(title)}</ListItem.Title>
        {subtitle && (
          <ListItem.Subtitle style={[{ color: Colors.light.tintText }, typography.sm]}>{subtitle}</ListItem.Subtitle>
        )}
      </ListItem.Content>
      <Block flex={1} />
      {right}
    </View>
  );
}

export default CustomBackHeader;
