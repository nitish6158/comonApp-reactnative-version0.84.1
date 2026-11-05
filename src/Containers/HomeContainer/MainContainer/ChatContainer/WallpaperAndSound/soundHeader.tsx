import * as React from "react";

import { GoBackComponent, navigateNested } from "@Components/goBack";
import { Pressable, View, useWindowDimensions } from "react-native";
import { mainStyles, typographyStyles } from "../../../../../styles/main";

import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Constants/Colors";
import { ListItem } from "react-native-elements";
import { headerStyle } from "@Components/header/HeaderStyle";
import { layoutStyle } from "@Components/layout/LayoutStyle";
import { useNavigation } from "@react-navigation/core";
import { useTranslation } from "react-i18next";

export type HeaderWithScreenNameProps = {
  title: string;
  subtitle?: string;
  navigateNested?: navigateNested;
  onSave?: () => void;
};

export const SoundHeader = ({ title, subtitle, navigateNested, onSave }: HeaderWithScreenNameProps) => {
  const { t } = useTranslation();
  const { fontScale } = useWindowDimensions();
  const typography = typographyStyles(fontScale);
  const navigation = useNavigation();

  return (
    <View
      style={[headerStyle.header, mainStyles.row, layoutStyle.containerBackground, headerStyle.headerWithScreenName]}
    >
      <Pressable
        onPress={() => {
          navigation.goBack();
        }}
      >
        <AntDesign name="arrowleft" size={24} color="black" style={{ marginRight: 5 }} />
      </Pressable>
      <ListItem.Content style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <ListItem.Title style={typography.md}>{t(title)}</ListItem.Title>
        <Pressable onPress={onSave}>
          <ListItem.Title style={[typography.md, { color: Colors.light.PrimaryColor }]}>Save</ListItem.Title>
        </Pressable>
      </ListItem.Content>
    </View>
  );
};
