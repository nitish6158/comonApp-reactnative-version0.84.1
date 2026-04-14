import React, { useEffect, useState } from "react";
import { Task } from "@Service/generated/types";
import { useStartTaskMutation, useUploadFileMutation } from "@Service/generated/task.generated";

import {
  useAddTaskResultMutation,
  useCompleteReportMutation,
  useMyReportsLazyQuery,
} from "@Service/generated/report.generated";
import { useDispatch } from "react-redux";

import { Asset } from "react-native-image-picker";
import { Edge } from "react-native-safe-area-context";
import { TaskDetailsFragment } from "@Service/generated/fragments.generated";
import { assignmentsType } from "@/redux/constants";
import { generateRNFile } from "@Util/chatUtils/generateRNFile";
import { navigate } from "../navigation/utility";
import { useMyAssignmentsLazyQuery } from "@Service/generated/assigment.generated";
import { useOrganizations } from "./useOrganization";
import { CurrentActiveOrganization, MyReportAtom } from "@/Atoms/taskAtom";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { currentUserIdAtom } from "@/Atoms";
import { activeAssignmentAtom, activeReportAtom, activeScenarioAtom } from "@/Atoms/AssignmentAtom";
import { whoosh } from "@Util/helpers/SendChatHelper";
import ToastMessage from "@Util/ToastMesage";
import { DocumentPickerResponse } from "react-native-document-picker";
import { setAssignments } from "@/redux/Reducer/OrganisationsReducer";
import useAdvanceNavigation from "./useAdvanceNavigation";
import { useTranslation } from "react-i18next";
import { requestLastKnownLocation } from "@/utils/permission/requestLocation";

export type onAddTaskResultType = (
  edge: Edge,
  task: TaskDetailsFragment,
  options?: string[],
  file?: Asset,
  userLocationRequired?: boolean,
  signature?: string
) => void;

let previousStartId: Array<{ reportId: string; taskId: string }> = [];

