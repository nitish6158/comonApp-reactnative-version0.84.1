// import React, { useCallback, useEffect, useState } from "react";
// import RealmContext from "@/schemas";
// import { Realm } from "@realm/react";
// import { useSelector } from "react-redux";
// import { RootState } from "@/redux/Reducer";
// import { useAtomValue, useSetAtom } from "jotai";
// import {
//   AllCalendarData,
//   CalendarDotAtom,
//   CalendarNotifications,
//   CalendarScheduleMessage,
//   IAllCalendarData,
//   notificationCount,
//   ReminderEventData,
// } from "@/Atoms/CalendarAtom";
// import { useFocusEffect, useIsFocused } from "@react-navigation/core";
// import { EventType, ParticipantAcceptStatus } from "@/graphql/generated/types";
// import dayjs from "dayjs";
// import { TimelineListProps } from "react-native-calendars";
// import { reminder } from "@/schemas/schema";
// import { Colors } from "@/Constants";
// import { ActivityIndicator, Pressable, TouchableOpacity, View } from "react-native";
// import EvilIcons from "react-native-vector-icons/EvilIcons";
// import ToastMessage from "@Util/ToastMesage";
// import { currentUserIdAtom } from "@/Atoms";
// import { GET_APPOINTMENTS_REMINDERS } from "@/graphql/generated/reminder.generated";
// import { useLazyQuery } from "@apollo/client";
// const { useQuery, useRealm } = RealmContext;
// export default function CalendarDataManipulator() {
//   const realm = useRealm();
//   const memberQuery = useQuery("member");
//   const assignmentQuery = useQuery("assignment");
//   const scenarioQuery = useQuery("scenario");
//   const organization = useQuery("organization");
//   const MyProfile = useAtomValue(currentUserIdAtom);

//   const setCalendarData = useSetAtom(AllCalendarData);
//   const setReminderData = useSetAtom(ReminderEventData);
//   const setCalendarNotification = useSetAtom(CalendarNotifications);
//   const setCalenderDots = useSetAtom(CalendarDotAtom);
//   const setScheduleMessageNotification = useSetAtom(CalendarScheduleMessage);
//   const setNotificationCount = useSetAtom(notificationCount);
//   const [loader, setLoader] = useState<boolean>(false);
//   const [taskDots, setTaskDots] = useState<{ [x: string]: { dots: string[] } }>({});
//   const [reminderDots, setReminderDots] = useState<{ [x: string]: { dots: string[] } }>({});
//   const [getAppointments, { loading, data, error }] =
//     useLazyQuery(GET_APPOINTMENTS_REMINDERS);

//   useFocusEffect(
//     useCallback(() => {
//       SyncCalenderManually();
//     }, [assignmentQuery, scenarioQuery, memberQuery, organization])
//   );
//   useFocusEffect(
//     useCallback(() => {
//       // getAppointments();
//     }, [])
//   );
//   useEffect(() => {
//     setLoader(loading);
//   }, [loading]);

//   useEffect(() => {
//     let lister = GetReminderEvents();
//     console.log("calender reminder listener added");
//     return () => {
//       console.log("calender reminder listener removed");
//       lister.removeAllListeners();
//     };
//   }, []);

//   useEffect(() => {
//     calculateDotValue();
//   }, [taskDots, reminderDots]);

//   function GetTaskEvents() {
//     if (MyProfile?._id && memberQuery?.length && assignmentQuery?.length) {
//       const allMembers = memberQuery?.filtered("user == $0", new Realm.BSON.ObjectId(MyProfile?._id));
//       if (allMembers?.length) {
//         const clonedMembers = JSON.parse(JSON.stringify(allMembers));
//         const assignmentValidationQuery = `type == "PUBLISHED" AND deleted == $0`;
//         const allAssignmentsWithValidation = assignmentQuery?.filtered(assignmentValidationQuery, false);

//         let query = "";
//         for (let item of clonedMembers) {
//           query += `members.member == oid(${item?._id}) OR `;
//         }

//         const assignmentDbQuery = query.substring(0, query.length - 4);

