import React, { useEffect } from "react";

import { KeyboardAvoidingView, Platform, View } from "react-native";
import { AssignmentChatHeader } from "./Assignments/AssignmentChatHeader";
import { AssignmentChatBody } from "./Assignments/AssignmentChatBody";

import { useMyReportsLazyQuery, useReportLazyQuery } from "@/graphql/generated/report.generated";
import { useScenarioLazyQuery } from "@/graphql/generated/scenario.generated";
import { currentUserIdAtom } from "@/Atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { activeAssignmentAtom, activeReportAtom, activeScenarioAtom } from "@/Atoms/AssignmentAtom";
import { useTaskReport } from "@/hooks";
import { CurrentActiveOrganization, MyReportAtom } from "@/Atoms/taskAtom";
import { navigate } from "@/navigation/utility";
import ToastMessage from "@Util/ToastMesage";
import { Assignment } from "@/graphql/generated/types";
import { Scenario } from "@/graphql/generated/user.generated";
import { useDispatch } from "react-redux";

import { setAssignments } from "@/redux/Reducer/OrganisationsReducer";
import { socket } from "@/redux/Reducer/SocketSlice";
import { useTranslation } from "react-i18next";


let activeAssignment: Assignment | undefined = undefined;
let scenario: Scenario | undefined = undefined;

export default function AssignmentChatScreen() {
  const {t} = useTranslation()

  const [reportRequest] = useReportLazyQuery({
    fetchPolicy: "no-cache",
  });
  const [scenarioRequest] = useScenarioLazyQuery({
    fetchPolicy: "no-cache",
  });
  const [fetchMyReport] = useMyReportsLazyQuery({
    fetchPolicy: "no-cache",
  });
  const MyProfile = useAtomValue(currentUserIdAtom);
  const [activeScenario, setActiveScenario] = useAtom(activeScenarioAtom);
  const [activeOrganisation] = useAtom(CurrentActiveOrganization);
  const setActiveReport = useSetAtom(activeReportAtom);
  const [assignment, setActiveAssignment] = useAtom(activeAssignmentAtom);
  const setMyReports = useSetAtom(MyReportAtom);

  const dispatch = useDispatch();

  const { fetchAllAssigment, setCompleteReportResponse, setCurrentTask, responseAssignment } = useTaskReport();

  useEffect(() => {
    if (typeof socket?.on == "function") {
      socket?.on("message", (data) => {
        if (data.type == "taskSubmit") {
          const scenarioId = data?.msg?.data?.assignment?.scenario?._id;
          const currentMember = data?.msg?.data?.assignment?.members.find(
            (itm) => itm.member?.user._id == MyProfile?._id
          );
          const checkingForTaskId = scenario?.tasks.find((e) => e._id == data?.msg?.taskId);
          if (scenario?._id == scenarioId && checkingForTaskId) {
            refreshActiveReports(scenarioId, currentMember?.activeReportId);
          }
        }
        if (data?.type == "completeReport") {
          const messageCopy =
            typeof data?.msg == "string"
              ? JSON.parse(data?.msg)
              : typeof data?.msg == "object"
              ? { ...data.msg }
              : data?.msg;
          if (messageCopy?.organizationId === activeOrganisation) {
            if (messageCopy?.assignmentId === activeAssignment?._id) {
              completeTask();
            } else {
              responseAssignment.refetch().then((response) => {
                if (response.error) {
                  console.error("Error in refetching assignment", response.error);
                  return;
                }
                dispatch(setAssignments(response.data?.myAssignments.data));
              });
            }
          }
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (assignment) {
      activeAssignment = assignment;
    }
    if (activeScenario) {
      scenario = activeScenario;
    }
  }, [assignment, activeScenario]);

  async function completeTask() {
    setCompleteReportResponse(true);
    await fetchAllAssigment();

    const myReportsResponse = await fetchMyReport({
      variables: { input: { skip: 0, limit: 50 } },
    });

    if (myReportsResponse.data?.myReports?.data?.length) {
      setMyReports(myReportsResponse.data.myReports.data);
    }

    setCompleteReportResponse(false);
    setActiveReport(null);
    setCurrentTask(null);
    activeAssignment = undefined;
    scenario = undefined;
    setActiveAssignment(null);
    ToastMessage(t("label.assignment-completed"));
    navigate("MyReportsScreen", {});
  }

  async function refreshActiveReports(scenarioId: string, reportId: string) {
    if (scenarioId && reportId) {
      const res = await scenarioRequest({ variables: { input: { _id: scenarioId, orgId: global?.activeOrg } } });
      if (res.data?.scenario) {
        setActiveScenario(res.data?.scenario);
      }
      const reportRes = await reportRequest({ variables: { input: { _id: reportId } } });
      if (reportRes.data?.report) {
        setActiveReport(reportRes?.data?.report);
      }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <AssignmentChatHeader />
      <AssignmentChatBody />
    </View>
  );
}
