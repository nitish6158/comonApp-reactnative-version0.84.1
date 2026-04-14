import * as React from "react";

import { Text, TextStyle, View, Dimensions } from "react-native";

import fonts from "@/Constants/fonts";
import getDownloadfileName from "@Util/GetDownlodedFilename";
import { toNumber } from "lodash";
import useFileSystem from "@Hooks/useFileSystem";
import { useSelector } from "react-redux";
import { TaskData } from "@/graphql/generated/types";
import AnswerQuestionContainer from "./TaskMessageComponents/AnswerQuestionContainer";
import Colors from "@/Constants/Colors";
import { MediaPreview } from "@Components/MediaPreview";
import { TaskVideoPlayer } from "./TaskMessageComponents/TaskVideoPlayer";
import DocumentPreview from "@Components/DocumentPreview";
import AudioDownloadView from "@Components/audioDownloadView";
import AudioSlider from "@Components/AudioPlayer/src/AudioSlider";
import VideoFullScreenPreview from "@Components/VideoPreviewFullScreen";
import { TaskflowTime } from "@Util/date";
import { useMemo } from "react";
import { useAtomValue } from "jotai";
import { currentUserIdAtom } from "@/Atoms";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import { RootState } from "@/redux/Reducer";
import { Image } from "react-native";

