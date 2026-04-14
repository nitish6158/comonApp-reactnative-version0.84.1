import * as Progress from "react-native-progress";

import DocumentPicker, {
  DocumentPickerResponse,
} from "react-native-document-picker";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { singleRoom, singleRoomType } from "@Atoms/singleRoom";

import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";
import DeleteMessageText from "@Util/chatUtils/deleteMessageText";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MessageCommonWrapper from "./MessageCommonWrapper";
import RNFS from "react-native-fs";
// import RealmContext from "../../../../../../schemas";
import Sound from "react-native-sound";
import { backgroundUpload } from "react-native-compressor";
import { useAtom } from "jotai";
import useFileSystem from "@Hooks/useFileSystem";

import { useTranslation } from "react-i18next";
import {
  getFileName,
  getFileNameFromCachePath,
  replaceAllCharacter,
} from "@Util/helpers/FilePathUtility";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Reducer";
import useUpdateChat from "@/hooks/useUpdateChat";
import { UdpateChatInput } from "@/graphql/generated/types";
import { useGetUploadSignedUrlLazyQuery } from "@/graphql/generated/room.generated";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketManager } from "@/utils/socket/SocketManager";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { ChatContext } from "@/Context/ChatProvider";

// const { useRealm, useQuery } = RealmContext;

type props = {
  isVisible: boolean;
  isMessageDeletedForEveryOne: boolean;
  isMessageForwarded: boolean;
  message: Conversation;
  searchText: string;
};

export default function DocumentUploadComponent({
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
      <Text
        style={{ color: Colors.light.black, fontStyle: "italic", fontSize: 13 }}
      >
        {DeleteMessageText(message, display.currentUserUtility.user_id, t)}
      </Text>
    );
  } else {
    return (
      <MessageCommonWrapper
        isMessageForwarded={isMessageForwarded}
        message={message}
        showMessageText={true}
        searchText={searchText}
      >
        <DocumentUploadPreview message={message} display={display} />
      </MessageCommonWrapper>
    );
  }
}

type DocumentUploadPreviewProps = {
  message: Conversation;
  display: singleRoomType;
};

const getFileTypeFromFileName = (fileName: string) => {
  return fileName.slice(fileName.lastIndexOf(".") + 1);
};

