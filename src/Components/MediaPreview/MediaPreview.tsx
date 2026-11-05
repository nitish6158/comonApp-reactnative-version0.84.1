import { Image, Modal, View } from "react-native";
import React, { useEffect, useState } from "react";

import { AvatarProps } from "react-native-elements/dist/avatar/Avatar";
import { DefaultImageUrl } from "@Service/provider/endpoints";

export const MediaPreview = ({
  size = "large",
  imageUri,
  renderCloseIcon = true,
}: {
  size?: AvatarProps["size"];
  imageUri: string;
  onRemoveImage?: () => void;
  renderCloseIcon?: boolean;
}) => {
  return (
    <>
      <View
        style={{
          height: 200,
          width: 200,
          alignSelf: "flex-end",
          borderRadius: 10,
          overflow: "hidden",
          marginBottom: 30,
        }}
      >
        <Image
          source={{ uri: `${DefaultImageUrl}${imageUri}` }}
          style={{ height: "100%", width: "100%", overflow: "hidden" }}
          resizeMode="cover"
        />
      </View>
    </>
  );
};
