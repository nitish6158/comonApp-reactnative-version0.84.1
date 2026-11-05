import { AddTaskResultDto, Edge, Task } from "@Service/generated/types";
import {
  Alert,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
  RecordBackType,
} from "react-native-nitro-sound";
import {
  PERMISSIONS,
  check,
  checkMultiple,
  openSettings,
} from "react-native-permissions";
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { onAddTaskResultType, useTaskReport } from "@Hooks/useTaskReport";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/core";

import AntDesign from "react-native-vector-icons/AntDesign";
import AudioRecordRed from "@Images/AudioRecording/AudioRecordRed.svg";
import Colors from "@/Constants/Colors";
import DigitalTimeString from "@Components/AudioPlayer/src/DigitalTimeString";
import { ListItem } from "react-native-elements";
import { PanGestureHandler } from "react-native-gesture-handler";
import PauseRecording from "@Images/AudioRecording/PauseRecording.svg";
import PlayRecording from "@Images/AudioRecording/PlayRecording.svg";
import RNFetchBlob from "rn-fetch-blob";
import { RootState } from "@Store/Reducer";
import SendChatWithgreenbg from "@Images/AudioRecording/SendChatWithgreenbg.svg";
import Slider from "@react-native-community/slider";
import { TaskDefaultLoadingButton } from "@Components/TaskDefaultLoadingButton";
import ToastMessage from "@Util/ToastMesage";
import { generateRNFile } from "@Util/chatUtils/generateRNFile";
import { singleRoom } from "@Atoms/singleRoom";

import { useAddTaskResultMutation } from "@Service/generated/report.generated";
import { useAtom } from "jotai";
import useFileSystem from "@Hooks/useFileSystem";
import { useTranslation } from "react-i18next";
import { useUploadFileMutation } from "@Service/generated/task.generated";
import uuid from "react-native-uuid";

const audioRecorderPlayer = AudioRecorderPlayer;
// create a component
export type props = {
  task: Task;
  addTaskLoading: boolean;
  edge: Edge;
  onAddTaskResult: onAddTaskResultType;
  onpressCancel: () => void;
  autoStart: boolean;
  containerStyle: ViewStyle;
};

// import RealmContext from "../../../../../../schemas";
import dayjs from "dayjs";
import { setCurrentReport } from "@/redux/Reducer/OrganisationsReducer";
import { requestLocation } from "@/utils/permission/requestLocation";
import { socketManager } from "@/utils/socket/SocketManager";
// const { useRealm } = RealmContext;

