import { Alert, AppState, Linking, Platform } from "react-native";
import { CallNotification } from "@Notification/Interfaces/Call";
import { DisplayMissedCall } from "@Notification/NotificationDispaly";
import RNVoipCall, { RNVoipPushKit } from "react-native-voips-calls";

import React, { useEffect, useRef, useState } from "react";
import { callAtom, callAtomType } from "@Atoms/callAtom";
import { callQueueAtom, deviceUniqueID, missedCallAtom } from "../../navigation/Application";
import { getDataFromAsync, removeDataFromAsync } from "@Util/asyncstorage.utils";
import notifee, { EventType } from "@notifee/react-native";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallWaitingMutation, useChangeCallStatusMutation } from "@Service/generated/call.generated";
import ActiveCallModel from "@/Containers/HomeContainer/GlobalCallContainer";
import AndroidCallQueueModel from "@/Containers/HomeContainer/GlobalCallContainer/component/AndroidCallQueueModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackgroundTimer from "react-native-background-timer";
import CallDetectorManager from "react-native-call-detection";
import CallTimerStarter from "@/Containers/HomeContainer/GlobalCallContainer/component/CallTimer";
import DeviceInfo from "react-native-device-info";
import ToastMessage from "@Util/ToastMesage";
import { asyncStorageKeys } from "@/Constants/asyncStorageKeys";
import { currentUserIdAtom } from "@Atoms/RealmloginManager";
import dayjs from "dayjs";
import messaging from "@react-native-firebase/messaging";
import proximity from "react-native-updated-proximity";
import { returnCallRequestAtom } from "@Atoms/callEventManagerAtom";
import { stopAllPlayers } from "@Util/player.utils";
import { useTranslation } from "react-i18next";
import { useUpdateUserMutation } from "@Service/generated/user.generated";
import { socket } from "@/redux/Reducer/SocketSlice";
import { user } from "@/schemas/schema";
import { useAppSelector } from "@/redux/Store";
import AskSurveyModal from "../HomeContainer/MainContainer/SurveyContainer/AskSurveyModal";
import { storage } from "@/redux/backup/mmkv";

let callDetector: InstanceType<CallDetectorManager>;

export function GlobalCallEvent() {
  return (
    <>
      <CallTimerStarter />
      <MissedCallHandler />
      <CallBackHandler />
      <PlatformCallHandler />
      <ActiveCallModel />
      <AskSurveyModal />
    </>
  );
}