//         const allAssignments = allAssignmentsWithValidation.filtered(assignmentDbQuery);
//         if (allAssignments?.length) {
//           const clonedAssignments = JSON.parse(JSON.stringify(allAssignments)) as IAllCalendarData[];
//           let scenario = "";
//           for (let item of clonedAssignments) {
//             scenario += `_id == oid(${item?.scenario}) OR `;
//           }
//           const scenarioDbQuery = scenario.substring(0, scenario.length - 4);
//           const allScenarios = scenarioQuery.filtered(scenarioDbQuery);
//           const clonedScenarios = JSON.parse(JSON.stringify(allScenarios));
//           const onlyMemberIDs = clonedMembers.map((e) => e?._id);

//           // console.log(formattedData)

//           let taskDots = {} as { [x: string]: { dots: string[] } };

//           let value = {} as TimelineListProps["events"];

//           clonedAssignments.forEach((v) => {
//             const findScenario = clonedScenarios.find((el) => el?._id == v?.scenario);
//             const findCompleteTime = v?.members.find((el1) => onlyMemberIDs?.includes(el1?.member));
//             const org = organization.filtered("_id == $0", new Realm.BSON.ObjectId(v.organizationId));
//             v.dateTimeInput.forEach((t) => {
//               let extraData = JSON.stringify({
//                 _id: v?._id,
//                 label: findScenario?.name ?? "",
//                 description: findScenario?.description ?? "",
//                 type: "TASK",
//                 recurrent: v?.recurrent,
//                 startDate: v?.start,
//                 startTimeInMs: v?.startTimeInMs,
//                 endDate: v?.end,
//                 completeTime: findCompleteTime?.completeTime ?? null,
//                 daylyParams: v?.daylyParams,
//                 montlyParams: v?.montlyParams,
//                 dateTimeInput: v?.dateTimeInput,
//                 members: v.members,
//                 tasks: findScenario.tasks ?? [],
//                 organization: org[0],
//                 isAllDay: v?.recurrent == "ANYTIME",
//                 eventDate: t.date,
//               });

//               let newEvent = {
//                 id: v._id,
//                 title: findScenario?.name,
//                 summary: findScenario?.description,
//                 color: "#F3F9FC",
//                 type: "TASK",
//                 extraData,
//               };

//               newEvent["start"] = dayjs(t.date).format("YYYY-MM-DD HH:mm:ss");
//               newEvent["end"] = dayjs(t?.date).add(30, "minutes").format("YYYY-MM-DD HH:mm:ss");
//               newEvent["extraData"] = extraData;
//               newEvent["isAllDay"] = v?.recurrent == "ANYTIME";
//               newEvent["isDragable"] = false;

//               let formattedDate = dayjs(t.date).format("YYYY-MM-DD");
//               let list = value[formattedDate];
//               let taskDotsList = taskDots[formattedDate];

//               let dot = { key: "task", color: Colors.light.PrimaryColor };

//               if (taskDotsList) {
//                 taskDots[formattedDate] = { dots: [...taskDots[formattedDate].dots, dot] };
//               } else {
//                 taskDots[formattedDate] = { dots: [dot] };
//               }

//               if (list) {
//                 value[formattedDate] = [...list, newEvent];
//               } else {
//                 value[formattedDate] = [newEvent];
//               }
//             });
//           });

//           setTaskDots(taskDots);

//           setCalendarData(value);
//         }
//       }
//     }
//   }

// function GetReminderEvents() {
//   const data = realm.objects("reminder").filtered("participants._id == $0", MyProfile?._id);

//   data.addListener((filter) => {
//     const reminderData = JSON.parse(JSON.stringify(filter)) as reminder[];
//     const value = {} as TimelineListProps["events"];
//     let dotsValue = {} as { [x: string]: { dots: string[] } };
//     const notifications = [] as reminder[];
//     const schedules = [] as reminder[];

//     reminderData.forEach((v) => {
//       const currentUser = v.participants.find((v) => v._id === MyProfile?._id);
//       const adminUser = v.participants.find((v) => v.role === "ADMIN");
//       const isCurrentUserAdmin = currentUser?.role == "ADMIN";

//       if (currentUser?.accepted === ParticipantAcceptStatus["Pending"]) {
//         if (!notifications.find((b) => b._id === v._id)) {
//           if (v.type === EventType["Schedule"]) {
//             if (v.isApprovalNeeded) {
//               const { Count, Unit } = v.approvalReminderTime[0];

