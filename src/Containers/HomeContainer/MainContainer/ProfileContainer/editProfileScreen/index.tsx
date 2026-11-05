import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { $size_md } from "@/Constants/Sizes";
import { $space_md } from "@/Constants/Spaces";
import Colors from "@/Constants/Colors";
import Dialog from "react-native-dialog";
import Modal from "react-native-modal";
import CommonHeader from "@/Components/header/CommonHeader";
import { EditProfileImageScreenProps } from "../../../../../navigation/screenPropsTypes";
import Feather from "react-native-vector-icons/Feather";
import ImagePicker from "react-native-image-crop-picker";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { currentTimeinUnix } from "@Util/date";
import { currentUserIdAtom } from "@/Atoms";
import { generateRNFile } from "@Util/chatUtils/generateRNFile";
import { mainStyles } from "../../../../../styles/main";
import {
  askCameraPermission,
  checkCameraPermission,
  permissionAlert,
} from "@Util/permission";
import { useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { useUpdateUserMutation } from "@Service/generated/user.generated";
import { useUploadChatFileMutation } from "@Service/generated/auth.generated";
import uuid from "react-native-uuid";
import { windowWidth } from "@Util/ResponsiveView";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";
import { useAppSelector } from "@/redux/Store";
import { socket } from "@/redux/Reducer/SocketSlice";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl, ImageUrl } from "@/graphql/provider/endpoints";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import { getTimeZone } from "react-native-localize";
import dayjs from "dayjs";
import { socketConnect } from "@/utils/socket/SocketConnection";