function DocumentUploadPreview({
  message,
  display,
}: DocumentUploadPreviewProps) {
  const [progress, setProgress] = useState<number>(0);
  const [documentSize, setDocumentSize] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const { DownloadFileStore } = useSelector((state: RootState) => state.Chat);
  // const realm = useRealm();
  const [getUrl] = useGetUploadSignedUrlLazyQuery();
  const { copyFile, donwloadFiles } = useFileSystem();
  const [error, setError] = useState<string>("");
  const { isConnected } = useNetInfo();
  const { updateChatMessage } = useUpdateChat();
  const { t } = useTranslation();
  const { updateMessage } = useContext(ChatContext);
  const [, setDisplay] = useAtom(singleRoom);

  const fileType = useMemo(() => {
    return getFileTypeFromFileName(message.fileURL);
  }, [message.fileURL]);

  const fileName = useMemo(() => {
    const name = getFileNameFromCachePath(
      replaceAllCharacter(message.fileURL, " ", "_")
    );
    const isExist = DownloadFileStore.filter((dfs: string) =>
      dfs.includes(name)
    );
    if (isExist.length > 0) {
      return `(${isExist.length + 1})_${name}`;
    } else {
      return name;
    }
  }, [DownloadFileStore]);

  useEffect(() => {
    if (isConnected) {
      setError("");
      uploadDocument(
        message.fileURL,
        message.type.replace("LOADING/DOCUMENT/", ""),
        message.duration
      );
    } else {
      setError(t("others.No internet connection, try again"));
    }
    // if (message.fileURL.startsWith("file:") || message.fileURL.startsWith("content:")) {
    // }
  }, [isConnected]);



  async function uploadDocument(file: string, type: string, durationA: string) {
    console.log("durationA", durationA);
    // console.log(fileName);
    const path = `${display.roomId}/${display.currentUserUtility.user_id}/${fileName}`;

    const fileExist = await RNFS.exists(file);
    let tempType = type;
    if (fileExist) {
      let duration = durationA as number;
      let isDocument = true;
      if (type.includes("audio/")) {
        const sound = new Sound(file, "", (error) => {
          duration = sound.getDuration();
          setDuration(duration);
        });
      }
      if (type.includes("recording/")) {
        tempType = tempType.replace("recording/", "audio/");
        isDocument = false;
      }

      const size = await RNFS.stat(file);
      setDocumentSize(size.size);
      getUrl({
        variables: {
          input: {
            path: path,
            contentType: type,
          },
        },
      }).then(async (res) => {
        if (res.data?.getUploadSignedUrl.url) {
          const headers = {
            "Content-Type": type,
          };

          const uploadResult = await backgroundUpload(
            res.data?.getUploadSignedUrl.url,
            file,
            { httpMethod: "PUT", headers },
            (written, total) => {
              setProgress(written / (total / 100) / 100);
            }
          ).catch((e) => {
            console.log("error", Object.keys(e).length);
            setError(t("others.File have some problem"));
          });

          if (uploadResult) {
            // console.log("duration", parseInt(duration.toPrecision()), typeof duration);
            copyFile(file, path);
            const payload: UdpateChatInput = {
              isSent: true,
              data: {
                _id: message._id,
                type: isDocument ? "DOCUMENT" : "AUDIO",
                fileURL: path,
                roomId: message?.roomId,
                isForwarded: false,
                message: "",
                fontStyle: "",
                thumbnail: "",
                duration: isDocument ? 0 : duration,
              },
              reply_msg: null,
            };
            console.log("Payload of document uploaded", payload);
            updateChatMessage(payload)
              .then((response) => {
                if (response) {
                  updateMessage(message._id, {
                    type: "media",
                    data: {
                      isSent: true,
                      fileURL: path,
                      type: isDocument ? "DOCUMENT" : "AUDIO",
                    },
                  });
                  setDisplay((prev) => ({
                    ...prev,
                    totalMedia: prev.totalMedia + 1,
                  }));
                  // uploadDocumentUpdate(path, isDocument);
                }
              })
              .catch((err) => {
                console.error(
                  "Error in updating chat message while sending document",
                  err
                );
              });
          } else {
            console.log(uploadResult);
          }
        } else {
          setError("Upload url fails");
          if (isConnected) {
          }
        }
      });
    } else {
      setError("File Path does not exist");
    }
  }

  async function reSelectDocument() {
    setError("");
    try {
      const result = await DocumentPicker.pickSingle({
        type: DocumentPicker.types.allFiles,
        copyTo: "documentDirectory",
      });
      if (result) {
        uploadDocument(result.fileCopyUri, result.type, 0);
      }
    } catch (error) {
      uploadDocument(
        message.fileURL,
        message.type.replace("LOADING/DOCUMENT/", ""),
        message.duration
      );
      console.log("Error in document picking", error);
    }
  }

  function secondsToMinutesAndSeconds(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;

    return formattedTime;
  }

  return (
    <View>
      <View style={styles.container}>
        <View style={{ marginRight: 10 }}>
          {error.length > 0 ? (
            <MaterialCommunityIcons
              onPress={() => {
                reSelectDocument();
              }}
              name="pencil-circle-outline"
              size={32}
              color={Colors.light.PrimaryColor}
            />
          ) : (
            <Progress.Circle
              animated={true}
              size={28}
              progress={progress}
              color={Colors.light.PrimaryColor}
              thickness={2}
            />
          )}
        </View>
        <View>
          <Text style={{ color: Colors.light.black, marginBottom: 5 }}>
            {getFileName(fileName)}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {duration > 0 && (
              <Text style={{ fontSize: 12, color: "rgba(51,51,51,.8)" }}>
                {secondsToMinutesAndSeconds(parseInt(duration.toFixed()))}
              </Text>
            )}

            {documentSize > 0 && (
              <Text style={{ fontSize: 12, color: "rgba(51,51,51,.8)" }}>
                {duration > 0 && "•"} {(documentSize / 1024 / 1024).toFixed(2)}{" "}
                mb
              </Text>
            )}

            <Text
              style={{
                fontSize: 12,
                color: "rgba(51,51,51,.8)",
                textTransform: "uppercase",
              }}
            >
              {" "}
              • {fileType}
            </Text>
          </View>
        </View>
      </View>
      {error.length > 0 && (
        <Text style={{ fontSize: 12, marginLeft: 10, color: "red" }}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: Colors.light.LightBlue,
    borderColor: "rgba(51,51,51,.5)",
    borderRadius: 10,
    borderWidth: 0.3,
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 5,
    marginTop: 5,
    minWidth: "90%",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