//               const after = dayjs(v.date).subtract(Count, Unit?.toLowerCase());
//               const isAfterInRange = dayjs().isSameOrAfter(after);
//               const before = dayjs().isBefore(v.date);

//               if (isAfterInRange && before) {
//                 schedules.push(v);
//               }
//             }
//           } else {
//             notifications.push(v);
//           }
//         }
//       }

//       if (v.type !== EventType["Schedule"]) {
//         if (
//           currentUser?.accepted === ParticipantAcceptStatus["Accept"] ||
//           currentUser?.accepted === ParticipantAcceptStatus["Pause"]
//         ) {
//           const newEvent = {
//             id: v._id,
//             title: v.title,
//             summary: v.description,
//             color: v.type === EventType["Appointment"] ? "rgba(255, 129, 131, .05)" : "rgba(1,100,100,.05)",
//             type: v.type,
//           };
//           let time = dayjs(v.time);
//           newEvent["start"] = dayjs(v.date)
//             .set("hours", time.get("hours"))
//             .set("minutes", time.get("minutes"))
//             .format("YYYY-MM-DD HH:mm:ss");
//           newEvent["end"] = dayjs(v.date)
//             .set("hours", time.get("hours"))
//             .set("minutes", time.get("minutes") + 30)
//             .format("YYYY-MM-DD HH:mm:ss");
//           newEvent["extraData"] = JSON.stringify({ ...v, currentUser, adminUser, isCurrentUserAdmin, ct: v.date });
//           newEvent["isAllDay"] = v.isAllDay;
//           newEvent["isDragable"] = isCurrentUserAdmin
//             ? dayjs(v.date).isSameOrAfter(dayjs(), "minutes")
//               ? true
//               : false
//             : false;

//           const formattedDate = dayjs(v.date).format("YYYY-MM-DD");
//           const list = value[formattedDate];
//           const DotsList = taskDots[formattedDate];

//           let color = Colors.light.PrimaryColor;

//           if (v.type === EventType["Appointment"]) {
//             color = "#ff8183";
//           } else if (v.type === EventType["Reminder"]) {
//             color = "#135D66";
//           }

//           let dot = { key: v.type?.toLowerCase(), color };

//           if (DotsList) {
//             dotsValue[formattedDate] = { dots: [...dotsValue[formattedDate].dots, dot] };
//           } else {
//             dotsValue[formattedDate] = { dots: [dot] };
//           }

//           if (list) {
//             value[formattedDate] = [...list, newEvent].sort((a, b) => dayjs(b.start).isBefore(a.start));
//           } else {
//             value[formattedDate] = [newEvent];
//           }
//         }
//       } else {
//         let newEvent = {
//           id: v._id,
//           title: v.title,
//           summary: v.description,
//           color: "rgba(1,100,100,.05)",
//           type: v.type,
//         };
//         let time = dayjs(v.time);
//         newEvent["start"] = dayjs(v.date)
//           .set("hours", time.get("hours"))
//           .set("minutes", time.get("minutes"))
//           .format("YYYY-MM-DD HH:mm:ss");
//         newEvent["end"] = dayjs(v.date)
//           .set("hours", time.get("hours"))
//           .set("minutes", time.get("minutes") + 30)
//           .format("YYYY-MM-DD HH:mm:ss");
//         newEvent["extraData"] = JSON.stringify({ ...v, currentUser, adminUser, isCurrentUserAdmin, ct: v.date });
//         newEvent["isAllDay"] = v.isAllDay;
//         newEvent["isDragable"] = dayjs(v.date).isSameOrAfter(dayjs(), "minutes");

//         let formattedDate = dayjs(v.date).format("YYYY-MM-DD");

//         let list = value[formattedDate];
//         let DotsList = taskDots[formattedDate];

//         let dot = { key: v.type?.toLowerCase(), color: Colors.light.PrimaryColor };

//         if (DotsList) {
//           dotsValue[formattedDate] = { dots: [...dotsValue[formattedDate].dots, dot] };
//         } else {
//           dotsValue[formattedDate] = { dots: [dot] };
//         }

//         if (list) {
//           value[formattedDate] = [...list, newEvent].sort((a, b) => dayjs(b.start).isBefore(a.start));
//         } else {
//           value[formattedDate] = [newEvent];
//         }
//       }
//     });

