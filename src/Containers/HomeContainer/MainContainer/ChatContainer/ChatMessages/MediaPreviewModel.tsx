import React from "react";
import useFileSystem from "@/hooks/useFileSystem";
import { useAtom, useAtomValue } from "jotai";
import { MediaPreviewAtom } from "./ChatListItem";
import { singleRoom } from "@/Atoms";
import { useTranslation } from "react-i18next";
import Modal from "react-native-modal";
import { Platform, Pressable, StatusBar, Text, TouchableOpacity, View } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import dayjs from "dayjs";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import ToastMessage from "@/utils/ToastMesage";
import { Colors } from "@/Constants";
import ImagePreviewComponent from "./ImagePreviewComponent";
import VideoPreviewComponent from "./VideoPreviewComponent";
import GetExtension from "@/utils/getExtensionfromUrl";

export default function MediaPreviewModel() {
  const [MediaPreviewData, setMediaPreviewData] = useAtom(MediaPreviewAtom);
  const { getFileLocationByFilename } = useFileSystem();
  const display = useAtomValue(singleRoom);
  const { t } = useTranslation();

  const closeModel = () => {
    setMediaPreviewData(null);
  };

  return (
    <Modal style={{ margin: 0 }} isVisible={MediaPreviewData != null} onBackButtonPress={closeModel}>
      <View style={{ flex: 1, backgroundColor: "black", marginTop: Platform.OS == "ios" ? 50 : 0 }}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(51,51,51,.9)" />
        <Pressable
          onPress={closeModel}
          style={{
            backgroundColor: "rgba(51,51,51,.9)",
            position: "absolute",
            top: 0,
            width: "100%",
            zIndex: 5,
            paddingHorizontal: 20,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AntDesign name="arrowleft" size={24} color="white" />
            <View style={{ marginLeft: 15, justifyContent: "center" }}>
              <Text style={{ color: "white", fontWeight: "700" }}>
                {display?.roomName.slice(0, 22)}
                {display?.roomName.length > 22 && "..."}
              </Text>
              <Text style={{ color: "rgba(230,230,230,1)", fontSize: 12 }}>
                {dayjs(MediaPreviewData?.time).format("MMMM DD, H:mmA")}
              </Text>
            </View>
          </View>
          <View>
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
                CameraRoll.save(getFileLocationByFilename(MediaPreviewData?.url), {
                  album: "comon",
                })
                  .then((res) => {
                    closeModel();
                    setTimeout(() => {
                      ToastMessage(t("label.image-saved-in-camera-roll"));
                    }, 1000);
                  })
                  .catch((e) => {
                    closeModel();
                    setTimeout(() => {
                      ToastMessage(
                        `${t("userDatabase.unable-to-save")} ${GetExtension(MediaPreviewData?.url ?? "")} ${t(
                          "userDatabase.format-camera-roll"
                        )}`
                      );
                    }, 1000);
                  });
              }}
            >
              <Text style={{ color: Colors.light.PrimaryColor, fontSize: 14, textAlign: "center" }}>
                {t("btn.save")}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
        {MediaPreviewData?.url && (
          <>
            <ImagePreviewComponent
              isVisible={MediaPreviewData?.type == "IMAGE"}
              imageURL={getFileLocationByFilename(MediaPreviewData?.url)}
            />
            <VideoPreviewComponent
              isVisible={MediaPreviewData?.type == "VIDEO"}
              videoUrl={getFileLocationByFilename(MediaPreviewData?.url)}
            />
          </>
        )}
      </View>
    </Modal>
  );
}
