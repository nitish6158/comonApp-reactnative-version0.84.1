// @ts-nocheck
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Image as ImageCompress,
  backgroundUpload,
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
import Lottie from "lottie-react-native";
import MessageCommonWrapper from "./MessageCommonWrapper";
// import RealmContext from "../../../../../../schemas";
import RetryOverlay from "./RetryOverlay";
import Text from "@Components/Text";
import UploadingOverlay from "./UploadingOverlay";
import { useAtom } from "jotai";
import useFileSystem from "@Hooks/useFileSystem";

import { useNetInfo } from "@react-native-community/netinfo";
import { useTranslation } from "react-i18next";
import useUpdateChat from "@/hooks/useUpdateChat";
import { useGetUploadSignedUrlLazyQuery } from "@/graphql/generated/room.generated";
import { UdpateChatInput } from "@/graphql/generated/types";
// import { BSON, UpdateMode } from "realm";
import { socket } from "@/redux/Reducer/SocketSlice";
import { ChatContext } from "@/Context/ChatProvider";
import { produce } from "immer";
import RNFS from "react-native-fs";
import {
  buildMediaKeyPlaintext,
  encryptFileToTemp,
  encryptMediaKeyForPeer,
  isE2eMediaRoom,
  plainCaptionFromMessage,
  resolveE2ePeerUserId,
  unlinkQuiet,
} from "@/services/e2e/e2eMedia";
import useE2eMediaUri from "@/hooks/useE2eMediaUri";
import { DefaultImageUrl } from "@Service/provider/endpoints";

// const { useRealm, useQuery, useObject } = RealmContext;

const { height, width } = Dimensions.get("window");

function getCompressorInputPath(uri: string) {
  if (!uri) return uri;
  if (!uri.startsWith("file://")) return uri;
  const filePath = uri.replace("file://", "");
  try {
    return decodeURIComponent(filePath);
  } catch {
    return filePath;
  }
}

async function shouldCompressImage(uri: string) {
  const filePath = getCompressorInputPath(uri);
  if (!filePath) return false;
  if (!uri.startsWith("file://")) return true;
  if (Platform.OS === "ios" && filePath.includes("/CoreSimulator/")) {
    return false;
  }
  try {
    return await RNFS.exists(filePath);
  } catch {
    return false;
  }
}

async function canUploadFile(uri: string) {
  if (!uri) return false;
  if (uri.startsWith("http://") || uri.startsWith("https://")) return true;
  const filePath = getCompressorInputPath(uri);
  try {
    return await RNFS.exists(filePath);
  } catch {
    return false;
  }
}

type props = {
  isVisible: boolean;
  isMessageDeletedForEveryOne: boolean;
  isMessageForwarded: boolean;
  message: Conversation;
  searchText: string;
};

