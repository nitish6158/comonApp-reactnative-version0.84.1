//import liraries
import React, { Component } from "react";
import { View, Text, StyleSheet, Image, ViewStyle } from "react-native";
import FastImage from "@d11/react-native-fast-image";

// create a component
interface props {
  ImageSource: { uri: string; require?: string };
  AvatarContainerStyle?: ViewStyle;
}
const AvtaarWithoutTitle = ({ ImageSource, AvatarContainerStyle }: props) => {
  return (
    <View style={[styles.AvataarContainer, AvatarContainerStyle]}>
      <FastImage
        source={{ uri: ImageSource.uri, priority: "high" }}
        style={{ height: "100%", width: "100%" }}
        resizeMode="cover"
      />
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  AvataarContainer: { borderRadius: 50, height: 40, overflow: "hidden", width: 40 },
});

//make this component available to the app
export default AvtaarWithoutTitle;
