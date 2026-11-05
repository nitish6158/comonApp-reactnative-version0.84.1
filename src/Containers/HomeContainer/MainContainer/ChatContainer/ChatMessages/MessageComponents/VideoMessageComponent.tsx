import { Dimensions, Pressable, StyleSheet, View,Image } from "react-native";
import React, { useCallback, useMemo } from "react";

import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import DeleteMessageText from "@Util/chatUtils/deleteMessageText";
import Ionicons from "react-native-vector-icons/Ionicons";
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
        <VideoComponent message={message} />
      </MessageCommonWrapper>
    );
  }
}

export function VideoComponent({ message }: { message: Conversation }) {
  const DownloadFileStore = useSelector((state: any) => state.Chat.DownloadFileStore);
  const setMediaPreviewData = useSetAtom(MediaPreviewAtom);

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

  return (
    <View style={styles.VideoContainer}>
      {isVideoLocallyAvailable ? (
        <Pressable
          onPress={() => {
            setMediaPreviewData({
              url: message.fileURL,
              type: "VIDEO",
              time: message.created_at,
            });
          }}
        >
          {!isEmpty(message.thumbnail) && (
            <FastImage
              source={{ uri: `${DefaultImageUrl}${message.thumbnail}` }}
              style={{ height: "100%", width: "100%" }}
            />
          )}
          <View style={styles.videoPlayButton}>
            <Ionicons name="play" size={30} color="white" />
          </View>
        </Pressable>
      ) : (
        <>
          {!isEmpty(message.thumbnail) && (
            <Image
              blurRadius={15}
              source={{ uri: `${DefaultImageUrl}${message.thumbnail}` }}
              style={{ height: "100%", width: "100%" }}
            />
          )}
          <VideoDownloadView item={message} />
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
