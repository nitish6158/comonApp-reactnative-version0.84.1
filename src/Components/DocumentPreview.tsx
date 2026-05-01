import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";

import AudioModal from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/SendMoreOptionsModal/AudioModal";

import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";

import Feather from "react-native-vector-icons/Feather";
import FileViewer from "react-native-file-viewer";
import GetExtension from "@Util/getExtensionfromUrl";
import RNFS from "react-native-fs";
import ToastMessage from "@Util/ToastMesage";
import getDownloadfileName from "@Util/GetDownlodedFilename";
import { useDispatch } from "react-redux";
import useFileSystem from "@Hooks/useFileSystem";
import { useTranslation } from "react-i18next";
import FastImage from "@d11/react-native-fast-image";
import { DocIcons } from "@Util/MessageIcons";
import { getFileName, getFileNameFromCachePath } from "@Util/helpers/FilePathUtility";
import { setDownloadFileStore } from "@/redux/Reducer/ChatReducer";
import { useAppSelector } from "@/redux/Store";

export default function DocumentPreview({ item }: { item: Conversation }) {
  const DownloadFileStore = useAppSelector((state) => state.Chat.DownloadFileStore);
  const [isDownLoaded, setIsDownLoaded] = useState(false);
  const [isDownLoading, setIsDownLoading] = useState(false);
  const { t } = useTranslation();
  const Dispatch = useDispatch();
  const [audioVisible, setAudioVisible] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const { getFileLocationByFilename, readComonDirectory } = useFileSystem();

  const resolvedFileUrl = useMemo(() => {
    return item?.fileURL || (item as any)?.file_URL || (item as any)?.url || "";
  }, [item]);

  const fileEndpoint = useMemo(() => {
    return resolvedFileUrl.split("/").pop() || "";
  }, [resolvedFileUrl]);

  const fileType = useMemo(() => {
    return resolvedFileUrl.split(".").pop() || "";
  }, [resolvedFileUrl]);

  const fileNameText = useMemo(() => {
    const filename = resolvedFileUrl.split("/").pop() || "";
    return getFileName(filename);
  }, [resolvedFileUrl]);

  function secondsToMinutesAndSeconds(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

    return formattedTime;
  }

  const isDocumentLocallyAvailable = useMemo(() => {
    return DownloadFileStore.indexOf(getDownloadfileName(fileEndpoint)) !== -1;
  }, [DownloadFileStore, fileEndpoint]);

  const previewDoc = () => {
    if (!fileEndpoint) {
      ToastMessage(t("label.file-not-found"));
      return;
    }
    if ([".mp3", ".m4a"].includes(GetExtension(resolvedFileUrl))) {
      setAudioVisible(true);
      setAudioUrl(getFileLocationByFilename(fileEndpoint));
    } else {
      FileViewer.open(getFileLocationByFilename(fileEndpoint), { showOpenWithDialog: true }).catch(() => {
        ToastMessage(`${t("toastmessage.install-message")} ${GetExtension(resolvedFileUrl)}`);
      });
    }
  };

  const downloadBeforePreview = async () => {
    if (!resolvedFileUrl || !fileEndpoint) {
      ToastMessage(t("label.file-not-found"));
      return;
    }
    if (!isDocumentLocallyAvailable) {
      setIsDownLoading(true);

      const downloadDest = `${RNFS.DocumentDirectoryPath}/comon/${fileEndpoint}`;
      const alldownloadeditemlist = await readComonDirectory();

      const isExist = alldownloadeditemlist?.find((_fileName: any) => _fileName === fileEndpoint);
      if (isExist) return;
      RNFS.downloadFile({
        fromUrl: `https://storage.googleapis.com/comon-bucket/${resolvedFileUrl}`,
        toFile: downloadDest,
      })
        .promise.then(async (r) => {
          const alldownloadeditemlist = await readComonDirectory();
          Dispatch(setDownloadFileStore(alldownloadeditemlist));
          setIsDownLoading(false);
          setIsDownLoaded(true);
          previewDoc();
          // console.log(alldownloadeditemlist);
        })
        .catch((res) => {
          // console.log("dowloadfailed", res, `https://storage.googleapis.com/comon-bucket/${resolvedFileUrl}`);
          setIsDownLoading(false);
          ToastMessage(t("label.file-download-failed"));
        });
    } else {
      previewDoc();
    }
  };

  const textColor = Colors.light.black;

  if (!resolvedFileUrl) {
    return (
      <View
        style={[
          {
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            marginTop: 5,
            marginBottom: 5,
            borderRadius: 10,
            paddingHorizontal: 10,
            minWidth: "70%",
            paddingVertical: 5,
            backgroundColor: Colors.light.LightBlue,
            borderColor: "rgba(51,51,51,.5)",
            borderWidth: 0.3,
          },
        ]}
      >
        <Text style={{ fontSize: 14 }}>File Not Found</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={downloadBeforePreview}
      style={{
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        marginTop: 5,
        marginBottom: 5,
        borderRadius: 10,
        paddingHorizontal: 10,
        minWidth: "90%",
        paddingVertical: 5,
        backgroundColor: Colors.light.LightBlue,
        borderColor: "rgba(51,51,51,.5)",
        borderWidth: 0.3,
      }}
    >
      <View style={{ marginRight: 10 }}>
        {isDocumentLocallyAvailable ? (
          // <FileIcon type={fileType.toUpperCase()} />
          <FileIconView type={fileType} />
        ) : isDownLoading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Feather name="download" size={24} color={textColor} />
        )}
      </View>
      <View>
        <Text style={{ color: textColor, marginBottom: 3 }}>{fileNameText}</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontWeight: "bold", textTransform: "uppercase", color: textColor }}>{fileType}</Text>
          {item.duration > 0 && <Text style={{ fontSize: 12 }}> • {secondsToMinutesAndSeconds(item.duration)}</Text>}
        </View>
      </View>
      <AudioModal
        audioVisible={audioVisible}
        setAudioVisible={() => setAudioVisible(false)}
        url={audioUrl}
        fileName={fileNameText}
      />
    </Pressable>
  );
}

type props = {
  type: string;
};

export function FileIconView({ type }: props) {
  const source = useMemo(() => {
    if (DocIcons[type]) {
      return DocIcons[type];
    } else {
      return DocIcons["other"];
    }
  }, []);
  return <FastImage source={source} style={{ height: 30, width: 25 }} />;
}
