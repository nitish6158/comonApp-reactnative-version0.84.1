import {
  View,
  Text,
  Pressable,
  ViewStyle,
  ActivityIndicator,
} from "react-native";
import React, { useMemo, useState, useEffect } from "react";
import { reminder } from "@/schemas/schema";
import { screenStyle as reminderStyle } from "../../ReminderContainer/ViewReminderScreen/viewReminder.styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import { ParticipantAcceptStatus } from "@/graphql/generated/types";
import dayjs from "dayjs";
import { Colors } from "@/Constants";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { IAllCalendarData } from "@/Atoms/CalendarAtom";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl, GroupUrl } from "@Service/provider/endpoints";
import { Chip } from "react-native-ui-lib";
import { useScenarioLazyQuery } from "@/graphql/generated/scenario.generated";
import { useReportLazyQuery } from "@/graphql/generated/report.generated";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  activeAssignmentAtom,
  activeReportAtom,
  activeScenarioAtom,
} from "@/Atoms/AssignmentAtom";
import { currentUserIdAtom } from "@/Atoms";
import {
  assignmentLoadingAtom,
  selectedAssignmentAtom,
} from "../../TaskContainer/AssignmentsContainer/Assignments/SingleAssignment";
import { useAssignmentLazyQuery } from "@/graphql/generated/assigment.generated";
import { navigate } from "@/navigation/utility";
import ToastMessage from "@Util/ToastMesage";
import useMasterOrg from "@/hooks/useMasterOrg";
import { useTranslation } from "react-i18next";
import "dayjs/locale/en";
import "dayjs/locale/fr";
import "dayjs/locale/es";
import "dayjs/locale/es";
import { getStorage } from "@/utils/storage";

type props = {
  eventStyle: ViewStyle[];
  event: IAllCalendarData;
  onEventPressed: (data: IAllCalendarData) => void;
  showTime?: boolean;
};

export default function CalendarTaskItem({
  event,
  onEventPressed,
  eventStyle,
  showTime,
}: props) {
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

  const getLocale = async () => {
    const loc = await getStorage("LANGUAGE");


    if (loc) {
      return loc;
    }
    return "en";
  };

  useEffect(() => {
    const initLocale = async () => {
      const language = await getLocale();
      dayjs.locale(language);
    };

    initLocale();
  }, []);

  const status = useMemo(() => {
    let isActionableDate = dayjs(event.eventDate).isSame(dayjs(), "dates");
    if (isActionableDate) {
      if (event.recurrent === "ANYTIME") {
        return {
          text: t("reminders.execute-now"),
          status: true,
        };
      } else {
        if (!event.completeTime) {
          let executeTime = getTimeFromMs(event.startDate, event.eventDate);
          let isActionableTime = dayjs().isSameOrAfter(executeTime, "minutes");

          if (isActionableTime) {
            return {
              text: t("reminders.execute-now"),
              status: true,
            };
          } else {
            return {
              text: `${t("reminders.after")} ${dayjs(event.eventDate).format(
                "HH:mm",
              )}`,
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
        status: null,
      };
    }
  }, [event]);

  return (
    <Pressable
      disabled={loading}
      onPress={() => {
        if (status.status) {
          onAssignmentPressed();
        } else {
          ToastMessage(status.text);
        }
      }}
      style={eventStyle}
    >
      <Text style={{ color: "black", fontSize: !showTime ? 14 : 17 }}>
        {event.label}
      </Text>

      {showTime ? (
        <View>
          <View style={reminderStyle.reminder_times}>
            <Text style={[reminderStyle.dateText]}>
              {dayjs(event.ct).format("DD MMMM YYYY")}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={[reminderStyle.timeText]}>
                |{" "}
                {event.recurrent === "ANYTIME"
                  ? t("reminders.all-day")
                  : dayjs(event.startDate).format("HH:mm")}
              </Text>
            </View>
            {event.organization && (
              <Text style={{ color: "black" }}>
                {" "}
                | {event.organization.name.slice(0, 18)}...
              </Text>
            )}
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={[
                  reminderStyle.recurrent,
                  { backgroundColor: Colors.light.blue },
                ]}
              >
                <Text style={reminderStyle.recurrentText}>
                  {t(`reminders.${event.recurrent.toLowerCase()}`)}
                </Text>
              </View>
              <View
                style={{
                  marginHorizontal: 5,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="people"
                  size={18}
                  color={Colors.light.blue}
                  style={{ marginRight: 5 }}
                />
                <Text style={{}}>{event.members.length}</Text>
              </View>
              <View
                style={{
                  marginHorizontal: 5,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <FontAwesome5
                  name="tasks"
                  size={16}
                  color={Colors.light.blue}
                  style={{ marginRight: 5 }}
                />
                <Text style={{}}>{event.tasks.length - 2}</Text>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator />
            ) : (
              <View>
                {status.text.length > 0 && status.status != null ? (
                  <Chip label={status.text} />
                ) : (
                  <></>
                )}
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: "row", alignSelf: "flex-end" }}>
          {loading && <ActivityIndicator color={Colors.light.PrimaryColor} />}
        </View>
      )}
    </Pressable>
  );

  async function onAssignmentPressed() {
    try {
      setLoading(true);
      let assignment = await getAssignmentRequest({
        variables: {
          input: {
            _id: event._id,
          },
        },
      });
      console.log("assignment", assignment.data?.assignment);
      if (assignment.data?.assignment) {
        let item = assignment.data?.assignment;
        global.activeOrg = await getMasterOrg(event.organization._id);
        setAssignmentLoading(true);
        setSelectedAssignment(item._id);
        console.log({
          variables: {
            input: { _id: item.scenario?._id, orgId: event.organization._id },
          },
        });

        const res = await scenarioRequest({
          variables: {
            input: { _id: item.scenario?._id, orgId: event.organization._id },
          },
        });
        // console.log("scenario",res.error,event.organization._id,item.scenario?._id)
        if (res.data?.scenario) {
          setActiveAssignment(item);
          setActiveScenario(res.data?.scenario);
          const currentMember = item.members.find(
            (itm) => itm?.member?.user?._id == MyProfile?._id,
          );
          // console.log("currentMember",currentMember)
          if (currentMember?.activeReportId) {
            const reportRes = await reportRequest({
              variables: { input: { _id: currentMember.activeReportId } },
            });
            // console.log("reportRes",reportRes)
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
