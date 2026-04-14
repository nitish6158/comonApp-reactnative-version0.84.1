import { AppState, PermissionsAndroid, Platform } from "react-native";
import { CallNotification } from "@Notification/Interfaces/Call";
import RNVoipCall, { RNVoipPushKit } from "react-native-voips-calls";
import React, { useEffect, useRef } from "react";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { getDataFromAsync, removeDataFromAsync } from "@Util/asyncstorage.utils";
import {
  useChangeCallStatusMutation,
  useGetChannelStatusLazyQuery,
  useGetOnGoingCallsLazyQuery,
} from "@/graphql/generated/call.generated";

import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";

import DeviceInfo from "react-native-device-info";

import { asyncStorageKeys } from "@/Constants/asyncStorageKeys";
import { callAtom } from "@Atoms/callAtom";

import dayjs from "dayjs";

import notifee from "@notifee/react-native";

import { returnCallRequestAtom } from "@Atoms/callEventManagerAtom";
import { useDispatch } from "react-redux";
import useTaskNotificationHandler from "@/hooks/useTaskNotifcationHandler";
import { getCurrentRoute, navigate } from "../navigation/utility";
import { callQueueAtom, deviceUniqueID, initialRouteAtom } from "../navigation/Application";
import { initialBottomTabScreenAtom } from "@/navigation/BottomTabNavigator";
import { calendarGlobalReminder } from "@/Atoms/CalendarAtom";
import { reminder, user } from "@/schemas/schema";
import { removeActiveCall } from "@/redux/Reducer/CallReducer";
import { useAppSelector } from "@/redux/Store";
import { dismissNotification, getNotificationPayload, markChatRead } from "@/notification/BackgroundCalls";
import { UserContact } from "@/graphql/generated/types";
import { KillStateTaskAtom } from "./SessionContainer/PlatformForegroundService";
import { storage } from "@/redux/backup/mmkv";
import { getSession } from "@/utils/session";

