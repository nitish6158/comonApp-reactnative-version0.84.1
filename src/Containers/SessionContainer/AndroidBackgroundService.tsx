import { View, Text, Platform } from "react-native";
import React, { useEffect, useRef } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { appStateAtom } from "@/Atoms/appLifeCycleAtom";
import { EventDetail } from "@notifee/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { asyncStorageKeys } from "@/Constants";
import notifee from "@notifee/react-native";
import { initialRouteAtom } from "@/navigation/Application";
import { returnCallRequestAtom } from "@/Atoms";
import { initialBottomTabScreenAtom } from "@/navigation/BottomTabNavigator";
import { calendarGlobalReminder } from "@/Atoms/CalendarAtom";
import useTaskNotificationHandler from "@/hooks/useTaskNotifcationHandler";
import { useNavigation } from "@react-navigation/core";
import { navigate } from "@/navigation/utility";
import { useAppSelector } from "@/redux/Store";
import { user } from "@/schemas/schema";
import { UserContact } from "@/graphql/generated/types";
import {
  ChangeScheduleMessageStatus,
  changeEventParticipantStatus,
  dismissNotification,
  getNotificationPayload,
  markChatRead,
} from "@/notification/BackgroundCalls";

export default function AndroidBackgroundService() {
  if (Platform.OS == "android") {
    return <BackgroundNotifications />;
  } else {
    return <></>;
  }
}

