import { Image, Modal, Pressable, ScrollView, View,Text } from "react-native";
import React, { SetStateAction, useState } from "react";

import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Constants/Colors";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import FastImage from "@d11/react-native-fast-image";
import SectionTitle from "./SectionTitle";
import { SimpleGrid } from "react-native-super-grid";
import VideoFullScreenPreview from "@Components/VideoPreviewFullScreen";
import getDownloadfileName from "@Util/GetDownlodedFilename";
import useFileSystem from "@Hooks/useFileSystem";
import { useTranslation } from "react-i18next";
import { MediaPreviewAtom } from "../ChatMessages/ChatListItem";
import { useAtom, useAtomValue } from "jotai";
import { useSelector } from "react-redux";
import { RoomMediaAtom } from "@/Atoms";
import MediaPreviewModel from "../ChatMessages/MediaPreviewModel";

function Media({ name }: { name: string }) {
  const data = useAtomValue(RoomMediaAtom);
  const { t } = useTranslation();
  const DownloadFileStore = useSelector((state: any) => state.Chat.DownloadFileStore);
  const { getFileLocationByFilename } = useFileSystem();
  const [MediaPreviewData, setMediaPreviewData] = useAtom(MediaPreviewAtom);

  const _renderItem = (item: any, index: any) => {
    if (item.type === "IMAGE") {
      return (
        <View style={{ borderRadius: 5, overflow: "hidden" }}>
          {DownloadFileStore.indexOf(getDownloadfileName(item.fileURL)) !== -1 ? (
            <Pressable
              onPress={() => {
                setMediaPreviewData({
                  url: item.fileURL,
                  type: "IMAGE",
                  time: item.created_at,
                });
              }}
              key={index}
              style={{}}
            >
              <FastImage style={{ aspectRatio: 1 }} source={{ uri: getFileLocationByFilename(item.fileURL) }} />
            </Pressable>
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors.light.LightBlue,
              }}
            >
              <FastImage
                style={{ aspectRatio: 1, height: 75, width: 75 }}
                source={{ uri: `${DefaultImageUrl}${item.fileURL}` }}
              >
                <View style={{ height: 75, width: 75, backgroundColor: "rgba(51,51,51,.7)", justifyContent: "center" }}>
                  <Text style={{ fontSize: 10, textAlign: "center", color: "white", fontWeight: "600" }} lineNumber={2}>
                    Image Not Downloaded
                  </Text>
                </View>
              </FastImage>
            </View>
          )}
        </View>
      );
    } else {
      return (
        <View>
          {DownloadFileStore.indexOf(getDownloadfileName(item.fileURL)) !== -1 ? (
            <Pressable
              onPress={() => {
                setMediaPreviewData({
                  url: item.fileURL,
                  type: "VIDEO",
                  time: item.created_at,
                });
              }}
              key={index}
              style={{ backgroundColor: Colors.light.LightBlue, borderWidth: 0.2 }}
            >
              <FastImage style={{ aspectRatio: 1 }} source={{ uri: `${DefaultImageUrl}${item?.thumbnail}` }} />
              <View
                style={{
                  padding: 4,
                  position: "absolute",
                  borderRadius: 10,
                  alignSelf: "center",
                  top: 18,
                }}
              >
                <AntDesign name="play" size={30} color={Colors.light.PrimaryColor} />
              </View>
            </Pressable>
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: Colors.light.LightBlue,
              }}
            >
              <FastImage
                style={{ aspectRatio: 1, height: 75, width: 75 }}
                source={{ uri: `${DefaultImageUrl}${item.thumbnail}` }}
              >
                <View style={{ height: 75, width: 75, backgroundColor: "rgba(51,51,51,.7)", justifyContent: "center" }}>
                  <Text style={{ fontSize: 10, textAlign: "center", color: "white", fontWeight: "600" }} lineNumber={2}>
                    Video Not downloaded
                  </Text>
                </View>
              </FastImage>
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 20 }}>
      {data.length === 0 && (
         <View style={{ flex: 1, alignItems: "center", marginTop: 135 }}>
          <Text style={{ color: "#333333", fontSize: 18, marginBottom: 16 }}>{t("education-business.media")}</Text>
          <Text style={{ color: "#828282", fontSize: 14, textAlign: "center" }}>
            {t("education-business.description")} {name ?? "N/A"} {t("education-business.end-description")}
          </Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {data.map((element: any, elementIndex: any) => (
          <View key={element.title} style={{ marginTop: elementIndex === 0 ? 0 : 20 }}>
            <SectionTitle title={element.title} />
            <SimpleGrid
              // style={{ flex: 1 }}
              itemDimension={70}
              data={element.data}
              renderItem={({ item, index }) => _renderItem(item, index)}
            />
          </View>
        ))}
      </ScrollView>
      {/* <VideoFullScreenPreview
        ImagePreviewVisible={ImagePreviewVisible}
        closeImageModal={closeImageModal}
        ImagePreviewImage={ImagePreviewImage}
      /> */}
      <MediaPreviewModel />
    </View>
  );
}

export default Media;