//     const reminderInvitationCount = getTotalParentCount(notifications);

//     console.log("dotsValue", JSON.stringify(dotsValue));

//     setReminderDots(dotsValue);

//     setReminderData(value);
//     setNotificationCount(schedules.length + reminderInvitationCount);
//     setScheduleMessageNotification(schedules);
//     setCalendarNotification(notifications);
//   });

//   return data;
// }

//   function getTotalParentCount(data: reminder[]) {
//     const parentIds = [] as Array<string>;

//     data.forEach((v) => {
//       const find = parentIds.find((b) => b == v.parent_id);
//       if (!find) {
//         parentIds.push(v.parent_id);
//       }
//     });
//     return parentIds.length;
//   }

//   function calculateDotValue() {
//     const value = { ...taskDots, ...reminderDots };
//     setCalenderDots(value);
//   }

//   function SyncCalenderManually() {
//     setLoader(true);
//     GetTaskEvents();

//     setTimeout(() => {
//       setLoader(false);
//     }, 900);
//   }

//   return (
//     <TouchableOpacity disabled style={{ marginBottom: 5, marginRight: 5 }} onPress={SyncCalenderManually}>
//       {/* {loader ? <ActivityIndicator /> : <EvilIcons name="refresh" size={33} color={"black"} />} */}
//     </TouchableOpacity>
//   );
// }
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/core";
import { useLazyQuery } from "@apollo/client";
import { useAtomValue, useSetAtom } from "jotai";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import dayjs from "dayjs";
import { calendarRefreshAtom } from "@/Atoms/CalendarAtom";

import {
  AllCalendarData,
  CalendarDotAtom,
  CalendarLoader,
  CalendarNotifications,
  CalendarScheduleMessage,
  ReminderEventData,
  notificationCount,
} from "@/Atoms/CalendarAtom";

import { currentUserIdAtom } from "@/Atoms";
import { Colors } from "@/Constants";

import {
  GET_APPOINTMENTS_REMINDERS,
  GET_ASSIGNMENTS_FOR_CALENDAR,
  GET_CALENDAR_INVITATIONS,
} from "@/graphql/generated/reminder.generated";

import { EventType, ParticipantAcceptStatus } from "@/graphql/generated/types";

import { TimelineListProps } from "react-native-calendars";
import { reminder } from "@/schemas/schema";

