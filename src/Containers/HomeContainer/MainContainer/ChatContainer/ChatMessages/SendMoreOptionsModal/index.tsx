import { Alert, Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import DocumentPicker, {
  DocumentPickerResponse,
} from "react-native-document-picker";
import {
  PERMISSIONS,
  checkMultiple,
  openSettings,
  requestMultiple,
} from "react-native-permissions";
import React, { useEffect, useState } from "react";
import {
  askCameraPermission,
  askMediaPermission,
  checkCameraPermission,
  checkMediaPermission,
} from "@Util/permission";

import Audio from "@Images/SendOptionModalSvg/Audio.svg";
import Camera from "@Images/SendOptionModalSvg/Camera.svg";
import Colors from "@/Constants/Colors";
import Contact from "@Images/SendOptionModalSvg/Contact.svg";
import Documents from "@Images/SendOptionModalSvg/Documents.svg";
import Feather from "react-native-vector-icons/Feather";
import Gallery from "@Images/SendOptionModalSvg/Gallery.svg";
import ImagePrevModal from "./ImagePreviewModa";
import { IsAttachmentSelectionVisibleAtom } from "@Atoms/ChatMessageEvents";
// import { Realm } from "@realm/react";
// import RealmContext from "../../../../../../schemas";
import { RootState } from "@Store/Reducer";
import Text from "@Components/Text";
import { generateThumbnail } from "@Util/genrateThumbNail";
import { launchCamera } from "react-native-image-picker";
import { launchImageLibrary } from "react-native-image-picker";
import { navigate } from "@Navigation/utility";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { windowWidth } from "@Util/ResponsiveView";
import Sound from "react-native-sound";
import ToastMessage from "@Util/ToastMesage";
import useUpdateChat from "@/hooks/useUpdateChat";
import Ionicons from "react-native-vector-icons/Ionicons";
import DocumentPreviewModal from "./DocumentPreviewModal";
import { EventType, RecurrentTypes } from "@/graphql/generated/types";
import dayjs from "dayjs";
import { useComonContacts } from "@/hooks/useComonContacts";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { socketManager } from "@/utils/socket/SocketManager";

// const { useRealm } = RealmContext;
interface SendMoreOptionModalProps { }

const SUPPORTED_AUDIO_EXTENSIONS = ["mp3", "wav"];
const SUPPORTED_DOCUMENT_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
  "zip",
  "rar",
  "7z",
];

const getFileExtension = (file: DocumentPickerResponse): string => {
  const source = `${file.name || file.fileCopyUri || file.uri || ""}`.toLowerCase();
  const extension = source.split(".").pop();
  return extension || "";
};

const isSupportedFile = (file: DocumentPickerResponse, allowedExtensions: string[]): boolean => {
  const extension = getFileExtension(file);
  return allowedExtensions.includes(extension);
};