function AndroidCallManagerContainer() {
  const [callQueue, setCallQueue] = useAtom(callQueueAtom);
  const callQueueRef = useRef(callQueue);
  const busyCallWaitingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { t } = useTranslation();
  const MyProfile = useAtomValue(currentUserIdAtom);
  const [requestCallWaiting] = useCallWaitingMutation();
  const activeCallKeys = useAppSelector((state) => state.Calls.activeCallKeys);

  const [callRequestValue, setCallRequest] = useAtom(callAtom);
  const [changeCallStatus] = useChangeCallStatusMutation();
  const callRequest = React.useRef<callAtomType | null>(null);
  const activeCallKeysRef = React.useRef<callAtomType | null>(activeCallKeys);
  const MyProfileRef = React.useRef<user | null>(null);

  useEffect(() => {
    MyProfileRef.current = MyProfile;
  }, [MyProfile]);

  useEffect(() => {
    callRequest.current = callRequestValue;
  }, [callRequestValue]);

  useEffect(() => {
    activeCallKeysRef.current = activeCallKeys;
  }, [activeCallKeys]);

  useEffect(() => {
    if (busyCallWaitingTimerRef.current) {
      clearTimeout(busyCallWaitingTimerRef.current);
      busyCallWaitingTimerRef.current = null;
    }

    callQueueRef.current = callQueue;
    if (callQueue) {
      const busyCallId = activeCallKeysRef.current?.callId ?? callRequest.current?.callId;
      console.log("GLOBAL_CALL_EVENT Android callQueue updated", {
        currentActiveCallId: busyCallId,
        incomingCallId: callQueue?.data?.callId,
        incomingOrigin: callQueue?.data?.origin,
        incomingRoomType: callQueue?.data?.roomType,
      });

      if (busyCallId && busyCallId !== callQueue?.data?.callId) {
        console.log("GLOBAL_CALL_EVENT Android auto busy path", {
          activeCallId: busyCallId,
          queuedCallId: callQueue?.data?.callId,
        });

        busyCallWaitingTimerRef.current = setTimeout(() => {
          console.log("GLOBAL_CALL_EVENT Android delayed busy path", {
            activeCallId: busyCallId,
            queuedCallId: callQueueRef.current?.data?.callId,
          });
          checkForCallWaiting(callQueueRef.current?.data?.callId);
          RNVoipCall.stopRingtune();
          RNVoipCall.endAllCalls();
          setCallQueue(null);
          ToastMessage(`${t("toastmessage.incall-already-message")}`);
          busyCallWaitingTimerRef.current = null;
        }, 4000);
      }
    }

    return () => {
      if (busyCallWaitingTimerRef.current) {
        clearTimeout(busyCallWaitingTimerRef.current);
        busyCallWaitingTimerRef.current = null;
      }
    };
  }, [callQueue]);

  useEffect(() => {
    //check for user action on Android Native-UI
    RNVoipCall.onCallAnswer((data: any) => onAnswer());
    RNVoipCall.onEndCall((data: any) => onDecline());
  }, []);

  async function onAnswer() {
    const busyCallId = activeCallKeysRef.current?.callId ?? callRequest.current?.callId;
    console.log("GLOBAL_CALL_EVENT Android onAnswer", {
      currentActiveCallId: busyCallId,
      queuedCallId: callQueueRef.current?.data?.callId,
    });
    if (busyCallWaitingTimerRef.current) {
      clearTimeout(busyCallWaitingTimerRef.current);
      busyCallWaitingTimerRef.current = null;
    }
    RNVoipCall.stopRingtune();
    RNVoipCall.endAllCalls();
    storage.delete(asyncStorageKeys.backgroundHandler);

    if (callRequest.current == null && activeCallKeysRef.current == null) {
      if (callQueueRef.current != null) {
        setCallRequest({
          roomName: callQueueRef.current?.notification.title,
          isReceiver: true,
          roomId: callQueueRef.current?.data?.roomId,
          callId: callQueueRef.current?.data.callId,
          channelId: callQueueRef.current?.data.channelName,
          channelName: callQueueRef.current?.data.channelName,
          callType: callQueueRef.current?.data.type,
          roomType: callQueueRef.current?.data.roomType,
          participants: callQueueRef.current?.data.callParticipants,
          callBackground: callQueueRef.current?.data.callBackground,
        });
        callQueueRef.current == null;
        setCallQueue(null);
      } else {
        const backData = await getDataFromAsync(asyncStorageKeys.backgroundHandler);
        if (backData != null) {
          setCallRequest({
            roomName: backData.notification.title,
            isReceiver: true,
            roomId: backData.data.roomId,
            callId: backData.data.callId,
            channelId: backData.data.channelName,
            channelName: backData.data.channelName,
            callType: backData.data.type,
            roomType: backData.data.roomType,
            participants: backData.data.callParticipants,
            callBackground: backData.data.callBackground,
          });
          callQueueRef.current == null;
          setCallQueue(null);
          removeDataFromAsync(asyncStorageKeys.backgroundHandler);
        }
      }
    } else {
      //for background this will directly handle by background handler. so only for foreground need to handle callWaiting.
      console.log("GLOBAL_CALL_EVENT Android onAnswer busy path", {
        activeCallId: busyCallId,
        queuedCallId: callQueueRef.current?.data?.callId,
      });
      checkForCallWaiting(callQueueRef.current?.data?.callId);
      ToastMessage(`${t("toastmessage.incall-already-message")}`);
    }
  }

  async function onDecline() {
    if (busyCallWaitingTimerRef.current) {
      clearTimeout(busyCallWaitingTimerRef.current);
      busyCallWaitingTimerRef.current = null;
    }
    const callQ = callQueueRef.current;
    callQueueRef.current == null;
    setCallQueue(null);
    RNVoipCall.stopRingtune();
    RNVoipCall.endAllCalls()

    if (callQ != null) {
      if (callQ != null) {
        // checkForCallWaiting(callQ?.data.callId);
        console.log("callQ?.data.callId", callQ?.data.callId);
        changeCallStatus({
          variables: {
            input: { callId: callQ?.data.callId, userId: MyProfileRef.current?._id, status: "rejected" },
          },
        }).catch(err => console.log({ callId: callQ?.data.callId, userId: MyProfileRef.current._id, status: "rejected" }, err.data))
      } else {
        changeCallStatus({
          variables: {
            input: { callId: callQ?.data.callId, userId: MyProfileRef.current?._id, status: "rejected" },
          },
        }).catch(err => console.log({ callId: callQ?.data.callId, userId: MyProfileRef.current?._id, status: "rejected" }, err.data))
      }
      AsyncStorage.removeItem(asyncStorageKeys.backgroundHandler);
    } else {
      const callData = await getDataFromAsync(asyncStorageKeys.backgroundHandler);

      if (callData) {
        if (callRequest.current != null) {
          checkForCallWaiting(callData.data.callId);
          changeCallStatus({
            variables: { input: { callId: callData.data.callId, userId: MyProfileRef.current?._id, status: "rejected" } },
          }).catch(err => console.log({ callId: callQ?.data.callId, userId: MyProfileRef.current?._id, status: "rejected" }, err.data))
        } else {
          changeCallStatus({
            variables: { input: { callId: callData.data.callId, userId: MyProfileRef.current?._id, status: "rejected" } },
          }).catch(err => console.log({ callId: callQ?.data.callId, userId: MyProfileRef.current?._id, status: "rejected" }, err.data))
          notifee.stopForegroundService();
        }
        AsyncStorage.removeItem(asyncStorageKeys.backgroundHandler);
      }
    }
  }

  function checkForCallWaiting(callID: string) {
    console.log("GLOBAL_CALL_EVENT checkForCallWaiting", callID);
    requestCallWaiting({
      variables: {
        input: {
          _id: callID,
        },
      },
    }).then((res) => {
      console.log("callwaiting res", res);
    });
    setCallQueue(null);
  }

  return <AndroidCallQueueModel onAnswer={onAnswer} onDecline={onDecline} />;
}

