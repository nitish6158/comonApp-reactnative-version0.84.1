import React, { SetStateAction, useState } from "react";
import { Task, Text, View } from "react-native";

import Colors from "@/Constants/Colors";
import { ImagePhoto } from "@Types/types";
import { Report, TaskData } from "@Service/generated/types";
import { TaskVideoPlayer } from "./TaskVideoPlayer";
import getDownloadfileName from "@Util/GetDownlodedFilename";
import useFileSystem from "@Hooks/useFileSystem";
import { useSelector } from "react-redux";
import AsssignmentSmallImage from "@/Components/asssignmentSmallImage";
import { MediaPreview } from "@/Components/MediaPreview/MediaPreview";
import AudioDownloadView from "@/Components/audioDownloadView";
import AudioSlider from "@/Components/AudioPlayer/src/AudioSlider";
import DocumentPreview from "@/Components/DocumentPreview";
import VideoFullScreenPreview from "@/Components/VideoPreviewFullScreen";
import { TaskTime } from "../SingleTaskMessage";

export default function AnswerQuestionContainer({ currentTask }: { currentTask: TaskData }) {
  // console.log(  TaskflowTime(toNumber(currentTask.taskStartTime)));

  const DownloadFileStore = useSelector((state: any) => state.Chat.DownloadFileStore);
  const [ImagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [ImagePreviewImage, setImagePreviewImage] = useState<SetStateAction<{ url: string; type: string }>>({});
  const closeImageModal = () => {
    setImagePreviewVisible(!ImagePreviewImage);
  };
  const { getFileLocationByFilename, readComonDirectory, donwloadFiles } = useFileSystem();
  const documentData = { fileURL: currentTask?.attachment?.filename, filename: currentTask?.attachment?.filename };

  return (
    <View style={{ flexDirection: "row" }}>
      <View
        style={{
          backgroundColor: Colors.light.White,
          alignSelf: "flex-start",
        }}
      >
        <AsssignmentSmallImage />

        <View
          style={{
            backgroundColor: Colors.light.PrimaryColor,
            maxWidth: 240,
            paddingHorizontal: 15,
            paddingVertical: 7,
            marginBottom: 30,
            borderRadius: 10,
            borderTopLeftRadius: 0,
          }}
        >
          <Text style={{ fontSize: 17, color: Colors.light.White }}>{currentTask?.label}</Text>
          <View style={{ height: 1, backgroundColor: Colors.light.White, marginVertical: 5 }} />
          <Text style={{ fontSize: 17, color: Colors.light.White }}>
            {currentTask?.content}
            {currentTask?.attachment && currentTask?.attachment?.type == ImagePhoto[currentTask?.attachment?.type] && (
              <View>
                <MediaPreview size="xlarge" imageUri={currentTask?.attachment?.filename} renderCloseIcon={false} />
              </View>
            )}
          </Text>
          {currentTask?.attachment && currentTask.attachment.type == "AUDIO" && (
            <View style={{ backgroundColor: Colors.light.White, padding: 5, borderRadius: 6 }}>
              {DownloadFileStore.indexOf(getDownloadfileName(currentTask?.attachment?.filename)) == -1 ? (
                <AudioDownloadView item={documentData} TextColor={Colors.light.black} />
              ) : (
                <AudioSlider
                  backgroundColor={Colors.light.White}
                  id={currentTask?.attachment.filename}
                  topColor={Colors.light.PrimaryColor}
                  audio={getFileLocationByFilename(currentTask?.attachment?.filename)}
                />
              )}
            </View>
          )}

          {currentTask?.attachment && currentTask.attachment?.type == "VIDEO" && currentTask?.attachment?.filename && (
            <>
              <TaskVideoPlayer
                isFullScreen={true}
                setImagePreviewImage={setImagePreviewImage}
                setImagePreviewVisible={() => setImagePreviewVisible(true)}
                ContainerStyle={{ alignSelf: "center", marginTop: 10 }}
                filename={currentTask?.attachment?.filename}
                key={currentTask.scenarioId}
              />
            </>
          )}
          {currentTask?.attachment?.type == "APPLICATION" && (
            <View
              style={{
                alignSelf: "flex-end",
                overflow: "hidden",
                borderRadius: 5,
                backgroundColor: Colors.light.LightBlue,
                marginVertical: 10,
              }}
            >
              <DocumentPreview item={documentData} />
            </View>
          )}
          <VideoFullScreenPreview
            ImagePreviewImage={ImagePreviewImage}
            ImagePreviewVisible={ImagePreviewVisible}
            closeImageModal={closeImageModal}
          />
          <TaskTime item={currentTask} textStyle={{ textAlign: "right", marginTop: 20, color: Colors.light.White }} />
        </View>
      </View>
    </View>
  );
}