export default function SendMoreOptionModal({ }: SendMoreOptionModalProps) {
  const { filterParticipants } = useComonContacts();
  // const realm = useRealm();
  const [ImagePre, setImagePre] = useState(false);
  const [documentData, setDocumentData] = useState<{
    file: DocumentPickerResponse;
    filetype: string;
    duration?: number;
  } | null>(null);
  const [moreVisible, setVisibleMore] = useAtom(
    IsAttachmentSelectionVisibleAtom
  );

  const { MyProfile } = useSelector((state: RootState) => state.Chat);

  const [display] = useAtom(singleRoom);
  const animatedOpacity = useSharedValue(0); // Initially set to 0 for hiding the component
  const [Image, setImage] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    animateDrawer(moreVisible);
  }, [moreVisible]);

  const animateDrawer = (show) => {
    runOnJS(() => {
      if (show) {
        animatedOpacity.value = withTiming(1, {
          duration: 200,
          easing: Easing.cubic,
        });
      } else {
        animatedOpacity.value = withTiming(0, {
          duration: 200,
          easing: Easing.bounce,
        });
      }
    })();
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedOpacity.value,
    };
  });

  const Button = ({ Icon, Title, onPress }: any) => {
    return (
      <Pressable style={styles.buttoncon} onPress={onPress}>
        {Icon}
        <Text size="xs" style={[styles.title, { marginTop: 5 }]} lineNumber={2}>
          {Title}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ marginTop: 5 }}>
      {moreVisible && (
        <Animated.View style={[styles.modalView, animatedStyle]}>
          <Button
            Title={t("moreOption.camera")}
            onPress={() => {
              pickImage("Camera");
            }}
            Icon={<Camera />}
          />
          <Button
            Title={t("moreOption.videos")}
            onPress={() => {
              pickImage("Video");
            }}
            Icon={
              <View
                style={{
                  backgroundColor: "white",
                  height: 56,
                  width: 56,
                  borderRadius: 50,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather
                  name="video"
                  size={32}
                  color={Colors.light.PrimaryColor}
                />
              </View>
            }
          />

          <Button
            Title={t("moreOption.gallery")}
            onPress={() => {
              pickImage("Gallery");
            }}
            Icon={<Gallery />}
          />
          <Button
            Title={t("moreOption.document")}
            onPress={() => {
              handleDocumentSelection("all");
            }}
            Icon={<Documents />}
          />
          <Button
            Title={t("moreOption.audio")}
            onPress={() => {
              handleDocumentSelection("audio");
            }}
            Icon={<Audio />}
          />

          <Button
            Title={t("moreOption.contact")}
            onPress={() => {
              onNavigateToContacts();
            }}
            Icon={<Contact />}
          />

          {(display.roomType == "individual" ||
            display.roomType === "group") && (
              <Button
                Title={t("moreOption.remind-at")}
                onPress={() => {
                  setVisibleMore(!moreVisible);
                  navigate("CreateReminderScreen", {
                    roomType: display.roomType,
                    roomId: display.roomId,
                    participants: filterParticipants(display.participantsNotLeft),
                  });
                }}
                Icon={
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 50,
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                    }}
                  >
                    <Ionicons
                      name="notifications-sharp"
                      size={33}
                      color={Colors.light.PrimaryColor}
                    />
                  </View>
                }
              />
            )}

          {(display.roomType == "group" ||
            display.roomType == "individual") && (
              <Button
                Title={t("chatPoll.poll")}
                onPress={() => {
                  setVisibleMore(!moreVisible);
                  navigate("CreateChatPollScreen", {});
                }}
                Icon={
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 50,
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="poll"
                      size={33}
                      color={Colors.light.PrimaryColor}
                    />
                  </View>
                }
              />
            )}
        </Animated.View>
      )}

      <DocumentPreviewModal
        document={documentData}
        onClose={() => setDocumentData(null)}
        onMessageSend={(caption) => {
          sendchat(
            documentData?.file,
            documentData?.filetype,
            documentData?.duration,
            caption
          );
          setDocumentData(null);
        }}
        onMessageSchedule={(caption) => {
          const decodedUri = decodeURIComponent(documentData?.file.fileCopyUri);
          navigate("CreateScheduleMessage", {
            type: EventType["Schedule"],
            roomId: display.roomId,
            roomType: display.roomType,
            mode: "create",
            startDate: dayjs().add(30, "minutes").toISOString(),
            daylyParams: null,
            monthlyParams: null,
            endDate: dayjs().toISOString(),
            recursive: RecurrentTypes["Once"],
            time: dayjs().add(30, "minutes").toISOString(),
            approvalReminderTime: [],
            isApprovalNeeded: false,
            message: [
              {
                roomId: display.roomId,
                type: "doc",
                mimeType: documentData?.file.type,
                fileURL: decodedUri,
                isForwarded: false,
                message: formateMessage(caption),
                fontStyle: "",
                thumbnail: "",
                duration: documentData?.duration ?? 0,
                isUploaded: false,
              },
            ],
          });
          setDocumentData(null);
        }}
      />

      <ImagePrevModal
        setImage={() => {
          setImage([]);
        }}
        Visible={ImagePre}
        image={Image}
        setVisible={() => {
          setImagePre(!ImagePre);
        }}
      />
    </View>
  );

  function formateMessage(message: string) {
    const regex = /@\[([^\]]+)\]\(([a-zA-Z0-9]{24})\)/g;
    let resultMessage = message;
    const matches = resultMessage.match(regex) ?? [];
    const changeMatch = [];

    // console.log(message, matches);
    if (matches.length > 0) {
      // const ids = [];
      for (let i = 0; i < matches?.length; i++) {
        const start = matches[i].indexOf("(");
        const end = matches[i].indexOf(")");
        const userID = matches[i].slice(start + 1, end);
        const phoneStart = matches[i].indexOf("[");
        const phoneEnd = matches[i].indexOf("]");
        const phone = matches[i].slice(phoneStart + 1, phoneEnd - 1);

        if (display.currentUserUtility.user_id == userID) {
          changeMatch.push(
            matches[i].replace(phone, display.currentUserUtility.phone)
          );
        } else {
          const isExist = display.participants.find(
            (contact) => contact.user_id == userID
          );
          if (isExist) {
            changeMatch.push(matches[i].replace(phone, isExist.phone));
          } else {
            changeMatch.push(matches[i].replace(phone, phone));
          }
        }
        // console.log(ids,matches[i])
      }

      for (let i = 0; i < matches.length; i++) {
        resultMessage = resultMessage?.replace(matches[i], changeMatch[i]);
      }
    }

    return resultMessage;
  }

  async function sendchat(
    file: DocumentPickerResponse,
    filetype: string,
    duration?: number,
    caption: string
  ) {
    const decodedUri = decodeURIComponent(file.fileCopyUri);
    try {
      const type =
        filetype == "audio"
          ? `LOADING/DOCUMENT/recording/mpeg`
          : `LOADING/DOCUMENT/${file.type}`;
      const conversation = {
        data: {
          roomId: display.roomId,
          type: type,
          message: formateMessage(caption),
          duration: duration ? Math.round(duration) : 0,
          fileURL: decodedUri ?? "",
          thumbnail: "",
          isForwarded: false,
          fontStyle: "",
          created_at: Date.now(),
          updated_at: 0,
          isSent: false,
        },
      };
      console.log("Conversation payload", conversation);
      socketManager.conversation.sendChat(conversation);
      // realm.write(() => {
      //   realm.create("conversations", conversation);
      // });
    } catch (error) {
      Alert.alert(
        `${t("moreOption-toastmessage.something-wrong")}`,
        `${t("moreOption-toastmessage.please-try-again-later")}`
      );
    }
  }

  async function handleDocumentSelection(filetype: string) {
    try {
      const result = await DocumentPicker.pickSingle({
        type:
          filetype == "audio"
            ? DocumentPicker.types.audio
            : DocumentPicker.types.allFiles,
        copyTo: "cachesDirectory",
      });
      if (result) {
        if (filetype == "audio") {
          if (!isSupportedFile(result, SUPPORTED_AUDIO_EXTENSIONS)) {
            ToastMessage("Unsupported audio format. Supported formats: .mp3, .wav");
            return;
          }

          setVisibleMore(!moreVisible);
          const sound = new Sound(result.fileCopyUri, "", (error) => {
            if (error) {
              console.error("Error in detecting sound", error);
              ToastMessage("Unsupported audio format. Supported formats: .mp3, .wav");
              return;
            }
            const duration = sound.getDuration();
            setDocumentData({
              file: result,
              filetype: "audio",
              duration: duration * 1000,
            });
            sound.release();
          });
        } else {
          if (!isSupportedFile(result, SUPPORTED_DOCUMENT_EXTENSIONS)) {
            ToastMessage(
              "Unsupported document format. Supported formats: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .csv, .zip, .rar, .7z"
            );
            return;
          }

          setVisibleMore(!moreVisible);
          setDocumentData({ file: result, filetype, duration: 0 });
        }
      }
    } catch (error) {
      console.log("Error in document picking", error);
    }
  }

  async function pickImage(type: "Gallery" | "Camera" | "Video") {
    switch (type) {
      case "Gallery":
        const resultGallery = await pickGallery();
        await OpenSelectedModel(resultGallery);
        break;
      case "Camera":
        const resultCamera = await pickCamera("Camera");
        await OpenSelectedModel(resultCamera);
        break;
      case "Video":
        const resultVideo = await pickCamera("Video");
        await OpenSelectedModel(resultVideo);
        break;
      default:
        break;
    }
  }

  async function pickCamera(type: "Camera" | "Video") {
    const checkCamera = await checkCameraPermission();
    console.log("checkCamera", checkCamera);
    if (checkCamera) {
      const result = await launchCamera({
        mediaType: type == "Camera" ? "photo" : "video",
        quality: 1,
        videoQuality: "high",
        durationLimit: 1200,
        cameraType: "back",
        formatAsMp4: Platform.OS == "ios" ? true : false,
      });

      return result;
    } else {
      const askCamera = await askCameraPermission();
      console.log("askCamera", askCamera);
      if (askCamera) {
        const result = await launchCamera({
          mediaType: type == "Camera" ? "photo" : "video",
          quality: 1,
          videoQuality: "high",
          durationLimit: 1200,
          cameraType: "back",
          formatAsMp4: Platform.OS == "ios" ? true : false,
        });
        return result;
      } else {
        PermissionAlert();
        return {};
      }
    }
  }

  async function pickGallery() {
    const checkGallery = await checkMediaPermission();
    if (checkGallery) {
      return await launchImageLibrary({
        // mediaTypes: MediaTypeOptions.All,
        mediaType: "mixed",
        presentationStyle: "popover",
        selectionLimit: 5,
        // allowsMultipleSelection: true,
        // quality: 1,
      });
    } else {
      const askGallery = await askMediaPermission();
      if (askGallery) {
        return await launchImageLibrary({
          // mediaTypes: MediaTypeOptions.All,
          mediaType: "mixed",
          presentationStyle: "popover",
          selectionLimit: 5,
          // allowsMultipleSelection: true,
          // quality: 1,
        });
      } else {
        PermissionAlert();
        return {};
      }
    }
  }

  async function OpenSelectedModel(result) {
    // console.log("result", result);
    if (result.didCancel) {
      setImage([]);
      setVisibleMore(!moreVisible);

      setTimeout(() => {
        setImagePre(false);
      }, 500);
    } else if (result.assets) {
      setVisibleMore(!moreVisible);

      let tempImageandVideoData: {
        element?: { type: string };
        thumbnail?: string | undefined;
        type?: string;
      }[] = [];

      for (let index = 0; index < result?.assets.length; index++) {
        try {
          if (result?.assets[index]?.type.includes("video")) {
            const thumb = await generateThumbnail(result?.assets[index]?.uri, {
              quality: 0,
            });
            const tempdata = result?.assets[index];
            const da = {
              thumbnail: thumb,
              ...tempdata, //by spreading this it will not create new key it directly append in object
            };
            tempImageandVideoData.push(da);
          } else {
            tempImageandVideoData = [
              ...tempImageandVideoData,
              result?.assets[index],
            ];
          }
        } catch (e) {
          console.log(e);
        }
      }
      if (tempImageandVideoData.length > 0) {
        // console.log("tempImageandVideoData", tempImageandVideoData);
        setImage((prevstate: any) => prevstate.concat(tempImageandVideoData));
        setTimeout(() => {
          setImagePre(true);
        }, 500);
      }
    } else {
      console.log("result", result);
    }
  }

  function onNavigateToContacts() {
    navigate("SelectContactScreen", {
      multipleRoomShare: false,
      currentRoomID: display.roomId,
    });
    setVisibleMore(!moreVisible);
  }

  function PermissionAlert() {
    Alert.alert(
      `${t("toastmessage.permission-alert")}`,
      `${t("toastmessage.permission-alert-message")}`,
      [
        {
          text: `${t("btn.cancel")}`,
          onPress: () => { }, //console.log("Cancel Pressed"),
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
  }
}

const styles = StyleSheet.create({
  buttoncon: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
    paddingVertical: 8,
    width: windowWidth / 6,
    // backgroundColor:'red'
  },

  // eslint-disable-next-line react-native/no-color-literals
  centeredView: {
    alignItems: "center",
    // backgroundColor: "rgba(0, 0, 0, 0.05)",
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: Platform.OS == "ios" ? 80 : 50,
  },

  // eslint-disable-next-line react-native/no-color-literals
  modalView: {
    // marginTop: "74%",
    // marginHorizontal: 10,
    // borderRadius: 10,

    backgroundColor: Colors.light.PrimaryColor,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    // paddingLeft: 30,

    alignItems: "flex-start",
    // justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // elevation: 4,
  },
  title: { color: Colors.light.White, textAlign: "center" },
});