//This Component will manage all "Notification Press Event" for android
function BackgroundNotifications() {
  const appState = useAtomValue(appStateAtom);
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const NotificationCallBackData = useSetAtom(returnCallRequestAtom);
  const setCalendarReminder = useSetAtom(calendarGlobalReminder);
  const navigation = useNavigation();
  const ProfileRef = useRef<user>(MyProfile);

  const { handleTaskNotificationTap } = useTaskNotificationHandler();

  useEffect(() => {
    ProfileRef.current = MyProfile;
  }, [MyProfile]);

  useEffect(() => {
    AsyncActionCheck();
  }, [appState]);

  async function AsyncActionCheck() {
    let detail = global.androidBackgroundNotificationPress;
    if (detail) {
      handlePressAction(detail);
      global.androidBackgroundNotificationPress = null;
    }
  }

  async function handlePressAction(detail: EventDetail) {
    const keyName = detail?.notification?.android?.pressAction?.id

    // if (detail.pressAction?.id === "try-now") {
    //   let contact = typeof detail?.notification?.data?.data
    //     ? JSON.parse(detail?.notification?.data?.data)
    //     : detail?.notification?.data;

    //   if (contact.length > 0) {
    //     dismissNotification(true, contact[0]._id);
    //     navigate("ChatMessageScreen", {
    //       RoomId: contact[0].roomId,
    //     });
    //   }
    //   notifee.cancelNotification(detail?.notification?.id);
    // }

    switch (keyName) {
      case "event_main_reminder":
      case "event_before_reminder":
      case "event_notification_reminder":
      case "event_main_callreminder":
        await handleCalendarReminder(detail);
        break;
      case "event_invitation_reminder":
        navigate("CalenderNotifications", { tabIndex: 0 });
        break;
      case "schedule_before_reminder":
        navigate("CalenderNotifications", { tabIndex: 1 });
        break;
      case "reminder":
      case "taskNotification":
        handleTaskNotification(detail);
        break;
      case "message":
        await handleMessageNotification(detail);
        break;
      case "contact_reminder":
        await handleContactReminder(detail);
        break;
      case "missedCall":
        NotificationCallBackData(detail);
        break;
      default:
        console.log("Unhandled press", keyName);
    }

    await notifee.cancelNotification(detail.notification?.id);

    
    // if (detail.pressAction?.id === "dismiss") {
    //   let contact = typeof detail?.notification?.data?.data
    //     ? JSON.parse(detail?.notification?.data?.data)
    //     : detail?.notification?.data;

    //   if (contact.length > 0) {
    //     dismissNotification(true, contact[0]._id);
    //   }
    //   notifee.cancelNotification(detail?.notification?.id);
    // }
    // if (keyName == "missedCall") {
    //   if (detail.notification?.id) {
    //     NotificationCallBackData(detail);
    //     await notifee.cancelNotification(detail.notification.id);
    //   }
    // } else if (keyName == "contact_reminder") {
    //   let contact = typeof detail?.notification?.data?.data
    //     ? JSON.parse(detail?.notification?.data?.data)
    //     : detail?.notification?.data;

    //   if (contact) {
    //     dismissNotification(true, contact._id);
    //     navigate("ChatMessageScreen", {
    //       RoomId: contact.roomId,
    //     });
    //   }
    //   notifee.cancelNotification(detail.notification?.id);
    // } else if (
    //   keyName == "event_main_reminder" ||
    //   keyName == "event_before_reminder" ||
    //   keyName == "event_notification_reminder" ||
    //   keyName == "event_main_callreminder"
    // ) {
    //   navigation.navigate("CalendarTabScreen", {});
    //   let payload = detail.notification?.data?.data;
    //   setTimeout(() => {
    //     setCalendarReminder(payload);
    //   }, 3000);
    // } else if (keyName == "event_invitation_reminder") {
    //   navigation.navigate("CalenderNotifications", { tabIndex: 0 });
    // } else if (keyName == "schedule_before_reminder") {
    //   navigation.navigate("CalenderNotifications", { tabIndex: 1 });
    // } else if (detail.pressAction.id === "event-accept") {
    //   const result = detail.notification.data;
    //   console.log("result", result);
    //   await changeEventParticipantStatus(result._id, "ACCEPT");

    //   await notifee.cancelNotification(detail?.notification?.id);
    // } else if (detail.pressAction.id === "event-reject") {
    //   const result = detail.notification.data;
    //   await changeEventParticipantStatus(result._id, "REJECT");

    //   await notifee.cancelNotification(detail?.notification?.id);
    // } else if (detail.pressAction.id === "approve-message") {
    //   const result = detail.notification.data;
    //   await ChangeScheduleMessageStatus(result._id, "ACCEPT");

    //   await notifee.cancelNotification(detail?.notification?.id);
    // } else if (detail.pressAction.id === "reject-message") {
    //   const result = detail.notification.data;
    //   await ChangeScheduleMessageStatus(result._id, "REJECT");

    //   await notifee.cancelNotification(detail?.notification?.id);
    // } else {
    //   const notificationData = detail?.notification?.data;
    //   const type = notificationData?.TYPE;

    //   if (type == "TASK") {
    //     if (notificationData?.data?.assignmentId && notificationData?.data?.organizationId) {
    //       handleTaskNotificationTap(notificationData?.data?.organizationId, notificationData?.data?.assignmentId);
    //       return;
    //     }
    //   }
    //   if (type == "TASK_COMPLETE") {
    //     navigate("ReportScreen", {
    //       reportId: detail.notification?.data?.data.reportId,
    //     });
    //   }
    //   if (type == "CHAT") {
    //     // console.log("notificationData?.assignmentData", notificationData?.assignmentData);
    //     if (notificationData?.assignmentData?.assignmentId && notificationData?.assignmentData?.orgId) {
    //       handleTaskNotificationTap(
    //         notificationData?.assignmentData?.orgId,
    //         notificationData?.assignmentData?.assignmentId
    //       );
    //       return;
    //     }
    //     const roomID = detail?.notification?.data?.myMessage?.roomId;
    //     global.roomId = roomID;

    //     if (ProfileRef.current.mode == "CLASSIC") {
    //       navigate("ChatMessageScreen", { RoomId: roomID });
    //     }
    //     if (ProfileRef.current.mode == "SENIORCITIZEN") {
    //       navigate("SeniorChatMessageScreen", {
    //         roomId: roomID,
    //       });
    //     }
    //   } else {
    //     // console.log(initialNotification?.notification.android);
    //   }
    // }
  }

  const IOSParse = (detail: any) => {
    return typeof detail.notification?.data.data == "string"
      ? parseNotificationData(detail.notification?.data?.data)
      : detail.notification?.data;
  };


  const handleContactReminder = async (detail: any) => {
    let contact = IOSParse(detail)
    if (contact?.data?.notificationId) {
      let res = await getNotificationPayload(contact.data.notificationId);
      let result = JSON.parse(res.payload);
      //TASK Notifications not have result.data
      let data = typeof result.data == "string" ? JSON.parse(result.data) : result;
      contact = data[0];
    }

    if (contact) {
      dismissNotification(true, contact._id);
      navigate("ChatMessageScreen", {
        RoomId: contact.roomId,
      });
    }
    notifee.cancelNotification(detail.notification?.id);
  };

  const handleCalendarReminder = async (detail: any) => {
    let payload = IOSParse(detail)

    if (payload?.data?.notificationId) {
      let res = await getNotificationPayload(payload.data.notificationId);
      let result = JSON.parse(res.payload);
      //TASK Notifications not have result.data
      payload = typeof result.data == "string" ? JSON.parse(result.data) : result;
      
    }else{
      payload = payload.data
    }

    navigate("CalendarTabScreen", {});
    setTimeout(() => {
      setCalendarReminder(payload);
    }, 3000);
  };

  const handleMessageNotification = async (detail: any) => {
    let parsedData = IOSParse(detail)
    let roomID = parsedData.myMessage.roomId;
    global.roomId = roomID;

    await markChatRead(parsedData);

    if (ProfileRef.current.mode === "CLASSIC") {
      navigate("ChatMessageScreen", { RoomId: roomID });
    } else if (ProfileRef.current.mode === "SENIORCITIZEN") {
      navigate("SeniorChatMessageScreen", { roomId: roomID });
    }
  };

  const handleTaskNotification = async (detail: any) => {
    let TaskData = IOSParse(detail)
    console.log("handleTaskNotification",TaskData)
    if (TaskData?.data?.notificationId) {
      let res = await getNotificationPayload(TaskData.data.notificationId);
      let result = JSON.parse(res.payload);
      //TASK Notifications not have result.data
      TaskData = typeof result.data == "string" ? JSON.parse(result.data) : result;
      
    }
    console.log("handleTaskNotification",TaskData)
    if (TaskData?.assignmentId && TaskData?.organizationId) {
      global.activeOrg = TaskData?.organizationId
      handleTaskNotificationTap(TaskData?.organizationId, TaskData?.assignmentId);
    }
  };

  const parseNotificationData = (data: any) => {
    return typeof data === "string" ? JSON.parse(data) : data;
  };

  return <></>;
}