export const SingleTaskMessage = ({ item }: { item: TaskData }) => {
  const myProfile = useAtomValue(currentUserIdAtom);
  const { comonContact } = useSelector((state: RootState) => state.Contact);

  const { getFileLocationByFilename, readComonDirectory, donwloadFiles } = useFileSystem();
  const DownloadFileStore = useSelector((state: any) => state.Chat.DownloadFileStore);
  const documentData = { fileURL: item?.resultAttachment?.filename, filename: item?.resultAttachment?.filename };
  const [ImagePreviewVisible, setImagePreviewVisible] = React.useState(false);
  const [ImagePreviewImage, setImagePreviewImage] = React.useState<{ url: string; type: string }>({});
  const closeImageModal = () => {
    setImagePreviewVisible(!ImagePreviewImage);
  };

  const expression =
    item?.type === "RANGE"
      ? item?.resultExp
        ? item?.resultExp?.map((e) => (typeof e === "string" ? JSON.parse(e) : e))
        : null
      : null;

  let rangeType = "";
  // console.log("Express is", expression);
  if (expression && Array.isArray(expression) && expression.length) {
    expression.forEach((e) => {
      rangeType += `${e?.message},`;
    });
    if (rangeType.endsWith(",")) {
      rangeType = rangeType.slice(0, rangeType.length - 1);
    }
  }

  const myTaskData = useMemo(() => {
    if (item?.memberId) {
      return item?.memberId?.user?._id == myProfile?._id;
    } else {
      return true;
    }
  }, []);

  const userName = useMemo(() => {
    if (item?.memberId) {
      const isExist = comonContact.find((cc) => cc.userId?._id == item?.memberId?.user?._id);
      return isExist ? `${isExist.firstName}${isExist.lastName}` : item?.memberId?.user?.phone;
    } else {
      return "";
    }
  }, []);

  const userProfile = useMemo(() => {
    if (item?.memberId) {
      return item?.memberId?.user.profile_img;
    }
  }, []);

  return (
    <View key={item?.edgeId} style={{ paddingHorizontal: 20 }}>
      <AnswerQuestionContainer currentTask={item} />
      <View
        style={{
          alignSelf: myTaskData ? "flex-end" : "flex-start",
          marginVertical: 10,
          backgroundColor: Colors.light.LightBlue,
          maxWidth: 240,
          paddingHorizontal: 15,
          borderRadius: 20,
          paddingVertical: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
          {userProfile && (
            <FastImage
              style={{ height: 30, width: 30, borderRadius: 30, marginRight: 10 }}
              source={{ uri: `${DefaultImageUrl}${item.memberId.user.profile_img}` }}
            />
          )}
          <Text>{myTaskData ? (item?.memberId ? "You" : "") : userName ?? "___"}</Text>
        </View>
        {item?.result && (
          <View style={{}}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                fontFamily: fonts.Lato,
                textAlign: "left",
              }}
            >
              Answer: {item.result}
            </Text>
            {rangeType && (
              <Text
                style={{
                  marginRight: 30,
                  fontSize: 15,
                  fontWeight: "600",
                  fontFamily: fonts.Lato,
                  textAlign: myTaskData ? "right" : "left",
                  paddingBottom: 10,
                }}
              >
                {rangeType}
              </Text>
            )}

            {item?.resultAttachment?.type == "IMAGE" && item.resultAttachment.filename && (
              <View style={{ marginTop: 20 }}>
                <MediaPreview size="xlarge" imageUri={item?.resultAttachment?.filename} renderCloseIcon={false} />
              </View>
            )}

            {item?.resultAttachment?.type == "VIDEO" && item?.resultAttachment?.filename && (
              <>
                <TaskVideoPlayer
                  setImagePreviewImage={setImagePreviewImage}
                  ContainerStyle={{ marginVertical: 20 }}
                  isFullScreen={true}
                  setImagePreviewVisible={() => setImagePreviewVisible(true)}
                  filename={item?.resultAttachment?.filename}
                  key={item.edgeId}
                />
              </>
            )}
            {item?.resultAttachment?.type == "APPLICATION" && item?.resultAttachment?.filename && (
              <View
                style={{
                  alignSelf: myTaskData ? "flex-end" : "flex-start",
                  overflow: "hidden",
                  borderRadius: 5,
                  backgroundColor: Colors.light.LightBlue,
                  marginVertical: 10,
                }}
              >
                <DocumentPreview item={documentData} />
              </View>
            )}

            {item?.resultAttachment?.type == "AUDIO" && item?.resultAttachment?.filename && (
              <View
                style={{
                  alignSelf: myTaskData ? "flex-end" : "flex-start",
                  overflow: "hidden",
                  borderRadius: 5,
                  backgroundColor: Colors.light.LightBlue,
                  marginVertical: 10,
                }}
              >
                {DownloadFileStore.indexOf(getDownloadfileName(item?.resultAttachment?.filename)) == -1 ? (
                  <AudioDownloadView item={documentData} TextColor={Colors.light.black} />
                ) : (
                  <AudioSlider
                    backgroundColor={Colors.light.White}
                    id={item?.resultAttachment?.filename}
                    topColor={Colors.light.PrimaryColor}
                    audio={getFileLocationByFilename(item?.resultAttachment?.filename)}
                  />
                )}
              </View>
            )}
            {item?.signatureAttachment ? (
              <View style={{ alignSelf: "flex-end" }}>
                <Image
                  resizeMode={"contain"}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#eee",
                    marginTop: 10,
                    borderRadius: 8,
                  }}
                  source={{ uri: "data:image/png;base64," + item.signatureAttachment }}
                />
              </View>
            ) : (
              <></>
            )}
            <TaskTime item={item} />
          </View>
        )}

        {!item?.result && item?.resultAttachment?.type == "IMAGE" && item.resultAttachment.filename && (
          <View
            style={{
              marginVertical: 20,
              backgroundColor: Colors.light.LightBlue,
              paddingHorizontal: 10,
              paddingVertical: 10,
              borderRadius: 10,
            }}
          >
            <MediaPreview size="xlarge" imageUri={item?.resultAttachment?.filename} renderCloseIcon={false} />
            {item?.signatureAttachment ? (
              <View style={{ alignSelf: "flex-end" }}>
                <Image
                  resizeMode={"contain"}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#eee",
                    marginTop: 10,
                    borderRadius: 8,
                  }}
                  source={{ uri: "data:image/png;base64," + item.signatureAttachment }}
                />
              </View>
            ) : (
              <></>
            )}
            <TaskTime item={item} />
          </View>
        )}

        {!item?.result && item?.resultAttachment?.type == "VIDEO" && item?.resultAttachment?.filename && (
          <>
            <TaskVideoPlayer
              setImagePreviewImage={setImagePreviewImage}
              ContainerStyle={{ marginVertical: 20 }}
              isFullScreen={true}
              setImagePreviewVisible={() => setImagePreviewVisible(true)}
              filename={item?.resultAttachment?.filename}
              key={item.edgeId}
            />
            {item?.signatureAttachment ? (
              <View style={{ alignSelf: "flex-end" }}>
                <Image
                  resizeMode={"contain"}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#eee",
                    marginTop: 10,
                    borderRadius: 8,
                  }}
                  source={{ uri: "data:image/png;base64," + item.signatureAttachment }}
                />
              </View>
            ) : (
              <></>
            )}
            <TaskTime item={item} />
          </>
        )}
        {!item?.result && item?.resultAttachment?.type == "APPLICATION" && item?.resultAttachment?.filename && (
          <View
            style={{
              alignSelf: myTaskData ? "flex-end" : "flex-start",
              overflow: "hidden",
              borderRadius: 5,
              backgroundColor: Colors.light.LightBlue,
              marginVertical: 10,
            }}
          >
            <DocumentPreview item={documentData} />
            {item?.signatureAttachment ? (
              <View style={{ alignSelf: "flex-end" }}>
                <Image
                  resizeMode={"contain"}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#eee",
                    marginTop: 10,
                    borderRadius: 8,
                  }}
                  source={{ uri: "data:image/png;base64," + item.signatureAttachment }}
                />
              </View>
            ) : (
              <></>
            )}
            <TaskTime item={item} />
          </View>
        )}

        {!item?.result && item?.resultAttachment?.type == "AUDIO" && item?.resultAttachment?.filename && (
          <View
            style={{
              alignSelf: myTaskData ? "flex-end" : "flex-start",
              overflow: "hidden",
              borderRadius: 5,
              backgroundColor: Colors.light.LightBlue,
              marginVertical: 10,
            }}
          >
            {DownloadFileStore.indexOf(getDownloadfileName(item?.resultAttachment?.filename)) == -1 ? (
              <AudioDownloadView item={documentData} TextColor={Colors.light.black} />
            ) : (
              <AudioSlider
                backgroundColor={Colors.light.White}
                id={item?.resultAttachment?.filename}
                topColor={Colors.light.PrimaryColor}
                audio={getFileLocationByFilename(item?.resultAttachment?.filename)}
              />
            )}
            {item?.signatureAttachment ? (
              <View style={{ alignSelf: "flex-end" }}>
                <Image
                  resizeMode={"contain"}
                  style={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#eee",
                    marginTop: 10,
                    borderRadius: 8,
                  }}
                  source={{ uri: "data:image/png;base64," + item.signatureAttachment }}
                />
              </View>
            ) : (
              <></>
            )}
            <TaskTime item={item} />
          </View>
        )}
      </View>
      <VideoFullScreenPreview
        ImagePreviewImage={ImagePreviewImage}
        ImagePreviewVisible={ImagePreviewVisible}
        closeImageModal={closeImageModal}
      />
    </View>
  );
};

export function TaskTime({ item, textStyle }: { item: TaskData; textStyle?: TextStyle }) {
  if (!item) return null;
  if (!textStyle) textStyle = {};

  return (
    <Text
      style={[
        {
          marginTop: 10,
          fontSize: 12,
          fontWeight: "400",
          fontFamily: fonts.Lato,
          textAlign: "right",
          textTransform: "lowercase",
          color: Colors.light.black,
        },
        textStyle,
      ]}
    >
      {TaskflowTime(toNumber(item.taskCompleteTime))}
    </Text>
  );
}
