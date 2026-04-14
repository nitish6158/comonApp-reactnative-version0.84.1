import {
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SendIconGreen from "@Images/SendIconGreen.svg";
import {
  ImagePickerResponse,
  launchImageLibrary,
} from "react-native-image-picker";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Modal from "react-native-modal";
import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Constants/Colors";
import CommonLoader from "@Components/CommonLoader";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MentionInput } from "react-native-controlled-mentions";
// import RealmContext from "../../../../../../../schemas";
import { RootState } from "@Store/Reducer/index";
import ToastMessage from "@Util/ToastMesage";
import { generateThumbnail } from "@Util/genrateThumbNail";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom, useAtomValue } from "jotai";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { MentionInputProps } from "react-native-controlled-mentions/dist/types";
import FastImage from "@d11/react-native-fast-image";
import Icon from "@Assets/images/Icon";
import { navigate } from "@/navigation/utility";
import { EventType, RecurrentTypes } from "@/graphql/generated/types";
import dayjs from "dayjs";
import Video from "react-native-video";
import { socketManager } from "@/utils/socket/SocketManager";
import RNFS from "react-native-fs";

// const { useRealm } = RealmContext;

const { width, height } = Dimensions.get("window");
const empty = new RegExp(/^[ \t\r\n]*$/);

async function persistImageUri(uri?: string, fileName?: string) {
  if (!uri || !uri.startsWith("file://")) return uri ?? "";
  try {
    const sourcePath = decodeURIComponent(uri.replace("file://", ""));
    const exists = await RNFS.exists(sourcePath);
    if (!exists) return uri;

    const directoryPath = `${RNFS.DocumentDirectoryPath}/comon-upload`;
    await RNFS.mkdir(directoryPath);

    const fileExt = sourcePath.split(".").pop() || "jpg";
    const baseName = (fileName || `image-${Date.now()}`)
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9-_]/g, "_");
    const targetPath = `${directoryPath}/${baseName}-${Date.now()}.${fileExt}`;

    await RNFS.copyFile(sourcePath, targetPath);
    return `file://${targetPath}`;
  } catch (error) {
    console.error("Failed to persist selected image", error);
    return uri;
  }
}
type imageWithCaptionType = {
  id: number;
  image: {
    fileName: string;
    fileSize: number;
    height: number;
    type: string;
    uri: string;
    width: number;
    thumbnail: string;
  };
  caption: string;
  type: "video" | "image";
};