function PlatformCallHandler() {
  if (Platform.OS == "ios") {
    return <IOSCallManagerContainer />;
  }

  if (Platform.OS == "android") {
    return <AndroidCallManagerContainer />;
  } else return <></>;
}

function IOSCallManagerContainer() {
  const [callQueue, setCallQueue] = useAtom(callQueueAtom);
  const MyProfile = useAtomValue(currentUserIdAtom);
  const [openLinking, setOpenLinking] = useState(false);
  const [updateToken] = useUpdateUserMutation();
  const [requestCallWaiting] = useCallWaitingMutation();
  const activeCallKeys = useAppSelector((state) => state.Calls.activeCallKeys);
  const [callRequestValue, setCallRequest] = useAtom(callAtom);
  const [changeCallStatus] = useChangeCallStatusMutation();
  const callRequest = useRef<callAtomType | null>(null);
  const activeCallKeysRef = useRef<callAtomType | null>(activeCallKeys);
  const busyCallWaitingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useTranslation()

  const setMissedCall = useSetAtom(missedCallAtom);
  const callQueueRef = useRef(callQueue);
  const MyProfileRef = useRef<user | null>(null)

  useEffect(() => {
    MyProfileRef.current = MyProfile
  }, [MyProfile])

  useEffect(() => {
    activeCallKeysRef.current = activeCallKeys;
  }, [activeCallKeys]);

  useEffect(() => {
    callQueueRef.current = callQueue;
  }, [callQueue]);

  useEffect(() => {
    if (busyCallWaitingTimerRef.current) {
      clearTimeout(busyCallWaitingTimerRef.current);
      busyCallWaitingTimerRef.current = null;
    }

    //On IOS if User receive any VOIP call then Native-UI will invoke, so if IOSVoip data is present it means then we invoke listener to check for any user action taken on Native-call-UI

    if (callQueue != null) {
      callQueueRef.current = callQueue;
      stopAllPlayers();
      const busyCallId = activeCallKeysRef.current?.callId ?? callRequest.current?.callId;
      if (busyCallId && busyCallId !== callQueue?.data?.callId) {
        console.log("GLOBAL_CALL_EVENT iOS auto busy path", {
          activeCallId: busyCallId,
          queuedCallId: callQueue?.data?.callId,
        });

        busyCallWaitingTimerRef.current = setTimeout(() => {
          console.log("GLOBAL_CALL_EVENT iOS delayed busy path", {
            activeCallId: busyCallId,
            queuedCallId: callQueueRef.current?.data?.callId,
          });
          checkForCallWaiting(callQueueRef.current?.data?.callId);
          RNVoipCall.stopRingtune();
          RNVoipCall.endAllCalls();
          setCallQueue(null);
          ToastMessage(`${t("toastmessage.incall-already-message")}`);
          busyCallWaitingTimerRef.current = null;
        }, 4000);
      } else {
        startListener(callQueue);
      }
    }

    return () => {
      if (busyCallWaitingTimerRef.current) {
        clearTimeout(busyCallWaitingTimerRef.current);
        busyCallWaitingTimerRef.current = null;
      }
    };
  }, [callQueue]);

  useEffect(() => {
    if (typeof socket?.on == "function") {
      socket?.on("message", (data) => {
        if (data.type == "Call Ended!") {
          //if this event is not related to current active call then show missed call

          const parsed = JSON.parse(data.msg);

          if (parsed.data.callId == callQueueRef.current?.data.callId) {
            proximity.removeListener(() => { });
            RNVoipCall.endAllCalls();
            setCallQueue(null);
            setMissedCall(parsed);
          }
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    //This is to make sure current Active call will work on event listeners
    callRequest.current = callRequestValue;
  }, [callRequestValue]);

  useEffect(() => {
    if (openLinking && Platform.OS === "ios") {
      setOpenLinking(false);
      Linking.canOpenURL("comon://")
        .then((response) => {
          if (response) {
            Linking.openURL("comon://")
              .then(() => {
                console.log("Successfully opened url");
              })
              .catch((Er) => {
                console.log("Error in opening url", Er);
              });
          }
        })
        .catch((Err) => {
          console.log("Error in testing url", Err);
        });
    }
  }, [openLinking]);

  useEffect(() => {
    if (MyProfileRef.current?.device) {
      RNVoipPushKit.getPushKitDeviceToken(async (res: { deviceToken: string }) => {
        const fcmToken = await messaging().getToken();
        if (!res.deviceToken && !fcmToken) return;
        if (MyProfileRef.current?.device?.fcmToken !== fcmToken || MyProfileRef.current.device.token !== res.deviceToken) {
          const uniqueId = await DeviceInfo.getUniqueId();
          const payload = {
            token: Platform.OS === "ios" ? res.deviceToken : uniqueId,
            fcmToken: fcmToken,
            type: Platform.OS === "ios" ? "iOS" : "ANDROID",
          };
          try {
            await updateToken({
              variables: {
                input: {
                  _id: MyProfileRef.current?._id,
                  device: payload,
                },
              },
            });
          } catch (error) {
            console.log(error);
          }
          if (MyProfileRef.current?.device?.fcmToken !== fcmToken) {
            await AsyncStorage.setItem(asyncStorageKeys.deviceToken, res.deviceToken);
          }
        }
      });
    }
  }, [MyProfileRef.current?.device]);
 
  function startListener(callData: CallNotification) {
    callDetector = new CallDetectorManager(handleCallEvent, false, () => { }, {
      title: "Phone State Permission",
      message: "This app needs access to your phone state in order to react and/or to adapt to incoming calls.",
    });

    function handleCallEvent(event: "Connected" | "Disconnected") {
      if (event === "Connected") {
        handleConnectedEvent();
      } else if (event === "Disconnected") {
        handleDisconnectedEvent();
      }
    }

    function handleConnectedEvent() {
      if (callRequest.current != null || activeCallKeysRef.current != null) {
        handleMultipleCalls();
        ToastMessage(t("label.cannot-pick-call"));
      } else if (shouldDelayCallConnection()) {
        setTimeout(() => connectCall(), 1000);
      } else {
        connectCall();
      }
    }

    function handleMultipleCalls() {
      requestCallWaiting({
        variables: {
          input: {
            _id: callData.data.callId,
          },
        },
      }).then((res) => { });
    }

    function shouldDelayCallConnection() {
      return AppState.currentState !== "active" || AppState.currentState !== "background";
    }

    function handleDisconnectedEvent() {
      if (callRequest.current != null || activeCallKeysRef.current != null) {
        handleMultipleCalls();
        changeCallStatus({
          variables: { input: { callId: callData.data.callId, userId: MyProfileRef.current?._id, status: "rejected" } },
        });
      } else {
        disconnectCall();
      }
    }

    async function connectCall() {
      if (AppState.currentState === "active") {
        RNVoipCall.endAllCalls();
      }

      setTimeout(() => {
        setOpenLinking(true);
      }, 500);

      setTimeout(() => {
        setCallRequest({
          roomName: callData.notification.title,
          isReceiver: true,
          callId: callData.data.callId,
          channelId: callData.data.channelName,
          channelName: callData.data.channelName,
          roomId: callData?.data?.roomId,
          callType: callData.data.type,
          roomType: callData.data.roomType,
          participants: callData.data.callParticipants,
          callBackground: callData.data.callBackground,
        });
        setCallQueue(null);
      }, 800);

      callDetector.dispose();
    }

    async function disconnectCall() {
      if (busyCallWaitingTimerRef.current) {
        clearTimeout(busyCallWaitingTimerRef.current);
        busyCallWaitingTimerRef.current = null;
      }
      callDetector.dispose();
      proximity.removeListener(() => { });
      RNVoipCall.endAllCalls();
      setCallQueue(null);
      changeCallStatus({
        variables: { input: { callId: callData.data.callId, userId: MyProfileRef.current?._id, status: "rejected" } },
      })
        .then((response) => {
          BackgroundTimer.stop();

          console.log("Success callback", response.data?.changeCallStatus.callId);
        })
        .catch((Err) => {
          BackgroundTimer.stop();

          console.log("Error in rejecting call", Err);
        });
    }
  }

  function checkForCallWaiting(callID: string) {
    console.log("GLOBAL_CALL_EVENT iOS checkForCallWaiting", callID);
    requestCallWaiting({
      variables: {
        input: {
          _id: callID,
        },
      },
    }).then((res) => {
      console.log("iOS callwaiting res", res);
    });
    setCallQueue(null);
  }

  return <></>;
}

function CallBackHandler() {
  const [callBackRequest, setCallBackRequest] = useAtom(returnCallRequestAtom);
  const [callRequestValue, setCallRequest] = useAtom(callAtom);
  const { t } = useTranslation();

  useEffect(() => {
    if (callBackRequest != null && Platform.OS == "android") {
      callBackRequestHandler(callBackRequest);
    }
  }, [callBackRequest]);

  function callBackRequestHandler(detail: CallNotification) {
    if (callRequestValue == null) {
      // const payload = JSON.parse(data.data) as CallNotification;
      // console.log("callBackRequestHandler", detail.notification.data);
      setTimeout(() => {
        Alert.alert(`${detail.notification.title}`, "Do you want to callback ?", [
          {
            text: "Cancel",
            style: "destructive",
            onPress: () => {
              setCallBackRequest(null);
              // Handle video call button press
            },
          },
          {
            text: "Callback",
            onPress: () => {
              const payload = JSON.parse(detail?.notification?.data?.data) as CallNotification["data"];
              if (payload) {
                if (payload.roomType == "contact_group" || payload.roomType == "contact") {
                  const participants = payload.participants.map((pp) => pp.userId);
                  setCallRequest({ ...payload, participants });
                } else {
                  setCallRequest(payload);
                }
              }
              setCallBackRequest(null);
            },
          },
        ]);
      }, 1000);
    } else {
      ToastMessage(t("others.Can not place new call while you are already in a call"));
    }
  }

  return <></>;
}

function MissedCallHandler() {
  const callRequest = useAtomValue(callAtom);
  const [callQueue, setCallQueue] = useAtom(callQueueAtom);
  const [missedCallData, setMissedCall] = useAtom(missedCallAtom);
  const MyProfile = useAtomValue(currentUserIdAtom);

  useEffect(() => {
    if (missedCallData != null) {
      RNVoipCall.stopRingtune();
      RNVoipCall.endAllCalls();
      console.log(missedCallData);
      console.log(callRequest?.callId != missedCallData.data.callId);
      if (callRequest?.callId != missedCallData.data.callId) {
        const diff = dayjs().diff(missedCallData.data.callStartedAt, "seconds");
        console.log(missedCallData.data.callParticipants[0]);
        if (diff < 90) {
          const isExist = missedCallData.data.callParticipants.filter((df) => {
            const id = Platform.OS == "android" ? df.userId : df.userId._id;
            console.log(df);
            if (id == MyProfile?._id) return true;
            else return false;
          });

          if (isExist.length > 0) {
            if (isExist[0].callStatus == "missed") {
              DisplayMissedCall({
                callType: missedCallData.data.type,
                roomType: missedCallData.data.roomType,
                roomId: missedCallData.data.roomId ?? "",
                callBackground: missedCallData.data.callBackground ?? "",
                roomName: Platform.OS == "android" ? missedCallData.notification.title : "Missed call",
                participants: missedCallData.data.callParticipants,
                isReceiver: false,
                callId: missedCallData.data.callId,
              });
            }
          }
        }
        if (callQueue?.data.callId == missedCallData.data.callId) {
          setCallQueue(null);
        }
      }
    }

    setMissedCall(null);
  }, [missedCallData]);

  return <></>;
}
