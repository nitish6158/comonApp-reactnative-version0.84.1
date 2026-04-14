import React, { useMemo, useState } from "react";

import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { onAddTaskResultType, useTaskReport } from "@Hooks/useTaskReport";

import { Report } from "@Service/generated/types";
import { Button } from "react-native-elements";
import Colors from "@/Constants/Colors";
import FontAwesome from "react-native-vector-icons/FontAwesome";

import { Task } from "@Service/generated/assigment.generated";

import TaskPermissionView from "./TaskMessageComponents/TaskPermissionView";
import TaskQuestionContainer from "./TaskMessageComponents/TaskQuestionContainer";

import { useAddTaskResultMutation } from "@Service/generated/report.generated";
import { useTranslation } from "react-i18next";

import { TaskPermissionContainer } from "./TaskMessageComponents/TaskPermissionContainer";
import { TaskOptionsView } from "@/Containers/HomeContainer/MainContainer/TaskContainer/AssignmentsContainer/Assignments/TaskMessageComponents/TaskOptionsView";
import { activeReportAtom, activeScenarioAtom } from "@/Atoms/AssignmentAtom";
import { useAtomValue, useSetAtom } from "jotai";
import { currentUserIdAtom } from "@/Atoms";
import DigitalSignature from "@Components/DigitalSignature";

type TaskListProps = {
  currentReport: Report;
};

