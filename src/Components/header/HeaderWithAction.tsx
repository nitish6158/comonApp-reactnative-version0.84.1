// @ts-nocheck
import { Pressable, Text, View } from "react-native";

import React from "react";

import { AppIcon } from "@/Components/icons";

type props = {
  screenName: string;
  onBackPress: () => void;
  isActionVisible: boolean;
  ActionComponent: () => JSX.Element | null;
};

export default function HeaderWithAction({ screenName, onBackPress, isActionVisible, ActionComponent }: props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white",
        paddingHorizontal: 15,
        paddingVertical: 10,
      }}
    >
      <Pressable
        onPress={onBackPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <AppIcon name="back" size={24} color="black" style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 17 }}>{screenName}</Text>
      </Pressable>
      {isActionVisible && <ActionComponent />}
    </View>
  );
}
