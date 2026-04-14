/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Image as ImageCompress,
  backgroundUpload,
} from "react-native-compressor";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { askMediaPermission, checkMediaPermission } from "@Util/permission";
import notifee, {
  AndroidImportance,
  NativeAndroidChannel,
} from "@notifee/react-native";
import { useIsFocused, useNavigation } from "@react-navigation/core";

import ArrowRight from "@Images/Arrow_right.svg";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import Colors from "@/Constants/Colors";
import CommonHeader from "@Components/header/CommonHeader";
import DarkThemeIcon from "@Images/Dark_theme.svg";
import FastImage from "@d11/react-native-fast-image";
import Ionicons from "react-native-vector-icons/Ionicons";
import LightThemeIcon from "@Images/Light_theme.svg";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import RealmContext from "../../../../../schemas";
import Slider from "@react-native-community/slider";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { launchImageLibrary } from "react-native-image-picker";
import { navigate } from "@Navigation/utility";
import { openSettings } from "react-native-permissions";
import RNFS from "react-native-fs";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useGetUploadSignedUrlLazyQuery } from "@Service/generated/room.generated";
import { useTranslation } from "react-i18next";

function getCompressorInputPath(uri: string) {
  if (!uri) return uri;
  if (!uri.startsWith("file://")) return uri;
  const filePath = uri.replace("file://", "");
  try {
    return decodeURIComponent(filePath);
  } catch {
    return filePath;
  }
}

async function shouldCompressImage(uri: string) {
  const filePath = getCompressorInputPath(uri);
  if (!filePath) return false;
  if (!uri.startsWith("file://")) return true;
  if (Platform.OS === "ios" && filePath.includes("/CoreSimulator/")) {
    return false;
  }
  try {
    return await RNFS.exists(filePath);
  } catch {
    return false;
  }
}
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { socket } from "@/redux/Reducer/SocketSlice";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { produce } from "immer";


const { width, height } = Dimensions.get("screen");