const useTaskReport = () => {
  const activeAssignment = useAtomValue(activeAssignmentAtom);
  const { replaceWithScreen } = useAdvanceNavigation();
  const [activeScenario] = useAtom(activeScenarioAtom);
  const [activeReport, setActiveReport] = useAtom(activeReportAtom);
  const [uploadFile, { loading: uploadFileLoading }] = useUploadFileMutation();
  const Dispatch = useDispatch();
  const [startTask] = useStartTaskMutation();
  const [addTaskResultRequest, addTaskResponse] = useAddTaskResultMutation();
  const [completeReport] = useCompleteReportMutation();
  const [completeReportResponse, setCompleteReportResponse] = useState(false);
  const [gettingCurrentLocation, setGettingCurrentLocation] = useState<boolean>(false);
  const { t } = useTranslation();
  const { currentOrganization } = useOrganizations();
  const [fetchMyReport] = useMyReportsLazyQuery();
  const setMyReports = useSetAtom(MyReportAtom);

  const [isExecutable, setIsExecutable] = useState(true);
  const [requestAssignment, responseAssignment] = useMyAssignmentsLazyQuery({
    fetchPolicy: "no-cache",
  });

  const [CurrentTask, setCurrentTask] = React.useState<Task | null>(null);
  const [taskDelay, setTaskDelay] = React.useState<number | null | undefined>(0);
  const [loader, setLoader] = useState(false);

  const me = useAtomValue(currentUserIdAtom);
  const [addTaskLoading, setaddTaskLoading] = useState(false);

  useEffect(() => {
    const setupTaskForEmptyReport = () => {
      let localTasks = [...activeScenario?.tasks] as Task[];
      const findTask = localTasks.reverse().find((e) => e.type === "INPUT");
      const targetTaskId = findTask?.edges[0].targetTaskID;
      const task = localTasks.find((item) => item?._id === targetTaskId);
      const executable = task?.assignTo?.find((item) => item?.user?._id === me?._id);
      if (executable?.user?._id === me?._id || task?.assignTo?.length == 0) {
        setIsExecutable(true);
      } else {
        setIsExecutable(false);
      }
      setCurrentTask(task);
      // onStartTask(activeReport?._id, activeScenario?.tasks[0]?._id);
      // onStartTask(activeReport?._id, targetTaskId);
    };

    const setupTaskForNonEmptyReport = () => {
      let localTasks = [...activeScenario?.tasks] as Task[];
      const targetTaskId = activeReport?.tasksData[activeReport?.tasksData.length - 1]?.targetTaskId;
      const task = localTasks.find((item) => item?._id === targetTaskId);

      const executable = task?.assignTo?.find((item) => item?.user?._id === me?._id);
      if (task) {
        const previousIndex = localTasks.findIndex((item) => item?._id === targetTaskId) - 1;
        if (localTasks[previousIndex]?.nextPrompt?.time) {
          const taskData = activeReport?.tasksData.find((e) => e.taskId == localTasks[previousIndex]._id);
          if (taskData) {
            const timeToSet = Date.now() - taskData?.taskCompleteTime;
            const newTime = localTasks[previousIndex]?.nextPrompt?.time * 1000 - timeToSet;
            if (newTime > 0) {
              setTaskDelay(Math.ceil(newTime / 1000));
            }
          }
        }
      }

      setCurrentTask(task);

      if (executable?.user?._id === me?._id || task?.assignTo?.length == 0) {
        setIsExecutable(true);
      } else {
        setIsExecutable(false);
      }
    };

    const setupTask = () => {
      if (!activeReport?._id) return;

      if (activeScenario?.tasks && activeReport?.tasksData?.length === 0) {
        setupTaskForEmptyReport();
      } else if (activeReport) {
        setupTaskForNonEmptyReport();
      }
    };

    setupTask();
  }, [activeScenario?.tasks, activeReport, activeAssignment?._id, me]);

  async function onStartTask(reportId: string, taskId: string) {
    try {
      const isDataAlreadyTriggered = previousStartId.some((e) => e?.taskId === taskId && e?.reportId === reportId);

      if (!isDataAlreadyTriggered) {
        previousStartId.push({
          reportId,
          taskId,
        });

        console.log("Start task", previousStartId);

        await startTask({
          variables: {
            input: {
              taskId,
              reportId,
            },
          },
        });
      }
    } catch (error) {
      handleStartTaskError(error);
    }
  }

  async function onCompleteReport(signature?: string) {
    try {
      setCompleteReportResponse(true);

      await completeReport({
        variables: {
          input: { _id: activeReport?._id, signature: signature ?? "", orgId: activeAssignment?.organizationId },
        },
      });

      await fetchAllAssignment();

      const myReportsResponse = await fetchMyReport({
        variables: { input: { skip: 0, limit: 50, masterOrg: global?.activeOrg ?? "" } },
      });

      const refetchReports = await myReportsResponse.refetch();

      if (refetchReports.data?.myReports?.data?.length) {
        setMyReports(refetchReports.data.myReports.data);
      }

      setCompleteReportResponse(false);
      ToastMessage(t("label.assignment-completed"));
      replaceWithScreen(
        {
          name: "ReportScreen",
          params: {
            reportId: activeReport?._id,
          },
        },
        ["AssignmentChatScreen"]
      );

      setActiveReport(null);
      setCurrentTask(null);
    } catch (error) {
      console.log("Error ", JSON.stringify(error));
      handleCompleteReportError(error);
    }
  }

  async function refreshAssignment(pullToRefreshRequired?: boolean) {
    if (!currentOrganization?._id) {
      return;
    }

    if (pullToRefreshRequired) setLoader(true);

    try {
      console.log("global.activeOrg", global.activeOrg);
      const assignmentResponse = await requestAssignment({
        variables: {
          input: {
            organizationId: global.activeOrg,
            skip: 0,
            limit: 1000,
          },
        },
      });

      Dispatch(setAssignments(assignmentResponse.data?.myAssignments.data));
      if (pullToRefreshRequired) setLoader(false);
    } catch (error) {
      handleRequestAssignmentError(error);
    }
  }

  async function onAddTaskResult(
    edge: Edge,
    task: Task,
    options: string,
    file: { assets: Asset[] } | Asset | undefined | DocumentPickerResponse,
    userLocationRequired?: boolean,
    signature?: string
  ) {
    try {
      const { latitude, longitude } = await getUserLocation(userLocationRequired);

      const convertedOptions = convertOptionsToString(options);

      const RNFile = file ? getRNFile(file) : false;
      // console.log("RNFile", RNFile);

      let uploadedAttachment = RNFile
        ? await uploadFile({
            variables: { file: RNFile, input: { orgId: activeAssignment?.organizationId, attachments: false } },
          })
        : null;

      // console.log(uploadedAttachment)

      const input = {
        reportId: activeReport?._id,
        label: CurrentTask?.label,
        content: CurrentTask?.content!,
        result: convertedOptions || edge.label!,
        type: CurrentTask?.type,
        edgeId: edge._id,
        taskId: CurrentTask?._id,
        attachmentId: CurrentTask?.attachment?.attachment?._id ?? null,
        resultAttachment: uploadedAttachment?.data?.uploadFile._id,
        signatureAttachment: signature ? signature : "",
        targetTaskId: edge?.targetTaskID,
        lat: latitude?.toString() || null,
        long: longitude?.toString() || null,
        orgId: activeAssignment?.organizationId,
      };

      // console.log("Input is ", JSON.stringify(input));

      const res = await addTaskResultRequest({ variables: { input } });

      handleAddTaskResultSuccess(res);
    } catch (error) {
      handleAddTaskResultError(error);
      console.log(error);
    }
  }

  async function getUserLocation(userLocationRequired?: boolean) {
    try {
      if (userLocationRequired) {
        setGettingCurrentLocation(true);

        const lastLocation = await requestLastKnownLocation();
        console.log("lastLocation", lastLocation);
        if (lastLocation?.coords) {
          setGettingCurrentLocation(false);
          return lastLocation?.coords;
        } else {
          const liveLocation = await requestLastKnownLocation();
          console.log("liveLocation", liveLocation);
          setGettingCurrentLocation(false);
          return liveLocation?.coords;
        }
      }
      return { latitude: null, longitude: null };
    } catch (error) {
      console.error("Error in getting user locaiton", error);
      setGettingCurrentLocation(false);
      return { latitude: null, longitude: null };
    }
  }

  async function uploadFileRequest(file: any) {
    return await uploadFile({
      variables: { file: file, input: { orgId: activeAssignment?.organizationId, attachments: false } },
    });
  }

  function fetchAllAssignment(id?: string) {
    return new Promise((resolve, reject) => {
      requestAssignment({
        variables: {
          input: {
            organizationId: id ?? currentOrganization?._id!,
            skip: 0,
            limit: 50,
          },
        },
      })
        .then((res) => {
          Dispatch(setAssignments(res.data?.myAssignments.data));
          return resolve(res);
        })
        .catch((err) => {
          Dispatch(setAssignments([]));
          console.error(err);
          alert("something went wrong");
          return reject(err);
        });
    });
  }

  function convertOptionsToString(options: string | object | undefined) {
    return options ? (typeof options === "object" ? JSON.stringify(options) : options.toString()) : undefined;
  }

  function getRNFile(file: { assets: Asset[] } | Asset) {
    if (file.assets?.[0] !== undefined) {
      const fileStructure = { name: file?.assets[0].fileName, uri: file.assets[0].uri };
      console.log("File structure is", fileStructure);
      return fileStructure.uri ? generateRNFile(fileStructure) : undefined;
    } else {
      return file?.uri ? generateRNFile({ name: file?.fileName, uri: file?.uri }) : undefined;
    }
  }

  function handleAddTaskResultSuccess(res: any) {
    try {
    } catch (error) {
      console.log("Error in handleAddTaskResultSuccess", error);
    }
    whoosh.play((success) => {
      if (success) {
        console.log("successfully finished playing");
      } else {
        console.log("playback failed due to audio decoding errors");
      }
    });
    fetchAllAssignment();
    const targetId =
      res?.data?.addTaskResult?.tasksData?.[res?.data?.addTaskResult?.tasksData?.length - 1]?.targetTaskId;

    const task = activeScenario?.tasks?.find((item: any) => item?._id === targetId);
    console.log(targetId, task);
    setCurrentTask(task);
    setActiveReport(res?.data?.addTaskResult);
  }

  function handleAddTaskResultError(error: any) {
    console.error(JSON.stringify(error), "error");
  }

  function handleRequestAssignmentError(error: any) {
    console.error("Error in request Assignment", error);
    setLoader(false);
  }

  function handleCompleteReportError(error: any) {
    console.error("Error in completing the report", error);
    setCompleteReportResponse(false);
  }

  function handleStartTaskError(error: any) {
    console.error("Error in starting the task", error);
  }

  return {
    onStartTask,
    isExecutable,
    onAddTaskResult,
    setCurrentTask,
    setTaskDelay,
    CurrentTask,
    addTaskResponse,
    uploadFileLoading,
    onCompeleteReport: onCompleteReport,
    addTaskLoading,
    completeReportResponse,
    taskDelay,
    setaddTaskLoading,
    fetchAllAssigment: fetchAllAssignment,
    refreshAssignment,
    responseAssignment,
    loader,
    gettingCurrentLocation,
    setCompleteReportResponse,
  };
};

export { useTaskReport };
