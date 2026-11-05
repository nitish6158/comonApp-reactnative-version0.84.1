import { Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

import React from "react";
import { Styles } from "./CustomButtonStyle";

// create a component
interface ButtonProps {
  Title?: string;
  onPressButton: () => void;
  Btnstyle?: ViewStyle;
  TitleStyle?: TextStyle;
}
const CustomButton = ({ Title, onPressButton, Btnstyle, TitleStyle }: ButtonProps) => {
  return (
    <View>
      <Pressable style={[Styles.CreateFolderButton, Btnstyle]} onPress={onPressButton}>
        <Text style={[{ color: "white" }, TitleStyle]}>{Title}</Text>
      </Pressable>
    </View>
  );
};

export default CustomButton;
