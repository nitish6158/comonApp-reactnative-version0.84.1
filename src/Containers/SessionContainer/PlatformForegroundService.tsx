import { callAtom, returnCallRequestAtom } from "@/Atoms";
import { activeScenarioAtom } from "@/Atoms/AssignmentAtom";
import { calendarGlobalReminder } from "@/Atoms/CalendarAtom";
import { seniorChatAlertAtom } from "@/Atoms/seniorModeAtom";
import { useMyAssignmentsLazyQuery } from "@/graphql/generated/assigment.generated";
import {
  useGetMyInvitesLazyQuery,
  useGetMyInvitesQuery,
} from "@/graphql/generated/organization.generated";
import { useScenarioLazyQuery } from "@/graphql/generated/scenario.generated";
import { User, UserContact } from "@/graphql/generated/types";
import useTaskNotificationHandler from "@/hooks/useTaskNotifcationHandler";
import { callQueueAtom, missedCallAtom } from "@/navigation/Application";
import {
  setAssignments,
  setOrganisationInvites,
} from "@/redux/Reducer/OrganisationsReducer";
import { useAppSelector } from "@/redux/Store";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import messaging from "@react-native-firebase/messaging";
import {
  invokeVoipCall,
  Message,
  onMessageReceived,
} from "@/notification/NotificationDispaly";
import { socket } from "@/redux/Reducer/SocketSlice";
import notifee, { EventType } from "@notifee/react-native";
import { Platform } from "react-native";
import {
  ChangeScheduleMessageStatus,
  RequestCallWaiting,
  changeEventParticipantStatus,
  dismissNotification,
  getNotificationPayload,
  markChatRead,
  notificationLog,
  updateChat,
} from "@/notification/BackgroundCalls";
import { navigate } from "@/navigation/utility";
import { reminder } from "@/schemas/schema";
import {
  CallNotification,
  CallNotificationSchema,
} from "@/notification/Interfaces/Call";
import { Chat } from "@/notification/Interfaces/Chat";
import { stopAllPlayers } from "@/utils/player.utils";
import RNVoipCall from "react-native-voips-calls";
import {
  removeDataFromAsync,
  setDataInAsync,
} from "@/utils/asyncstorage.utils";
import { asyncStorageKeys } from "@/Constants";
import { getSession } from "@/utils/session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { socketManager } from "@/utils/socket/SocketManager";

let assignmentCopy = [];

export let KillStateTaskAtom = atom<{ orgId: string; assignId: string } | null>(
  null
);

