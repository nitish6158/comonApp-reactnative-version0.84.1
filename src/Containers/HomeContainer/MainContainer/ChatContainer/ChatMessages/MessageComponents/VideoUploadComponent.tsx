import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import {
  Image as ImageCompress,
  Video as VideoCompress,
  backgroundUpload,
  clearCache,
  createVideoThumbnail,
} from "react-native-compressor";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { singleRoom, singleRoomType } from "@Atoms/singleRoom";

import Colors from "@/Constants/Colors";
import { Conversation } from "@Models/chatmessage";
import DeleteMessageText from "@Util/chatUtils/deleteMessageText";
import FastImage from "@d11/react-native-fast-image";
import MessageCommonWrapper from "./MessageCommonWrapper";
// import RealmContext from "../../../../../../schemas";
import RetryOverlay from "./RetryOverlay";
import Text from "@Components/Text";
import UploadingOverlay from "./UploadingOverlay";
import { useAtom } from "jotai";
import useFileSystem from "@Hooks/useFileSystem";
import { useNetInfo } from "@react-native-community/netinfo";

import { useTranslation } from "react-i18next";
import { useGetUploadSignedUrlLazyQuery } from "@/graphql/generated/room.generated";
import { UdpateChatInput } from "@/graphql/generated/types";
import useUpdateChat from "@/hooks/useUpdateChat";
import { socket } from "@/redux/Reducer/SocketSlice";
import { ChatContext } from "@/Context/ChatProvider";

// const { useRealm, useQuery } = RealmContext;

const { height, width } = Dimensions.get("window");

type props = {
  isVisible: boolean;
  isMessageDeletedForEveryOne: boolean;
  isMessageForwarded: boolean;
  message: Conversation;
  searchText: string;
};

export default function VideoUploadComponent({
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
        searchText={searchText}
        showMessageText={true}
      >
        <VideoComponent message={message} display={display} />
      </MessageCommonWrapper>
    );
  }
}

function VideoComponent({
  message,
  display,
}: {
  message: Conversation;
  display: singleRoomType;
}) {
  // const realm = useRealm();
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setUploading] = useState<boolean>(false);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [retry, setRetry] = useState<boolean>(false);
  const { isConnected } = useNetInfo();

  const { copyFile, donwloadFiles, unlinkFile } = useFileSystem();

  const [getUrl] = useGetUploadSignedUrlLazyQuery();
  const { updateChatMessage } = useUpdateChat();
  const { updateMessage } = useContext(ChatContext);
  const [, setDisplay] = useAtom(singleRoom);

  useEffect(() => {
    if (message.fileURL.startsWith("file:")) {
      if (isConnected) {
        setRetry(false);
        uploadVideo();
      } else {
        setRetry(true);
        createVideoThumbnail(message.fileURL).then((thumbnail) => {
          setThumbnail(thumbnail.path);
        });
      }
    }
  }, [isConnected]);

  return (
    <View style={styles.VideoContainer}>
      <FastImage
        source={{ uri: thumbnail, priority: FastImage.priority.high }}
        style={{ height: "100%", width: "100%" }}
      />
      <UploadingOverlay isVisible={isUploading} progress={progress} />
      <RetryOverlay isVisible={retry} />
    </View>
  );


  async function uploadVideo() {
    let bucketThumbnailUrl = `${display.roomId}/${display.currentUserUtility.user_id
      }/thumbnail/${message.fileURL.slice(-10)}`;
    let bucketVideoUrl = `${display.roomId}/${display.currentUserUtility.user_id
      }/${message.fileURL.slice(-10)}`;
    setUploading(true);
    const thumbnail = await createVideoThumbnail(message.fileURL);
    setThumbnail(thumbnail.path);

    let thumbnailUploadUrl = await getUrl({
      variables: {
        input: {
          path: bucketThumbnailUrl,
          contentType: "image/jpeg",
        },
      },
    });

    if (thumbnailUploadUrl.data?.getUploadSignedUrl.url) {
      backgroundUpload(
        thumbnailUploadUrl?.data?.getUploadSignedUrl.url,
        thumbnail.path,
        { httpMethod: "PUT", headers: { "Content-Type": "image/jpeg" } },
        (written, total) => {
          // console.log("Thumbnail upload", written, total);
        }
      );

      getUrl({
        variables: {
          input: {
            path: bucketVideoUrl,
            contentType: message.type.replace("LOADING/", ""),
          },
        },
      }).then(async (res) => {
        if (res.data?.getUploadSignedUrl.url) {
          try {
            const compressedUrl = await VideoCompress.compress(
              message.fileURL,
              {
                compressionMethod: "auto",
              },
              (progress) => {
                setProgress(progress / 2);
              }
            );

            const headers = {
              "Content-Type": message.type.replace("LOADING/", ""),
            };

            const uploadResult = await backgroundUpload(
              res.data?.getUploadSignedUrl.url,
              compressedUrl,
              { httpMethod: "PUT", headers },
              (written, total) => {
                setProgress(written / (total / 100) / 100 / 2 + 0.47);
              }
            );

            if (uploadResult) {
              copyFile(compressedUrl, bucketVideoUrl);
              setProgress(1);
              const payload: UdpateChatInput = {
                isSent: true,
                data: {
                  _id: message._id.toString(),
                  roomId: message?.roomId,
                  fileURL: bucketVideoUrl,
                  thumbnail: bucketThumbnailUrl,
                  message: message?.message,
                  isForwarded: false,
                  type: "VIDEO",
                  fontStyle: "",
                  duration: 0,
                },
                reply_msg: null,
              };
              updateChatMessage(payload)
                .then((response) => {
                  if (response) {
                    updateMessage(message._id, {
                      type: "media",
                      data: {
                        isSent: true,
                        fileURL: bucketVideoUrl,
                        thumbnail: bucketThumbnailUrl,
                        type: "VIDEO",
                      },
                    });

                    setDisplay((prev) => ({
                      ...prev,
                      totalMedia: prev.totalMedia + 1,
                    }));

                    unlinkFile(thumbnail.path);
                    unlinkFile(compressedUrl);
                  }
                })
                .catch((err) => {
                  console.error(
                    "Error in updating chat message while video uploading",
                    err
                  );
                });
            }
          } catch (error) {
            console.log(error);
          }
        }
      });
    }
  }
}

const styles = StyleSheet.create({
  VideoContainer: {
    backgroundColor: Colors.light.gray,
    borderRadius: 5,
    height: 260,
    marginBottom: 5,
    overflow: "hidden",
    width: 200,
  },
  imageContainer: {
    backgroundColor: Colors.light.gray,
    borderRadius: 15,
    height: 269,
    overflow: "hidden",
    width: 200,
  },
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(51,51,51,.8)",
    height: "100%",
    justifyContent: "center",
    position: "absolute",
    width: "100%",
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
    height: 60,
    justifyContent: "center",
    marginTop: 110,
    position: "absolute",
    width: 60,
  },
});
