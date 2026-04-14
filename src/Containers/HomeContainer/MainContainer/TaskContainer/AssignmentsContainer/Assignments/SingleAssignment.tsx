import { ActivityIndicator, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { Assignment } from "@Service/generated/types";
import React, { useMemo, useState } from "react";
import { useScenarioLazyQuery } from "@Service/generated/scenario.generated";

import { navigate } from "@Navigation/utility";
import { useDispatch } from "react-redux";
import { useReportLazyQuery } from "@Service/generated/report.generated";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { currentUserIdAtom } from "@/Atoms";
import { activeAssignmentAtom, activeReportAtom, activeScenarioAtom } from "@/Atoms/AssignmentAtom";
import { Colors } from "@/Constants";
import { getOverdueStatus } from "../utils/task.utils";
import useMasterOrg from "@/hooks/useMasterOrg";

const { width } = Dimensions.get("screen");

export const assignmentLoadingAtom = atom<boolean>(false);
export const selectedAssignmentAtom = atom<string | null>(null);

export function SingleAssignment({ item }: Readonly<{ item: Assignment }>) {
  const [reportRequest] = useReportLazyQuery({
    fetchPolicy: "no-cache",
  });
  const [scenarioRequest] = useScenarioLazyQuery({
    fetchPolicy: "no-cache",
  });
  const setActiveReport = useSetAtom(activeReportAtom);
  const setActiveScenario = useSetAtom(activeScenarioAtom);
  const setActiveAssignment = useSetAtom(activeAssignmentAtom);
  const [selectedAssignment, setSelectedAssignment] = useAtom(selectedAssignmentAtom);
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const MyProfile = useAtomValue(currentUserIdAtom);
  const [isAssignmentLoading, setAssignmentLoading] = useAtom(assignmentLoadingAtom);
  const { getMasterOrg } = useMasterOrg();

  const RandomColor = useMemo(() => {
    return getRandomDarkColor(165);
  }, []);

  function getRandomDarkColor(value) {
    // Generate random values for RGB components in a dark range
    const red = Math.floor(Math.random() * value);
    const green = Math.floor(Math.random() * value);
    const blue = Math.floor(Math.random() * value);

    // Construct the RGB color string
    const color = `rgb(${red}, ${green}, ${blue})`;

    return color;
  }
  return (
    <Pressable onPress={onAssignmentPressed} style={styles.main} disabled={isAssignmentLoading}>
      <View
        style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", width: width - 40 }}
      >
        <View style={{ maxWidth: "85%" }}>
          <Text style={styles.taskTitle}>{item?.scenario?.name}</Text>
          {item?.scenario?.description?.length > 0 && (
            <Text style={styles.taskDescription}>
              {item?.scenario?.description.slice(0, 40)}
              {item?.scenario?.description.length > 40 ? "..." : ""}
            </Text>
          )}
          {item.recurrent !== "ONCE" && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.subtitle}>
                {item.recurrent === "ANYTIME" ? "AnyTime" : dayjs(item.start).format("D MMM, YYYY HH:mm")}
              </Text>
            </View>
          )}
        </View>
        {item.start && selectedAssignment != item._id && item?.recurrent != "ANYTIME" && (
          <View style={{ height: 50, justifyContent: "center", alignItems: "center" }}>
            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    item?.status && item?.status == "To Perform"
                      ? Colors.light.onlineGreen
                      : getOverdueStatus(item.start) == "Overdue"
                      ? "red"
                      : Colors.light.onlineGreen,
                },
              ]}
            >
              {item?.status
                ? item?.status == "Overdue"
                  ? t("overdue")
                  : t("toPerform")
                : getOverdueStatus(item.start) == "Overdue"
                ? t("overdue")
                : t("toPerform")}
            </Text>
          </View>
        )}
        {selectedAssignment == item._id && (
          <View style={{ height: 50, width: 50, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        )}
      </View>
    </Pressable>
  );
  async function onAssignmentPressed() {
    try {
      setAssignmentLoading(true);
      setSelectedAssignment(item._id);
      global.activeOrg = await getMasterOrg(item.organizationId);

      const res = await scenarioRequest({
        variables: { input: { _id: item.scenario?._id, orgId: global?.activeOrg } },
      });
      if (res.data?.scenario) {
        setActiveAssignment(item);
        setActiveScenario(res.data?.scenario);
        const currentMember = item.members.find((itm) => itm?.member?.user?._id == MyProfile?._id);
        if (currentMember?.activeReportId) {
          const reportRes = await reportRequest({ variables: { input: { _id: currentMember.activeReportId } } });
          if (reportRes.data?.report) {
            setActiveReport(reportRes?.data?.report);
            navigate("AssignmentChatScreen", {});
          }
          setAssignmentLoading(false);
          setSelectedAssignment(null);
        } else {
          setActiveReport(null);
          setAssignmentLoading(false);
          setSelectedAssignment(null);
          navigate("AssignmentChatScreen", {});
        }
      }
    } catch (error) {
      setAssignmentLoading(false);
      setSelectedAssignment(null);
      console.error("Eror in starting task", error);
    }
  }
}

const styles = StyleSheet.create({
  main: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  subtitle: {
    color: "rgba(51,51,51,.8)",
    fontSize: 12,
    textAlign: "center",
  },
  taskDescription: {
    color: "rgba(51,51,51,.5)",
    fontSize: 14,
  },
  taskTitle: {
    color: "rgba(51,51,51,1)",
    fontSize: 16,
    fontWeight: "500",
  },
});
