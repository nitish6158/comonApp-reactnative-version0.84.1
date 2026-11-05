import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from "react-native";
//import liraries
import React, { Component } from "react";
import { windowHeight, windowWidth } from "@Util/ResponsiveView";

import Lottie from "lottie-react-native";

// create a component
type Props = {
  IndicatorStyle?: ViewStyle;
};
const CommonLoader = ({ IndicatorStyle }: Props) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(1,2,2,0.2)",
        position: "absolute",
        height: "100%",
        width: "100%",
        zIndex: 99999,
      }}
    >
      <View style={[styles.container, IndicatorStyle]}>
        <Lottie
          source={require("../../../assets/lottie/loader.json")}
          style={{ height: 100, width: windowWidth, marginVertical: 20 }}
          autoPlay
          loop
        />
      </View>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    top: windowHeight / 2.4,
    // eslint-disable-next-line react-native/sort-styles
    bottom: 0,
    position: "absolute",
    left: windowWidth / 2.6,
    // backgroundColor: Colors.light.Hiddengray,
    height: 80,
    width: 80,
    zIndex: 999999,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
});

//make this component available to the app
export default CommonLoader;
