import { Text, View } from "react-native";

import Colors from "@/Constants/Colors";
import React from "react";

type props = {
  title: string;
};

export default function SectionTitle({ title }: props) {
  return (
    <View
      style={{
        marginBottom: 10,
        backgroundColor: Colors.light.LightBlue,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
      }}
    >
      <Text
        style={{
          color: "#333333",
          fontFamily: "Lato",
          fontSize: 14,
          fontWeight: "700",
        }}
      >
        {title}
      </Text>
    </View>
  );
}
