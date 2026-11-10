import React, { useCallback, useEffect } from "react";
import {
  activeAssignmentAtom,
  activeReportAtom,
  activeScenarioAtom,
  taskNotificationLoader,
} from "@/Atoms/AssignmentAtom";
import { CurrentActiveOrganization } from "@/Atoms/taskAtom";
import { useMyAssignmentsLazyQuery } from "@/graphql/generated/assigment.generated";
import { useReportLazyQuery } from "@/graphql/generated/report.generated";
import { useScenarioLazyQuery } from "@/graphql/generated/scenario.generated";
import { Assignment } from "@/graphql/generated/types";
import { RootState } from "@/redux/Reducer";
import { useAtom, useSetAtom } from "jotai";
import { useDispatch, useSelector } from "react-redux";
import { useOrganizations } from "./useOrganization";
import { assignmentsType } from "@/redux/constants";
import { navigate } from "@/navigation/utility";
import { useTranslation } from "react-i18next";
import { setAssignments } from "@/redux/Reducer/OrganisationsReducer";

let organisationCopy: any[] = [];

export default function useTaskNotificationHandler() {
  const setActiveAssignment = useSetAtom(activeAssignmentAtom);
  const setActiveReport = useSetAtom(activeReportAtom);
  const [taskNotification, setTaskNotificationLoader] = useAtom(taskNotificationLoader);
  const [activeOrganisation, setActiveOrganisation] = useAtom(CurrentActiveOrganization);
  const setActiveScenario = useSetAtom(activeScenarioAtom);

  const [scenarioRequest] = useScenarioLazyQuery({ fetchPolicy: "no-cache" });
  const [reportRequest] = useReportLazyQuery({
    fetchPolicy: "no-cache",
  });
  const [requestAssignment] = useMyAssignmentsLazyQuery({
    fetchPolicy: "no-cache",
  });

  const { assignments, organizations } = useSelector((state: RootState) => state.Organisation);
  const { MyProfile } = useSelector((state: RootState) => state.Chat);

  const { switchOrganization } = useOrganizations();

  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    organisationCopy = organizations ?? [];
  }, [organizations]);

  const handleTaskNotificationTap = useCallback(
    async (organisationId: string, assignmentId: string) => {
      const org =
        organisationCopy?.length >= (organizations?.length ?? 0)
          ? organisationCopy
          : organizations ?? [];
      console.log("Org", org);
      const checkIfTheOrganisationAlreadyExist = org?.find((e: any) => e._id == organisationId);
      if (checkIfTheOrganisationAlreadyExist) {
        if (global.activeOrg == organisationId) {
          const checkIfTheAssignmentAlreadyExist = assignments.find((e) => e._id == assignmentId);
          if (checkIfTheAssignmentAlreadyExist) {
            handleScenarioRequest(checkIfTheAssignmentAlreadyExist as any);
          } else {
            setTaskNotificationLoader(t("loadingTask"));
            requestAssignment({
              variables: {
                input: {
                  organizationId: organisationId,
                  skip: 0,
                  limit: 50,
                },
              },
            })
              .then((response) => {
                if (response.error) {
                  console.error("Error in assignment request", response.error);
                  setTaskNotificationLoader(null);
                  return;
                }
                const checkForAssignment = response.data?.myAssignments.data?.find((e) => e._id == assignmentId);
                if (checkForAssignment) {
                  handleScenarioRequest(checkForAssignment as any);
                }
                dispatch(setAssignments((response.data?.myAssignments.data ?? []) as any));
              })
              .catch((err) => {
                console.error("Error in requesting assignment", err);
              });
          }
        } else {
          setTaskNotificationLoader(t("switchingOrg"));
          switchOrganization(organisationId, org as any)
            .then((response) => {
              setActiveOrganisation(organisationId);
              setTaskNotificationLoader(t("loadingTask"));
              requestAssignment({
                variables: {
                  input: {
                    organizationId: organisationId,
                    skip: 0,
                    limit: 50,
                  },
                },
              })
                .then((response) => {
                  if (response.error) {
                    console.error("Error in assignment request", response.error);
                    setTaskNotificationLoader(null);
                    return;
                  }
                  const activeAssignment = response.data?.myAssignments.data?.find((e) => e._id == assignmentId);
                  if (activeAssignment) handleScenarioRequest(activeAssignment as any);
                  dispatch(setAssignments((response.data?.myAssignments.data ?? []) as any));
                })
                .catch((err) => {
                  console.error("Error in requesting assignment", err);
                  setTaskNotificationLoader(null);
                });
            })
            .catch((Err) => {
              console.log("Error in switching organisation", Err);
              setTaskNotificationLoader(null);
            });
        }
      }
    },
    [organizations, assignments]
  );

  const handleScenarioRequest = useCallback(
    (assignment: Assignment) => {
      setTaskNotificationLoader(t("loadingTaskDetail"));
      scenarioRequest({
        variables: {
          input: {
            _id: assignment?.scenario?._id ?? "",
            orgId: global.activeOrg ?? "",
          },
        },
      })
        .then((response) => {
          if (response.error) {
            console.error("Error in requesting scenario", response.error);
            setTaskNotificationLoader(null);
            return;
          }
          setActiveAssignment(assignment);
          if (response.data?.scenario) setActiveScenario(response.data?.scenario as any);
          const myActiveReportId = assignment.members.find((e) => e.member?.user?._id == MyProfile?._id);
          if (myActiveReportId?.activeReportId) {
            reportRequest({
              variables: {
                input: {
                  _id: myActiveReportId?.activeReportId,
                },
              },
            })
              .then((response) => {
                if (response.error) {
                  console.error("Error in report request", response.error);
                  setTaskNotificationLoader(null);
                  return;
                }
                if (response?.data?.report) setActiveReport(response?.data?.report as any);
                setTaskNotificationLoader(null);
                navigate("AssignmentChatScreen", {});
              })
              .catch((err) => {
                console.error("Error in requesting report", err);
                setTaskNotificationLoader(null);
              });
          } else {
            setActiveReport(null);
            setTaskNotificationLoader(null);
            navigate("AssignmentChatScreen", {});
          }
        })
        .catch((err) => {
          console.error("Error in scenario request", err);
          setTaskNotificationLoader(null);
        });
    },
    [MyProfile]
  );
  return {
    handleTaskNotificationTap,
  };
}
