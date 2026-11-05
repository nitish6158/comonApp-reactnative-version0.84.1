//import liraries
import React from "react";
import { View, Pressable, ViewStyle } from "react-native";
import Styles from "./styles";

// create a component

interface ListItemCommonProps {
  FirstFlex?: {};
  FirstFlexStyle?: {};
  SecondFlexStyle?: {};
  ThirdFlexStyle?: {};
  SecondFlex?: {};
  ThirdFlex?: {};
  ContainerStyle?: ViewStyle;
  onPress?: () => void;
}
const ListItemCommon = ({
  FirstFlex,
  SecondFlex,
  ThirdFlex,
  ContainerStyle,
  FirstFlexStyle,
  ThirdFlexStyle,
  SecondFlexStyle,
  onPress,
}: ListItemCommonProps) => {
  return (
    <View>
      <Pressable style={[Styles.Container, ContainerStyle]} onPress={onPress}>
        <View style={[{ flex: 2 }, FirstFlexStyle]}>{FirstFlex}</View>
        <View style={[{ flex: 9 }, SecondFlexStyle]}>{SecondFlex}</View>
        <View style={[{ flex: 2 }, ThirdFlexStyle]}>{ThirdFlex}</View>
      </Pressable>
    </View>
  );
};

//make this component available to the app
export default ListItemCommon;
