import { Text, View } from "react-native";

import Colors from "@/Constants/Colors";
import CountDown from "react-native-countdown-component";

import { ImagePhoto } from "@Types/types";

import React from "react";
import { Scenario, Task } from "@Service/generated/types";
import { TaskVideoPlayer } from "./TaskVideoPlayer";
import getDownloadfileName from "@Util/GetDownlodedFilename";
import useFileSystem from "@Hooks/useFileSystem";
import { useSelector } from "react-redux";
import { MediaPreview } from "@/Components/MediaPreview/MediaPreview";
import AudioDownloadView from "@/Components/audioDownloadView";
import AudioSlider from "@/Components/AudioPlayer/src/AudioSlider";
import DocumentPreview from "@/Components/DocumentPreview";


type TaskQuestionContainerProps = {
  currentTask: Task;
  onfinish: () => void;
  taskDelay: number;
  setTaskDelay: (value: number) => void;
  isExecutable: boolean;
};

export default function TaskQuestionContainer({
  currentTask,
  onfinish,
  taskDelay,
  setTaskDelay,
  isExecutable,
}: Readonly<TaskQuestionContainerProps>) {
  const DownloadFileStore = useSelector((state: any) => state.Chat.DownloadFileStore);
  const handleCountdownFinish = () => {
    setTaskDelay(0);
  };

  const { getFileLocationByFilename } = useFileSystem();
  const documentData = {
    fileURL: currentTask?.attachment?.attachment?.filename,
    filename: currentTask?.attachment?.attachment?.filename,
  };

  const handleTimeout = () => {
    onfinish();
  };

  if (!currentTask) {
    return <></>;
  }

  return (
    <View
      style={{
        paddingHorizontal: 5,
        marginBottom: 15,
        paddingVertical: 5,
      }}
    >
      <Text style={{ fontSize: 18, color: Colors.light.black, fontWeight: "700" }}>{currentTask?.label}</Text>

      <Text style={{ fontSize: 15, color: "rgba(51,51,51,.8)" }}>
        {currentTask?.content}
        {currentTask?.attachment?.attachment?.filename &&
          currentTask?.attachment?.type == ImagePhoto[currentTask?.attachment?.type] && (
            <MediaPreview
              size="xlarge"
              imageUri={currentTask?.attachment?.attachment?.filename}
              renderCloseIcon={false}
            />
          )}
      </Text>
      {currentTask?.attachment !== null && <Text style={{ fontWeight: "700", marginVertical: 10 }}>Attachment</Text>}
      {currentTask?.attachment?.attachment !== null && currentTask?.attachment?.type == "AUDIO" && (
        <View style={{ backgroundColor: Colors.light.White, padding: 5, borderRadius: 6 }}>
          {DownloadFileStore.indexOf(getDownloadfileName(currentTask?.attachment?.attachment?.filename)) == -1 ? (
            <AudioDownloadView item={documentData} TextColor={Colors.light.black} />
          ) : (
            <AudioSlider
              backgroundColor={Colors.light.White}
              id={currentTask?.attachment?.attachment?.filename}
              topColor={Colors.light.PrimaryColor}
              audio={getFileLocationByFilename(currentTask?.attachment?.attachment?.filename)}
            />
          )}
        </View>
      )}

      {currentTask?.attachment &&
        currentTask?.attachment?.type == "VIDEO" &&
        currentTask?.attachment?.attachment?.filename && (
          <>
            <TaskVideoPlayer
              ContainerStyle={{ alignSelf: "center", marginTop: 10 }}
              filename={currentTask?.attachment?.attachment?.filename}
              key={currentTask.scenarioId}
            />
          </>
        )}
      {(currentTask?.attachment?.type == "APPLICATION" || currentTask?.attachment?.type == "DOCUMENT") && (
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

      {taskDelay ? (
        <CountDown
          digitStyle={{ backgroundColor: "#FFF", marginHorizontal: 15 }}
          until={taskDelay}
          timeToShow={["H", "M", "S"]}
          onFinish={handleCountdownFinish}
          size={20}
        />
      ) : (
        <></>
      )}

      {currentTask?.timeout && isExecutable && (
        <CountDown
          digitStyle={{ backgroundColor: "#FFF", marginHorizontal: 15 }}
          timeLabelStyle={{ color: "black", fontSize: 15 }}
          timeToShow={["M", "S"]}
          until={currentTask.timeout / 1000}
          onFinish={() => {
            handleTimeout();
          }}
          size={20}
        />
      )}
    </View>
  );
}
