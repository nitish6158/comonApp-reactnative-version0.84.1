import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";

import Colors from "@/Constants/Colors";
import Text from "@Components/Text";
import fonts from "@/Constants/fonts";

type props = {
  isVisible: boolean;
  senderName: string;
};

export default function SenderImage({ isVisible, senderName }: props) {
  if (!isVisible) {
    return null;
  } else {
    return (
      <View style={[styles.rowDirection, { justifyContent: "space-between", marginBottom: 5 }]}>
        <Text style={[styles.textTypo, { marginTop: 5, fontSize: 16, fontWeight: "500", color: Colors.light.black }]}>
          {senderName}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  recevierTime: { color: Colors.light.black, marginLeft: 4, textAlign: "right" },
  rowDirection: {
    alignItems: "center",
    flexDirection: "row",
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
});