// create a component
export default function EditProfileScreen({
  navigation,
}: EditProfileImageScreenProps) {
  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);
  const setProfileImagePath = useSetAtom(currentUserIdAtom);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [Fileupload, { loading: signUpLoading }] = useUploadChatFileMutation();
  const [updateUser, { loading: updateLoading }] = useUpdateUserMutation();
  const [localProfileUri, setLocalProfileUri] = useState<string | null>(null);
  const [imageVersion, setImageVersion] = useState<number>(Date.now());
  const [aboutDialog, setAboutDialog] = useState<boolean>(false);
  const [nameDialog, setNameDialog] = useState<boolean>(false);
  const [imageOptionDialog, setImageOptionDialog] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>(
    `${MyProfile?.firstName ?? ""} ${MyProfile?.lastName ?? ""}`,
  );
  const [userStatus, setUserStatus] = useState<string>(
    MyProfile?.bio?.status ?? "",
  );

  return (
    <KeyboardAvoidingView
      style={[mainStyles.flex1, { backgroundColor: "#FFF" }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <CommonHeader title={t("navigation.editProfile")} />
      <View style={{ flex: 1 }}>
        <Pressable
          onPress={onProfileImagePress}
          style={{
            height: 180,
            width: 180,
            borderRadius: 100,
            justifyContent: "center",
            alignItems: "center",
            alignSelf: "center",
          }}
        >
          <FastImage
            style={{ height: 150, width: 150, borderRadius: 100 }}
            source={{
              uri:
                localProfileUri ??
                `${DefaultImageUrl}${
                  MyProfile?.profile_img || ImageUrl
                }?v=${imageVersion}`,
            }}
          />
          <View
            style={{
              backgroundColor: Colors.light.PrimaryColor,
              paddingHorizontal: 10,
              paddingVertical: 10,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 50,
              position: "absolute",
              bottom: 10,
              // marginLeft: 30,
              right: 20,
            }}
          >
            <Feather name="camera" size={18} color="#FFFF" />
          </View>
        </Pressable>
        <View style={styles.userForm}>
          <View>
            <Pressable
              onPress={() => {
                setNameDialog(true);
              }}
              style={styles.inputContainer}
            >
              <MaterialCommunityIcons
                style={styles.inputIcon}
                name="account-outline"
                size={22}
                color={"gray"}
              />
              <View style={{}}>
                <Text style={styles.inputLabel}>{t("table.title.name")}</Text>
                <Text lineNumber={2} style={styles.inputText}>{`${
                  MyProfile?.firstName ?? ""
                } ${MyProfile?.lastName ?? ""}`}</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => {
                setAboutDialog(true);
              }}
              style={styles.inputContainer}
            >
              <AntDesign
                style={styles.inputIcon}
                name="infocirlceo"
                size={22}
                color={"gray"}
              />
              <View style={{ marginRight: 30 }}>
                <Text style={styles.inputLabel}>{t("navigation.about")}</Text>
                <Text lineNumber={5} style={styles.inputText}>
                  {MyProfile?.bio?.status ?? ""}
                </Text>
              </View>
            </Pressable>

            <View style={styles.inputContainer}>
              <Feather
                style={styles.inputIcon}
                name="phone"
                size={22}
                color={"gray"}
              />
              <View style={{}}>
                <Text style={styles.inputLabel}>{t("form.label.phone")}</Text>
                <Text style={styles.inputText}>{MyProfile?.phone ?? ""}</Text>
              </View>
            </View>

            {/* <View style={styles.inputContainer}>
              <MaterialCommunityIcons style={styles.inputIcon} name="email-outline" size={22} color={"gray"} />
              <View style={{}}>
                <Text style={styles.inputLabel}>{t("form.label.email")}</Text>
                <Text style={styles.inputText}>{MyProfile.email}</Text>
              </View>
            </View> */}
          </View>
        </View>
      </View>
      <Dialog.Container visible={nameDialog}>
        <Dialog.Title style={{ color: "black" }}>{`${t(
          "table.title.name",
        )}`}</Dialog.Title>
        <Dialog.Input
          defaultValue={`${MyProfile?.firstName ?? ""} ${
            MyProfile?.lastName ?? ""
          }`}
          maxLength={30}
          style={{ color: "black" }}
          onChangeText={setUserName}
        />
        <Dialog.Button
          label={t("btn.cancel")}
          onPress={() => setNameDialog(false)}
        />
        <Dialog.Button label={t("btn.save")} onPress={updateUserName} />
      </Dialog.Container>

      <Dialog.Container visible={aboutDialog}>
        <Dialog.Title style={{ color: "black" }}>{`${t("others.Add")} ${t(
          "navigation.about",
        )}`}</Dialog.Title>
        <Dialog.Input
          defaultValue={MyProfile?.bio?.status ?? ""}
          maxLength={140}
          style={{ color: "black" }}
          onChangeText={setUserStatus}
        />
        <Dialog.Button
          label={t("btn.cancel")}
          onPress={() => setAboutDialog(false)}
        />
        <Dialog.Button label={t("btn.save")} onPress={updateUserBio} />
      </Dialog.Container>

      {Platform.OS === "android" && (
        <Modal
          isVisible={imageOptionDialog}
          onBackdropPress={() => setImageOptionDialog(false)}
          onBackButtonPress={() => setImageOptionDialog(false)}
          style={styles.imageActionModal}
        >
          <View style={styles.imageActionCard}>
            <Text style={styles.imageActionTitle}>
              {t("others.Change-image")}
            </Text>
            <Pressable
              style={styles.imageActionButton}
              onPress={() => {
                setImageOptionDialog(false);
                openCamera();
              }}
            >
              <Text style={styles.imageActionText}>
                {t("moreOption.camera")}
              </Text>
            </Pressable>
            <Pressable
              style={styles.imageActionButton}
              onPress={() => {
                setImageOptionDialog(false);
                ImagePickers();
              }}
            >
              <Text style={styles.imageActionText}>
                {t("moreOption.gallery")}
              </Text>
            </Pressable>
            <Pressable
              style={styles.imageActionButton}
              onPress={() => {
                setImageOptionDialog(false);
                removeProfilePhoto();
              }}
            >
              <Text style={styles.imageActionText}>
                {t("remove-profile.remove")}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.imageActionButton, styles.imageActionCancel]}
              onPress={() => setImageOptionDialog(false)}
            >
              <Text
                style={[styles.imageActionText, styles.imageActionCancelText]}
              >
                {t("btn.cancel")}
              </Text>
            </Pressable>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );

  function onProfileImagePress() {
    if (Platform.OS === "android") {
      setImageOptionDialog(true);
      return;
    }

    Alert.alert(t("others.Change-image"), "", [
      {
        text: t("moreOption.camera"),
        onPress: () => {
          openCamera();
        },
      },
      {
        text: t("moreOption.gallery"),
        onPress: () => {
          ImagePickers();
        },
      },
      {
        text: t("remove-profile.remove"),
        onPress: () => {
          removeProfilePhoto();
        },
      },
      {
        text: t("btn.cancel"),
        style: "cancel",
      },
    ]);
  }

  async function ImagePickers() {
    ImagePicker.openPicker({
      width: 300,
      height: 300,
      cropping: true,
    })
      .then((ima) => {
        uploadPickedImage(ima);
      })
      .catch((error) => {
        setLocalProfileUri(null);
        console.log(error);
      });
  }

  async function openCamera() {
    const hasCameraPermission = await checkCameraPermission();
    if (!hasCameraPermission) {
      const granted = await askCameraPermission();
      if (!granted) {
        permissionAlert("Camera");
        return;
      }
    }

    ImagePicker.openCamera({
      width: 300,
      height: 300,
      cropping: true,
    })
      .then((ima) => {
        uploadPickedImage(ima);
      })
      .catch((error) => {
        setLocalProfileUri(null);
        console.log(error);
      });
  }

  function uploadPickedImage(ima: { path: string; mime: string }) {
    const ImageData = [ima];
    setLocalProfileUri(ima?.path ?? null);
    if (ImageData) {
      const image: any = {
        uri: ImageData[0].path,
        mime: ImageData[0].mime,
        name: currentTimeinUnix() + "." + ImageData[0].path.split(".").pop(),
      };
      const fileurl: any = generateRNFile(image);
      Fileupload({
        variables: {
          file: fileurl,
          thumbnail: null,
          input: {
            roomId: uuid.v4(),
            _id: MyProfile?._id,
          },
        },
      }).then((res) => {
        const fileres = res?.data?.UploadChatFile?.data;

        dispatch(
          setMyProfile({
            ...MyProfile,
            profile_img: res?.data?.UploadChatFile?.data?.filename,
          }),
        );
        setImageVersion(Date.now());

        setProfileImagePath((prev) => {
          return {
            ...prev,
            profile_img: res?.data?.UploadChatFile?.data?.filename,
          };
        });
        socketConnect.emit("setProfilePicture", {
          imageURl: fileres?.filename,
        });
        if (res?.data !== null) {
          ToastMessage(`${t("toastmessage.profile-photo-updated")}`);
        }
      });
    }
  }

  function removeProfilePhoto() {
    updateUser({
      variables: {
        input: {
          _id: MyProfile?._id,
          profile_img: ImageUrl,
          timezone: getTimeZone(),
        },
      },
    })
      .then((res) => {
        if (res.data?.updateUser) {
          dispatch(setMyProfile({ ...MyProfile, profile_img: ImageUrl }));
          setLocalProfileUri(null);
          setImageVersion(Date.now());
          setProfileImagePath((prev) => {
            return { ...prev, profile_img: ImageUrl };
          });
          socketConnect.emit("setProfilePicture", { imageURl: ImageUrl });
          ToastMessage(`${t("toastmessage.profile-photo-updated")}`);
        }
      })
      .catch((err) => {
        console.log("Error in removing profile photo", JSON.stringify(err));
      });
  }

  function updateUserName() {
    if (userName?.trim()?.length === 0) {
      ToastMessage(t("label.user-name-can-not-empty"));
      return;
    }
    setNameDialog(false);
    let spitedName = userName.split(" ");
    let payload = {
      _id: MyProfile?._id,
      firstName: spitedName[0] ?? "",
      lastName: userName.replace(spitedName[0] ?? "", "").trim(),
      timezone: getTimeZone(),
    };

    updateUser({
      variables: {
        input: payload,
      },
    })
      .then((res) => {
        dispatch(
          setMyProfile({
            ...MyProfile,
            firstName: res.data?.updateUser?.firstName,
            lastName: res.data?.updateUser?.lastName,
          }),
        );

        setProfileImagePath({
          ...MyProfile,
          firstName: res.data?.updateUser?.firstName,
          lastName: res.data?.updateUser?.lastName,
        });
        ToastMessage(t("label.profile-updated"));
      })
      .catch((err) => {
        console.log("Error in updating user", JSON.stringify(err));
      });
  }

  function updateUserBio() {
    if (userStatus?.trim().length === 0) {
      ToastMessage(t("label.user-bio-can-not-empty"));
      return;
    }
    setAboutDialog(false);
    let time = dayjs().unix();

    let payload = {
      _id: MyProfile?._id,
      bio: {
        status: userStatus,
        time: time,
      },
      timezone: getTimeZone(),
    };

    updateUser({
      variables: {
        input: payload,
      },
    })
      .then((res) => {
        dispatch(
          setMyProfile({
            ...MyProfile,
            bio: {
              status: userStatus,
              time: time,
            },
          }),
        );
        setProfileImagePath({
          ...MyProfile,
          bio: {
            status: userStatus,
            time: time,
          },
        });

        ToastMessage(t("label.profile-updated"));
      })
      .catch((err) => {
        console.log("Error in updating user", JSON.stringify(err));
      });
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    bottom: 20,
    flex: 1,
    justifyContent: "center",
  },
  userForm: {
    paddingHorizontal: 20,
    justifyContent: "space-between",
    flex: 1,
  },
  labelContainer: {
    backgroundColor: Colors.light.HighLighter,
    borderColor: Colors.light.formItemBorder,
    borderRadius: 10,
    borderWidth: 1,
    height: $size_md,
    justifyContent: "center",
    minHeight: $size_md,
    paddingHorizontal: $space_md,
    width: "100%",
  },
  button: {
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  inputIcon: {
    marginRight: 20,
  },
  inputLabel: {
    fontSize: 12,
    color: "gray",
    marginBottom: 2,
  },
  inputText: {
    fontSize: 16,
  },
  imageActionModal: {
    justifyContent: "center",
    marginHorizontal: 20,
  },
  imageActionCard: {
    backgroundColor: Colors.light.White,
    borderRadius: 12,
    paddingVertical: 8,
    overflow: "hidden",
  },
  imageActionTitle: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  imageActionButton: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  imageActionCancel: {
    marginTop: 6,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  imageActionText: {
    color: "#007AFF",
    fontSize: 17,
    fontWeight: "500",
  },
  imageActionCancelText: {
    fontWeight: "700",
  },
});

//make this component available to the app
