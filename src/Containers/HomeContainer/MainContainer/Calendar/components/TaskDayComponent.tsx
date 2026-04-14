import { View, Text, ActivityIndicator } from "react-native";
import React, { useMemo, useState } from "react";
import { reminder } from "@/schemas/schema";
import { Chip } from "react-native-ui-lib";
import { screenStyle } from "../../ReminderContainer/ViewReminderScreen/viewReminder.styles";
import { useAssignmentLazyQuery } from "@/graphql/generated/assigment.generated";
import { useReportLazyQuery } from "@/graphql/generated/report.generated";
import { useScenarioLazyQuery } from "@/graphql/generated/scenario.generated";
import { useAtomValue, useSetAtom } from "jotai";
import useMasterOrg from "@/hooks/useMasterOrg";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { activeAssignmentAtom, activeReportAtom, activeScenarioAtom } from "@/Atoms/AssignmentAtom";
import {
  assignmentLoadingAtom,
  selectedAssignmentAtom,
} from "../../TaskContainer/AssignmentsContainer/Assignments/SingleAssignment";
import { currentUserIdAtom } from "@/Atoms";
import { navigate } from "@/navigation/utility";
import ToastMessage from "@Util/ToastMesage";
import { TimelineEventProps } from "react-native-calendars";
import { IAllCalendarData } from "@/Atoms/CalendarAtom";

type props = {
  title: string;
  data: reminder;
};

export default function TaskDayComponent({ data, title }: props) {
  const [getAssignmentRequest] = useAssignmentLazyQuery({
    fetchPolicy: "no-cache",
  });

  const [reportRequest] = useReportLazyQuery({
    fetchPolicy: "no-cache",
  });
  const [scenarioRequest] = useScenarioLazyQuery({
    fetchPolicy: "no-cache",
  });
  const setActiveReport = useSetAtom(activeReportAtom);
  const setActiveScenario = useSetAtom(activeScenarioAtom);
  const setActiveAssignment = useSetAtom(activeAssignmentAtom);
  const setSelectedAssignment = useSetAtom(selectedAssignmentAtom);
  const [loading, setLoading] = useState<boolean>(false);
  const MyProfile = useAtomValue(currentUserIdAtom);
  const setAssignmentLoading = useSetAtom(assignmentLoadingAtom);
  const { getMasterOrg } = useMasterOrg();
  const { t } = useTranslation();
  const status = useMemo(() => {
    let isActionableDate = dayjs(data.eventDate).isSame(dayjs(), "dates");
    if (isActionableDate) {
      if (data.recurrent === "ANYTIME") {
        return {
          text: t("reminders.execute-now"),
          status: true,
        };
      } else {
        if (!data.completeTime) {
          let executeTime = getTimeFromMs(data.startDate, data.eventDate);
          let isActionableTime = dayjs().isSameOrAfter(executeTime, "minutes");

          if (isActionableTime) {
            return {
              text: t("reminders.execute-now"),
              status: true,
            };
          } else {
            return {
              text: `${t("reminders.after")} ${dayjs(data.eventDate).format("HH:mm")}`,
              status: false,
            };
          }
        } else {
          return {
            text: t("reminders.completed"),
            status: false,
          };
        }
      }
    } else {
      return {
        text: `${t("reminders.not-active-reminder")}`,
        status: false,
      };
    }
  }, [data]);

  return (
    <View>
      <Chip
        label={title.slice(0, 20)}
        labelStyle={{ color: "white" }}
        disabled={loading}
        onPress={() => {
          if (status.status) {
            onAssignmentPressed();
          } else {
            ToastMessage(status.text);
          }
        }}
        containerStyle={[
          {
            marginRight: 5,
            borderColor: "gray",
            borderRadius: 5,
          },
          screenStyle[`type_box_${data.type}`],
        ]}
        rightElement={<View style={{ marginHorizontal: 5 }}>{loading && <ActivityIndicator color={"white"} />}</View>}
      />
    </View>
  );

  async function onAssignmentPressed() {
    try {
      setLoading(true);
      let assignment = await getAssignmentRequest({
        variables: {
          input: {
            _id: data._id,
          },
        },
      });

      if (assignment.data?.assignment) {
        let item = assignment.data?.assignment;
        global.activeOrg = await getMasterOrg(data.organization._id);
        setAssignmentLoading(true);
        setSelectedAssignment(item._id);

        const res = await scenarioRequest({
          variables: { input: { _id: item.scenario?._id, orgId: data.organization._id } },
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
      }
      setLoading(false);
    } catch (e) {
      console.log(e);
      ToastMessage(t("label.error-to-start-assignment"));
      setLoading(false);
    }
  }

  function getTimeFromMs(start: string, date: string) {
    let hours = dayjs(start).get("hours");
    let minute = dayjs(start).get("minutes");

    return dayjs(date).set("hours", hours).set("minutes", minute);
  }
}
