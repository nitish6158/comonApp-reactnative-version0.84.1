import { Pressable, Text, View, ViewStyle, StyleProp } from "react-native";

import React from "react";
import { navigateBack } from "@Navigation/utility";
import { useTranslation } from "react-i18next";

import { AppIcon } from "@/Components/icons";

type props = {
  customStyle?: StyleProp<ViewStyle>
}

export default function HeaderWithBack({ customStyle }: props) {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={navigateBack}
      style={[{
        backgroundColor: "white",
        paddingHorizontal: 15,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
      }, customStyle && customStyle]}
    >
      <AppIcon name="back" size={24} color="black" style={{ marginRight: 5 }} />
      <Text style={{ fontSize: 17 }}>{t('titles.Back')}</Text>
    </Pressable>
  );
}