export default function InitialCallingContainer() {
  const [channelStatusRequest] = useGetChannelStatusLazyQuery();
  const dispatch = useDispatch();
  const setCallRequest = useSetAtom(callAtom);
  const setCallQueue = useSetAtom(callQueueAtom);
  const setInitialRoute = useSetAtom(initialRouteAtom);
  const NotificationCallBackData = useSetAtom(returnCallRequestAtom);
  const [onGoingCallRequest] = useGetOnGoingCallsLazyQuery();
  const [changeCallStatus] = useChangeCallStatusMutation();
  const setDeviceUniqueID = useSetAtom(deviceUniqueID);
  const setBottomTabScreen = useSetAtom(initialBottomTabScreenAtom);
  const setCalendarReminder = useSetAtom(calendarGlobalReminder);
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const ProfileRef = useRef<user | null>(MyProfile);
  const setKillStateTask = useSetAtom(KillStateTaskAtom);
  const lastHandledNotificationIdRef = useRef<string>("");

  useEffect(() => {
    ProfileRef.current = MyProfile;
  }, [MyProfile]);

  useEffect(() => {
    onGoingCallRequest();
    const unsubscribeNotificationOpen = messaging().onNotificationOpenedApp(
      async (remoteMessage) => {
        if (!remoteMessage) return;
        const normalizedDetail = normalizeFirebaseNotification(remoteMessage);
        await handleInitialNotificationPress(normalizedDetail);
      }
    );

    if (Platform.OS == "ios") {
      IOSVoipCallForegroundAndBackgroundDataHandler();
      IOSInitialNotificationFromNotify();
      IOSInitialNotificationFromFirebase();
    }
    if (Platform.OS == "android") {
      AndroidBackgroundCallActionHandler();
      AndroidActiveBackgroundCallHandler();
      AndroidAppStateCallHandler();
      AndroidAskForPostNotification();
      AndroidInitialNotificationFromNotify();
      AndroidInitialNotificationFromFirebase();
    }
    getDeviceId();

    return () => {
      unsubscribeNotificationOpen();
    };
  }, []);

  async function getDeviceId() {
    const deviceToken = await AsyncStorage.getItem(asyncStorageKeys.deviceToken);
    const uniqueId = await DeviceInfo.getUniqueId();

    setDeviceUniqueID(Platform.OS === "ios" ? deviceToken : uniqueId);
  }

  // This function invokes the Voip Notification receiver for iOS.
  // It collects the voip call data when a voip call comes to the iOS device in the foreground or background
  // and sets it to the atom, which can be used throughout the app.
  function IOSVoipCallForegroundAndBackgroundDataHandler() {
    RNVoipPushKit.RemotePushKitNotificationReceived(
      (notification: { data: { data: CallNotification; uuid: number } }) => {
        const rawData = notification?.data?.data;
        const callData = typeof rawData == "string" ? (JSON.parse(rawData) as CallNotification) : rawData;
        console.log("INITIAL_CALLING iOS setCallQueue", {
          callId: callData?.data?.callId,
          origin: callData?.data?.origin,
          roomType: callData?.data?.roomType,
          notificationType: callData?.notificationType,
        });
        setCallQueue(callData);
      }
    );
  }

  async function IOSInitialNotificationFromNotify() {
    const detail = await notifee.getInitialNotification();

    if (detail) {
      await handleInitialNotificationPress(detail);
    }

    // if (initialNotification) {
    //   const keyName = initialNotification?.notification?.ios?.categoryId;
    //   if (keyName == "message") {
    //     const messageRaw = JSON.parse(initialNotification?.notification.data.data);
    //     if (messageRaw?.assignmentData?.assignmentId && messageRaw?.assignmentData?.orgId) {
    //       handleTaskNotificationTap(messageRaw?.assignmentData?.orgId, messageRaw?.assignmentData?.assignmentId);
    //       return;
    //     }
    //     const roomID = messageRaw.myMessage.roomId;
    //     global.roomId = roomID;

    //     setInitialRoute({
    //       name: ProfileRef.current.mode == "SENIORCITIZEN" ? "SeniorChatMessageScreen" : "ChatMessageScreen",
    //       payload: ProfileRef.current.mode == "SENIORCITIZEN" ? { roomId: roomID } : { RoomId: roomID },
    //     });
    //   } else if (keyName == "contact_reminder") {
    //     let contact =
    //       typeof initialNotification.notification.data.data == "string"
    //         ? JSON.parse(initialNotification.notification.data.data)
    //         : initialNotification.notification.data;

    //     let res = await getNotificationPayload(contact.data.notificationId);
    //     let result = JSON.parse(res.payload);
    //     //TASK Notifications not have result.data
    //     let resultData = typeof result.data == "string" ? JSON.parse(result.data) : result;

    //     if (resultData.length > 0) {
    //       dismissNotification(true, resultData[0]._id);
    //       setInitialRoute({
    //         name: "ChatMessageScreen",
    //         payload: { RoomId: resultData[0].roomId },
    //       });
    //     }
    //     notifee.cancelNotification(initialNotification.notification?.id);
    //   } else if (keyName == "event_invitation_reminder") {
    //     setInitialRoute({
    //       name: "CalenderNotifications",
    //       payload: {
    //         tabIndex: 0,
    //       },
    //     });
    //   } else if (keyName == "schedule_before_reminder") {
    //     setInitialRoute({
    //       name: "CalenderNotifications",
    //       payload: {
    //         tabIndex: 1,
    //       },
    //     });
    //   } else if (
    //     keyName == "event_main_reminder" ||
    //     keyName == "event_before_reminder" ||
    //     keyName == "event_notification_reminder" ||
    //     keyName == "event_main_callreminder"
    //   ) {
    //     setBottomTabScreen("CalendarTabScreen");
    //     //Reminder Payload is having 3 level of JSON parse data because it is coming form APN
    //     let data = initialNotification.notification?.data?.data as string;
    //     let payload = typeof data == "string" ? JSON.parse(data) : data;
    //     let payload2 = typeof payload.data == "string" ? JSON.parse(payload.data) : payload.data;

    //     let res = await getNotificationPayload(payload2.notificationId);
    //     let result = JSON.parse(res.payload);
    //     //TASK Notifications not have result.data
    //     let resultData = typeof result.data == "string" ? JSON.parse(result.data) : result;
    //     console.log("resultData",resultData)
    //     setTimeout(() => {
    //       setCalendarReminder(resultData);
    //     }, 3000);
    //   } else if (
    //     initialNotification.notification.data?.TYPE == "TASK" ||
    //     initialNotification.notification.data?.type == "REMINDER"
    //   ) {
    //     if (initialNotification.notification.data?.TYPE == "TASK") {
    //       const notificationData = initialNotification.notification.data;
    //       if (notificationData?.data?.assignmentId && notificationData?.data?.organizationId) {
    //         handleTaskNotificationTap(notificationData?.data?.organizationId, notificationData?.data?.assignmentId);
    //         return;
    //       }
    //     }
    //     if (initialNotification.notification.data?.type == "REMINDER") {
    //       const notificationData =
    //         typeof initialNotification.notification.data?.data == "string"
    //           ? JSON.parse(initialNotification.notification.data?.data)
    //           : initialNotification.notification.data?.data;
    //       if (notificationData?.data?.assignmentId && notificationData?.data?.organizationId) {
    //         handleTaskNotificationTap(notificationData?.data?.organizationId, notificationData?.data?.assignmentId);
    //         return;
    //       }
    //     }
    //   }
    // }
  }

  async function IOSInitialNotificationFromFirebase() {
    const remoteMessage = await messaging().getInitialNotification();
    if (!remoteMessage) return;

    const normalizedDetail = normalizeFirebaseNotification(remoteMessage);
    await handleInitialNotificationPress(normalizedDetail);
  }

  const IOSParse = (detail: any) => {
    const notificationData = detail?.notification?.data;
    if (!notificationData) return {};

    if (notificationData?.data !== undefined) {
      return parseNotificationData(notificationData?.data);
    }

    return parseNotificationData(notificationData);
  };

  const deepParse = (value: any, depth = 0): any => {
    if (depth > 3) return value;
    if (typeof value !== "string") return value;
    try {
      return deepParse(JSON.parse(value), depth + 1);
    } catch {
      return value;
    }
  };

  const extractRoomIdFromPayload = (payload: any): string | undefined => {
    const parsedPayload = deepParse(payload);

    const directRoomId =
      parsedPayload?.myMessage?.roomId ||
      parsedPayload?.myMessage?.roomID ||
      parsedPayload?.roomId ||
      parsedPayload?.roomID ||
      parsedPayload?.data?.roomId ||
      parsedPayload?.data?.roomID ||
      parsedPayload?.data?.myMessage?.roomId ||
      parsedPayload?.data?.myMessage?.roomID;

    if (directRoomId) return String(directRoomId);

    if (typeof parsedPayload === "object" && parsedPayload !== null) {
      for (const key of Object.keys(parsedPayload)) {
        const nested = parsedPayload[key];
        const nestedRoomId = extractRoomIdFromPayload(nested);
        if (nestedRoomId) return nestedRoomId;
      }
    }

    return undefined;
  };

  const hasMessageRoomId = (payload: any) => {
    return Boolean(extractRoomIdFromPayload(payload));
  };

  const resolveNotificationKey = (detail: any) => {
    const keyName =
      Platform.OS === "ios"
        ? detail?.notification?.ios?.categoryId
        : detail?.notification?.android?.pressAction?.id;

    const normalizeKey = (value: any) => {
      const text = String(value || "").trim();
      const upper = text.toUpperCase();
      const lower = text.toLowerCase();

      if (upper === "CHAT" || lower === "message") return "message";
      if (upper === "CONTACT_REMINDER" || lower === "contact_reminder") return "contact_reminder";
      if (upper === "TASK" || lower === "tasknotification") return "taskNotification";
      if (upper === "REMINDER" || lower === "reminder") return "reminder";
      if (upper === "MISSEDCALL" || lower === "missedcall") return "missedCall";
      if (upper === "EVENT_INVITATION_REMINDER") return "event_invitation_reminder";
      if (upper === "SCHEDULE_BEFORE_REMINDER") return "schedule_before_reminder";
      if (upper === "EVENT_MAIN_REMINDER") return "event_main_reminder";
      if (upper === "EVENT_BEFORE_REMINDER") return "event_before_reminder";
      if (upper === "EVENT_NOTIFICATION_REMINDER") return "event_notification_reminder";
      if (upper === "EVENT_MAIN_CALLREMINDER") return "event_main_callreminder";

      return text;
    };

    if (keyName) return normalizeKey(keyName);

    const parsedData = IOSParse(detail);
    if (parsedData?.TYPE === "TASK" || parsedData?.type === "TASK") return "taskNotification";
    if (
      parsedData?.TYPE === "REMINDER" ||
      parsedData?.type === "REMINDER" ||
      parsedData?.type === "reminder"
    ) {
      return "reminder";
    }
    if (parsedData?.type) return normalizeKey(parsedData?.type);
    if (parsedData?.TYPE) return normalizeKey(parsedData?.TYPE);
    if (hasMessageRoomId(parsedData)) return "message";
    if (parsedData?.data?.notificationId) return "contact_reminder";

    return "";
  };

  const normalizeFirebaseNotification = (remoteMessage: any) => {
    const data = remoteMessage?.data || {};
    const rawCategory =
      data?.categoryId ||
      data?.category ||
      data?.key ||
      data?.type ||
      data?.notificationType ||
      "";

    return {
      notification: {
        id: remoteMessage?.messageId || data?.notificationId || "",
        ios: {
          categoryId: rawCategory,
        },
        android: {
          pressAction: {
            id: rawCategory,
          },
        },
        data,
      },
    };
  };

  const getStableNotificationId = (detail: any) => {
    const explicitId = detail?.notification?.id;
    if (explicitId) return String(explicitId);

    const parsedData = IOSParse(detail);
    const roomId = extractRoomIdFromPayload(parsedData);
    const notificationId = parsedData?.data?.notificationId;

    if (roomId) return `room:${roomId}`;
    if (notificationId) return `notification:${notificationId}`;
    return "";
  };

  const handleInitialNotificationPress = async (detail: any) => {
    if (!detail) return;

    const stableId = getStableNotificationId(detail);
    if (stableId && lastHandledNotificationIdRef.current === stableId) return;
    if (stableId) lastHandledNotificationIdRef.current = stableId;

    const keyName = resolveNotificationKey(detail);
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

    if (detail?.notification?.id) {
      await notifee.cancelNotification(detail.notification.id);
    }
  };

  const handleContactReminder = async (detail: any) => {
    let contact = IOSParse(detail);
    if (contact?.data?.notificationId) {
      let res = await getNotificationPayload(contact.data.notificationId);
      let result = JSON.parse(res.payload);
      //TASK Notifications not have result.data
      let data = typeof result.data == "string" ? JSON.parse(result.data) : result;
      contact = data[0];
    }

    if (contact) {
      dismissNotification(true, contact._id);
      // navigate("ChatMessageScreen", {
      //   RoomId: contact.roomId,
      // });
      setInitialRoute({
        name: "ChatMessageScreen",
        payload: { RoomId: contact.roomId },
      });
    }
    notifee.cancelNotification(detail.notification?.id);
  };

  const handleCalendarReminder = async (detail: any) => {
    let payload = IOSParse(detail);

    if (payload?.data?.notificationId) {
      let res = await getNotificationPayload(payload.data.notificationId);
      let result = JSON.parse(res.payload);
      //TASK Notifications not have result.data
      payload = typeof result.data == "string" ? JSON.parse(result.data) : result;
    } else {
      payload = payload.data;
    }

    setInitialRoute({
      name: "BottomTabScreen",
      payload: { name: "CalendarTabScreen", payload },
    });
  };

  const handleMessageNotification = async (detail: any) => {
    let parsedData = deepParse(IOSParse(detail));
    let roomID = extractRoomIdFromPayload(parsedData);

    if (!roomID) {
      console.log("Unable to resolve roomId from initial notification payload", parsedData);
      return;
    }

    global.roomId = roomID;

    await markChatRead(parsedData).catch((error) => {
      console.log("markChatRead failed", error);
    });

    const fallbackSession = await getSession();
    const userMode = ProfileRef.current?.mode || fallbackSession?.mode || "CLASSIC";

    if (userMode === "CLASSIC") {
      setInitialRoute({
        name: "ChatMessageScreen",
        payload: { RoomId: roomID },
      });
      setTimeout(() => {
        if (getCurrentRoute() !== "ChatMessageScreen") {
          navigate("ChatMessageScreen", { RoomId: roomID });
        }
      }, 1400);
    } else if (userMode === "SENIORCITIZEN") {
      setInitialRoute({
        name: "SeniorChatMessageScreen",
        payload: { roomId: roomID },
      });
      setTimeout(() => {
        if (getCurrentRoute() !== "SeniorChatMessageScreen") {
          navigate("SeniorChatMessageScreen", { roomId: roomID });
        }
      }, 1400);
    }
  };

  const handleTaskNotification = async (detail: any) => {
    let TaskData = IOSParse(detail);
    console.log("handleTaskNotification", TaskData);
    if (TaskData?.data?.notificationId) {
      let res = await getNotificationPayload(TaskData.data.notificationId);
      let result = JSON.parse(res.payload);
      //TASK Notifications not have result.data
      TaskData = typeof result.data == "string" ? JSON.parse(result.data) : result;
    }
    console.log("handleTaskNotification", TaskData);
    if (TaskData?.assignmentId && TaskData?.organizationId) {
      global.activeOrg = TaskData?.organizationId;
      setKillStateTask({ orgId: TaskData?.organizationId, assignId: TaskData?.assignmentId });
      // handleTaskNotificationTap(TaskData?.organizationId, TaskData?.assignmentId);
    }
  };

  const parseNotificationData = (data: any) => {
    return typeof data === "string" ? JSON.parse(data) : data;
  };

  //This function will handle Android Notification permission
  function AndroidAskForPostNotification() {
    PermissionsAndroid.request("android.permission.POST_NOTIFICATIONS")
      .then((res) => {
        // console.log("Android permission successfull", res);
      })
      .catch((err) => {
        console.log("Error in request POST_NOTIFICATIONS android permissions");
      });
  }

  //Background Notification Action handler for Android this will handle actions that user taken on notifee Notification on kill state.
  //This function is only for Android because on IOS InitialNotification will get on ForegroundEvents listener.
  async function AndroidInitialNotificationFromNotify() {
    const detail = await notifee.getInitialNotification();

    if (detail) {
      await handleInitialNotificationPress(detail);
    }
  }

  async function AndroidInitialNotificationFromFirebase() {
    const remoteMessage = await messaging().getInitialNotification();
    if (!remoteMessage) return;

    const normalizedDetail = normalizeFirebaseNotification(remoteMessage);
    await handleInitialNotificationPress(normalizedDetail);
  }

  // This function handles the background call actions on Android.
  // It checks for the event and sets the data for the fullModal or starts the call directly.
  function AndroidBackgroundCallActionHandler() {
    getDataFromAsync(asyncStorageKeys.backgroundHandler).then((res) => {
      if (res) {
        // console.log("res", res);
        const isExpiry = dayjs().isAfter(dayjs(res.expiry).add(60, "seconds"), "seconds");

        if (!isExpiry) {
          if (res.fromForeground) {
            console.log("INITIAL_CALLING Android backgroundHandler fromForeground setCallQueue", {
              callId: res?.data?.callId,
              origin: res?.data?.origin,
              roomType: res?.data?.roomType,
              notificationType: res?.notificationType,
            });
            setCallQueue(res);
            removeDataFromAsync(asyncStorageKeys.backgroundHandler);
          } else {
            RNVoipCall.getInitialNotificationActions()
              .then(async (data: { action: string }) => {
                console.log("getInitialNotificationActions", data.action);
                if (data.action == "contentTap" || data.action == "fullScreenIntent") {
                  if (res) {
                    console.log("AndroidBackgroundCallActionHandler:-setCallQueue");
                    console.log("INITIAL_CALLING Android action setCallQueue", {
                      action: data.action,
                      callId: res?.data?.callId,
                      origin: res?.data?.origin,
                      roomType: res?.data?.roomType,
                      notificationType: res?.notificationType,
                    });
                    setCallQueue(res);

                    removeDataFromAsync(asyncStorageKeys.backgroundHandler);
                  }
                } else if (data.action == "callAnswer") {
                  if (res) {
                    setCallRequest({
                      roomName: res?.notification.title,
                      isReceiver: true,
                      roomId: res?.data?.roomId,
                      callId: res?.data.callId,
                      channelId: res?.data.channelName,
                      channelName: res?.data.channelName,
                      callType: res?.data.type,
                      roomType: res?.data.roomType,
                      participants: res?.data.callParticipants,
                      callBackground: res?.data.callBackground,
                    });

                    if (Platform.OS == "android") {
                      RNVoipCall.endAllCalls();
                    }
                    RNVoipCall.stopRingtune();

                    removeDataFromAsync(asyncStorageKeys.backgroundHandler);
                  }
                }
              })
              .catch(async (e: any) => {
                //call
                // console.log(e);
                // const MyProfile = await getDataFromAsync("MyProfile");
                // console.log({ callId: res.callId, userId: MyProfile?._id, status: "rejected" });
                // changeCallStatus({
                //   variables: { input: { callId: res.data.callId, userId: MyProfile?._id, status: "rejected" } },
                // });
                // storage.delete(asyncStorageKeys.backgroundHandler);
                console.log("INITIAL_CALLING Android getInitialNotificationActions catch setCallQueue", {
                  callId: res?.data?.callId,
                  origin: res?.data?.origin,
                  roomType: res?.data?.roomType,
                  notificationType: res?.notificationType,
                });
                setCallQueue(res);

                removeDataFromAsync(asyncStorageKeys.backgroundHandler);
              });
          }
        } else {
          removeDataFromAsync(asyncStorageKeys.backgroundHandler);
        }
      }
    });
  }

  // backgroundCallReject:- This function handles the active background calls on Android.
  // If the user is on a call and kills the app, they can still continue talking.
  // When the user re-opens the app, this function shows the CallUI again in Android.
  // If the user rejects the call in the background or other participants reject the call,
  // then on the next app open, this function handles the CallUI.
  async function AndroidActiveBackgroundCallHandler() {
    const activeAsyncCall = await AsyncStorage.getItem("activeCallData");
    const isBackgroundCallRejectedAsync = await AsyncStorage.getItem("backgroundCallReject");
    if (activeAsyncCall != null && isBackgroundCallRejectedAsync == null) {
      const activeCallKeys = JSON.parse(activeAsyncCall);
      const currentUser = ProfileRef.current;
      if (activeCallKeys?.callId && activeCallKeys?.channelId && currentUser) {
        // Check for active call
        channelStatusRequest({
          variables: {
            input: {
              callId: activeCallKeys.callId,
              channelName: activeCallKeys.channelId,
            },
          },
        }).then((channelStatus) => {
          const getChannelStatus = channelStatus.data?.getChannelStatus;
          // If the channel exists, join the call
          if (getChannelStatus?.isChannelExists) {
            const callHistory = getChannelStatus.call?.callParticipants.find(
              (el) => el?.userId?._id === currentUser?._id
            );
            const callJoinedAt = callHistory?.callHistory[0]?.callJoinedAt;
            const myUid = getChannelStatus.call?.callParticipants.find((e) => e?.userId._id == currentUser?._id)?.uid;
            const activeCallUids = getChannelStatus.users
              ?.filter((e) => Number(e) !== Number(myUid))
              .map((e) => Number(e));
            const payload = {
              roomName: activeCallKeys.roomName,
              isReceiver: activeCallKeys.isReceiver,
              roomId: activeCallKeys.roomId,
              callId: activeCallKeys.callId,
              channelId: activeCallKeys.channelId,
              channelName: activeCallKeys.channelId,
              callType: activeCallKeys.callType,
              roomType: activeCallKeys.roomType,
              participants: activeCallKeys.participants,
              callBackground: activeCallKeys.callBackground,
              appKilled: {
                status: true,
                startTime: callJoinedAt,
                participantUid: activeCallUids,
              },
            };
            console.log("channel exist payload", payload);
            setCallRequest(payload);
          } else {
            dispatch(removeActiveCall());
            AsyncStorage.removeItem("backgroundCallReject");
            AsyncStorage.removeItem("activeCallData");
            console.log("channel not exist", getChannelStatus);
          }
        });
      } else {
        console.log("activeCallKeys are not defined");
        dispatch(removeActiveCall());
        AsyncStorage.removeItem("backgroundCallReject");
      }
    } else {
      console.log("call is rejected already");
      dispatch(removeActiveCall());
      AsyncStorage.removeItem("backgroundCallReject");
    }
  }

  //if user is in background state and got new call then if user come back to active state then check for active call data by getting backgroundHandler data from Async storage then show FullScreen Call model
  function AndroidAppStateCallHandler() {
    AppState.addEventListener("change", async (nextAppState) => {
      console.log("nextAppState", nextAppState);
      if (nextAppState == "active") {
        const callData = await getDataFromAsync(asyncStorageKeys.backgroundHandler);
        console.log("AndroidAppStateCallHandler", typeof callData, callData);
        const callEndQueue = await AsyncStorage.getItem("endCallQueue");
        const callStartedQueue = await AsyncStorage.getItem("callQueue");
        if (callEndQueue == callStartedQueue) {
          console.log("remove callqueue");
          setCallQueue(null);
        }
        if (callData != null) {
          AsyncStorage.setItem("callQueue", callData?.data?.callId);
          setCallQueue(callData);
        } else {
          setCallQueue(null);
        }
      }
    });
  }

  return <></>;
}
