import { Image, Text, View, ViewStyle } from "react-native";

import React from "react";
import { useOrganizations } from "@Hooks/useOrganization";

const AsssignmentSmallImage = ({ containerStyle }: { containerStyle?: ViewStyle }) => {
  const { currentOrganization } = useOrganizations();

  return (
    <View>
      <View
        style={[
          { width: 199, zIndex: 1000, height: 40, marginBottom: 10, flexDirection: "row", alignItems: "center" },
          containerStyle,
        ]}
      >
        <View
          style={{
            borderRadius: 50,
            height: 40,
            width: 40,
            overflow: "hidden",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../assets/images/adaptive-icon.png")}
            resizeMode="contain"
            style={{ height: 55, width: 55 }}
          />
        </View>
        <Text style={{ marginHorizontal: 5, fontSize: 16 }}>{currentOrganization?.name}</Text>
      </View>
    </View>
  );
};

export default AsssignmentSmallImage;