export default function AudioRecording({
  onpressCancel,
  autoStart,
  task,
  edge,
  containerStyle,
}: props) {
  const { copyFile } = useFileSystem();
  const [addTaskResult, addTaskResponse] = useAddTaskResultMutation();
  const [loading, setloading] = useState(false);
  // const realm = useRealm();

  const { tasks, setCurrentTask, onAddTaskResult } = useTaskReport();
  const OrganisationData = useSelector(
    (state: RootState) => state.Organisation
  );
  const dispatch = useDispatch();

  const [display] = useAtom(singleRoom);

  const cTRef = useRef<number>(0);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showInitialView, setShowInitialView] = useState(true);
  const [duration, setDuration] = useState(0);
  const [activeTimeLine, setactiveTimeline] = useState(0);
  const [movingduration, setmovingduration] = useState(0);
  const [uploadFileTask] = useUploadFileMutation();

  const [audioUrl, setaudioUrl] = useState("");

  const [isPlaying, setIsplaying] = useState(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation();

  const { t } = useTranslation();

  useFocusEffect(
    React.useCallback(() => {
      if (autoStart == true) {
        setShowInitialView(true);
        startRecording();
      }
    }, [])
  );

  useEffect(() => {
    navigation.addListener("blur", () => {
      cancelAudio();
    });
    return () => {
      navigation.removeListener("blur", () => { });
    };
  }, []);

  const dirs = RNFetchBlob.fs.dirs;

  const path = Platform.select({
    // Discussion: https://github.com/hyochan/react-native-audio-recorder-player/discussions/479
    // ios: 'https://firebasestorage.googleapis.com/v0/b/cooni-ebee8.appspot.com/o/test-audio.mp3?alt=media&token=d05a2150-2e52-4a2e-9c8c-d906450be20b',
    // ios: 'https://staging.media.ensembl.fr/original/uploads/26403543-c7d0-4d44-82c2-eb8364c614d0',
    ios: `${dayjs().format("YYYYMMDD_hh_mm")}_recording.m4a`,
    android: `${dirs.CacheDir}/${dayjs().format(
      "YYYYMMDD_hh_mm"
    )}_recording.mp3`,
  });

  const PermissionAlert = () => {
    Alert.alert(
      `${t("toastmessage.permission-alert-microphone")}`,
      `${t("toastmessage.permission-alert-message-microphone")}`,
      [
        {
          text: `${t("btn.cancel")}`,
          onPress: () => { },
          style: "cancel",
        },
        {
          text: `${t("btn.ok")}`,
          onPress: () => {
            openSettings();
          },
        },
      ]
    );
  };

  async function checkAudioPermission() {
    if (Platform.OS == "android") {
      const checkAudio = await checkMultiple([
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
      ]);
      if (
        checkAudio["android.permission.READ_EXTERNAL_STORAGE"] == "granted" &&
        checkAudio["android.permission.READ_EXTERNAL_STORAGE"] == "granted" &&
        checkAudio["android.permission.WRITE_EXTERNAL_STORAGE"] == "granted"
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      const checkAudio = await check(PERMISSIONS.IOS.MICROPHONE);

      if (checkAudio == "granted") {
        return true;
      } else {
        return false;
      }
    }
  }

  async function requestAudioPermission() {
    if (Platform.OS == "android") {
      const askAudio = await checkMultiple([
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.RECORD_AUDIO,
      ]);
      if (
        askAudio["android.permission.READ_EXTERNAL_STORAGE"] == "granted" &&
        askAudio["android.permission.READ_EXTERNAL_STORAGE"] == "granted" &&
        askAudio["android.permission.WRITE_EXTERNAL_STORAGE"] == "granted"
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      const askAudio = await check(PERMISSIONS.IOS.MICROPHONE);
      if (askAudio == "granted") {
        return true;
      } else {
        return false;
      }
    }
  }

  function startAudio() {
    setIsRecording(true);
    setIsPaused(false);

    const audioSet = {
      AudioSourceAndroid: AudioSourceAndroidType.MIC,
      AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
      OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS,
      AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
      AVNumberOfChannelsKeyIOS: 2,
      AVFormatIDKeyIOS: AVEncodingOption.aac,
    };

    audioRecorderPlayer.startRecorder(path, audioSet, true).catch(async (e) => {
      const isAudioPermission = await checkAudioPermission();
      if (isAudioPermission) {
        startAudio();
      } else {
        const askAudio = await requestAudioPermission();
        if (askAudio) {
          startAudio();
        } else {
          PermissionAlert();
        }
      }
    });
  }

  const startRecording = async () => {
    startAudio();
  };

  const sendAudio = async () => {
    if (!isLoading && !isPlaying) {
      setIsLoading(true);
      sendRecordingHandler(audioUrl, autoStart);
      return;
    }
    ToastMessage(
      t("others.Please stop playing audio then you can send the file")
    );
  };
  const stopRecording = async () => {
    setIsPaused(false);
    setIsplaying(false);
    setIsRecording(false);
    setShowInitialView(false);
    const result = await audioRecorderPlayer.stopRecorder();
    setaudioUrl(result);
  };

  const pauseRecording = async () => {
    const result = await audioRecorderPlayer.pauseRecorder();

    setIsPaused(true);
  };

  const resumeRecording = async () => {
    const result = await audioRecorderPlayer.resumeRecorder();

    setIsPaused(false);

    // await recording.startAsync();
  };

  const RedAudio = () => {
    return (
      <Pressable style={styles.audioredcon}>
        <BlinkingMicrophone
          isAnimate={isPaused}
          onIconPress={() => {
            stopPlayRecording();
            // startPlayRecording();
          }}
        />
        <AudioRecordingTimer
          initialValueRef={cTRef}
          maxLimit={10 * 60 * 1000}
          onMaxLimit={() => {
            stopRecording();
            setIsPaused(true);
          }}
          visibility={!isPlaying}
        />
      </Pressable>
    );
  };

  const sendRecordingHandler = async (
    recordingURI: string,
    autoStart: boolean
  ) => {
    const file = {
      name: "mp3",
      uri: recordingURI,
    };
    // console.log("recordingURI", recordingURI);
    if (!autoStart) {
      setloading(true);
      const audioFile = {
        name: recordingURI,
        uri: recordingURI,
      };
      const reportId = OrganisationData.currentReport._id;

      let RNFile: any = {};
      RNFile = file?.uri ? generateRNFile(audioFile) : undefined;

      let uploadError;
      const attachmentId = RNFile
        ? await uploadFileTask({
          variables: { file: RNFile },
        }).catch((error) => {
          setloading(false);

          // Alert.alert(error.message);
          uploadError = error;
        })
        : undefined;
      if (uploadError) {
        ToastMessage(t("others.There has been some error in uploading file"));
        return;
      }
      let lat = null;
      let long = null;
      if (task?.saveUserLocation) {
        requestLocation()
          .then((res) => {
            lat = res?.lat;
            long = res?.long;
          })
          .catch((err) => {
            console.log("errrrrrrr", err);
          });
      }

      const input: AddTaskResultDto = {
        reportId,
        label: task.label!,
        content: task.content!,
        result: edge.label!,
        type: task.type!,
        edgeId: edge._id,
        attachmentId: task?.attachment?.attachment?._id ?? null,
        resultAttachment: attachmentId?.data?.uploadFile._id,
        targetTaskId: edge.targetTaskID,
        lat: task?.saveUserLocation ? lat : null,
        long: task?.saveUserLocation ? long : null,
      };

      addTaskResult({
        variables: {
          input,
        },
      })
        .then((res) => {
          setloading(false);
          const targetId =
            res?.data?.addTaskResult?.tasksData[
              res?.data?.addTaskResult?.tasksData?.length - 1
            ]?.targetTaskId;

          const task = tasks?.find((item: any) => item?._id === targetId);

          setCurrentTask(task);
          dispatch(setCurrentReport(res?.data?.addTaskResult));
        })
        .catch((res) => {
          console.log(res, "errroror");
          setloading(false);
        });

      return;
    }

    const decodedUri = decodeURIComponent(recordingURI);

    try {
      await cancelAudio();
      const conversation = {
        _id: uuid.v4(),
        roomId: display.roomId,
        type: "LOADING/DOCUMENT/recording/mpeg",
        sender: display.currentUserUtility.user_id,
        message: "",
        duration: parseInt(cTRef.current.toFixed(0)),
        fileURL: decodedUri ?? "",
        thumbnail: "",
        favourite_by: [],
        isForwarded: false,
        fontStyle: "",
        created_at: Date.now(),
        updated_at: 0,
        readByIds: "",
        read_by: [],
        deleted: [],
        downloadBy: [],
        PinBy: [],
        isSent: false,
        deliveredToIds: "",
        delivered_to: [],
        __v: 0,
      };

      const payload = {
        data: {
          roomId: display?.roomId,
          type: "LOADING/DOCUMENT/recording/mpeg",
          fileURL: decodedUri ?? "",
          isForwarded: false,
          message: "",
          fontStyle: "",
          thumbnail: "",
          duration: parseInt(cTRef.current.toFixed(0)),
        },
        reply_msg: null,
      };

      socketManager.conversation.sendChat(payload);

      // realm.write(() => {
      //   realm.create("conversations", conversation);
      // });
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      Alert.alert(
        `${t("moreOption-toastmessage.something-wrong")}`,
        `${t("moreOption-toastmessage.please-try-again-later")}`
      );
    }
  };

  const cancelAudio = async () => {
    setIsRecording(false);
    setShowInitialView(true);
    onpressCancel(false);
    await audioRecorderPlayer.stopRecorder();
    audioRecorderPlayer.removeRecordBackListener();
  };
  const startPlayRecording = async () => {
    // setIsplaying(true);
    try {
      const msg = await audioRecorderPlayer.startPlayer(audioUrl);
      const volume = await audioRecorderPlayer.setVolume(1.0);

      // console.log("msg", msg);
      await audioRecorderPlayer.addPlayBackListener((e) => {
        // console.log("e", e);
        setDuration(e.duration);
        setmovingduration(e.currentPosition);
        if (e.duration == e.currentPosition) {
          setIsRecording(false);
          setIsplaying(false);
        }
      });
    } catch (error) { }
  };
  const mapAudioToCurrentTime = async () => {
    try {
      // set slider position code here if needed
    } catch (error) { }
  };
  const stopPlayRecording = async () => {
    setIsRecording(false);

    setIsplaying(false);
    audioRecorderPlayer.stopPlayer();
    audioRecorderPlayer.removePlayBackListener();
  };

  const X = useSharedValue(0);
  const animatedGestureEvent = useAnimatedGestureHandler({
    onActive: (e) => {
      if (e.translationX < 0) {
        X.value = e.translationX;
      }
    },
    onEnd: () => {
      if (X.value < -163) {
        X.value = withSpring(-0);

        runOnJS(cancelAudio)();
      } else {
        X.value = withSpring(0);
      }
    },
  });
  const AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: X.value }],
    };
  });
  const InterPlolateXinput = [0, -150];
  const CancelTextAnimated = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        X.value,
        InterPlolateXinput,
        [0.8, 0],
        Extrapolate.CLAMP
      ),
      transform: [
        {
          translateX: interpolate(
            X.value,
            InterPlolateXinput,
            [-0, -160],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  const PauseAndResume = useCallback(() => {
    return autoStart ? (
      <Pressable
        style={{ height: "100%", paddingLeft: 15, paddingVertical: 5 }}
        onPress={() => {
          if (isPaused) {
            resumeRecording();
          } else {
            pauseRecording();
          }
        }}
      >
        <Text>{!isPaused ? t("others.Pause") : t("others.Resume")}</Text>
      </Pressable>
    ) : (
      <></>
    );
  }, [autoStart, isPaused]);

  return (
    <View style={[styles.container, containerStyle]}>
      {!loading ? (
        <>
          <View style={styles.slidercon}>
            {isPlaying && (
              <>
                <DigitalTimeString time={duration - movingduration} />
                <Slider
                  thumbTintColor={Colors.light.PrimaryColor}
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{ width: "86%", height: 40 }}
                  minimumValue={0}
                  value={movingduration}
                  maximumValue={duration}
                  minimumTrackTintColor={Colors.light.PrimaryColor}
                  maximumTrackTintColor={Colors.light.PrimaryColor}
                  onValueChange={(e) => setactiveTimeline(e)}
                  onResponderRelease={async () => {
                    await mapAudioToCurrentTime();
                  }}
                />
              </>
            )}
          </View>
          <View style={styles.secondcon}>
            <RedAudio />

            {!isLoading ? (
              <View style={styles.leftCon}>
                <Pressable
                  onPress={() => {
                    cancelAudio();
                  }}
                >
                  <Animated.Text style={[styles.cancel, CancelTextAnimated]}>
                    {t("others.Cancel")}
                  </Animated.Text>
                </Pressable>
                {showInitialView && (
                  <>
                    {autoStart == false && isRecording == false ? (
                      <TouchableOpacity
                        style={{
                          height: 60,
                          width: 60,
                          backgroundColor: Colors.light.PrimaryColor,
                          borderRadius: 100,
                          justifyContent: "center",
                          alignItems: "center",
                          marginLeft: 10,
                        }}
                        onPress={() => {
                          setShowInitialView(true);
                          startRecording();
                        }}
                      >
                        <Text
                          style={{
                            textAlign: "center",
                            color: Colors.light.White,
                          }}
                        >
                          {t("others.Record")}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      autoStart == false && (
                        <TouchableOpacity
                          style={{
                            height: 60,
                            width: 60,
                            backgroundColor: Colors.light.red,
                            borderRadius: 100,
                            justifyContent: "center",
                            alignItems: "center",
                            marginLeft: 4,
                          }}
                          onPress={() => {
                            stopRecording();
                          }}
                        >
                          <Text
                            style={{
                              textAlign: "center",
                              color: Colors.light.White,
                            }}
                          >
                            {t("others.Stop")}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                    {/* <PauseAndResume /> */}
                    {autoStart && (
                      <Pressable
                        onPress={() => {
                          if (isPaused) {
                            resumeRecording();
                          } else {
                            pauseRecording();
                          }
                        }}
                      >
                        <PanGestureHandler
                          onGestureEvent={animatedGestureEvent}
                        >
                          <Animated.View
                            style={[
                              // eslint-disable-next-line react-native/no-inline-styles
                              {
                                // backgroundColor: "red",
                                flexDirection: "row",
                                paddingHorizontal: 10,
                              },
                              AnimatedStyle,
                            ]}
                          >
                            {/* {!showRecording && <Chevron />} */}
                            {!isPaused ? (
                              <AntDesign
                                name="pausecircle"
                                size={30}
                                color={Colors.light.PrimaryColor}
                              />
                            ) : (
                              <PlayRecording style={styles.iconStyle} />
                            )}
                            {/* <AudioRecordBlue style={styles.audioblue} /> */}
                          </Animated.View>
                        </PanGestureHandler>
                      </Pressable>
                    )}
                    <Pressable
                      style={{
                        height: "100%",
                        paddingLeft: 15,
                        paddingVertical: 5,
                      }}
                      onPress={async () => {
                        setIsPaused(false);
                        setIsplaying(false);
                        setShowInitialView(false);
                        const result = await audioRecorderPlayer.stopRecorder();

                        // console.log("Stopping recording..", result);
                        if (!isLoading && !isPlaying) {
                          setIsLoading(true);
                          sendRecordingHandler(result, autoStart);
                          return;
                        }
                        ToastMessage(
                          t(
                            "others.Please stop playing audio then you can send the file"
                          )
                        );
                      }}
                    >
                      <SendChatWithgreenbg />
                    </Pressable>
                  </>
                )}
                {!showInitialView && (
                  <>
                    {/* <HoldRecording style={styles.iconStyle} /> */}
                    {isPlaying ? (
                      <Pressable onPress={stopPlayRecording}>
                        <PauseRecording style={styles.iconStyle} />
                      </Pressable>
                    ) : (
                      <Pressable onPress={startPlayRecording}>
                        <PlayRecording style={styles.iconStyle} />
                      </Pressable>
                    )}

                    {/* <Pressable style={{ height: "100%", paddingLeft: 15, paddingVertical: 5 }} onPress={sendAudio}>
                      <SendChatWithgreenbg />
                    </Pressable> */}
                  </>
                )}
              </View>
            ) : (
              <View>
                <Text>{t("others.Sending...")}</Text>
              </View>
            )}
          </View>
        </>
      ) : (
        <TaskDefaultLoadingButton />
      )}
    </View>
  );
}

// define your styles
const styles = StyleSheet.create({
  audioblue: { height: 44, marginLeft: 20 },
  audioredcon: { alignItems: "center", flexDirection: "row" },
  cancel: { color: Colors.light.red },
  chevron: { transform: [{ rotate: "180deg" }] },
  container: {
    backgroundColor: Colors.light.LightBlue,
    height: 76,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  iconStyle: { marginLeft: 20 },
  leftCon: { alignItems: "center", flexDirection: "row", height: "100%" },
  secondcon: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  slidercon: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

type AudioRecordingTimerProps = {
  initialValueRef: MutableRefObject<number>;
  maxLimit: number;
  onMaxLimit: () => void;
  visibility: boolean;
};

function AudioRecordingTimer({
  initialValueRef,
  maxLimit,
  onMaxLimit,
  visibility,
}: AudioRecordingTimerProps) {
  const [time, setTime] = useState(initialValueRef.current);
  useEffect(() => {
    audioRecorderPlayer.addRecordBackListener(async (e: RecordBackType) => {
      // console.log(e);
      if (e.currentPosition >= maxLimit) {
        onMaxLimit();
        ToastMessage("You cannot record audio more than 1 minute");
      }
      setTime(e.currentPosition);
      initialValueRef.current = e.currentPosition;
    });
  }, []);
  return visibility ? <DigitalTimeString time={time} /> : <></>;
}

type BlinkingMicrophoneProps = {
  isAnimate: boolean;
  onIconPress: () => void;
};

function BlinkingMicrophone({
  isAnimate,
  onIconPress,
}: BlinkingMicrophoneProps) {
  const offset = useSharedValue(1);
  const blink = useAnimatedStyle(() => {
    return { opacity: offset.value };
  });

  useEffect(() => {
    if (isAnimate) {
      offset.value = withTiming(1);
    } else {
      offset.value = withRepeat(
        withTiming(0, {
          duration: 1000,
        }),
        -1
      );
    }
  }, [isAnimate]);

  return (
    <Pressable onPress={() => { }}>
      <Animated.View style={[styles.audioredcon, blink]}>
        <AudioRecordRed style={{ marginHorizontal: 10 }} />
      </Animated.View>
    </Pressable>
  );
}
