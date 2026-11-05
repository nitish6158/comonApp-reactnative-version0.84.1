import { Modal, Pressable, View } from "react-native";
import React, { SetStateAction, useState } from "react";

import Colors from "@/Constants/Colors";
import ImageViewer from "react-native-image-zoom-viewer";
import Text from "../Text";
import { useTranslation } from "react-i18next";
import { windowHeight } from "@Util/ResponsiveView";
import Video from "react-native-video";

type props = {
  ImagePreviewVisible: boolean;
  closeImageModal: () => void;
  ImagePreviewImage: { type: "IMAGE" | "VIDEO"; url: String };
};

function VideoFullScreenPreview({ ImagePreviewVisible, closeImageModal, ImagePreviewImage }: props) {
  const { t } = useTranslation();
  return (
    <>
      <Modal visible={ImagePreviewVisible} transparent={true}>
        {ImagePreviewImage.type == "IMAGE" ? (
          <ImageViewer
            enableSwipeDown
            renderIndicator={() => <></>}
            imageUrls={[
              {
                url: ImagePreviewImage.url,
              },
            ]}
            onSwipeDown={closeImageModal}
            onClick={closeImageModal}
          />
        ) : (
          <View
            style={{
              flex: 1,
              backgroundColor: "black",
              paddingTop: 40,
            }}
          >
            <Pressable onPress={closeImageModal}>
              <Text
                style={{
                  color: Colors.light.White,
                  marginLeft: 30,
                  marginTop: 10,
                }}
                size="lg"
              >
                {t("education-business.close")}
              </Text>
            </Pressable>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
              }}
            >
              <Video
                source={{ uri: ImagePreviewImage.url }}
                controls
                paused={false}
                style={{
                  height: windowHeight / 2,
                  backgroundColor:'black'
                }}
                resizeMode="contain"
              />
            </View>
          </View>
        )}
      </Modal>
    </>
  );
}

export default VideoFullScreenPreview;
