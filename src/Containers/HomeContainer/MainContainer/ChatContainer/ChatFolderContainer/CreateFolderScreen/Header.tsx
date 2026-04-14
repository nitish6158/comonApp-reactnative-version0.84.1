import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { mainStyles, typographyStyles } from "../../../../../../styles/main";

import Check from "@Images/Check.svg";
import Colors from "@/Constants/Colors";
import { ListItem } from "react-native-elements";
import Pencil from "@Images/Profile/Pencil.svg";
import React from "react";
import Search from "@Images/search.svg";
import { headerStyle } from "@Components/header/HeaderStyle";
import { layoutStyle } from "@Components/layout/LayoutStyle";
import { useTranslation } from "react-i18next";

interface SelectGroupHeaderProps {
  OnSearch?: () => void;
  onbackPresss?: () => void;
  Title: String;
  onCheck?: () => void;
  isEdit?: boolean;
  onPressPencil?: () => void;
  pencil?: boolean;
  onEdit?: () => void;
}

// create a component
const SelectGrupHeader = ({
  OnSearch,
  onbackPresss,
  Title,
  onCheck,
  isEdit,
  pencil,
  onPressPencil,
  onEdit,
}: SelectGroupHeaderProps) => {
  const { fontScale } = useWindowDimensions();
  const typography = typographyStyles(fontScale);
  const { t } = useTranslation();
  return (
    <View
      style={[headerStyle.header, mainStyles.row, layoutStyle.containerBackground, headerStyle.headerWithScreenName]}
    >
      <Pressable onPress={onbackPresss} style={mainStyles.center}>
        <ListItem.Chevron tvParallaxProperties style={mainStyles.rotate} size={30} color={Colors.light.text} />
      </Pressable>
      <ListItem.Content>
        <ListItem.Title style={typography.md}>{Title}</ListItem.Title>
      </ListItem.Content>

      {pencil && (
        <Pressable onPress={onPressPencil}>
          <Pencil style={{ marginHorizontal: 10 }} />
        </Pressable>
      )}

      {OnSearch && (
        <Pressable onPress={OnSearch}>
          <Search style={{ marginHorizontal: 10 }} />
        </Pressable>
      )}
      {onCheck && (
        <Pressable onPress={onCheck}>
          <Check style={{ marginHorizontal: 10 }} />
        </Pressable>
      )}

      {isEdit && (
        <Pressable onPress={onEdit ? onEdit : () => {}}>
          <Text style={{ fontWeight: "500" }}>{t("btn.edit")}</Text>
        </Pressable>
      )}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "#2c3e50",
    flex: 1,
    justifyContent: "center",
  },
});

//make this component available to the app
export default SelectGrupHeader;
