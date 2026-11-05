import { View, Text, Pressable, TouchableOpacity } from "react-native";
import React from "react";

import ImagePreviewComponent from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/ImagePreviewComponent";
import { MediaType } from "@/graphql/generated/types";
import Modal from "react-native-modal";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import { AttachmentViewScreenProps } from "@/navigation/screenPropsTypes";
import Ionicons from "react-native-vector-icons/Ionicons";
import VideoPreviewComponent from "../../ChatContainer/ChatMessages/VideoPreviewComponent";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { Colors } from "@/Constants";
import ToastMessage from "@Util/ToastMesage";
import useFileSystem from "@/hooks/useFileSystem";
import { useTranslation } from "react-i18next";

export default function AttachmentViewScreen({ navigation, route }: AttachmentViewScreenProps) {
  const { getFileLocationByFilename } = useFileSystem();
  const {t} = useTranslation()
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ justifyContent: "space-between", flexDirection: "row", alignItems: "center",marginHorizontal:10 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="arrow-back" color="gray" size={30} onPress={navigation.goBack} />
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "white",
            borderRadius: 12,
            paddingHorizontal: 15,
            paddingVertical: 5,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            CameraRoll.save(getFileLocationByFilename(route.params.attachment.url), { album: "comon" })
              .then((res) => {
                setTimeout(() => {
                  ToastMessage(t("label.image-saved-in-camera-roll"));
                }, 1000);
              })
              .catch((e) => {
                console.log(e);
              });
          }}
        >
          <Text style={{ color: Colors.light.PrimaryColor, fontSize: 14, textAlign: "center" }}>Save</Text>
        </TouchableOpacity>
      </View>
      <ImagePreviewComponent
        isVisible={route.params.attachment.type == MediaType["Photo"]}
        imageURL={`${DefaultImageUrl}${route.params.attachment.url}`}
      />
      <VideoPreviewComponent
        isVisible={route.params.attachment.type == MediaType["Video"]}
        videoUrl={`${DefaultImageUrl}${route.params.attachment.url}`}
      />
    </View>
  );
}
