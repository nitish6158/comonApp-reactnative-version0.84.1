import React, { useState, useEffect } from "react";

import { Edge, Task, TaskTypes } from "@Service/generated/types";
import { Dimensions, Image, Modal, StyleSheet, View } from "react-native";

import AudioRecording from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/AudioRecording";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import { TaskOptionButton } from "./TaskOptionButton";
import { TaskDefaultLoadingButton } from "@Components/TaskDefaultLoadingButton";
import TaskPermissionView from "./TaskPermissionView";

import { onAddTaskResultType } from "@Hooks/useTaskReport";
import { t } from "i18next";
import { windowWidth } from "../../../../../../../utils/ResponsiveView";

import { MultiSelect } from "./MultiSelect";
import { RadioSelect } from "./RadioSelect";
import { RangeSelect } from "./RangeSelect";
import AttachFile from "./AttachFile";
import { TaskInput } from "./TaskInput";
import DigitalSignature from "@Components/DigitalSignature";

let previousTask = {};

type TaskOptionsViewProps = {
  currentTask: Task | null;
  onAddTaskResult: onAddTaskResultType;
  addTaskLoading: boolean;
};

const { width, height } = Dimensions.get("screen");
export function TaskOptionsView({ currentTask, onAddTaskResult, addTaskLoading }: TaskOptionsViewProps) {
  const [selected, setSelected] = useState({});
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [signature, setSignature] = useState("");
  const [showMessage, setShowMessage] = React.useState(false);
  const [media, setMedia] = React.useState();
  const otherParams = React.useRef(null);

  useEffect(() => {
    if (currentTask) {
      if (JSON.stringify(currentTask) !== JSON.stringify(previousTask)) {
        setShowMessage(false);
        setSelectedEdge(null);
        setSignature("");
        previousTask = currentTask;
      }
    }
  }, [currentTask]);

  
  return (
    <View style={{ width: width - 40 }}>
      {currentTask?.edges.map((edge, index) => {
     
        switch (currentTask?.type) {
          case TaskTypes.Checkbox:
            return edge.type == "TIMEOUT" ? (
              <></>
            ) : (
              <MultiSelect
                key={index}
                edge={edge}
                taskDelay={0}
                task={currentTask}
                addTaskLoading={false}
                onAddTaskResult={onAddTaskResult}
              />
            );
          case TaskTypes.SelectOne:
            return !addTaskLoading ? (
              edge.type == "TIMEOUT" ? (
                <></>
              ) : (
                <>
                  <View key={index}>
                    <TaskOptionButton
                      key={edge._id}
                      onPressTaskButton={() => {
                        if (edge?.signature && signature.length == 0) {
                          setModalVisible(!modalVisible);
                        }
                        if (edge.media == null && !edge.location && !edge?.signature) {
                          // console.log("edge", edge);
                          onAddTaskResult(edge, currentTask, undefined, undefined);
                        } else {
                          if (edge?.location && !edge?.media && !edge?.signature) {
                            setSelectedEdge(edge);
                            if (selectedEdge) onAddTaskResult(edge, currentTask, undefined, undefined, edge?.location);
                            return;
                          } else {
                            setSelectedEdge(edge);
                          }
                        }
                      }}
                      isSelected={edge._id == selectedEdge?._id}
                      subtype={currentTask.subType ?? null}
                      edgeLabel={edge.label ?? ""}
                    />
                  </View>
                </>
              )
            ) : (
              <View key={index}>
                {showMessage && (
                  <View style={{ width: windowWidth - 40 }}>
                    <TaskPermissionView
                      message={t("task.useLocation")}
                      icon={<FontAwesome name="map-marker" size={24} color="gray" />}
                    />
                  </View>
                )}
                <TaskDefaultLoadingButton />
              </View>
            );

          case TaskTypes.Radio:
            return edge.type == "TIMEOUT" ? (
              <></>
            ) : (
              <RadioSelect
                key={index}
                edge={edge}
                addTaskLoading={addTaskLoading}
                task={currentTask}
                onAddTaskResult={onAddTaskResult}
              />
            );

          case TaskTypes.Range:
            return edge.type == "TIMEOUT" ? (
              <></>
            ) : (
              <RangeSelect
                key={index}
                edge={edge}
                addTaskLoading={addTaskLoading}
                task={currentTask}
                onAddTaskResult={onAddTaskResult}
              />
            );

          case TaskTypes.TextInput:
            return edge.type == "TIMEOUT" ? (
              <></>
            ) : (
              <TaskInput
                key={index}
                edge={edge}
                addTaskLoading={addTaskLoading}
                task={currentTask}
                onAddTaskResult={onAddTaskResult}
              />
            );
          case TaskTypes.NumberInput:
            return edge.type == "TIMEOUT" ? (
              <></>
            ) : (
              <TaskInput
                key={index}
                edge={edge}
                addTaskLoading={addTaskLoading}
                task={currentTask}
                onAddTaskResult={onAddTaskResult}
              />
            );

          case TaskTypes.MediaUpload: {
            if (currentTask?.mediaType == "RECORD") {
              return !addTaskLoading ? (
                <View key={index}>
                  <TaskPermissionView message={t("task.useMic")} icon={<FontAwesome name="microphone" />} />
                  <AudioRecording
                    task={currentTask}
                    addTaskLoading={addTaskLoading}
                    edge={edge}
                    onAddTaskResult={onAddTaskResult}
                    autoStart={false}
                    onpressCancel={() => {
                      // setAudioRecordVisible(false);
                    }}
                    containerStyle={styleSheet.audioContainer}
                  />
                </View>
              ) : (
                <TaskDefaultLoadingButton />
              );
            } else {
              return edge.type == "TIMEOUT" ? (
                <></>
              ) : (
                <View style={{ marginHorizontal: 25 }} key={index}>
                  <AttachFile
                    task={currentTask}
                    addTaskLoading={addTaskLoading}
                    edge={edge}
                    onAddTaskResult={onAddTaskResult}
                  />
                </View>
              );
            }
          }
          default:
            return null;
        }
      })}

      <View style={{ marginHorizontal: 20 }}>
      {signature ? (
          <View style={{ alignItems: "center" }}>
            <Image
              resizeMode={"contain"}
              style={{
                width: windowWidth - 100,
                height: 110,
                backgroundColor: "#eee",
                marginTop: 10,
                borderRadius: 20,
              }}
              source={{ uri: "data:image/png;base64," + signature }}
            />
          </View>
        ) : null}
        {selectedEdge && selectedEdge?.media && (
          <AttachFile
            isSignatureDone={signature}
            task={{ mediaType: selectedEdge?.media }}
            addTaskLoading={addTaskLoading}
            edge={selectedEdge}
            onAddTaskResult={(edge, currentTask, undefined, file) => {
              onAddTaskResult(selectedEdge, currentTask, undefined, file, selectedEdge.location, signature);
            }}
          />
        )}

        {selectedEdge && selectedEdge.location && (
          <View style={{ width: windowWidth - 40 }}>
            <TaskPermissionView
              message={t("task.useLocation")}
              icon={<FontAwesome name="map-marker" size={24} color="gray" />}
            />
          </View>
        )}
        
        {selectedEdge?.signature && (
          <DigitalSignature
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            onPressSave={(image) => {
              if (!selectedEdge?.media) {
                onAddTaskResult(selectedEdge, currentTask, undefined, undefined, selectedEdge?.location, image);
              } else {
                setSignature(image);
              }
              setModalVisible(!modalVisible);
            }}
          />
        )}
      </View>
    </View>
  );
}
const styleSheet = StyleSheet.create({
  audioContainer: {
    borderRadius: 5,
    elevation: 5,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },

    shadowOpacity: 0.36,
    shadowRadius: 6.68,

    width: "100%",
  },
});
