import { Alert, AppState, Dimensions, Image, Platform, View } from "react-native";
import CallParticipantsMode, { participantsFormatted } from "./component/CallParticipantsMode";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { callAtom, callAtomType } from "@Atoms/callAtom";
import { callFullScreenState, callMiniScreenState } from "@Atoms/GlobalCallController";
import createAgoraRtcEngine, { ChannelProfileType, ClientRoleType, IRtcEngine, LogLevel } from "react-native-agora";
import notifee, { EventType } from "@notifee/react-native";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  useChangeCallStatusMutation,
  useEndCallMutation,
  useGetChannelStatusLazyQuery,
  useLeftCallMutation,
} from "@Service/generated/call.generated";
import { useDispatch, useSelector } from "react-redux";

import AddParticipants from "./component/AddParticipants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackgroundTimer from "react-native-background-timer";
import FullCallMode from "./component/FullCallMode";
import { InternetAtom } from "@Atoms/InternetAtom";
import { Keyboard } from "react-native";
import MiniCallMode from "./component/MiniCallMode";
import NetInfo from "@react-native-community/netinfo";
import RNVoipCall from "react-native-voips-calls";

import ToastMessage from "@Util/ToastMesage";
import { appStateAtom, callQueueAtom } from "@Navigation/Application";
import { callTimerTypeAtom } from "./component/CallTimer";
// import { currentUserIdAtom } from "@Atoms/RealmloginManager";
import { displayOnGoingCall } from "@Notification/NotificationDispaly";
import { getMicrophonePermission, permissionAlert } from "@Util/permission";
import proximity from "react-native-updated-proximity";
import { stopAllPlayers } from "@Util/player.utils";

import useStartCall from "@Hooks/useStartCall";
import { useTranslation } from "react-i18next";

import { addActiveCall, removeActiveCall } from "@/redux/Reducer/CallReducer";
import { socket } from "@/redux/Reducer/SocketSlice";
import SeniorCallMode from "./component/SeniorCallMode";
import { useAppSelector } from "@/redux/Store";
import { activeSurveyIdAtom } from "@/Atoms/surveyAtom";
import { useTakeSurveyMutation } from "@/graphql/generated/survey.generated";
import { SurveyEventType } from "@/graphql/generated/types";
import { requestCameraPermission } from "@/utils/permissionUtils";
import { parseSocketMessage } from "@/utils/callSocket";
import { socketConnect } from "@/utils/socket/SocketConnection";
import Sound from "react-native-sound";

const { width, height } = Dimensions.get("window");

let roomIDPlaceHolder = null;
let callRequestCopy: callAtomType | null = null;

type remoteUser = {
  uid: number;
  image: string;
  userName: string;
  callStatus: string;
  micEnable: boolean;
};

const AgoraErrorTypes = Object.freeze({
  1: "Connection Lost. Trying to connect.",
  2: "Connecting",
  3: "Connected",
  4: "Reconnecting",
  5: undefined,
});

// FLOW => ATOM GOT CALL REQUEST FROM USER (ANY SCREEN CAN SEND CALL REQUEST)
// FLOW => TAKE CALL REQUEST DATA AND GENERATE RTM TOKEN
// FLOW => TAKE RTM TOKEN AND CONNECT WITH AGORA
// FLOW => IF CONNECTED SHOW FULL MODE UI
// FLOW => USER CAN CLICK BACK BUTTON TO SWITCH TO MINI MODE
// FLOW => USER CAN CLICK ON MINI MODE UI TO SWITCH TO FULL MODE
// FLOW => USER CAN CLOSE THE CALL ON FULL MODE AND ATOM DATA IS NULL THEN AND UI DESPAIRS

