import React, { useMemo } from "react";
import { Text, View } from "react-native";

import AudioDownloadView from "@Components/audioDownloadView";
import AudioSlider from "@Components/AudioPlayer/src/AudioSlider";
import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";
import DeleteMessageText from "@Util/chatUtils/deleteMessageText";
import MessageCommonWrapper from "./MessageCommonWrapper";
import getDownloadfileName from "@Util/GetDownlodedFilename";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom, useAtomValue } from "jotai";
import useFileSystem from "@Hooks/useFileSystem";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

type props = {
  isVisible: boolean;
  isMessageDeletedForEveryOne: boolean;
  isMessageForwarded: boolean;
  message: Conversation;
  searchText: string;
  senderImage: string;
  withoutWrapper?: boolean;
};

export default function AudioMessageComponent({
  isVisible,
  isMessageDeletedForEveryOne,
  isMessageForwarded,
  message,
  searchText,
  senderImage,
  withoutWrapper,
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
    if (withoutWrapper) {
      return <AudioComponent message={message} senderImage={senderImage} withoutWrapper={withoutWrapper} />;
    }
    return (
      <MessageCommonWrapper
        isMessageForwarded={isMessageForwarded}
        message={message}
        showMessageText={true}
        searchText={searchText}
      >
        <AudioComponent message={message} senderImage={senderImage} />
      </MessageCommonWrapper>
    );
  }
}

export function AudioComponent({
  message,
  senderImage,
  withoutWrapper,
}: {
  message: Conversation;
  senderImage: string;
  withoutWrapper?: boolean;
}) {
  const { getFileLocationByFilename } = useFileSystem();
  const DownloadFileStore = useSelector((state: any) => state.Chat.DownloadFileStore);

  const isAudioLocallyAvailable = useMemo(() => {
    return DownloadFileStore.indexOf(getDownloadfileName(message.fileURL)) !== -1;
  }, [message.fileURL, DownloadFileStore]);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {!isAudioLocallyAvailable ? (
        <AudioDownloadView item={message} TextColor={Colors.light.black} />
      ) : (
        <AudioSlider
          senderProfileUrl={senderImage}
          duration={message.duration}
          topColor={Colors.light.PrimaryColor}
          backgroundColor={Colors.light.White}
          audio={getFileLocationByFilename(message.fileURL)}
          withoutWrapper={withoutWrapper}
        />
      )}
    </View>
  );
}