export default function ImageUploadComponent({
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
        showForwardBadge={false}
        showStatusRow={false}
      >
        <ImageComponent message={message} display={display} />
      </MessageCommonWrapper>
    );
  }
}
const AnimatedLottieView = Animated.createAnimatedComponent(Lottie);
function ImageComponent({
  message,
  display,
}: {
  message: Conversation;
  display: singleRoomType;
}) {
  // const realm = useRealm();
  const [isUploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const { isConnected } = useNetInfo();
  const [retry, setRetry] = useState<boolean>(false);
  const { updateMessage } = useContext(ChatContext);
  const [, setDisplay] = useAtom(singleRoom);

  const [getUrl] = useGetUploadSignedUrlLazyQuery();
  // const conversation = useObject("conversations", new BSON.ObjectId(message._id));

  const { copyFile, donwloadFiles, unlinkFile } = useFileSystem();

  const { updateChatMessage } = useUpdateChat();
  const e2e = isE2eMediaRoom(display);
  const { uri: e2eUri } = useE2eMediaUri(message, display, { kind: "file" });

  const url = useMemo(() => {
    if (message.fileURL?.startsWith("file:")) return message.fileURL;
    if (e2e && e2eUri) return e2eUri;
    if (message.fileURL && !message.fileURL.startsWith("file:")) {
      return `${DefaultImageUrl}${message.fileURL}`;
    }
    return message.fileURL;
  }, [message.fileURL, e2e, e2eUri]);

  useEffect(() => {
    // console.log("conversation",conversation)
    if (message.fileURL.startsWith("file:")) {
      if (isConnected) {
        setRetry(false);
        uploadImage();
      } else {
        setRetry(true);
      }
    }
  }, [isConnected]);

  return (
    <View style={styles.imageContainer}>
      <FastImage
        source={{ uri: url, priority: FastImage.priority.high }}
        style={{ height: "100%", width: "100%" }}
      />
      <UploadingOverlay isVisible={isUploading} progress={progress} />
      <RetryOverlay isVisible={retry} />
    </View>
  );


  async function uploadImage() {
    setUploading(true);
    let encryptedTemp: string | null = null;
    try {
      const path = `${display.roomId}/${display.currentUserUtility.user_id
        }/${message.fileURL.slice(-10)}`;
      const mimeType = message.type.replace("LOADING/", "");
      const uploadContentType = e2e ? "application/octet-stream" : mimeType;
      const res = await getUrl({
        variables: {
          input: {
            path: path,
            contentType: uploadContentType,
          },
        },
      });
      if (res.error) {
        console.error("Error in getting url", res.error);
      }
      if (res.data?.getUploadSignedUrl.url) {
        let uploadFilePath = message.fileURL;
        const canCompress = await shouldCompressImage(message.fileURL);
        if (canCompress) {
          const compressorInputPath = getCompressorInputPath(message.fileURL);
          uploadFilePath = await ImageCompress.compress(compressorInputPath, {
            compressionMethod: "manual",
            maxWidth: 1000,
            quality: 0.8,
          });
        }

        let plaintextLocalPath = uploadFilePath;
        let encryptedMessage = "";
        let e2eMediaPkg = null;

        if (e2e) {
          const peerUserId = resolveE2ePeerUserId(display);
          if (!peerUserId) {
            console.error("[e2e-media] missing peer for image upload");
            setRetry(true);
            return;
          }
          const enc = await encryptFileToTemp(uploadFilePath, {
            mimeHint: mimeType,
          });
          encryptedTemp = enc.tempPath;
          uploadFilePath = enc.tempPath;
          const caption = plainCaptionFromMessage(message?.message);
          const packageJson = buildMediaKeyPlaintext({
            keyB64: enc.keyB64,
            ivB64: enc.ivB64,
            mime: enc.mimeHint || mimeType,
            caption,
          });
          encryptedMessage = await encryptMediaKeyForPeer(
            peerUserId,
            packageJson
          );
          e2eMediaPkg = {
            t: "media",
            v: 1,
            key: enc.keyB64,
            iv: enc.ivB64,
            mime: enc.mimeHint || mimeType,
            caption,
          };
        }

        const headers = {
          "Content-Type": uploadContentType,
        };
        const isUploadFileReadable = await canUploadFile(uploadFilePath);
        if (!isUploadFileReadable) {
          console.error(
            "Image file missing before upload, skipping native upload call",
            uploadFilePath
          );
          setRetry(true);
          return;
        }

        const uploadResult = await backgroundUpload(
          res.data?.getUploadSignedUrl.url,
          uploadFilePath,
          { httpMethod: "PUT", headers },
          (written, total) => {
            setProgress(written / (total / 100) / 100 - 0.03);
          }
        );
        if (uploadResult) {
          setProgress(1);
          const payload: UdpateChatInput = {
            isSent: true,
            data: {
              _id: message._id,
              type: "IMAGE",
              fileURL: path,
              roomId: message?.roomId,
              isForwarded: false,
              message: e2e ? encryptedMessage : "",
              fontStyle: "",
              thumbnail: "",
              duration: 0,
            },
            reply_msg: null,
          };
          console.log("Payload of document uploaded", payload);
          updateChatMessage(payload)
            .then(() => {
              updateMessage(message._id, {
                type: "media",
                data: {
                  isSent: true,
                  fileURL: path,
                  type: "IMAGE",
                  message: e2e
                    ? e2eMediaPkg?.caption ?? ""
                    : message?.message ?? "",
                  ...(e2e && e2eMediaPkg ? { e2eMedia: e2eMediaPkg } : {}),
                },
              });
              setDisplay((prev) => ({
                ...prev,
                totalMedia: prev.totalMedia + 1
              }));
              // Keep plaintext local copy for sender preview
              copyFile(plaintextLocalPath, path);
            })
            .catch((err) => {
              console.error(
                "Error in updating chat message while sending document",
                err
              );
              setRetry(true);
            });
        } else {
          console.log("else condition uploadImage----->", uploadResult);
          setRetry(true);
        }
        if (plaintextLocalPath !== message.fileURL) {
          unlinkFile(plaintextLocalPath);
        }
      } else {
        console.log(res);
        setRetry(true);
      }
    } catch (err) {
      console.error("Error in uploadImage", err);
      setRetry(true);
    } finally {
      await unlinkQuiet(encryptedTemp);
      setUploading(false);
    }
  }
}

const styles = StyleSheet.create({
  imageContainer: {
    backgroundColor: Colors.light.gray,
    borderRadius: 12,
    height: 245,
    marginBottom: 5,
    overflow: "hidden",
    width: 185,
  },
  overlay: {
    alignItems: "center",
    backgroundColor: "rgba(51,51,51,.5)",
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
  retryContainer: {
    backgroundColor: "rgba(51,51,51,.8)",
    borderRadius: 40,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
});