function ActiveCallModel() {
  console.log("CALLER ActiveCallModel mounted");
  const [isFullScreenModel, setFullScreenModel] = useAtom(callFullScreenState);
  const [isMiniScreenModel, setMiniScreenModel] = useAtom(callMiniScreenState);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [callRequest, setCallRequest] = useAtom(callAtom);
  const [, setInternet] = useAtom(InternetAtom);
  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);
  const MyProfileRef = useRef(MyProfile);
  const { t } = useTranslation();
  const [checkChatSurvey] = useTakeSurveyMutation();

  useEffect(() => {
    MyProfileRef.current = MyProfile;
  }, [MyProfile]);

  const { joinCall, createNewCall, loading } = useStartCall();
  const activeCallData = useRef<callAtomType | null>(null);
  const [isTokenGenerated, setIsTokenGenerated] = useState<boolean>(false);
  const [connectedWithAgora, setConnectedWithAgora] = useState<boolean>(false);
  const engine = useRef<IRtcEngine | null>(global.engine);
  const [speakerEnabled, setSpeakerEnabled] = useState(false);
  const [muteAudio, setMuteAudio] = useState(false);
  const inProgress = useRef(false);
  const updatePart = useSetAtom(participantsFormatted);
  const callTimer = useSetAtom(callTimerTypeAtom);
  const setCallQueue = useSetAtom(callQueueAtom);
  const setActiveSurveyId = useSetAtom(activeSurveyIdAtom);

  const MyuidRef = useRef<Number>(0);

  const joined = useRef<boolean>(false);
  const [videoCameraOn, setVideoCameraOn] = useState(false);
  const [disabledRemoteVideo, setDisabledRemoteVideo] = useState<Array<number>>([]);

  const mounted = useRef(false);

  const [changeCallStatusRequest] = useChangeCallStatusMutation();
  const getChannelStatusTimerRef = useRef<NodeJS.Timeout>();
  const onGoingNotificationId = useRef<string>("");

  const [endCall] = useEndCallMutation();
  const [leftUserRequest] = useLeftCallMutation();
  const [remoteUserListState, setRemoteUserListState] = useState<number[]>([]);
  const remoteUserList = useRef<number[]>([]);
  const remoteUserData = useRef<remoteUser[]>([]);
  const callStatus = useRef<string>("");
  const myStatusSended = useRef<boolean>(false);

  const callState = useRef<string>("");
  const setAppState = useSetAtom(appStateAtom);

  const player = useRef<Sound | null>(null);

  useEffect(() => {
    // Enable playback in silence mode for iOS
    Sound.setCategory("Playback");

    // Load the sound file
    const callingSound = Image.resolveAssetSource(
      require("../../../../assets/audio/calling.mp3")
    )?.uri;
    if (!callingSound) {
      return;
    }

    const sound = new Sound(callingSound, "", (error) => {
      if (error) {
        console.error("Failed to load sound", error);
        return;
      }
      // Successfully loaded sound, assign to player ref
      player.current = sound;
    });

    // Cleanup function to release the sound when the component unmounts
    return () => {
      player.current?.release();
    };
  }, []);

  const [isCallParticipantMode, setIsCallParticipantMode] = useState<boolean>(false);
  const [isAddParticipantMode, setIsAddParticipantMode] = useState<boolean>(false);
  const [currentUserList, setCurrentUserList] = useState(0);
  const NoAnswerCallAutoCutRef = useRef<NodeJS.Timeout>();
  const [channelStatus] = useGetChannelStatusLazyQuery();

  const dispatch = useDispatch();

  const getBusyCallMessage = useCallback(
    (payload: any) => {
      return (
        payload?.message ||
        payload?.msg?.message ||
        payload?.error?.message ||
        t("toastmessage.incall-already-message")
      );
    },
    [t]
  );

  const handleBusyCallFailure = useCallback(
    async (payload: any) => {
      player.current?.stop();
      callStatus.current = t("onAnotherCall");
      clearTimeout(NoAnswerCallAutoCutRef.current);
      ToastMessage(getBusyCallMessage(payload));
      await closeCall();
      engine?.current?.leaveChannel();
    },
    [getBusyCallMessage, t]
  );

  useEffect(() => {
    console.log("CALLER socket effect start", {
      hasSocket: !!socketConnect.getSocket?.(),
      hasOn: typeof socketConnect.addMessageHandler,
    });
    if (typeof socketConnect.addMessageHandler === "function") {
      console.log("CALLER socket message listener attached", {
        activeCallId: activeCallData.current?.callId,
      });
      const handleSocketMessage = async (type, msg) => {
        console.log("CALLER socket message received", {
          type,
          msg,
          activeCallId: activeCallData.current?.callId,
        });
        if (type === "REJECT_CALL") {
          const parsed = typeof msg === "string" ? JSON.parse(msg) : msg;

          //If current user rejected the call then or any other participants reject the call then "Reject call" will come for all participants, below function only work if user does not have any active call. remoteUserList.current.length == 0 indicating user does not have active call with remote users.
          if (remoteUserList.current.length == 0) {
            if (
              parsed.data.callId == activeCallData.current?.callId &&
              (parsed.data.roomType == "individual" || parsed.data.roomType == "contact")
            ) {
              clearTimeout(NoAnswerCallAutoCutRef.current);

              // console.log("parsed",activeCallData.current)
              if (MyProfileRef.current?.mode == "SENIORCITIZEN") {
                Alert.alert(`${activeCallData.current?.roomName} ${t("seniorMode.not-make-call")}`, "", [
                  { text: t("btn.ok"), onPress: () => {} },
                ]);
              }
              closeCall();
            }
          }
        }
        if (type === "callWaiting") {
          const parsed = parseSocketMessage<{ callId: string; roomType: string }>(msg);
          console.log("CALLER received callWaiting raw", { type, msg });
          console.log("CALLER received callWaiting parsed", parsed);
          console.log("CALLER activeCallData", activeCallData.current?.callId);

          if (
            parsed?.callId == activeCallData.current?.callId &&
            (parsed?.roomType == "individual" || parsed?.roomType == "contact")
          ) {
            await handleBusyCallFailure({
              ...parsed,
              message: parsed?.message || t("anotherCall"),
            });
          }
        }
        if (data.type === "voipFailed") {
          const parsedData =
            typeof data?.msg === "string" ? JSON.parse(data?.msg) : data?.msg ?? data;
          const activeCall = activeCallData.current;

          if (!activeCall?.callId || activeCall?.isReceiver) {
            return;
          }

          const parsedCallId = parsedData?.callId ?? parsedData?.data?.callId;
          const parsedRoomType =
            parsedData?.roomType ?? parsedData?.data?.roomType ?? activeCall?.roomType;
          const failedUserId = parsedData?.userId ?? parsedData?.data?.userId;
          const activeParticipantIds =
            activeCall?.participants
              ?.map((participant) => participant?._id)
              .filter(Boolean) ?? [];

          const isIndividualCall =
            parsedRoomType === "individual" || parsedRoomType === "contact";
          const isMatchingActiveCall =
            parsedCallId === activeCall?.callId ||
            (!!failedUserId && activeParticipantIds.includes(failedUserId));

          if (isIndividualCall && isMatchingActiveCall) {
            await handleBusyCallFailure(parsedData);
          }
        }
        if (type === "ParticipantAdded") {
          //For current call if any participants added in contact_group call then user will receive this event and update the remote user list.
          if (activeCallData.current?.callId === msg.callId) {
            msg.user.forEach((ur) => {
              const isExist = activeCallData.current?.participants.find((cp) => cp._id == ur.userId);
              if (!isExist) {
                const data = {
                  ...ur,
                  micEnable: false,
                  callStatus: "calling",
                  pId: ur.userId,
                };
                // console.log(data);
                activeCallData.current.participants = [...activeCallData.current?.participants, data];
              }
            });
          }
        }
        if (type == "Call Ended!") {
          //If any remote user called endCall API, then all participants will receive this event. end Call always called by last participant so below code not going to execute for already left users.
          const parsedData = typeof msg === "string" ? JSON.parse(msg) : msg;
          if (activeCallData.current?.callId === parsedData.data.callId) {
            player.current?.stop();
            resetCall();
            await notifee.stopForegroundService();
            await notifee.cancelNotification(onGoingNotificationId.current);
          }
        }
        // if (data?.type === "OnAccept") {
        //   const parsedData = typeof data?.msg === "string" ? JSON.parse(data?.msg) : data?.msg;
        //   console.log(
        //     "Parsed data",
        //     JSON.stringify(parsedData),
        //     parsedData?.device != "App" &&
        //       parsedData?.data?.roomType === "individual" &&
        //       parsedData?.data?.callId == activeCallData.current?.callId &&
        //       !callRequestCopy
        //   );
        //   if (
        //     parsedData?.device != "App" &&
        //     parsedData?.data?.roomType === "individual" &&
        //     parsedData?.data?.callId == activeCallData.current?.callId &&
        //     !callRequestCopy
        //   ) {
        //     console.log("<<<<><<<<<<=========Trigger=============>>>>>>>>");
        //     RNVoipCall.endAllCalls();
        //     RNVoipCall.stopRingtune();
        //     setCallQueue(null);
        //     removeDataFromAsync(asyncStorageKeys.backgroundHandler);
        //     resetCall();
        //   }
        // }
      };
      socketConnect.addMessageHandler(handleSocketMessage);

      return () => {
        socketConnect.removeMessageHandler(handleSocketMessage);
      };
    }
  }, []);

  useEffect(() => {
    console.log("CALLER callRequest changed", callRequest);
    callRequestCopy = callRequest;
  }, [callRequest]);

  useEffect(() => {
    //Check that app internet is connect or disconnect during call
    const netUnsubscribe = NetInfo.addEventListener((state: { isConnected: any }) => {
      if (state.isConnected) {
        setInternet(true);
      } else {
        player.current?.stop();
        setInternet(false);
        ToastMessage(t("others.No internet connection, try again"));

        resetCall();
        notifee.stopForegroundService();
        dispatch(removeActiveCall());
        notifee.cancelNotification(onGoingNotificationId.current);
        clearTimeout(NoAnswerCallAutoCutRef.current);
        engine?.current?.leaveChannel();
      }
    });
    let subs = { remove: () => {} };
    //Checking that app is killed by user or not
    subs = AppState.addEventListener("change", (state) => {
      setAppState(state);
      if (Platform.OS == "android") {
        if (joined.current && state == "background") {
          AsyncStorage.setItem("activeCallData", JSON.stringify(activeCallData.current));
          dispatch(addActiveCall(activeCallData.current));
        } else {
          // console.log("removing to kill");
          dispatch(removeActiveCall());
        }
      }

      //we are using this event for restricting displaying of chatMessage notification
      if (state == "background") {
        roomIDPlaceHolder = global.roomId;
        global.roomId = null;
      }

      if (state == "active") {
        global.roomId = roomIDPlaceHolder;
      }
    });
    // Check that app foreground get reject event
    const foregroundUnsubscribe = notifee.onForegroundEvent(async ({ type, detail }: any) => {
      if (type === EventType.ACTION_PRESS && detail.pressAction.id === "reject") {
        closeCall();
        await notifee.cancelNotification(detail.notification?.id);
      }
    });

    return () => {
      subs.remove();
      // foregroundUnsubscribe();
      netUnsubscribe();
    };
  }, []);

  useEffect(() => {
    engine?.current?.registerEventHandler({
      onJoinChannelSuccess: () => {
        console.log("Successfully joined the channel");
        if (Platform.OS == "android") {
          OutgoingCall();
        }

        if (!activeCallData.current?.isReceiver) {
          //IF I AM ORIGIN THEN START 31 SEC TIMER AND END THE CALL IF NOT ONE JOIN THE CALL

          NoAnswerCallAutoCut(activeCallData?.current?.callId);
        }
      },
      onUserJoined: (connection, uid) => {
        //IF JOINED REMOTE USER COUNT IS GRATER THEN 0 THEN START CALL DURATION TIMER, AND MONITOR OTHER PARTICIPANTS JOIN STATUS AND MANAGE IT LOCALLY.
        if (connection.channelId === "agora-echo-test-audio_only") return;
        player.current?.stop();
        handleRemoteUser(uid);
        if (Platform.OS == "android") {
          OngoingCall();
        }
      },
      onUserOffline: (connection, uid, reason) => {
        console.log("Remote User onLeaveChannel", uid, reason);
        //IF REMOTE USER LEFT THE CALL THEN MANAGE IT LOCALLY AND IF ALL REMOTE USER LEFT THEN AUTO CUT THR CALL
        markRemoteVideoEnabled(uid);
        removeRemoteUser(uid);
      },
      onRemoteVideoStateChanged: (connection, remoteUid, state, reason, elapsed) => {
        if (reason === 5 || reason === 12) {
          markRemoteVideoDisabled(remoteUid);
        } else if (reason === 6) {
          markRemoteVideoEnabled(remoteUid);
        }
      },
      onUserMuteVideo: (connection, remoteUid, muted) => {
        if (muted) {
          markRemoteVideoDisabled(remoteUid);
        } else {
          markRemoteVideoEnabled(remoteUid);
        }
      },
      onTranscodingUpdated: () => {
        console.log("Transcoding updated");
      },
      onAudioRoutingChanged: (routing) => {
        if (routing === 5) {
          setIsBluetoothEnabled(true);
        } else {
          setIsBluetoothEnabled(false);
        }
      },
      onRemoteAudioStateChanged: (connection, remoteUid, state, reason, elapsed) => {
        if (state === 1 || reason === 6) {
          if (activeCallData.current?.participants) {
            activeCallData.current.participants = activeCallData.current.participants.map((cp) => {
              return commonCondition(remoteUid, parseInt(cp.uid)) ? { ...cp, micEnable: true } : cp;
            });

            updatePart((prev) =>
              prev.map((prv) => ({
                ...prv,
                micEnable: commonCondition(remoteUid, prv.uid) ? true : prv.micEnable,
              }))
            );
          }
        } else if (state === 0 && reason === 5) {
          if (activeCallData.current?.participants) {
            activeCallData.current.participants = activeCallData.current.participants.map((cp) => {
              return commonCondition(remoteUid, parseInt(cp.uid)) ? { ...cp, micEnable: false } : cp;
            });

            updatePart((prev) =>
              prev.map((prv) => ({
                ...prv,
                micEnable: commonCondition(remoteUid, prv.uid) ? false : prv.micEnable,
              }))
            );
          }
        }
      },
      onError: async (err, msg) => {
        // await closeCall();
      },
      onConnectionStateChanged(connection, state, reason) {
        if (AgoraErrorTypes[state]) {
          callState.current = AgoraErrorTypes[state];
        }
        const joinCallData = activeCallData.current;
        if (state === 1 || state === 5) {
          if (state === 5) engine.current?.leaveChannel();
          if (joinCallData && Object.keys(joinCallData).length) {
            const uid = joinCallData.participants.find((e) => e._id === MyProfile?._id);
            if (uid?.uid) {
              rejoinChannel(joinCallData.token, joinCallData.channelId, parseInt(uid.uid));
            }
          }
        }
      },
      onLeaveChannel: (e) => {},
      onConnectionLost: (e) => {},
    });
    return () => {
      callTimer({ type: "STOP", duration: 0 });

      engine?.current?.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    if (callRequest && Object.keys(callRequest)?.length) {
      stopAllPlayers();
    }
  }, [callRequest]);

  useEffect(() => {
    // FLOW => ATOM GOT CALL REQUEST FROM USER (ANY SCREEN CAN SEND CALL REQUEST)
    // console.log('callRequest in model  ',callRequest?.channelId)
    if (callRequest && !inProgress.current) {
      callState.current = "";
      Keyboard.dismiss();
      inProgress.current = true;
      setFullScreenModel(true);
      // console.log('start the call object',activeCallData.current, callRequest)
      activeCallData.current = callRequest;
      dispatch(addActiveCall(callRequest));
      // FLOW => TAKE CALL REQUEST DATA AND GENERATE RTM TOKEN
      if (callRequest?.hasOwnProperty("appKilled") && callRequest?.appKilled?.status) {
        console.log("Here in app killed", callRequest?.appKilled?.participantUid);
        remoteUserList.current = callRequest?.appKilled?.participantUid;
        setRemoteUserListState(callRequest?.appKilled?.participantUid);
        joined.current = true;
        callStatus.current = `ComOn ${callRequest?.callType == "audio" ? t("audio") : t("video")} ${t("call")}`;
        callTimer({ type: "SPECIFIC", duration: Number(callRequest?.appKilled?.startTime ?? 0) });

        if (callRequest?.callType === "video") {
          engine?.current?.enableVideo();
          engine.current?.startPreview();
          setVideoCameraOn(true);
        }
        return;
      }
      if (callRequest.isReceiver) {
        const startTime = performance.now();
        callStatus.current = `${t("joiningCall")}...`;
        initializeBackgroundTask();
        const endTime = performance.now();
        console.log(`Call to doSomething took ${endTime - startTime} milliseconds.`);
      } else {
        console.log(callRequest);
        callStatus.current = `ComOn ${callRequest?.callType == "audio" ? t("audio") : t("video")} ${t("call")}`;
        createNewCall(callRequest, CloseCallONError).then(async (data) => {
          console.log("CALLER createNewCall result", data);
          if (typeof data == "object") {
            // console.log("createCall", data);
            activeCallData.current = data;
            console.log("CALLER activeCallData set", data?.callId);
            dispatch(addActiveCall(data));
            setIsTokenGenerated(true);
            if (typeof data?.callId == "string") {
              proximity.addListener(callback);

              const audioPermission = await getMicrophonePermission();
              if (!audioPermission) {
                return permissionAlert("Microphone", CloseCallONError);
              }

              engine.current?.enableLocalAudio(true);
              engine.current?.setEnableSpeakerphone?.(data.callType === "video");
              // engine.current?.startEchoTest();
              if (data.callType === "video") {
                const cameraPermission = await requestCameraPermission();
                if (cameraPermission === "denied") {
                  return permissionAlert("Camera", CloseCallONError);
                }
                engine.current?.startPreview();
                engine?.current?.enableVideo();
                engine.current?.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
                setVideoCameraOn(true);
              } else {
                engine.current?.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
                engine.current?.disableVideo?.();
              }
              // FLOW => TAKE RTM TOKEN AND CONNECT WITH AGORA
              engine?.current?.stopEchoTest();
              const uid = data.participants.find((dp) => dp.userId._id == MyProfile?._id);
              engine.current?.leaveChannel();
              if (uid) {
                const status = engine?.current?.joinChannel(data?.token, data?.channelId, parseInt(uid?.uid), {
                  clientRoleType: ClientRoleType.ClientRoleBroadcaster,
                });

                if (status == 0) {
                  MyuidRef.current = parseInt(uid?.uid);
                  player.current?.play();
                  setConnectedWithAgora(true);
                } else {
                  ToastMessage(t("label.cannot-join-call"));
                  resetCall();
                }
              } else {
                ToastMessage(t("label.current-user-not-found"));
                resetCall();
              }
            }
          } else {
            console.log("data is null", data);
            setIsTokenGenerated(false);
          }
        });
      }
    }
  }, [callRequest]);

  useEffect(() => {
    if (isTokenGenerated) {
      if (typeof activeCallData?.current?.callId == "string") {
        setTimeout(() => {
          (async () => {
            if (mounted.current) {
              if (activeCallData.current?.callType === "video") {
                await requestCameraPermission();
                engine.current?.enableVideo?.();
                engine.current?.setEnableSpeakerphone?.(true);
              } else {
                engine.current?.disableVideo?.();
                engine.current?.setEnableSpeakerphone?.(false);
              }
            }
            mounted.current = true;
          })();
        }, 1000);
      }
    }
  }, [activeCallData?.current?.callType, activeCallData?.current?.callId, isTokenGenerated]);

  const callback = (data) => {};

  const switchToVideoCall = useCallback(async () => {
    engine.current?.enableVideo();
    setVideoCameraOn(true);
    activeCallData.current = { ...activeCallData.current, callType: "video" };
    engine.current?.setEnableSpeakerphone(false);
  }, []);

  const videoCallRejected = useCallback(async () => {
    engine.current?.disableVideo();
    setVideoCameraOn(false);
    activeCallData.current = { ...activeCallData.current, callType: "video" };
    engine.current?.setEnableSpeakerphone(true);
  }, []);

  function NoAnswerCallAutoCut(id: string) {
    clearTimeout(NoAnswerCallAutoCutRef.current);
    NoAnswerCallAutoCutRef.current = setTimeout(() => {
      console.log("joined", joined.current);
      if (!joined.current) {
        if (id) {
          endCall({ variables: { input: { callId: id, userId: MyProfileRef.current?._id } } })
            .catch((error) => {
              console.log("NoAnswerCallAutoCut endCall error", error);
            })
            .finally(() => {
              player.current?.stop();
              resetCall();
              engine?.current?.leaveChannel();
              ToastMessage(t("callNotAnswered"));
            });
        }
      }
    }, 90000);
  }

  function initiateJoinCalls(isBackground?: boolean) {
    joinCall(callRequest, CloseCallONError).then(async (data) => {
      console.log("CALLER joinCall result", data);
      if (typeof data == "object") {
        activeCallData.current = data;
        console.log("CALLER activeCallData set from join", data?.callId);
        dispatch(addActiveCall(data));
        setIsTokenGenerated(true);
        if (typeof data?.callId == "string") {
          const audioPermission = await getMicrophonePermission();
          const errorCallCut = data.roomType === "individual" ? closeCall : CloseCallONError;
          console.log("audioPermission ", audioPermission);
          if (!audioPermission) {
            return permissionAlert("Microphone", errorCallCut);
          }
          engine.current?.enableLocalAudio(true);
          engine.current?.setEnableSpeakerphone?.(data.callType === "video");
          let cameraPermission = undefined;
          if (data.callType === "video") {
            cameraPermission = await requestCameraPermission();
            if (cameraPermission === "denied") {
              return permissionAlert("Camera", errorCallCut);
            }
            engine.current?.startPreview();
            engine?.current?.enableVideo();
            engine.current?.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);
            setVideoCameraOn(true);
          } else {
            engine.current?.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
            engine.current?.disableVideo?.();
          }
          // FLOW => TAKE RTM TOKEN AND CONNECT WITH AGORA
          engine?.current?.stopEchoTest();

          const uid = data.participants.find((dp) => dp.userId == MyProfile?._id);
          engine.current?.leaveChannel();
          console.log("Leaving previous channel");
          if (uid) {
            const status = engine?.current?.joinChannel(data?.token, data?.channelId, parseInt(uid?.uid), {
              clientRoleType: ClientRoleType.ClientRoleBroadcaster,
            });
            console.log("joining new channel");
            remoteUserData.current = data.participants;
            console.log("status", status);
            if (status == 0) {
              MyuidRef.current = parseInt(uid?.uid);

              setConnectedWithAgora(true);
              if (isBackground) {
                BackgroundTimer.stop();
              }
              const permissionCheck =
                data.callType === "video" ? audioPermission && cameraPermission === "granted" : audioPermission;
              if (permissionCheck) getChannelStatus(data);
            } else {
              ToastMessage(t("label.cannot-join-call"));

              resetCall();

              if (isBackground) {
                BackgroundTimer.stop();
              }
            }
          }
        }
      } else {
        console.log("data is null", data);
        setIsTokenGenerated(false);
      }
    });
  }

  function rejoinChannel(token: string, channelId: string, uid: number) {
    const status = engine.current?.joinChannel(token, channelId, uid, {
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
    });
    if (status === 0) {
      return true;
    }

    closeCall();
  }

  function getChannelStatus(data: callAtomType) {
    if (data?.roomType !== "individual") return;

    getChannelStatusTimerRef.current = setTimeout(() => {
      channelStatus({
        variables: {
          input: {
            callId: data?.callId,
            channelName: data?.channelId,
          },
        },
      })
        .then((res) => {
          if (res?.data?.getChannelStatus) {
            let joinedStatus = true;
            const participants = res.data.getChannelStatus.call?.callParticipants;
            if (participants?.length) {
              for (const item of participants) {
                if (item?.callStatus === "missed" && !remoteUserList.current?.length) {
                  joinedStatus = false;
                  break;
                }
              }
              if (!joinedStatus) {
                ToastMessage(t("label.no-one-is-available-in-call"));
                closeCall();
              }
            }
          }
        })
        .catch((err) => {
          console.log("Error in getting channel status", err);
        });
    }, 10000);
  }

  function handleRemoteUser(localUid: number) {
    let currentList = remoteUserList.current;
    console.log("handleRemoteUser", currentList, localUid);

    if (!myStatusSended.current && activeCallData.current?.callId) {
      callState.current = AgoraErrorTypes[3];
      myStatusSended.current = true;
      changeCallStatusRequest({
        variables: {
          input: {
            callId: activeCallData.current?.callId,
            userId: MyProfileRef.current._id,
            status: "accepted",
            device: "App",
          },
        },
      })
        .then((res) => {
          if (res.data?.changeCallStatus) {
            // ToastMessage("User Connected");
          }
        })
        .catch((err) => {
          if (err?.message) {
            const errorMessage = typeof err?.message === "string" ? JSON.parse(err?.message) : err?.message;
            if (errorMessage?.code === "already-joined") {
              resetCall();
              ToastMessage(errorMessage?.message);
            }
          }
          console.log("Error in change call status", JSON.stringify(err));
        });
    }

    if (activeCallData.current?.participants?.length) {
      console.log("Matching");
      const particpantData = [...activeCallData.current.participants];
      activeCallData.current.participants = particpantData.map((cp) => {
        return commonCondition(localUid, parseInt(cp.uid)) ? { ...cp, callStatus: "In call" } : cp;
      });

      updatePart((prev) =>
        prev.map((prv) => ({
          ...prv,
          callStatus: commonCondition(localUid, prv?.uid) ? "In call" : prv.callStatus,
        }))
      );
    }
    currentList = [...currentList, localUid];
    remoteUserList.current = [...new Set(currentList)];
    setRemoteUserListState(remoteUserList.current);
    console.log("currentList", currentList);
    joined.current = true;
    callStatus.current = "";
    callTimer({ type: "START", duration: 0 });
  }

  function commonCondition(localUid: number, uid: number) {
    return `${localUid}`.length > 6 ? `${localUid}`.startsWith(`${uid}`) : uid == localUid;
  }

  function removeRemoteUser(localUid: number) {
    console.log("onUserLeft", localUid, remoteUserList.current);
    const currentList = remoteUserList.current.filter((rc) => rc != localUid);

    if (activeCallData.current?.participants) {
      activeCallData.current.participants = activeCallData.current.participants.map((cp) => {
        return commonCondition(localUid, parseInt(cp.uid)) ? { ...cp, callStatus: "Left call" } : cp;
      });

      updatePart((prev) =>
        prev.map((prv) => ({
          ...prv,
          callStatus: commonCondition(localUid, prv.uid) ? "Left call" : prv.callStatus,
        }))
      );
    }
    remoteUserList.current = [...new Set(currentList)];
    setRemoteUserListState(remoteUserList.current);
    console.log("currentList", currentList.length);
    setTimeout(() => {
      if (currentUserList != currentList?.length) setCurrentUserList(currentList.length);
    }, 200);
    if (currentList.length == 0) {
      console.log("removeRemoteUser");
      closeCall();
    }
  }

  function CloseCallONError() {
    player.current?.stop();

    resetCall();
    clearTimeout(NoAnswerCallAutoCutRef.current);
  }

  async function OngoingCall(data?: callAtomType) {
    if (!data) data = activeCallData.current;
    if (data && Object.keys(data).length > 0) {
      const callRequestPayload = {
        roomName: data?.roomName,
        callType: data?.callType,
        roomType: data?.roomType,
        callBackground: data?.callBackground,
        callId: data.callId,
        body: `On going ${data.callType == "audio" ? "audio" : "video"} call`,
      };
      displayOnGoingCall(callRequestPayload);
    }
  }

  async function OutgoingCall(data?: callAtomType) {
    if (!data) data = activeCallData.current;
    if (data && Object.keys(data).length > 0) {
      const callRequestPayload = {
        roomName: data?.roomName,
        callType: data?.callType,
        roomType: data?.roomType,
        callBackground: data?.callBackground,
        callId: data.callId,
        body: `Out going ${data.callType == "audio" ? "audio" : "video"} call`,
      };
      displayOnGoingCall(callRequestPayload);
    }
  }

  async function initializeBackgroundTask() {
    if (Platform.OS === "ios") {
      if (AppState.currentState === "background" || AppState.currentState === "inactive") {
        BackgroundTimer.start();
        initiateJoinCalls(true);
      } else {
        initiateJoinCalls();
      }
    } else {
      initiateJoinCalls();
    }
  }

  async function resetCall() {
    updatePart([]);
    AsyncStorage.removeItem("activeCallData");
    clearTimeout(getChannelStatusTimerRef.current);
    inProgress.current = false;
    dispatch(removeActiveCall());
    setConnectedWithAgora(false);
    setDisabledRemoteVideo([]);
    setCallRequest(null);
    activeCallData.current = null;
    remoteUserList.current = [];
    setRemoteUserListState([]);
    joined.current = false;
    callTimer({ type: "STOP", duration: 0 });

    RNVoipCall.endAllCalls();
    engine.current?.setEnableSpeakerphone(false);
    setSpeakerEnabled(false);
    engine.current?.enableLocalAudio(false);
    setMuteAudio(false);
    myStatusSended.current = false;
    callState.current = "";
    setFullScreenModel(false);
    setMiniScreenModel(false);
    setIsBluetoothEnabled(false);
    setIsCallParticipantMode(false);
    setIsAddParticipantMode(false);
    proximity.removeListener(callback);
    await notifee.stopForegroundService();
    console.log("reset HERe in Call ended!");
    await notifee.cancelNotification(onGoingNotificationId.current);
  }

  async function toggleSpeaker() {
    engine.current?.setEnableSpeakerphone(!speakerEnabled);
    setSpeakerEnabled(!speakerEnabled);
  }

  async function toggleMute() {
    engine.current?.enableLocalAudio(muteAudio);
    setMuteAudio(!muteAudio);
  }

  async function toggleCamera() {
    engine.current?.switchCamera();
  }

  async function toggleVideoOnOff() {
    if (videoCameraOn) {
      engine.current?.muteLocalVideoStream(true);
      setVideoCameraOn(false);
    } else {
      engine.current?.muteLocalVideoStream(false);
      setVideoCameraOn(true);
    }
  }

  function markRemoteVideoDisabled(remoteUid: number) {
    setDisabledRemoteVideo((_tempArr: number[]) => (_tempArr.includes(remoteUid) ? _tempArr : [..._tempArr, remoteUid]));
  }

  function markRemoteVideoEnabled(remoteUid: number) {
    setDisabledRemoteVideo((_tempArr: number[]) => _tempArr.filter((_e: number) => _e !== remoteUid));
  }

  async function closeCall() {
    player.current?.stop();

    if (activeCallData?.current?.callId) {
      console.log("Closing call id", activeCallData?.current?.callId, remoteUserList.current.length);
      if (remoteUserList.current.length == 0) {
        const payload = {
          variables: {
            input: {
              callId: activeCallData?.current?.callId,
              userId: MyProfileRef.current?._id,
            },
          },
        };
        console.log("Payload", payload);
        endCall(payload)
          .then(async (res) => {
            if (res.errors) {
              console.error("Error in ending call", res.errors);
            }
            console.log("res.data?.endCall", res.data?.endCall);
            if (res.data?.endCall) {
              console.log(`call ended ${Platform.OS}`);
              resetCall();
              RNVoipCall.endAllCalls();
              RNVoipCall.stopRingtune();
              dispatch(removeActiveCall());
              await notifee.stopForegroundService();
              await notifee.cancelNotification(onGoingNotificationId.current);

              clearTimeout(NoAnswerCallAutoCutRef.current);
              engine?.current?.leaveChannel();
            }
          })
          .catch((err) => {
            console.error("Error in ending call", err);
          });
      } else {
        leftUserRequest({ variables: { input: { _id: activeCallData?.current?.callId } } })
          .then(async (res) => {
            if (res.data?.leftCall) {
              console.log(`call left ${Platform.OS}`);
              resetCall();
              RNVoipCall.endAllCalls();
              RNVoipCall.stopRingtune();
              await notifee.stopForegroundService();
              await notifee.cancelNotification(onGoingNotificationId.current);
              clearTimeout(NoAnswerCallAutoCutRef.current);
              engine?.current?.leaveChannel();
            }
          })
          .catch((err) => {
            console.error("Error in ending call", err);
          });
      }
    }

    setTimeout(() => {
      checkForCallSurvey();
    }, 1000);
  }

  async function checkForCallSurvey() {
    if (!MyProfileRef.current?.isSurvey) {
      return;
    }

    let res = await checkChatSurvey({
      variables: {
        input: {
          Module: SurveyEventType["Call"],
        },
      },
    });

    if (res.data?.takeSurvey) {
      console.log(res.data?.takeSurvey);
      if (res.data?.takeSurvey.success && res.data?.takeSurvey.surveyId) {
        setActiveSurveyId(res.data?.takeSurvey.surveyId);
      } else {
        setActiveSurveyId(null);
      }
    }
  }

  return (
    <View style={{ zIndex: 100 }}>
      {isMiniScreenModel && (
        <MiniCallMode
          switchToFullMode={(value) => {
            Keyboard.dismiss();
            setFullScreenModel(value);
            setMiniScreenModel(false);
          }}
          userName={activeCallData.current != null ? activeCallData.current.roomName : ""}
          // duration={formattedSeconds}
        />
      )}
      {isFullScreenModel && (
        <View
          style={{
            position: "absolute",
            height: height,
            width: width,
            zIndex: 101,
            top: 0,
            backgroundColor: "#b4e8ff",
          }}
        >
          {MyProfile?.mode == "SENIORCITIZEN" ? (
            <SeniorCallMode
              connectionCompleted={connectedWithAgora}
              SwitchToMiniMode={() => {
                setMiniScreenModel(true);
                setFullScreenModel(false);
              }}
              showCallParticipants={() => {
                setFullScreenModel(false);
                setIsCallParticipantMode(true);
              }}
              callRequest={activeCallData.current}
              muteAudio={muteAudio}
              toggleMute={toggleMute}
              toggleSpeaker={toggleSpeaker}
              speakerEnabled={speakerEnabled}
              peerIds={remoteUserListState}
              currentCallType={activeCallData?.current?.callType}
              toggleCamera={toggleCamera}
              joined={joined.current}
              toggleVideoOnOff={toggleVideoOnOff}
              videoCameraOn={videoCameraOn}
              disabledRemoteVideo={disabledRemoteVideo}
              switchToVideoCall={switchToVideoCall}
              videoCallRejected={videoCallRejected}
              closeCall={closeCall}
              // duration={formattedSeconds}
              callStatusText={callStatus.current}
              callState={callState.current}
              addParticipants={() => {
                setFullScreenModel(false);
                setIsAddParticipantMode(true);
              }}
              isBluetoothEnabled={isBluetoothEnabled}
            />
          ) : (
            <FullCallMode
              connectionCompleted={connectedWithAgora}
              SwitchToMiniMode={() => {
                setMiniScreenModel(true);
                setFullScreenModel(false);
              }}
              showCallParticipants={() => {
                setFullScreenModel(false);
                setIsCallParticipantMode(true);
              }}
              callRequest={activeCallData.current}
              muteAudio={muteAudio}
              toggleMute={toggleMute}
              toggleSpeaker={toggleSpeaker}
              speakerEnabled={speakerEnabled}
              peerIds={remoteUserListState}
              currentCallType={activeCallData?.current?.callType}
              toggleCamera={toggleCamera}
              joined={joined.current}
              toggleVideoOnOff={toggleVideoOnOff}
              videoCameraOn={videoCameraOn}
              disabledRemoteVideo={disabledRemoteVideo}
              switchToVideoCall={switchToVideoCall}
              videoCallRejected={videoCallRejected}
              closeCall={closeCall}
              // duration={formattedSeconds}
              callStatusText={callStatus.current}
              callState={callState.current}
              addParticipants={() => {
                setFullScreenModel(false);
                setIsAddParticipantMode(true);
              }}
              isBluetoothEnabled={isBluetoothEnabled}
            />
          )}
        </View>
      )}

      {isCallParticipantMode && (
        <View
          style={{
            width: width,
            height: height,

            backgroundColor: "white",
          }}
        >
          <CallParticipantsMode
            switchToFullCallMode={() => {
              setIsCallParticipantMode(false);
              setFullScreenModel(true);
            }}
            setFormattedParticipants={(data) => {
              if (activeCallData.current?.participants) {
                activeCallData.current.participants = data;
              }
            }}
            // duration={formattedSeconds}
            callID={activeCallData.current?.callId}
            participants={activeCallData.current ? activeCallData.current?.participants : []}
          />
        </View>
      )}

      {isAddParticipantMode && (
        <View
          style={{
            height: height,
            width: width,
            backgroundColor: "white",
          }}
        >
          <AddParticipants
            currentParticipantsList={activeCallData.current?.participants}
            onBackPress={(selectedContacts) => {
              setIsAddParticipantMode(false);
              setFullScreenModel(true);
            }}
            callId={activeCallData.current?.callId}
            roomId={
              callRequest?.roomType == "contact" || callRequest?.roomType == "contact_group"
                ? null
                : callRequest?.roomId
            }
          />
        </View>
      )}
    </View>
  );
}

export default React.memo(ActiveCallModel);
