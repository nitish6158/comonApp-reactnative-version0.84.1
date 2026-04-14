import { Dimensions, Modal, Platform, StyleSheet, Text, TextProps, View, ViewProps } from "react-native";
import React, { useEffect, useState } from "react";
import { Tooltip, TooltipProps } from "react-native-elements";

import Colors from "@/Constants/Colors";
import fonts from "@/Constants/fonts";

const { width, height } = Dimensions.get("screen");

interface ITooltip {
  popOverText: string;
  children: React.ReactNode;
  popOverTextStyle?: TextProps;
  popOverViewStyle?: ViewProps;
}

export function TooltipInfo(props: ITooltip) {
  const { popOverText, children, popOverTextStyle, popOverViewStyle } = props;

  const [open, setOpen] = useState(false);

  return (
    <Tooltip
      visible={open}
      withOverlay={false}
      height={100}
      width={250}
      popover={
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={[styles.textStyle, styles.textTypo, popOverTextStyle]}>{popOverText}</Text>
        </View>
      }
      containerStyle={{ marginLeft: Platform.OS === "ios" ? 100 : 0 }}
      withPointer={false}
      skipAndroidStatusBar={true}
      backgroundColor={Colors.light.black}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    >
      {children}
    </Tooltip>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.grayText,
    height: 120,
    width: 150,
  },
  textStyle: {
    color: Colors.light.White,
    fontSize: 12,
    fontWeight: "700",
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
});