export default function CalendarDataManipulator() {
  const MyProfile = useAtomValue(currentUserIdAtom);

  // 🔹 Atoms
  const refreshKey = useAtomValue(calendarRefreshAtom);

  const setCalendarData = useSetAtom(AllCalendarData);
  const setReminderData = useSetAtom(ReminderEventData);
  const setCalendarNotification = useSetAtom(CalendarNotifications);
  const setScheduleMessageNotification = useSetAtom(CalendarScheduleMessage);
  const setCalenderDots = useSetAtom(CalendarDotAtom);
  const setNotificationCount = useSetAtom(notificationCount);
  const setCalendarLoader = useSetAtom(CalendarLoader);
  const [taskDots, setTaskDots] = useState<Record<string, any>>({});
  const [reminderDots, setReminderDots] = useState<Record<string, any>>({});
  const [loader, setLoader] = useState(false);

  /* ===================== APIs ===================== */

  const [getAppointments, { data: appointmentData }] = useLazyQuery(
    GET_APPOINTMENTS_REMINDERS,
    {
      fetchPolicy: "no-cache",
    },
  );

  const [getAssignments, { data: assignmentData }] = useLazyQuery(
    GET_ASSIGNMENTS_FOR_CALENDAR,
    {
      fetchPolicy: "no-cache",
    },
  );

  const [getNotifications] = useLazyQuery(GET_CALENDAR_INVITATIONS, {
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      console.log(
        "🟢 API RESPONSE (getPendingReminder):",
        data?.getPendingReminder,
      );
      console.log("🟢 Total reminders:", data?.getPendingReminder?.length);

      handlePendingInvitations(data?.getPendingReminder ?? []);
    },
    onError: (error) => {
      console.log("🔴 API ERROR:", error);
    },
  });

  /* ===================== FOCUS ===================== */

  // useFocusEffect(
  //   useCallback(() => {
  //     setCalendarLoader(true);
  //     getAppointments();
  //     getAssignments();
  //     getNotifications();
  //     setCalendarLoader(false);
  //   }, []),
  // );
  // const fetchCalendarData = useCallback(() => {
  //   console.log("🔥 Fetching Calendar API");

  //   setCalendarLoader(true);

  //   getAppointments();
  //   getAssignments();
  //   getNotifications();

  //   setTimeout(() => {
  //     setCalendarLoader(false);
  //   }, 500);
  // }, []);
  const fetchCalendarData = useCallback(async () => {
  try {
    console.log("🔥 Fetching Calendar API");

    setCalendarLoader(true); // ✅ START LOADER

    await Promise.all([
      getAppointments(),
      getAssignments(),
      getNotifications(),
    ]);

  } catch (e) {
    console.log("Calendar API Error", e);
  } finally {
    setCalendarLoader(false); // ✅ STOP LOADER
  }
}, []);

  useFocusEffect(
    useCallback(() => {
      fetchCalendarData();
    }, [fetchCalendarData]),
  );
  useEffect(() => {
    if (refreshKey) {
      console.log("🔁 Refresh Triggered:", refreshKey);
      fetchCalendarData();
    }
  }, [refreshKey, fetchCalendarData]);
  /* ===================== APPOINTMENTS ===================== */

  useEffect(() => {
    if (!appointmentData?.getAppointmentForCalendar || !MyProfile?._id) return;

    const events: TimelineListProps["events"] = {};
    const dots: Record<string, any> = {};

    appointmentData.getAppointmentForCalendar.forEach((v: any) => {
      const time = dayjs(v.time);
      const start = dayjs(v.date)
        .set("hour", time.hour())
        .set("minute", time.minute());

      const dateKey = start.format("YYYY-MM-DD");

      events[dateKey] = [
        ...(events[dateKey] || []),
        {
          id: v._id,
          title: v.title,
          summary: v.description,
          start: start.format("YYYY-MM-DD HH:mm:ss"),
          end: start.add(30, "minute").format("YYYY-MM-DD HH:mm:ss"),
          isAllDay: v.isAllDay,
          type: v.type,
          color:
            v.type === EventType.Appointment
              ? "rgba(255,129,131,.05)"
              : "rgba(1,100,100,.05)",
          extraData: JSON.stringify(v),
        },
      ];

      dots[dateKey] = {
        dots: [
          {
            key: v.type.toLowerCase(),
            color: v.type === EventType.Appointment ? "#ff8183" : "#135D66",
          },
        ],
      };
    });

    setReminderData(events);
    setReminderDots(dots);
  }, [appointmentData, MyProfile]);

  /* ===================== INVITATIONS ===================== */

  function handlePendingInvitations(data: reminder[]) {
    const notifications: reminder[] = [];
    const schedules: reminder[] = [];

    data.forEach((v) => {
      const currentUser = v.participants?.find((p) => p._id === MyProfile._id);

      // ❌ current user not part of this reminder
      if (!currentUser) return;

      // ❌ current user already accepted
      if (currentUser.accepted !== ParticipantAcceptStatus.Pending) return;

      // ✅ ONLY PENDING FOR CURRENT USER
      if (v.type === EventType.Schedule && v.isApprovalNeeded) {
        schedules.push(v);
      } else {
        notifications.push(v);
      }
    });

    setScheduleMessageNotification(schedules);
    setCalendarNotification(notifications);
    setNotificationCount(
      schedules.length + getUniqueParentCount(notifications),
    );
  }

  function getUniqueParentCount(data: reminder[]) {
    const ids = new Set<string>();
    data.forEach((v) => ids.add(v.parent_id));
    return ids.size;
  }

  /* ===================== TASKS ===================== */

  useEffect(() => {
    if (!assignmentData?.getAssignmentForCalendar) return;
    handleTasks(assignmentData.getAssignmentForCalendar);
  }, [assignmentData]);

  // function handleTasks(assignments: any[]) {
  //   const events: TimelineListProps["events"] = {};
  //   const dots: Record<string, any> = {};

  //   assignments.forEach((v: any) => {
  //     v.dateTimeInput?.forEach((t: any) => {
  //       const start = dayjs(t.date);
  //       const dateKey = start.format("YYYY-MM-DD");

  //       events[dateKey] = [
  //         ...(events[dateKey] || []),
  //         {
  //           id: v._id,
  //           title: v.scenario?.name ?? "Task",
  //           summary: v.scenario?.description ?? "",
  //           start: start.format("YYYY-MM-DD HH:mm:ss"),
  //           end: start.add(30, "minute").format("YYYY-MM-DD HH:mm:ss"),
  //           type: "TASK",
  //           isAllDay: v.recurrent === "ANYTIME",
  //           color: "#F3F9FC",
  //           extraData: JSON.stringify(v),
  //         },
  //       ];

  //       dots[dateKey] = {
  //         dots: [{ key: "task", color: Colors.light.PrimaryColor }],
  //       };
  //     });
  //   });
  //   console.log("Final Events =>", events); // ✅ Debug
  //   setCalendarData(events);
  //   setTaskDots(dots);
  // }

  function handleTasks(assignments: any[]) {
    const events: TimelineListProps["events"] = {};
    const dots: Record<string, any> = {};

    assignments.forEach((v: any) => {
      v.dateTimeInput?.forEach((t: any) => {
        const start = dayjs(t.date);
        const end = dayjs(t.date).add(30, "minute");

        const dateKey = start.format("YYYY-MM-DD");

        // ✅ Build like Realm
        const extraDataObj = {
          _id: v._id,
          label: v.scenario?.name ?? "",
          description: v.scenario?.description ?? "",
          type: "TASK",
          recurrent: v.recurrent,
          startDate: t.date,
          startTimeInMs: v.startTimeInMs,
          endDate: t.date,
          completeTime: v.completeTime ?? null,
          daylyParams: v.daylyParams,
          montlyParams: v.montlyParams,
          dateTimeInput: v.dateTimeInput,
          members: v.members ?? [],
          tasks: v.scenario?.tasks ?? [],
          organization: {
            _id: v.organizationId,
            name: "",
          },
          isAllDay: v.recurrent === "ANYTIME",
          eventDate: t.date,
          ct: t.date,
        };

        const extraData = JSON.stringify(extraDataObj); // ✅ STRING

        const newEvent: any = {
          ...extraDataObj, // For UI
          extraData, // For parser
          id: v._id,
          title: extraDataObj.label,
          summary: extraDataObj.description,
          start: start.format("YYYY-MM-DD HH:mm:ss"),
          end: end.format("YYYY-MM-DD HH:mm:ss"),
          color: "#F3F9FC",
          isDragable: false,
        };

        // Add event
        if (events[dateKey]) {
          events[dateKey].push(newEvent);
        } else {
          events[dateKey] = [newEvent];
        }

        // Add dot
        if (dots[dateKey]) {
          dots[dateKey].dots.push({
            key: "task",
            color: Colors.light.PrimaryColor,
          });
        } else {
          dots[dateKey] = {
            dots: [{ key: "task", color: Colors.light.PrimaryColor }],
          };
        }
      });
    });

    console.log("Final Calendar Events =>", events);

    setCalendarData(events);
    setTaskDots(dots);
  }

  /* ===================== DOT MERGE ===================== */

  useEffect(() => {
    setCalenderDots({ ...taskDots, ...reminderDots });
  }, [taskDots, reminderDots]);

  /* ===================== REFRESH ===================== */

  // function SyncCalenderManually() {
  //   setLoader(true);
  //   getAppointments();
  //   getAssignments();
  //   getNotifications();
  //   setTimeout(() => setLoader(false), 800);
  // }
async function SyncCalenderManually() {
  try {
    setLoader(true);
    setCalendarLoader(true);

    await Promise.all([
      getAppointments(),
      getAssignments(),
      getNotifications(),
    ]);

  } finally {
    setLoader(false);
    setCalendarLoader(false);
  }
}

  return (
    <TouchableOpacity
      style={{ marginBottom: 5, marginRight: 5 }}
      onPress={SyncCalenderManually}
    >
      {loader ? (
        <ActivityIndicator />
      ) : (
        <EvilIcons name="refresh" size={33} color="black" />
      )}
    </TouchableOpacity>
  );
}
