import { ActivityIndicator, View } from "react-native";

import Colors from "@/Constants/Colors";
/* eslint-disable react-native/no-inline-styles */
import React from "react";
import { mainStyles } from "../styles/main";

export const Loader = ({ smallSize }: { smallSize?: boolean }) => (
  <View style={[mainStyles.flex1, mainStyles.center]}>
    <ActivityIndicator size={smallSize ? "small" : "large"} color={Colors.light.link} />
  </View>
);

export const LoaderContainer = ({ children, loading }: { children?: any; loading?: boolean }) =>
  loading ? (
    <View style={{ backgroundColor: Colors.light.background, height: "100%" }}>
      <Loader />
    </View>
  ) : (
    children
  );