function WallpaperAndSound() {
  const [display, setDisplay] = useAtom(singleRoom);
  const [tempWallpaper, setTempWallPaper] = useState(
    `https://storage.googleapis.com/comon-bucket/${display.roomWallpaper.url}`
  );

  const [getUrl] = useGetUploadSignedUrlLazyQuery();
  const isFocused = useIsFocused();
  const [selectedWallpaper, setSelectedWallper] = useState<any>("");
  const [selectedWallpaperOpacity, setSelectedWallperOpacity] =
    useState<number>(display.roomWallpaper.opacity);

  const [tone, setTone] = useState({});
  const [AndroidChannel, setAndroidChannel] =
    useState<NativeAndroidChannel | null>(null);
  const [showIOSSound, setIOSSound] = useState<boolean>(false);
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    if (Platform.OS == "ios") {
      setIOSSound(display.roomSound.title != "" ? true : false);
    } else {
      notifee.getChannel(display.roomId).then((res) => {
        setAndroidChannel(res);
      });
    }
    setSelectedWallperOpacity(display.roomWallpaper.opacity);
    setTempWallPaper(
      `https://storage.googleapis.com/comon-bucket/${display.roomWallpaper.url}`
    );
  }, [isFocused]);

  const debouncedChangeRoomWallpaper = debounce((fileUrl, value, roomId) => {
    setIsUploading(true);
    socketConnect.emit("changeRoomWallpaper", {
      fileName: fileUrl,
      opacity: value,
      roomId: roomId,
    });
    ``;

    setDisplay(
      produce(display, (draftDisplay) => {
        draftDisplay.roomWallpaper.opacity = value;
        draftDisplay.roomWallpaper.url = fileUrl;
      })
    );

    setSelectedWallperOpacity(value);
    setIsUploading(false);
  }, 1000);

  useEffect(() => {
    if (display.roomWallpaper != null) {
      setSelectedWallper(display.roomWallpaper.url);
      setSelectedWallperOpacity(display.roomWallpaper.opacity);
    }
  }, [isFocused]);

  useEffect(() => {
    if (!display.roomSound) {
      setTone(display.roomSound);
    }
  }, [isFocused, display.roomSound]);

  const PermissionAlert = () => {
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
  };

  const uploadWallpaer = (fileUrl: string) => {
    setSelectedWallper(fileUrl);
    setSelectedWallperOpacity(selectedWallpaperOpacity);
    socketConnect.emit("changeRoomWallpaper", {
      fileName: fileUrl,
      opacity: selectedWallpaperOpacity,
      roomId: display.roomId,
    });

    setDisplay(
      produce(display, (draftDisplay) => {
        draftDisplay.roomWallpaper.opacity = selectedWallpaperOpacity;
        draftDisplay.roomWallpaper.url = fileUrl;
      })
    );
  };

  const removeWallpaper = useCallback(() => {
    socketConnect.emit("changeRoomWallpaper", {
      fileName: "",
      opacity: 0,
      roomId: display.roomId,
    });

    setDisplay(
      produce(display, (draftDisplay) => {
        draftDisplay.roomWallpaper.opacity = 0;
        draftDisplay.roomWallpaper.url = "";
      })
    );
  }, [isFocused, display.roomId]);

  const lunchGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      quality: 1,
      presentationStyle: "popover",
    });

    if (!result.didCancel && result.assets?.length > 0) {
      setIsUploading(true);
      setTempWallPaper(result.assets[0]?.uri);
      const path = `${display.roomId}/${display.currentUserUtility.user_id
        }/${result.assets[0]?.uri.slice(-10)}`;

      try {
        getUrl({
          variables: {
            input: {
              path: path,
              contentType: result.assets[0].type,
            },
          },
        }).then(async (res) => {
          if (res.data?.getUploadSignedUrl.url) {
            const imageUri = result.assets[0]?.uri ?? "";
            let compressedUrl = imageUri;
            const canCompress = await shouldCompressImage(imageUri);
            if (canCompress) {
              const compressorInputPath = getCompressorInputPath(imageUri);
              compressedUrl = await ImageCompress.compress(compressorInputPath, {
                compressionMethod: "manual",
                maxWidth: 1000,
                quality: 0.8,
              });
            }

            const headers = {
              "Content-Type": result.assets[0].type,
            };

            const uploadResult = await backgroundUpload(
              res.data?.getUploadSignedUrl.url,
              compressedUrl,
              { httpMethod: "PUT", headers },
              (written, total) => {
                // setProgress(written / (total / 100) / 100 - 0.03);
                console.log(written, total);
              }
            );
            if (uploadResult) {
              uploadWallpaer(path);
              setIsUploading(false);
            }
          } else {
            console.log(res);
          }
        });
      } catch (err) {
        Alert.alert(
          `${t("errors.error")}`,
          `${t("toastmessage.failed-to-upload-wallpaer")}`
        );
      }
    }
  };

  const onChooseWallperPress = useCallback(async () => {
    const res = await checkMediaPermission();
    if (res) {
      lunchGallery();
    } else {
      const askGallery = await askMediaPermission();
      if (askGallery) {
        lunchGallery();
      } else {
        PermissionAlert();
      }
    }
  }, [isFocused]);

  function onSelectSound(sound: any) {
    setTone(sound);
  }

  const selectedToneTitle = (tone as any)?.title || display.roomSound.title;

  const CustomSoundCheckbox = useCallback(() => {
    return (
      <BouncyCheckbox
        isChecked={
          Platform.OS == "android"
            ? AndroidChannel != null
              ? true
              : false
            : showIOSSound
        }
        iconStyle={{ borderRadius: 5 }}
        innerIconStyle={{ borderRadius: 5 }}
        fillColor={Colors.light.PrimaryColor}
        onPress={() => {
          if (Platform.OS == "android") {
            if (AndroidChannel != null) {
              notifee.deleteChannel(display.roomId);
              setAndroidChannel(null);
            } else {
              notifee
                .createChannel({
                  id: display.roomId,
                  name: display.roomName,
                  groupId: "CON",
                  sound: "default",
                  importance: AndroidImportance.HIGH,
                })
                .then((res) => {
                  notifee.getChannel(display.roomId).then((ch) => {
                    setAndroidChannel(ch);
                  });
                });
            }
          } else {
            setIOSSound(!showIOSSound);
          }
        }}
      />
    );
  }, [AndroidChannel, showIOSSound, isFocused, display.roomSound]);

  const isBroadcastRoom = display?.roomType == "broadcast";

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <CommonHeader
        title={t("others.Wallpaper")}
      />
      {isUploading && (
        <View
          style={{
            position: "absolute",
            zIndex: 5,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" />
        </View>
      )}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20 }}>
        <View style={styles.chooseWallpaperBtn}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons name="wallpaper" size={22} color="black" />
            <Text style={[styles.darkText, { marginLeft: 10 }]}>
              {t("wallpaper-sound.wallpaper")}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable
              onPress={() => onChooseWallperPress()}
              style={{
                backgroundColor: Colors.light.PrimaryColor,
                paddingHorizontal: 15,
                paddingVertical: 6,
                borderRadius: 10,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "500",
                  textAlign: "center",
                  fontSize: 12,
                }}
              >
                {t("btn.change")}
              </Text>
            </Pressable>
            {display.roomWallpaper.url.length != 0 && (
              <Pressable
                onPress={() => removeWallpaper()}
                style={{
                  backgroundColor: "red",
                  paddingHorizontal: 15,
                  paddingVertical: 6,
                  borderRadius: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 10,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "500",
                    textAlign: "center",
                    fontSize: 12,
                  }}
                >
                  {t("btn.delete")}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
        <View style={{ width: width, maxHeight: height / 1.7 }}>
          <View style={{}}>
            {display.roomWallpaper.url.length > 0 ? (
              <View style={{ marginHorizontal: -20 }}>
                <View
                  style={{
                    width: width,
                    height: "100%",
                    justifyContent: "flex-end",
                  }}
                >
                  <FastImage
                    source={{
                      uri: tempWallpaper,
                      priority: FastImage.priority.high,
                    }}
                    style={{
                      width: width,
                      height: "100%",
                      zIndex: -2,
                      position: "absolute",
                    }}
                  />
                  {/* <OverLay /> */}
                  <View
                    style={{
                      position: "absolute",
                      width: width,
                      // height: height,
                      height: "100%",
                      // height: height / 1.5,
                      top: 0,
                      zIndex: 1,
                      bottom: 0,
                      backgroundColor: `rgba(0, 0, 0, ${selectedWallpaperOpacity})`,
                    }}
                  >
                    <View
                      style={{
                        left: 10,
                        top: 30,
                        position: "absolute",
                        zIndex: 5,
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 10,
                        backgroundColor: "white",
                      }}
                    >
                      <Text style={{ color: "black", fontSize: 16 }}>
                        {t("defaultWallpaper")}
                      </Text>
                      <Text
                        style={{
                          textAlign: "right",
                          color: "black",
                          marginTop: 5,
                        }}
                      >
                        {dayjs().format("HH:mm")}
                      </Text>
                    </View>
                    <View
                      style={{
                        right: 10,
                        top: 120,
                        position: "absolute",
                        zIndex: 5,
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 10,
                        backgroundColor: Colors.light.PrimaryColor,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 16 }}>
                        {t("setWallpaper")}
                      </Text>
                      <Text
                        style={{
                          textAlign: "right",
                          color: "white",
                          marginTop: 5,
                        }}
                      >
                        {dayjs().format("HH:mm")}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignSelf: "center",
                      paddingVertical: 20,
                      marginLeft: -20,
                      alignItems: "center",
                      width: width / 1.5,
                      height: "10%",
                      marginBottom: 20,
                      zIndex: 2,
                    }}
                  >
                    <View style={{ width: 30 }}>
                      <LightThemeIcon />
                    </View>
                    <Slider
                      style={{ width: width / 1.5 }}
                      value={selectedWallpaperOpacity}
                      minimumValue={0}
                      maximumValue={1}
                      value={selectedWallpaperOpacity}
                      onValueChange={(value) => {
                        debouncedChangeRoomWallpaper(
                          selectedWallpaper,
                          value,
                          display.roomId
                        );
                      }}
                      minimumTrackTintColor="white"
                      maximumTrackTintColor="white"
                      thumbTintColor="white"
                    />
                    <View style={{ width: 30, alignItems: "center" }}>
                      <DarkThemeIcon />
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View
                style={{
                  width: width,
                  height: height,
                  marginHorizontal: -20,
                }}
              >
                <View
                  style={{
                    backgroundColor: "rgba(240,240,240,.8)",
                    height: height - 100,
                  }}
                >
                  <View
                    style={{
                      left: 10,
                      top: 30,
                      position: "absolute",
                      zIndex: 5,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 10,
                      backgroundColor: "white",
                    }}
                  >
                    <Text style={{ color: "black", fontSize: 16 }}>
                      {t("wallpaper-sound.comon-wallpaper-description")}
                    </Text>
                    <Text
                      style={{
                        textAlign: "right",
                        color: "black",
                        marginTop: 5,
                      }}
                    >
                      {dayjs().format("HH:mm")}
                    </Text>
                  </View>
                  <View
                    style={{
                      right: 10,
                      top: 120,
                      position: "absolute",
                      zIndex: 5,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      borderRadius: 10,
                      backgroundColor: Colors.light.PrimaryColor,
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 16 }}>
                      {t("wallpaper-sound.set-wallpaper-description-")}
                    </Text>
                    <Text
                      style={{
                        textAlign: "right",
                        color: "white",
                        marginTop: 5,
                      }}
                    >
                      {dayjs().format("HH:mm")}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
        {!isBroadcastRoom && display.roomType != "self" && (
          <View
            style={{
              marginTop: 10,
              paddingTop: 20,
              backgroundColor: "white",
              marginHorizontal: -20,
              paddingHorizontal: 15,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons
                  name="musical-notes-outline"
                  size={22}
                  color="black"
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.lightText}>
                  {t("wallpaper-sound.custom-tone")}
                </Text>
              </View>
              <CustomSoundCheckbox />
            </View>
            {Platform.OS == "android" && AndroidChannel != null ? (
              <Pressable
                style={[styles.chooseWallpaperBtn, { paddingTop: 16 }]}
                onPress={() =>
                  notifee.openNotificationSettings(AndroidChannel.id)
                }
              >
                <Text style={styles.darkText}>
                  {t("wallpaper-sound.alert-tone")}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.lightText}>{t("goToSettings")}</Text>
                  <ArrowRight />
                </View>
              </Pressable>
            ) : showIOSSound ? (
              <Pressable
                onPress={() => {
                  navigate("ChatSoundSelectionScreen", {
                    onSelectSound: onSelectSound,
                    tone: display.roomSound.title,
                  });
                }}
                style={[styles.chooseWallpaperBtn, { paddingTop: 16 }]}
              >
                <Text style={styles.darkText}>
                  {t("wallpaper-sound.alert-tone")}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.lightText}>
                    {selectedToneTitle}
                  </Text>
                  <ArrowRight />
                </View>
              </Pressable>
            ) : (
              <></>
            )}
            {Platform.OS == "android" && (
              <Pressable
                style={[
                  styles.rowDirection,
                  {
                    marginVertical: 10,
                    justifyContent: "space-between",
                    paddingVertical: 5,
                  },
                ]}
                onPress={() => {
                  navigate("PhoneSound", {});
                }}
              >
                <View style={styles.rowDirection}>
                  <MaterialIcons name="phonelink-ring" size={25} />
                  <Text
                    style={{
                      marginLeft: 5,
                      color: "#828282",
                      fontSize: 16,
                      lineHeight: 20,
                      marginRight: 10,
                    }}
                  >
                    {t("ringtone")}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  style={{ marginRight: 10 }}
                />
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default WallpaperAndSound;

const styles = StyleSheet.create({
  chooseWallpaperBtn: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  darkText: {
    color: "#333333",
    // fontFamily: 'Lato-Regular',
    fontSize: 16,
    lineHeight: 20,
  },

  imageContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  lightText: {
    color: "#828282",
    // fontFamily: 'Lato-Regular',
    fontSize: 16,
    lineHeight: 20,
    marginRight: 10,
  },
  rowDirection: {
    flexDirection: "row",
    alignItems: "center",
  },
});
