import { Dimensions, Image, Pressable, StyleSheet, View } from "react-native";
import React, { useCallback, useEffect, useMemo } from "react";
import { singleRoom, singleRoomType } from "@Atoms/singleRoom";

import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import DeleteMessageText from "@Util/chatUtils/deleteMessageText";
import FastImage from "@d11/react-native-fast-image";
import MessageCommonWrapper from "./MessageCommonWrapper";

import Text from "@Components/Text";
import getDownloadfileName from "@Util/GetDownlodedFilename";
import { useAtom, useSetAtom } from "jotai";
import useFileSystem from "@Hooks/useFileSystem";
import { useSelector } from "react-redux";
import ImageDownloadView from "@Components/ImageDownloadView";
import { MediaPreviewAtom } from "../ChatListItem";
import { useTranslation } from "react-i18next";

const { height, width } = Dimensions.get("window");

type props = {
  isVisible: boolean;
  isMessageDeletedForEveryOne: boolean;
  isMessageForwarded: boolean;
  message: Conversation;
  searchText: string;
};

export default function ImageMessageComponent({
  isVisible,
  isMessageDeletedForEveryOne,
  isMessageForwarded,
  message,
  searchText,
}: props) {
  const [display] = useAtom(singleRoom);
  const { t } = useTranslation();

  if (!isVisible) {
    return null;
  } else if (isMessageDeletedForEveryOne) {
    return (
      <Text style={{ color: Colors.light.black, fontStyle: "italic", fontSize: 13 }}>
        {DeleteMessageText(message, display.currentUserUtility.user_id, t)}
      </Text>
    );
  } else {
    return (
      <MessageCommonWrapper
        isMessageForwarded={isMessageForwarded}
        message={message}
        searchText={searchText}
        showMessageText={true}
        showForwardBadge={false}
        showStatusRow={false}
      >
        <ImageComponent message={message} />
      </MessageCommonWrapper>
    );
  }
}

function ImageComponent({ message }: { message: Conversation }) {
  const { getFileLocationByFilename } = useFileSystem();
  const DownloadFileStore = useSelector((state: any) => state.Chat.DownloadFileStore);
  const setMediaPreviewData = useSetAtom(MediaPreviewAtom);

  const isImageLocallyAvailable = useMemo(() => {
    return DownloadFileStore.indexOf(getDownloadfileName(message.fileURL)) !== -1;
  }, [message.fileURL, DownloadFileStore]);

  const url = useMemo(() => {
    return getFileLocationByFilename(message.fileURL);
  }, []);

  if (message.fileURL.length == 0) {
    return (
      <View style={[styles.imageContainer, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 14 }}>File Not Found</Text>
      </View>
    );
  }

  return (
    <View style={styles.imageContainer}>
      {isImageLocallyAvailable ? (
        <Pressable
          onPress={() => {
            setMediaPreviewData({
              url: message.fileURL,
              type: "IMAGE",
              time: message.created_at,
            });
          }}
        >
          <FastImage
            source={{ uri: url, priority: FastImage.priority.high }}
            style={{ height: "100%", width: "100%" }}
          />
        </Pressable>
      ) : (
        <>
          <Image
            blurRadius={15}
            source={{ uri: `${DefaultImageUrl}${message.fileURL}` }}
            style={{ height: "100%", width: "100%" }}
          />
          <ImageDownloadView item={message} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    backgroundColor: Colors.light.gray,
    borderRadius: 15,
    height: 269,
    marginBottom: 5,
    overflow: "hidden",
    width: 200,
  },
  recevierTime: {
    color: Colors.light.black,
    marginLeft: 4,
    textAlign: "right",
  },
  replyCon: {
    alignItems: "center",
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 2,
    paddingVertical: 3,
    width: width / 4.5,
  },
});
