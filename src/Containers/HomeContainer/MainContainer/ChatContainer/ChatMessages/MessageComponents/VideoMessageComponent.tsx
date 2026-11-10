import { Dimensions, Pressable, StyleSheet, View,Image } from "react-native";
import React, { useCallback, useMemo } from "react";

import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import DeleteMessageText from "@Util/chatUtils/deleteMessageText";

import MessageCommonWrapper from "./MessageCommonWrapper";
import Text from "@Components/Text";
import VideoDownloadView from "@Components/videoDownloadView";
import getDownloadfileName from "@Util/GetDownlodedFilename";
import { isEmpty } from "lodash";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom, useSetAtom } from "jotai";
import { useSelector } from "react-redux";
import { MediaPreviewAtom } from "../ChatListItem";
import { useTranslation } from "react-i18next";
import FastImage from "@d11/react-native-fast-image";

import { VectorIconCompat } from "@/Components/icons";
import useE2eMediaUri from "@/hooks/useE2eMediaUri";
import { singleRoomType } from "@Atoms/singleRoom";

const { height, width } = Dimensions.get("window");

type props = {
  isVisible: boolean;
  isMessageDeletedForEveryOne: boolean;
  isMessageForwarded: boolean;
  message: Conversation;
  searchText: string;
};

export default function VideoMessageComponent({
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
      >
        <VideoComponent message={message} display={display} />
      </MessageCommonWrapper>
    );
  }
}

export function VideoComponent({
  message,
  display,
}: {
  message: Conversation;
  display?: singleRoomType;
}) {
  const [roomDisplay] = useAtom(singleRoom);
  const effectiveDisplay = display || roomDisplay;
  const DownloadFileStore = useSelector((state: any) => state.Chat.DownloadFileStore);
  const setMediaPreviewData = useSetAtom(MediaPreviewAtom);
  const { uri: e2eThumbUri, mediaPackage } = useE2eMediaUri(
    message,
    effectiveDisplay,
    { kind: "thumbnail" }
  );
  const { uri: e2eFileUri } = useE2eMediaUri(message, effectiveDisplay, {
    kind: "file",
  });
  const isE2e = !!(mediaPackage || (message as any)?.e2eMedia);

  const isVideoLocallyAvailable = useMemo(() => {
    return DownloadFileStore.indexOf(getDownloadfileName(message.fileURL)) !== -1;
  }, [message.fileURL, DownloadFileStore]);

  if(message.fileURL.length == 0){
    return(
      <View style={[styles.imageContainer,{justifyContent:'center',alignItems:'center'}]}>
        <Text style={{fontSize:14}}>File Not Found</Text>
      </View>
    )
  }

  const thumbUri = isE2e
    ? e2eThumbUri?.startsWith("file:")
      ? e2eThumbUri
      : null
    : !isEmpty(message.thumbnail)
      ? `${DefaultImageUrl}${message.thumbnail}`
      : null;

  const playUrl =
    isE2e && e2eFileUri?.startsWith("file:")
      ? e2eFileUri
      : message.fileURL;

  return (
    <View style={styles.VideoContainer}>
      {isVideoLocallyAvailable || (isE2e && e2eFileUri?.startsWith("file:")) ? (
        <Pressable
          onPress={() => {
            setMediaPreviewData({
              url: playUrl,
              type: "VIDEO",
              time: message.created_at,
            });
          }}
        >
          {!!thumbUri && (
            <FastImage
              source={{ uri: thumbUri }}
              style={{ height: "100%", width: "100%" }}
            />
          )}
          <View style={styles.videoPlayButton}>
            <VectorIconCompat name="play" size={30} color="white" />
          </View>
        </Pressable>
      ) : (
        <>
          {!!thumbUri && (
            <Image
              blurRadius={isE2e ? 0 : 15}
              source={{ uri: thumbUri }}
              style={{ height: "100%", width: "100%" }}
            />
          )}
          {!isE2e && <VideoDownloadView item={message} />}
          {isE2e && !e2eFileUri && (
            <View style={styles.videoPlayButton}>
              <Text style={{ color: "white", fontSize: 11 }}>🔒</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  VideoContainer: {
    backgroundColor: Colors.light.gray,
    borderRadius: 5,
    height: 245,
    marginBottom: 5,
    overflow: "hidden",
    width: 185,
  },
  imageContainer: {
    backgroundColor: Colors.light.gray,
    borderRadius: 12,
    height: 245,
    overflow: "hidden",
    width: 185,
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
  videoPlayButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Colors.light.Hiddengray,
    borderRadius: 70,
    height: 52,
    justifyContent: "center",
    marginTop: 96,
    position: "absolute",
    width: 52,
  },
});
