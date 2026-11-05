import { Pressable, Text, View } from "react-native";

import AntDesign from "react-native-vector-icons/AntDesign";
import React from "react";

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
        <AntDesign name="arrowleft" size={24} color="black" style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 17 }}>{screenName}</Text>
      </Pressable>
      {isActionVisible && <ActionComponent />}
    </View>
  );
}
