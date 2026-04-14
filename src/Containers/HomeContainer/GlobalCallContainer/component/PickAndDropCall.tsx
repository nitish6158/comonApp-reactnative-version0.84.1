import { StyleSheet, TouchableOpacity } from "react-native";
import { Text, View } from "react-native";

import Colors from "@/Constants/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import React from "react";
import fonts from "@/Constants/fonts";

interface IPickAndDropButton {
  buttonName: "Decline" | "Answer";
  buttonColor?: string;
  buttonDisable?: boolean;
  buttonAction: Function;
}

export default function PickAndDropCall(props: IPickAndDropButton) {
  const { buttonAction, buttonName, buttonColor, buttonDisable } = props;
  return (
    <View style={{ alignItems: "center" }}>
      <TouchableOpacity
        style={[styles.buttonContainer, { backgroundColor: buttonColor ? buttonColor : Colors.light.alertSuccess }]}
        activeOpacity={0.7}
        disabled={buttonDisable ? buttonDisable : false}
        onPress={() => buttonAction(buttonName)}
      >
        {buttonName === "Decline" ? (
          <Entypo name="cross" size={50} color={Colors.light.White} />
        ) : (
          <FontAwesome name="phone" size={40} color={Colors.light.White} />
        )}
      </TouchableOpacity>
      <Text style={styles.textStyle}>{buttonName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    borderRadius: 50,
    elevation: 5,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  textStyle: {
    color: Colors.light.White,
    fontFamily: fonts.Lato,
    fontSize: 15,
    fontWeight: "500",
    paddingTop: 10,
  },
});