export default function PlatformForegroundService() {
  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);
  const id = MyProfile?._id;

  const ProfileRef = useRef<User | null>(MyProfile);
  const { handleTaskNotificationTap } = useTaskNotificationHandler();

  useEffect(() => {
    ProfileRef.current = MyProfile;
  }, [MyProfile]);

  const setCallQueue = useSetAtom(callQueueAtom);
  const setMissedCall = useSetAtom(missedCallAtom);
  const activeCallRequest = useAtomValue(callAtom);

  const NotificationCallBackData = useSetAtom(returnCallRequestAtom);
  const setActiveScenario = useSetAtom(activeScenarioAtom);

  const setCallRequest = useSetAtom(callAtom);

  const { assignments, organizations } = useAppSelector(
    (state) => state.Organisation
  );

  const [getInvites] = useGetMyInvitesLazyQuery();
  const { refetch } = useGetMyInvitesQuery();
  const [scenarioRequest] = useScenarioLazyQuery({ fetchPolicy: "no-cache" });

  const [requestAssignment] = useMyAssignmentsLazyQuery({
    fetchPolicy: "no-cache",
  });

  const dispatch = useDispatch();

  const setCalendarReminder = useSetAtom(calendarGlobalReminder);
  const setSeniorChatAlert = useSetAtom(seniorChatAlertAtom);
  const [getInviteRequest] = useGetMyInvitesLazyQuery();

  useEffect(() => {
    getInviteRequest()
      .then((res) => {
        if (res.data?.getMyInvites) {
          // console.log("getInviteRequest",res.data?.getMyInvites)
          dispatch(setOrganisationInvites(res.data.getMyInvites));
        }
      })
      .catch(console.log);
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage((message) => {
      const { data, type } = message.data as Message["data"];
      handleFirebaseOnMessage(data, type, message);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    assignmentCopy = assignments;
  }, [assignments]);

  useEffect(() => {
    socketManager.voip.onVoipFailed((data) => {
      console.log("onVoipFailed", data);
    });
    if (typeof socket?.on == "function") {
      socket?.on("message", (data) => {
        // if (data.type == "logout") {
        //   console.log("Can I logout you");
        //   forceLogout();
        // }
        if (data?.type === "voipFailed") {
          const parsedData =
            typeof data?.msg === "string" ? JSON.parse(data?.msg) : data?.msg;
          if (parsedData?.userId === MyProfile?._id) {
            topicReSubscription();
          }
        }
        if (data?.type === "invited") {
          refetch()
            .then((response) => {
              dispatch(setOrganisationInvites(response.data.getMyInvites));
            })
            .catch((err) => {
              console.log("Error in refetching organisation invites", err);
            });
        }

        if (data?.type === "addAssignmentMember") {
          if (global.activeOrg) {
            const parsedData =
              typeof data?.msg === "string" ? JSON.parse(data?.msg) : data?.msg;
            if (parsedData?.orgId == global.activeOrg) {
              requestAssignment({
                variables: {
                  input: {
                    organizationId: parsedData?.orgId,
                    skip: 0,
                    limit: 50,
                  },
                },
              })
                .then((res) => {
                  res.refetch().then((res) => {
                    dispatch(setAssignments(res.data?.myAssignments.data));
                  });
                })
                .catch((err) => {
                  dispatch(setAssignments([]));
                  console.log(err);
                });
            }
          }
        }
        if (data?.type == "removeAssignmentMember") {
          const parsedData =
            typeof data?.msg === "string" ? JSON.parse(data?.msg) : data?.msg;

          if (parsedData?.orgId == global.activeOrg) {
            const removedAssignment = assignmentCopy?.filter(
              (e) => e?._id != parsedData?.assignmentId
            );
            dispatch(setAssignments(removedAssignment));
          }
        }
        if (data?.type == "taskUpdated" || data.type == "updateScenario") {
          const parsedData =
            typeof data?.msg === "string" ? JSON.parse(data?.msg) : data?.msg;

          if (global.activeOrg == parsedData?.orgId) {
            const assignmentAlreadyExist = assignmentCopy?.find(
              (e) => e?._id == parsedData?.assignmentId
            );
            if (assignmentAlreadyExist) {
              scenarioRequest({
                variables: {
                  input: {
                    _id: assignmentAlreadyExist?.scenario?._id,
                    orgId: global.activeOrg,
                  },
                },
              }).then((response) => {
                if (response.error) {
                  console.error("Error in getting scenario", response.error);
                  return;
                }
                requestAssignment({
                  variables: {
                    input: {
                      organizationId: parsedData?.orgId,
                      skip: 0,
                      limit: 50,
                    },
                  },
                })
                  .then((res) => {
                    res.refetch().then((res) => {
                      dispatch(setAssignments(res.data?.myAssignments.data));
                    });
                  })
                  .catch((err) => {
                    dispatch(setAssignments([]));
                    console.log(err);
                  });
                if (response.data?.scenario) {
                  setActiveScenario(response.data?.scenario);
                }
              });
            }
          }
        }
        if (data.type == "overDueReminder") {
          if (global.activeOrg == data?.msg?.orgId) {
            const newAssignment = assignmentCopy.map((e) => {
              if (e._id == data?.msg?.assignmentId) {
                return {
                  ...e,
                  status: "Overdue",
                };
              }
              return e;
            });
            dispatch(setAssignments(newAssignment));
          }
        }
        if (data.type == "taskStartingReminder") {
          if (global.activeOrg === data?.msg?.orgId) {
            const newAssignment = assignmentCopy.map((e) => {
              if (e._id == data?.msg?.assignmentId) {
                return {
                  ...e,
                  status: "To Perform",
                };
              }
              return e;
            });
            dispatch(setAssignments(newAssignment));
          }
        }
        if (data.type == "assignmentDeleted") {
          console.log("data", data);
          const assignment = assignmentCopy.filter(
            (e) => e?._id != data?.msg.assignmentId
          );
          dispatch(setAssignments(assignment));
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(async ({ type, detail }) => {
      console.log(Platform.OS, type, detail);
      const keyName = resolveNotificationKey(detail);

      const isMessageTapWithoutCategory =
        keyName === "message" || hasMessageRoomId(IOSParse(detail));

      if (type === EventType.PRESS && isMessageTapWithoutCategory) {
        await handleMessageNotification(detail);
        await notifee.cancelNotification(detail.notification?.id);
        return;
      }

      const pressKey = Platform.select({
        ios: detail?.notification?.ios?.categoryId,
        android: detail?.notification?.android?.pressAction?.id,
      });

      if (type === EventType.ACTION_PRESS) {
        await handleActionPress(detail.pressAction.id, detail);
      } else if (type === EventType.PRESS) {
        await handlePress(pressKey, detail);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  function handleFirebaseOnMessage(
    data: string | CallNotification | Chat,
    type: string,
    message: Message
  ) {
    console.log("FIREBASE NOTIFICATION:-", type, data);
    switch (type) {
      case "CHAT":
        if (ProfileRef.current?.mode == "SENIORCITIZEN") {
          let chatRoom = JSON.parse(data);
          if (global.roomId !== chatRoom.myMessage.roomId) {
            setSeniorChatAlert(chatRoom);
          }
        }
        onMessageReceived(message);
        break;
      case "CONTACT_REMINDER":
        onMessageReceived(message);
        break;
      case "TASK":
      case "TASK_SUBMIT":
      case "TASK_COMPLETE":
      case "TASK_REMINDER":
      case "REMINDER":
      case "EVENT_MAIN_REMINDER":
      case "EVENT_NOTIFICATION_REMINDER":
      case "EVENT_MAIN_CALLREMINDER":
      case "EVENT_BEFORE_REMINDER":
      case "SCHEDULE_BEFORE_REMINDER":
        onMessageReceived(message);
        break;
      case "EVENT_INVITATION_REMINDER":
        onMessageReceived(message);
        break;
      case "CALL":
        try {
          const dataObject: CallNotification | Chat =
            typeof data === "string" ? JSON.parse(data) : data;
          const result = CallNotificationSchema.safeParse(dataObject);

          if (result) {
            const dataCall = dataObject as CallNotification;
            stopAllPlayers();
            switch (dataCall.notificationType) {
              case "CALL":
                notificationLog("CALL");
                if (dataCall.data.origin != MyProfile?._id) {
                  if (
                    activeCallRequest != null &&
                    activeCallRequest.callId !== dataCall.data.callId
                  ) {
                    console.log("BUSY_USER sending callWaiting", {
                      activeCallId: activeCallRequest?.callId,
                      incomingCallId: dataCall.data.callId,
                      incomingRoomType: dataCall.data.roomType,
                    });
                    RequestCallWaiting(dataCall.data.callId);
                    console.log("BUSY_USER callWaiting requested", dataCall.data.callId);
                    break;
                  }

                  invokeVoipCall(dataCall);
                  setCallQueue(dataCall);

                  setDataInAsync(asyncStorageKeys.backgroundHandler, {
                    ...dataCall,
                    expiry: new Date().toISOString(),
                    fromForeground: true,
                  });
                }
                break;
              case "END_CALL":
                notificationLog("END_CALL");
                //if end call receive for any other call excluding current active call then need to handle foreground missed call in this function
                setMissedCall(dataCall);
                break;
              default:
                break;
            }
          }
        } catch (error) {
          console.log(error);
        }
        break;
      case "ON_ACCEPT":
        notificationLog("ON_ACCEPT");

        const parsedData = typeof data == "string" ? JSON.parse(data) : data;
        if (parsedData?.data.notificationId) {
          RNVoipCall.endAllCalls();
          RNVoipCall.stopRingtune();
          setCallQueue(null);
          setCallRequest(null);
          removeDataFromAsync(asyncStorageKeys.backgroundHandler);
        }
        break;
      default: {
        // onMessageReceived(message);
        break;
      }
    }
  }

  async function topicReSubscription() {
    const { mode } = await getSession();
    messaging()
      .unsubscribeFromTopic(`${mode}_user_id_${id}`)
      .then(() => {
        messaging()
          .subscribeToTopic(`${mode}_user_id_${id}`)
          .then(() => {
            console.info(
              "Topic subscription complete",
              `${mode}_user_id_${id}`
            );
          })
          .catch((err) => {
            console.error("Error in subscribing topic in main navigation", err);
          });
      })
      .catch((err) => {
        console.error(
          "Error in unsubcribing firebase topic in main navigation",
          err
        );
      });
  }

  const handleActionPress = async (pressActionId: string, detail: any) => {
    switch (pressActionId) {
      case "reply":
        await updateChat(detail.notification.data, detail.input);
        break;
      case "mark-as-read":
        await markChatRead(detail.notification.data);
        break;
      case "try-now":
        await handleTryNow(detail);
        break;
      case "dismiss":
        await handleDismiss(detail);
        break;
      case "event-accept":
        await changeEventParticipantStatus(
          detail.notification.data._id,
          "ACCEPT"
        );
        break;
      case "event-reject":
        await changeEventParticipantStatus(
          detail.notification.data._id,
          "REJECT"
        );
        break;
      case "approve-message":
        await ChangeScheduleMessageStatus(
          detail.notification.data._id,
          "ACCEPT"
        );
        break;
      case "reject-message":
        await ChangeScheduleMessageStatus(
          detail.notification.data._id,
          "REJECT"
        );
        break;
      case "callback":
        NotificationCallBackData(detail);
        break;
      default:
        console.log("Unhandled action press", pressActionId);
    }
    await notifee.cancelNotification(detail.notification?.id);
  };

  const handlePress = async (keyName: string, detail: any) => {
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
  };
  const handleTryNow = async (detail: any) => {
    let contact = IOSParse(detail);
    console.log("contact", contact);
    if (contact) {
      dismissNotification(true, contact._id);
      navigate("ChatMessageScreen", { RoomId: contact.roomId });
    }
  };

  const handleDismiss = async (detail: any) => {
    let contact = IOSParse(detail);
    if (contact) {
      dismissNotification(true, contact._id);
    }
  };

  const IOSParse = (detail: any) => {
    const notificationData = detail?.notification?.data;
    if (!notificationData) return {};

    if (notificationData?.data !== undefined) {
      return parseNotificationData(notificationData?.data);
    }

    return parseNotificationData(notificationData);
  };

  const hasMessageRoomId = (payload: any) => {
    return Boolean(
      payload?.myMessage?.roomId ||
        payload?.myMessage?.roomID ||
        payload?.roomId ||
        payload?.roomID ||
        payload?.data?.roomId
    );
  };

  const resolveNotificationKey = (detail: any) => {
    const keyName = Platform.select({
      ios: detail?.notification?.ios?.categoryId,
      android: detail?.notification?.android?.pressAction?.id,
    });

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
    if (parsedData?.type) return normalizeKey(parsedData?.type);
    if (parsedData?.TYPE) return normalizeKey(parsedData?.TYPE);
    if (hasMessageRoomId(parsedData)) return "message";
    if (parsedData?.data?.notificationId) return "contact_reminder";

    return "";
  };

  const handleContactReminder = async (detail: any) => {
    let contact = IOSParse(detail);
    if (contact?.data?.notificationId) {
      let res = await getNotificationPayload(contact.data.notificationId);
      let result = JSON.parse(res.payload);
      //TASK Notifications not have result.data
      let data =
        typeof result.data == "string" ? JSON.parse(result.data) : result;
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
    let payload = IOSParse(detail);

    if (payload?.data?.notificationId) {
      let res = await getNotificationPayload(payload.data.notificationId);
      let result = JSON.parse(res.payload);
      //TASK Notifications not have result.data
      payload =
        typeof result.data == "string" ? JSON.parse(result.data) : result;
    } else {
      payload = payload.data;
    }

    navigate("CalendarTabScreen", {});
    setTimeout(() => {
      setCalendarReminder(payload);
    }, 3000);
  };

  const handleMessageNotification = async (detail: any) => {
    let parsedData = IOSParse(detail);
    let roomID =
      parsedData?.myMessage?.roomId ||
      parsedData?.myMessage?.roomID ||
      parsedData?.roomId ||
      parsedData?.roomID ||
      parsedData?.data?.roomId;

    if (!roomID) {
      console.log("Unable to resolve roomId from notification payload", parsedData);
      return;
    }

    global.roomId = roomID;

    await markChatRead(parsedData).catch((error) => {
      console.log("markChatRead failed", error);
    });

    const fallbackSession = await getSession();
    const userMode = ProfileRef.current?.mode || fallbackSession?.mode || "CLASSIC";

    if (userMode === "CLASSIC") {
      navigate("ChatMessageScreen", { RoomId: roomID });
    } else if (userMode === "SENIORCITIZEN") {
      navigate("SeniorChatMessageScreen", { roomId: roomID });
    }
  };

  const handleTaskNotification = async (detail: any) => {
    let TaskData = IOSParse(detail);
    console.log("handleTaskNotification", TaskData);
    if (TaskData?.data?.notificationId) {
      let res = await getNotificationPayload(TaskData.data.notificationId);
      let result = JSON.parse(res.payload);
      //TASK Notifications not have result.data
      TaskData =
        typeof result.data == "string" ? JSON.parse(result.data) : result;
    }
    console.log("handleTaskNotification", TaskData);
    if (TaskData?.assignmentId && TaskData?.organizationId) {
      global.activeOrg = TaskData?.organizationId;
      handleTaskNotificationTap(
        TaskData?.organizationId,
        TaskData?.assignmentId
      );
    }
  };

  const parseNotificationData = (data: any) => {
    return typeof data === "string" ? JSON.parse(data) : data;
  };

  return <></>;
}
