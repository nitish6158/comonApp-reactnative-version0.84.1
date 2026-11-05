import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { mainStyles, typographyStyles } from "../../../../../styles/main";

import Check from "@Images/Check.svg";
import Colors from "@/Constants/Colors";
import { ListItem } from "react-native-elements";
//import liraries
import React from "react";
import Text from "@Components/Text";
import { headerStyle } from "@Components/header/HeaderStyle";
import { layoutStyle } from "@Components/layout/LayoutStyle";

// create a component
interface GroupheaderName {
  onbackPresss?: () => void;
  Title: string;
  navigation?: {};
  oncheckPress?: () => void;
  secondText?: string;
}
const GroupCreateHeader = ({ onbackPresss, Title, oncheckPress, secondText }: GroupheaderName) => {
  const { fontScale } = useWindowDimensions();

  const typography = typographyStyles(fontScale);

  return (
    <View style={[headerStyle.header, mainStyles.row, layoutStyle.containerBackground]}>
      <Pressable onPress={onbackPresss} style={mainStyles.center}>
        <ListItem.Chevron tvParallaxProperties style={mainStyles.rotate} size={30} color={Colors.light.text} />
      </Pressable>
      <ListItem.Content>
        <ListItem.Title style={typography.md}>{Title}</ListItem.Title>
      </ListItem.Content>
      {oncheckPress && (
        <Pressable onPress={oncheckPress}>
          <Check />
        </Pressable>
      )}
      {secondText && <Text>{secondText}</Text>}
    </View>
  );
};

//make this component available to the app
export default GroupCreateHeader;
