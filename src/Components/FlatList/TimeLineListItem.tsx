import { Image, Linking, Platform, Pressable, TouchableOpacity, View, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import React, { SetStateAction, useState } from "react";
import { windowHeight, windowWidth } from "@Util/ResponsiveView";

import Colors from "@/Constants/Colors";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import Markdown from "react-native-markdown-display";
import { TaskData } from "@Service/generated/types";

import { TaskflowTime } from "@Util/date";
import Text from "../Text";
import { mainStyles } from "../../styles/main";
import { styles } from "./MapStyles";
import { Button } from "react-native-elements";
import FastImage from "@d11/react-native-fast-image";
import { Chip } from "react-native-ui-lib";
import { fonts } from "@/Constants";
import { TaskVideoPlayer } from "../../Containers/HomeContainer/MainContainer/TaskContainer/AssignmentsContainer/Assignments/TaskMessageComponents/TaskVideoPlayer";

const getAttachmentUri = (attachment?: { url?: string | null; filename?: string | null }) => {
  if (!attachment) {
    return "";
  }

  if (attachment.url?.startsWith("http") || attachment.url?.startsWith("data:")) {
    return attachment.url;
  }

  if (attachment.filename?.startsWith("http") || attachment.filename?.startsWith("data:")) {
    return attachment.filename;
  }

  const mediaPath = attachment.filename || attachment.url || "";

  if (!mediaPath) {
    return "";
  }

  return `${DefaultImageUrl}${mediaPath}`;
};

const isImageAttachment = (attachment?: { type?: string | null; url?: string | null; filename?: string | null }) => {
  const attachmentType = attachment?.type?.toUpperCase?.() ?? "";
  const attachmentUri = getAttachmentUri(attachment).toLowerCase();

  return attachmentType === "IMAGE" || /\.(png|jpe?g|gif|webp|bmp|heic|heif)(\?|$)/.test(attachmentUri);
};

const isVideoAttachment = (attachment?: { type?: string | null; url?: string | null; filename?: string | null }) => {
  const attachmentType = attachment?.type?.toUpperCase?.() ?? "";
  const attachmentUri = getAttachmentUri(attachment).toLowerCase();

  return attachmentType === "VIDEO" || /\.(mp4|mov|avi|m4v|webm|mkv)(\?|$)/.test(attachmentUri);
};
export const renderDetail = (
  rowData: TaskData,
  imageView: boolean,
  setImageView: Function,
  setImagePreviewImage: Function,
  setImagePreviewVisible: Function
) => {
  const coordinate = {
    latitude: Number(rowData.lat),
    longitude: Number(rowData.long),
  };
  const content = rowData?.content?.replace(/[++]/g, ""); // disable underline

  const openGps = (latitude: string, longitude: string) => {
    if (latitude && longitude) {
      const scheme = Platform.select({ ios: "maps://0,0?q=", android: "geo:0,0?q=" });
      const latLng = `${latitude},${longitude}`;
      const label = `${latitude}${longitude}`;
      const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
      });

      Linking.openURL(url);
    }
  };

  const exp =
    rowData?.type === "RANGE" ? rowData?.resultExp?.map((e) => (typeof e === "string" ? JSON.parse(e) : e)) : null;
  let rangeType = "";
  if (exp && Array.isArray(exp) && exp.length) {
    for (const item of exp) {
      rangeType += `${item.message},`;
    }
    if (rangeType.endsWith(",")) {
      rangeType = rangeType.slice(0, rangeType.length - 1);
    }
  }

  const taskAttachmentUri = getAttachmentUri(rowData?.attachment);
  const resultAttachmentUri = getAttachmentUri(rowData?.resultAttachment);

  return (
    <>
      <Text size="md" lineNumber={10} style={[{ color: Colors.light.black }]}>
        {rowData.label}
      </Text>
      <Markdown mergeStyle style={{ body: { color: Colors.light.black } }}>
        {content}
      </Markdown>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <FastImage
          source={{ uri: `${DefaultImageUrl}${rowData?.memberId?.user?.profile_img}` }}
          style={{ height: 20, width: 20, marginRight: 5, borderRadius: 20 }}
        />
        <Text size={"lg"} lineNumber={10} style={[mainStyles.bold, { color: Colors.light.black, marginVertical: 10 }]}>
          {`${rowData?.memberId?.user?.firstName} ${rowData?.memberId?.user?.lastName}`}
        </Text>
      </View>

      <View style={{ flex: 1, backgroundColor: Colors.light.formItemBorderFocused, borderRadius: 5, padding: 5 }}>
        {rangeType && (
          <Text size="md" lineNumber={10} style={[mainStyles.bold, { color: Colors.light.White, paddingTop: 10 }]}>
            {rangeType}``
          </Text>
        )}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 10 }}>
          <Text size={"lg"} style={{ color: Colors.light.White }}>
            {rowData.result}
          </Text>
          {/* <View style={{ backgroundColor: Colors.light.White, padding: 3, borderRadius: 5 }}> */}
          <Text style={{ fontSize: 12, color: Colors.light.White }}>{TaskflowTime(rowData?.taskCompleteTime)}</Text>
          {/* </View> */}
        </View>

        {isImageAttachment(rowData?.attachment) && taskAttachmentUri && (
          <Pressable style={{ alignSelf: "flex-end", padding: 5 }} onPress={() => setImageView(taskAttachmentUri)}>
            <Image source={{ uri: taskAttachmentUri }} style={{ height: windowHeight / 4, width: windowWidth / 3 }} resizeMode="contain" />
          </Pressable>
        )}
        {isVideoAttachment(rowData?.attachment) && taskAttachmentUri && (
          <TaskVideoPlayer
            isFullScreen={true}
            filename={taskAttachmentUri}
            setImagePreviewImage={setImagePreviewImage}
            setImagePreviewVisible={setImagePreviewVisible}
          />
        )}
        {isVideoAttachment(rowData?.resultAttachment) && resultAttachmentUri && (
          <TaskVideoPlayer
            isFullScreen={true}
            filename={resultAttachmentUri}
            setImagePreviewImage={setImagePreviewImage}
            setImagePreviewVisible={setImagePreviewVisible}
          />
        )}
        {isImageAttachment(rowData?.resultAttachment) && resultAttachmentUri && (
          <Pressable style={{ alignSelf: "flex-end", padding: 5 }} onPress={() => setImageView(resultAttachmentUri)}>
            <Image source={{ uri: resultAttachmentUri }} style={{ height: windowHeight / 4, width: windowWidth / 3 }} resizeMode="contain" />
          </Pressable>
        )}
        {rowData.lat && rowData.long && (
          <View>
            <MapView
              style={[styles.map, mainStyles.offsetTopLg]}
              initialRegion={{
                latitude: coordinate.latitude,
                longitude: coordinate.longitude,
                latitudeDelta: 0.003,
                longitudeDelta: 0.0003,
              }}
              scrollEnabled={false}
            >
              <Marker coordinate={coordinate} />
            </MapView>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 8,
                marginBottom: 5,
                marginHorizontal: 5,
              }}
            >
              <Chip
                label={`${rowData.distance ? rowData.distance.toFixed(2) : ""} ${rowData.distanceUnit ?? "m"}`}
                labelStyle={{ color: "black" }}
                backgroundColor={"white"}
                containerStyle={{ borderColor: "white" }}
              />
              <Chip
                label="View in map"
                onPress={() => openGps(rowData.lat, rowData.long)}
                labelStyle={{ color: "black", fontSize: 14, fontFamily: fonts.Lato }}
                backgroundColor={"white"}
                containerStyle={{ borderColor: "white" }}
              />
            </View>
          </View>
        )}
        {rowData.signatureAttachment ? (
          <Pressable
            style={{ alignSelf: "flex-end" }}
            onPress={() => setImageView("data:image/png;base64," + rowData.signatureAttachment)}
          >
            <Image
              resizeMode={"contain"}
              style={{
                width: 40,
                height: 40,
                backgroundColor: "#eee",
                marginTop: 10,
                borderRadius: 8,
              }}
              source={{ uri: "data:image/png;base64," + rowData.signatureAttachment }}
            />
          </Pressable>
        ) : (
          <></>
        )}
      </View>
    </>
  );
};