export function CurrentTaskView({ currentReport }: TaskListProps) {
  
  const [modalVisible, setModalVisible] = useState(false);
  
  const MyProfile = useAtomValue(currentUserIdAtom);
  const { t } = useTranslation();

  const {
    CurrentTask,
    onCompeleteReport,
    isExecutable,
    taskDelay,
    setTaskDelay,
    setCurrentTask,
    onAddTaskResult,
    addTaskResponse,
    completeReportResponse,
    uploadFileLoading,
    gettingCurrentLocation,
  } = useTaskReport();

  const IsActiveMember = useMemo(() => {
    if (!CurrentTask?.assignTo?.length) return true;
    const findMySelf = CurrentTask.assignTo.find((e) => e?.user?._id == MyProfile?._id);
    if (findMySelf) return true;
    return false;
  }, [CurrentTask]);

  const isApproved = useMemo(() => {
    return currentReport?.tasksData?.[currentReport?.tasksData.length - 1]?.isApproved;
  }, [currentReport?.tasksData]);

  return addTaskResponse.loading || completeReportResponse || uploadFileLoading || gettingCurrentLocation ? (
    <View
      style={{
        justifyContent: "center",
        marginBottom: 30,
        backgroundColor: !currentReport ? "white" : Colors.light.LightBlue,
        marginHorizontal: 20,
        height: 80,
        minWidth: 250,
        alignSelf: "flex-end",
        borderRadius: 15,
        alignItems: "center",
      }}
    >
      {uploadFileLoading && <Text>{t("uploading")}...</Text>}
      {gettingCurrentLocation && (
        <View style={{ paddingHorizontal: 20, paddingVertical: 3 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ActivityIndicator />
            <Text style={{ marginLeft: 5 }}>{t("checkingCurrentLocation")}... </Text>
          </View>

          <Text style={{ fontSize: 12, maxWidth: 250 }}>{t("takeSomeTime")}</Text>
        </View>
      )}
      {addTaskResponse.loading && <Text>{t("submittingAnswer")}...</Text>}
      {completeReportResponse && <Text>{t("submittingReport")}...</Text>}
    </View>
  ) : (
    <View
      style={{
        justifyContent: "flex-end",
        paddingTop: -100,
        paddingBottom: 30,
        backgroundColor: !currentReport ? "white" : Colors.light.LightBlue,
        paddingHorizontal: 20,
      }}
    >
      <TaskQuestionContainer
        taskDelay={taskDelay}
        setTaskDelay={setTaskDelay}
        currentTask={CurrentTask}
        onAddTaskResult={onAddTaskResult}
        onfinish={() => onTimeout()}
        isExecutable={isExecutable}
      />

      {CurrentTask?.timeout && isExecutable && (
        <TaskPermissionView
          message={t("task.time-Out")}
          icon={<FontAwesome name="clock-o" size={20} color={Colors.light.black} style={{ marginLeft: -10 }} />}
        />
      )}

      {taskDelay !== 0 && (
        <TaskPermissionView
          message={t("task.delay")}
          icon={<FontAwesome name="clock-o" size={20} color={Colors.light.black} style={{ marginLeft: -10 }} />}
        />
      )}

      {!taskDelay ? (
        <TaskOptionsSection
          IsActiveMember={IsActiveMember}
          isExecutable={isExecutable}
          isApproved={isApproved}
          currentAssignmentTask={CurrentTask}
          onCurrentTaskAnswered={(edge, task, option, file, userLocationRequired, signature) => {
            onAddTaskResult(edge, task, option, file, userLocationRequired, signature);
          }}
          isCompleteAssignmentVisible={
            CurrentTask?.type === 'OUTPUT'
          }
          onCompleteAssignmentPressed={() => {
            if (CurrentTask?.signature) {
              setModalVisible(true);
              return;
            }
            onCompeleteReport();
          }}
          t={t}
        />
      ) : (
        <></>
      )}
      <DigitalSignature
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onPressSave={(image) => {
          setModalVisible(!modalVisible);
          onCompeleteReport(image);
        }}
      />
    </View>
  );

  // async function AddTaskResult(edge: any, task: any, options: any) {
  //   try {
  //     setLoading(true);

  //     const convertedOptions = options ? options.toString() : undefined;
  //     const reportId = currentReport._id;

  //     const input: AddTaskResultDto = {
  //       reportId,
  //       label: task.label!,
  //       content: task.content!,
  //       result: convertedOptions || edge.label!,
  //       type: task.type!,
  //       edgeId: edge._id,
  //       attachmentId: undefined,
  //       targetTaskId: edge.targetTaskID,
  //     };

  //     const res = await TaskResult({ variables: { input } });
  //     if (res.data?.addTaskResult) {
  //       setLoading(false);
  //       const targetId =
  //         res?.data?.addTaskResult?.tasksData[res?.data?.addTaskResult?.tasksData?.length - 1]?.targetTaskId;

  //       const task = activeScenario?.tasks?.find((item: any) => item?._id === targetId);

  //       setCurrentTask(task);
  //       setCurrentReport(res?.data?.addTaskResult);
  //     }
  //     setLoading(false);
  //   } catch (error) {
  //     console.log(error);
  //     setLoading(false);
  //   }
  // }
  function onTimeout() {
    const edge = CurrentTask?.edges?.find((e) => e?.type == "TIMEOUT");
    onAddTaskResult(edge, CurrentTask, "", undefined, edge?.location);
  }
}

const styles = StyleSheet.create({
  labelContainer: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(51,51,51,.1)",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: 350,
  },
});

type TaskOptionsSectionProps = {
  IsActiveMember: boolean;
  isExecutable: boolean;
  isApproved: boolean | null;
  currentAssignmentTask: Task;
  onCurrentTaskAnswered: onAddTaskResultType;
  isCompleteAssignmentVisible: boolean;
  onCompleteAssignmentPressed: () => void;
  t: any;
};

function TaskOptionsSection({
  IsActiveMember,
  isExecutable,
  isApproved,
  currentAssignmentTask,
  onCurrentTaskAnswered,
  isCompleteAssignmentVisible,
  onCompleteAssignmentPressed,
  t,
}: Readonly<TaskOptionsSectionProps>) {

  // console.log("isCompleteAssignmentVisible",isCompleteAssignmentVisible)

  if (!isExecutable) {
    return (
      <View style={styles.labelContainer}>
        <Text> {t("task.not-assign")} </Text>
      </View>
    );
  } else if (!IsActiveMember) {
    return (
      <View style={styles.labelContainer}>
        <Text>{t("task.you-are-not-active-user")}</Text>
      </View>
    );
  } else if (isApproved == false) {
    return (
      <View style={styles.labelContainer}>
        <Text>{t("task.admin-approval")}</Text>
      </View>
    );
  } else if (isCompleteAssignmentVisible) {
    return (
      <Button
        buttonStyle={{ height: 45, borderRadius: 20, width: 300, alignSelf: "center" }}
        loading={false}
        containerStyle={{ flex: 1, paddingBottom: 10 }}
        onPress={onCompleteAssignmentPressed}
        title={t("btn.complete-report")}
      />
    );
  } else {
    return (
      <TaskPermissionContainer>
        <TaskOptionsView
          currentTask={currentAssignmentTask}
          onAddTaskResult={onCurrentTaskAnswered}
          addTaskLoading={false}
        />
      </TaskPermissionContainer>
    );
  }
}
