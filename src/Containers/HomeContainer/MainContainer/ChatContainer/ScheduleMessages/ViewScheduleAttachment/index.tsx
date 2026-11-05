import { View, Text, Pressable, TouchableOpacity, StatusBar, ScrollView, StyleSheet } from "react-native";
import React from "react";
import ImagePreviewComponent from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/ImagePreviewComponent";
import { ViewScheduleAttachmentProps } from "@/navigation/screenPropsTypes";
import Ionicons from "react-native-vector-icons/Ionicons";

import VideoPreviewComponent from "../../ChatMessages/VideoPreviewComponent";

export default function ViewScheduleAttachment({ navigation, route }: ViewScheduleAttachmentProps) {

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <StatusBar backgroundColor="black" />
      <View style={{ marginHorizontal: 10 }}>
        <Ionicons name="arrow-back" color="white" size={30} onPress={navigation.goBack} />
      </View>
      <ImagePreviewComponent isVisible={route.params.type == "image"} imageURL={`${route.params.url}`} />
      <VideoPreviewComponent isVisible={route.params.type == "video"} videoUrl={`${route.params.url}`} />
      {route.params.caption && route.params.caption.length > 0 && (
        <ScrollView style={styles.captionContainer}>
          <Text style={{ color: "white", textAlign: "center" }}>{route.params.caption}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  captionContainer: {
    position: "absolute",
    zIndex: 10,
    bottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "rgba(20,20,20,1)",
    width: "100%",
    maxHeight: 200,
  },
});
