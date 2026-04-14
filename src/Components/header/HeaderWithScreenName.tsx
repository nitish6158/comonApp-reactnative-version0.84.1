import * as React from "react";

import { GoBackComponent, navigateNested } from "../goBack";
import { View, useWindowDimensions } from "react-native";
import { mainStyles, typographyStyles } from "../../styles/main";

import { AuthNavigatorParamList } from "@Navigation/screenPropsTypes";
import Colors from "@/Constants/Colors";
import { ListItem } from "react-native-elements";
import { headerStyle } from "./HeaderStyle";
import { layoutStyle } from "../layout/LayoutStyle";
import { useTranslation } from "react-i18next";

export type HeaderWithScreenNameProps = {
  title: string;
  subtitle?: string;
  leftIcon?: any;
  navigateNested?: { page: keyof AuthNavigatorParamList; screen: keyof AuthNavigatorParamList };
};

export const HeaderWithScreenName = ({ title, subtitle, navigateNested, leftIcon }: HeaderWithScreenNameProps) => {
  const { t } = useTranslation();
  const { fontScale } = useWindowDimensions();
  const typography = typographyStyles(fontScale);

  return (
    <View
      style={[headerStyle.header, mainStyles.row, layoutStyle.containerBackground, headerStyle.headerWithScreenName]}
    >
      <GoBackComponent navigateNested={navigateNested} />
      <ListItem.Content>
        <ListItem.Title style={typography.md}>{t(title)}</ListItem.Title>
        {subtitle && (
          <ListItem.Subtitle style={[{ color: Colors.light.tintText }, typography.sm]}>{subtitle}</ListItem.Subtitle>
        )}
      </ListItem.Content>
      {leftIcon && leftIcon}
    </View>
  );
};
