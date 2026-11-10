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
import useE2eMediaUri from "@/hooks/useE2eMediaUri";

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
  const display = useAtomValue(singleRoom);
  const { uri: e2eUri, mediaPackage } = useE2eMediaUri(message, display, {
    kind: "file",
  });
  const isE2e = !!(mediaPackage || (message as any)?.e2eMedia);

  const isAudioLocallyAvailable = useMemo(() => {
    return DownloadFileStore.indexOf(getDownloadfileName(message.fileURL)) !== -1;
  }, [message.fileURL, DownloadFileStore]);

  const e2eReady = isE2e && !!e2eUri?.startsWith("file:");
  const canPlay = isAudioLocallyAvailable || e2eReady;
  const audioPath: string = e2eReady && e2eUri
    ? e2eUri
    : getFileLocationByFilename(message.fileURL);

  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      {!canPlay ? (
        isE2e ? (
          <Text style={{ fontSize: 12, color: Colors.light.black }}>🔒</Text>
        ) : (
          <AudioDownloadView item={message} TextColor={Colors.light.black} />
        )
      ) : (
        <AudioSlider
          senderProfileUrl={senderImage}
          duration={message.duration}
          topColor={Colors.light.PrimaryColor}
          backgroundColor={Colors.light.White}
          audio={audioPath}
          withoutWrapper={withoutWrapper}
        />
      )}
    </View>
  );
}
