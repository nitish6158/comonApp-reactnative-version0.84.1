import React, { useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Colors } from "@/Constants";

type ImagePreviewComponentProps = {
  isVisible: boolean;
  imageURL: string;
};

export default function ImagePreviewComponent({ isVisible, imageURL }: ImagePreviewComponentProps) {
  const [loading, setLoading] = useState<boolean>(false);

  if (!isVisible) {
    return <></>;
  } else {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ImageZoom uri={imageURL} onLoadStart={() => setLoading(true)} onLoadEnd={() => setLoading(false)} />
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size={"large"} color={Colors.light.PrimaryColor} />
          </View>
        )}
      </GestureHandlerRootView>
    );
  }
}

const styles = StyleSheet.create({
  loader: {
    position: "absolute",
    zIndex: 5,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
