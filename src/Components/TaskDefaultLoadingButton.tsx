import { ActivityIndicator, View } from "react-native";

import Colors from "@/Constants/Colors";
import React from "react";
export function TaskDefaultLoadingButton({}) {
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          backgroundColor: Colors.light.PrimaryColor,
          marginTop: 10,
          width: "100%",
          alignItems: "center",
          borderRadius: 5,
          alignSelf: "center",
          paddingVertical: 10,
        }}
      >
        <ActivityIndicator color={Colors.light.White} size={25} />
      </View>
    </View>
  );
}
