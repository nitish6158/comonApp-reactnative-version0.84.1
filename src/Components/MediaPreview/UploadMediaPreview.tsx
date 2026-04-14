import { Image, Text, View } from "react-native";

import React from "react";

const UploadMediaPreview = ({ imageUri }: any) => {
  return (
    <View style={{ height: 60, width: 60, marginTop: 5, overflow: "hidden", borderRadius: 5 }}>
      <Image
        source={{ uri: `${imageUri}` }}
        style={{ height: "100%", width: "100%", overflow: "hidden" }}
        resizeMode="cover"
      />
    </View>
  );
};

export default UploadMediaPreview;
