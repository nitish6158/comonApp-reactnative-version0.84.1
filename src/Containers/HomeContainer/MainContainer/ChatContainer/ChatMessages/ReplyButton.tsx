import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/Constants/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import React from "react";

type props = {
  isVisible: boolean;
  iconName: "reply" | "forward";
  onReplyPress: () => void;
};

export default function ReplyButton({ iconName, onReplyPress, isVisible }: props) {
  if (!isVisible) {
    return null;
  } else {
    return (
      <Pressable style={styles.root} onPress={onReplyPress}>
        <View style={styles.iconContainer}>
          <Entypo name={iconName} size={15} style={styles.icon} color={Colors.light.black} />
        </View>
      </Pressable>
    );
  }
}

const styles = StyleSheet.create({
  icon: {},
  iconContainer: {
    backgroundColor: Colors.light.LightBlue,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  root: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
});