// create a component
export default function ImagePrevModal({
  Visible,
  setVisible,
  image,
  setImage,
}: any) {
  const display = useAtomValue(singleRoom);
  const MyProfile = useSelector((state: RootState) => state.Chat.MyProfile);
  const MentionInputRef = useRef<MentionInputProps>(null);
  // const realm = useRealm();
  const { t } = useTranslation();

  const [selectedImage, setSelectedImage] =
    useState<imageWithCaptionType | null>(null);
  const [imageWithCaptionList, setImageWithCaptionList] = useState<
    imageWithCaptionType[]
  >([]);

  useEffect(() => {
    (async () => {
      const preImages = await Promise.all(
        image.map(async (item, index) => {
          const stableUri = item?.type?.includes("image")
            ? await persistImageUri(item.uri, item.fileName)
            : item.uri;
          return {
            image: {
              ...item,
              uri: stableUri,
            },
            caption: "",
            id: index,
            type: item.type?.includes("video") ? "video" : "image",
          };
        })
      );
      setImageWithCaptionList(preImages);
      setSelectedImage(preImages[0] ?? null);
    })();
  }, [image]);

  const SendButton = () => {
    return (
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          style={styles.sendContainer}
          onPress={() => {
            handleSend();
            setVisible(!Visible);
          }}
        >
          <Ionicons
            name="send"
            color="white"
            size={18}
            style={{ marginLeft: 2 }}
          />
        </TouchableOpacity>
        <View style={{ width: 5 }} />
        {display.roomType !== "self" && (
          <Pressable style={styles.sendContainer} onPress={onMessageSchedule}>
            <Image
              tintColor={"white"}
              source={Icon.ScheduleIcon}
              style={{ height: 22, width: 22 }}
            />
          </Pressable>
        )}
      </View>
    );
  };

  const addImages = async (imageLen: number) => {
    const result = await launchImageLibrary({
      mediaType: "mixed",
      presentationStyle: "popover",
      selectionLimit: imageLen,
    });
    // console.log(result);

    if (result.assets) {
      let tempImageAndVideoData: ImagePickerResponse["assets"] = [];

      for (let index = 0; index < result?.assets.length; index++) {
        const mbSize = result?.assets[index].fileSize;
        const fileSizeInKB = mbSize / 1024;
        const fileSizeInMB = fileSizeInKB / 1024;

        if (fileSizeInMB < 16) {
          if (result?.assets[index]?.type?.includes("video")) {
            const thumb = await generateThumbnail(result?.assets[index]?.uri, {
              quality: 0,
            });

            const tempdata = result?.assets[index];
            const da = {
              thumbnail: thumb,
              ...tempdata,
            };
            tempImageAndVideoData.push(da);
          } else {
            const stableUri = await persistImageUri(
              result?.assets[index]?.uri,
              result?.assets[index]?.fileName
            );
            tempImageAndVideoData = [
              ...tempImageAndVideoData,
              {
                ...result?.assets[index],
                uri: stableUri,
              },
            ];
          }
        } else {
          ToastMessage(
            `${result?.assets.length == 1
              ? `${t("moreOption-toastmessage.largeImage-message")}`
              : `${t("moreOption-toastmessage.toolargeImage-message")}`
            }`
          );
        }
      }
      if (tempImageAndVideoData.length > 0) {
        // setImage((prevstate: any) => prevstate.concat(tempImageandVideoData));
        setImageWithCaptionList((prevState) =>
          prevState.concat(
            tempImageAndVideoData.map((iv, ivi) => {
              return {
                image: iv,
                caption: "",
                id: imageWithCaptionList.length + ivi,
                type: iv.type?.includes("video") ? "video" : "image",
              };
            })
          )
        );
      }
    }
  };

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

  const handleMessageChange = (message: string) => {
    const isEmpty = empty.test(message);
    if (!isEmpty) {
      // console.log(imageWithCaptionList);
      const newIC = imageWithCaptionList.map((item) => {
        if (item.id == selectedImage?.id) {
          return { ...item, caption: message };
        } else {
          return item;
        }
      });
      // console.log(newIC);
      setImageWithCaptionList(newIC);
    } else {
      const newIC = imageWithCaptionList.map((item) => {
        if (item.id == selectedImage?.id) {
          return { ...item, caption: "" };
        } else {
          return item;
        }
      });
      setImageWithCaptionList(newIC);
    }
  };

  const BottomImageSelector = useCallback(() => {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 10,
          // backgroundColor: "red",
          alignSelf: "center",
          width: width - 80,
        }}
      >
        {imageWithCaptionList.map((item, index) => {
          return (
            <Pressable
              key={index}
              style={{
                height: 50,
                width: 50,
                marginHorizontal: 1,
                borderColor: Colors.light.PrimaryColor,
                borderWidth:
                  selectedImage && item?.image.uri == selectedImage?.image?.uri
                    ? 2
                    : 0,
                borderRadius: 5,
              }}
              onPress={() => {
                setSelectedImage(item);
              }}
            >
              <ImageBackground
                source={{
                  uri:
                    item.type !== "video"
                      ? item.image.uri
                      : item.image.thumbnail,
                }}
                style={{ height: 46, width: 46 }}
                resizeMode="cover"
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                  }}
                >
                  {item.type == "video" && (
                    <Entypo name="controller-play" size={24} color="white" />
                  )}
                </View>
              </ImageBackground>
            </Pressable>
          );
        })}
      </View>
    );
  }, [imageWithCaptionList, selectedImage, image]);

  function onMessageSchedule() {
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
      message: imageWithCaptionList.map((v) => {
        let type = v.image.type?.includes("video") ? "video" : "image";
        return {
          roomId: display.roomId,
          type: type,
          mimeType: v.image.type,
          fileURL: v.image.uri,
          isForwarded: false,
          message: formateMessage(v.caption.trim()),
          fontStyle: "",
          thumbnail: v.image.thumbnail ?? "",
          duration: 0,
          isUploaded: false,
        };
      }),
    });
    setVisible(false);
    setImage([]);
    setSelectedImage(null);
  }

  const handleSend = () => {
    imageWithCaptionList.forEach(async (element) => {
      const conversation = {
        data: {
          roomId: display.roomId,
          type: `LOADING/${element.image.type}`,
          fileURL: element.image.uri,
          isForwarded: false,
          message: formateMessage(element.caption.trim()),
          fontStyle: "",
          thumbnail: "",
          duration: 0
        },
        reply_msg: null
      };
      socketManager.conversation.sendChat(conversation);
    });
    setVisible(false);
    setImage([]);
    setSelectedImage(null);
  };

  const AddMoreImages = () => {
    return (
      <Pressable
        onPress={() => {
          if (imageWithCaptionList.length != 5) {
            addImages(5 - imageWithCaptionList.length);
          } else {
            ToastMessage(t("label.max-limit"));
          }
        }}
      >
        <MaterialCommunityIcons
          name="file-image-plus"
          color="white"
          size={24}
        />
      </Pressable>
    );
  };

  const keyBoardOffset = Platform.OS == "android" ? 46 : 100;

  return (
    <View style={styles.container}>
      <Modal
        isVisible={Visible}
        onBackButtonPress={() => {
          setVisible(!Visible);
          setImage([]);
          setSelectedImage(null);
        }}
        style={{ margin: 0 }}
      >
        <StatusBar
          backgroundColor="rgba(51,51,51,.9)"
          barStyle="light-content"
        />
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: "black" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={height / keyBoardOffset}
        >
          <View style={styles.topcon}>
            <AntDesign
              name="arrowleft"
              color="white"
              size={24}
              onPress={() => {
                setVisible(!Visible);
                setImage([]);
                setImageWithCaptionList([]);
                setSelectedImage(null);
              }}
            />
          </View>
          <View style={styles.mainCon}>
            <View style={{ backgroundColor: "black" }}>
              {selectedImage?.type == "video" ? (
                <View style={{ flex: 1, justifyContent: "center" }}>
                  <Video
                    source={{ uri: selectedImage.image.uri }}
                    controls
                    style={{
                      height: height / 1.1,
                      width: "100%",
                      backgroundColor: "black",
                    }}
                    paused={false}
                    resizeMode="contain"
                  />
                </View>
              ) : (
                <Image
                  source={{
                    uri: selectedImage?.image.uri,
                  }}
                  // eslint-disable-next-line react-native/no-inline-styles
                  style={{ height: "100%", width: "100%" }}
                  resizeMode="contain"
                />
              )}
            </View>

            <View style={{ position: "absolute", left: 10, bottom: 10 }}>
              <View style={styles.bottomcon}>
                <View style={{ flexGrow: 1 }}>
                  <BottomImageSelector />
                  <View
                    style={{
                      minWidth: width - 20,
                      maxHeight: 200,
                      // marginRight: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      // marginBottom: 5,
                      backgroundColor: "rgba(51,51,51,.8)",
                      borderRadius: 30,
                      paddingHorizontal: 20,
                    }}
                  >
                    <AddMoreImages />
                    <MentionInput
                      ref={MentionInputRef}
                      maxLength={4096}
                      defaultValue={selectedImage?.caption}
                      onChange={handleMessageChange}
                      placeholder="Add Caption"
                      placeholderTextColor="rgba(243,243,243,.6)"
                      style={{
                        height: 48,
                        paddingHorizontal: 10,
                        marginHorizontal: 10,
                        borderRadius: 6,
                        paddingTop: 13,
                        paddingBottom: 10,
                        width: width - 140,
                        color: "white",
                        fontWeight: "500",
                        zIndex: 10,
                      }}
                      partTypes={[]}
                    />
                  </View>
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(51,51,51,.5)",
                    paddingHorizontal: 15,
                    borderRadius: 12,
                    paddingVertical: 5,
                  }}
                >
                  <Text style={{ color: "white" }}>{display.roomName}</Text>
                </View>
                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <SendButton />
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// define your styles
const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  addmorecon: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 5,
    height: 50,
    justifyContent: "center",
    marginLeft: 8,
    marginRight: 5,
    width: 30,
  },
  addmoretext: { color: "white", fontSize: 20, textAlign: "center" },
  bottomcon: {
    alignItems: "center",
    // backgroundColor: "white",
    flexDirection: "row",
    // flexGrow: 1,
    height: 120,
    justifyContent: "space-between",
    borderRadius: 10,
    width: width - 20,
  },
  // eslint-disable-next-line react-native/no-color-literals
  container: {
    alignItems: "center",
    backgroundColor: "black",
    flex: 1,
    justifyContent: "center",
  },
  mainCon: { backgroundColor: "black", flex: 1, justifyContent: "center" },
  topcon: {
    alignItems: "center",
    backgroundColor: "rgba(51,51,51,.9)",
    flexDirection: "row",
    height: Platform.OS == "ios" ? 90 : 50,
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: Platform.OS == "ios" ? 35 : 0,
    // position: "absolute",
    width: width,
    zIndex: 100,
  },
  sendContainer: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 40,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
});
