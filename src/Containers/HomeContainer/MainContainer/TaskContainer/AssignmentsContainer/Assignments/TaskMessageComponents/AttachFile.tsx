import { Alert, Platform, Pressable, StyleSheet, View, Text, Image, Dimensions, Linking } from "react-native";
import { AttachmentType, Task } from "@Service/generated/assigment.generated";
import { Edge, MediaType } from "@Service/generated/types";
import React, { useEffect, useState } from "react";
import {
  askCameraPermission,
  askMediaPermission,
  checkCameraPermission,
  checkMediaPermission,
  checkMicrophonePermission,
} from "@Util/permission";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";

import DocumentPicker from "react-native-document-picker";
import { TaskOptionButton } from "./TaskOptionButton";
import { TaskDocumentPickerTypes } from "@Types/types";

import { onAddTaskResultType } from "@Hooks/useTaskReport";
import { openSettings } from "react-native-permissions";
import { useTranslation } from "react-i18next";
import { Colors } from "@/Constants";
import UploadMediaPreview from "@Components/MediaPreview/UploadMediaPreview";
import FileNameView from "@/Components/FileNameView";
import { TaskDefaultLoadingButton } from "@Components/TaskDefaultLoadingButton";
import { Button } from "react-native-elements";
import DigitalSignature from "@/Components/DigitalSignature";

function AttachFile({
  task,
  edge,
  onAddTaskResult,
  addTaskLoading,
  mediaRequiredOnOptions,
  isSignatureDone,
}: {
  task: Task;
  addTaskLoading: boolean;
  edge: Edge;
  onAddTaskResult: onAddTaskResultType;
  mediaRequiredOnOptions?: boolean;
  isSignatureDone: string;
}) {
  const { t } = useTranslation();
  const [file, setFile] = useState<TaskDocumentPickerTypes>();
  const [modal, setModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [signature, setSignature] = useState("");

  const mediaType = task.mediaType === MediaType.Photo ? "photo" : "video";

  // console.log("Media type check", task.mediaType);

  useEffect(() => {
    if (mediaRequiredOnOptions) {
      onAddTaskResult(edge, task, undefined, file);
    }
  }, [file]);

  useEffect(() => {
    setFile(undefined);
  }, [edge._id]);

  const PermissionAlert = () => {
    Alert.alert(`${t("toastmessage.permission-alert")}`, `${t("toastmessage.permission-alert-message")}`, [
      {
        text: `${t("btn.cancel")}`,
        onPress: () => {}, //console.log("Cancel Pressed"),
        style: "cancel",
      },
      {
        text: `${t("btn.ok")}`,
        onPress: () => {
          openSettings().catch(() => {
            Linking.openSettings();
          });
        },
      },
    ]);
  };

  const pickImage = async () => {
    if (task.mediaType == AttachmentType.Audio) {
      const AudioData = await DocumentPicker.pickSingle({
        copyTo: "cachesDirectory",
        type: DocumentPicker.types.audio,
      });
      if (AudioData) {
        setFile({ ...AudioData, uri: AudioData.fileCopyUri, fileName: AudioData.name });
      }

      return;
    } else if (task.mediaType == AttachmentType.Document) {
      const DocumentData = await DocumentPicker.pickSingle({
        copyTo: "cachesDirectory",
        type: [
          DocumentPicker.types.csv,
          DocumentPicker.types.doc,
          DocumentPicker.types.xls,
          DocumentPicker.types.docx,
          DocumentPicker.types.pdf,
        ],
      });
      if (DocumentData) {
        setFile({ ...DocumentData, uri: DocumentData.fileCopyUri, fileName: DocumentData.name });
      }
      return;
    }
    let result;
    const permission = await checkMediaPermission();
    if (permission) {
      result = await launchImageLibrary({
        mediaType: mediaType,
        presentationStyle: "popover",
        selectionLimit: 1,
      });
    } else {
      const askGallery = await askMediaPermission();
      if (askGallery) {
        result = await launchImageLibrary({
          mediaType: mediaType,
          presentationStyle: "popover",
          selectionLimit: 1,
        });
      } else {
        PermissionAlert();
      }
    }
    if (result?.assets?.length) {
      setFile(result);
    }
    setModal(false);
  };

  async function mediaPermissionCheck() {
    const permission = await checkMediaPermission();
    if (!permission) {
      const askGallery = await askMediaPermission();
      if (!askGallery) {
        PermissionAlert();
        return false;
      }
      return true;
    }
    return true;
  }

  async function cameraPermissionCheck() {
    const permission = await checkCameraPermission();
    if (!permission) {
      const askCamera = await askCameraPermission();
      if (!askCamera) {
        PermissionAlert();
        return false;
      }
      return true;
    }
    return true;
  }

  const onOpenCamera = async () => {
    const hasMediaPermission = await mediaPermissionCheck();
    if (!hasMediaPermission) return;

    const hasCameraPermission = await cameraPermissionCheck();
    if (!hasCameraPermission) return;

    const hasMicrophonePermission = await checkMicrophonePermission();
    if (!hasMicrophonePermission) return;

    const result = await launchCamera({
      mediaType: mediaType,
      quality: 1,
      videoQuality: "high",
      durationLimit: 1200,
      cameraType: "back",
      formatAsMp4: Platform.OS == "ios" ? true : false,
    });

    if (result.assets?.length) {
      setFile(result);
    }
    setModal(false);
  };

  const checkType =
    task.mediaType == AttachmentType.Audio || task.mediaType == AttachmentType.Document
      ? file?.uri
      : file?.assets?.[0]?.uri;
  const fileType =
    task.mediaType == AttachmentType.Audio || task.mediaType == AttachmentType.Document
      ? file?.type
      : file?.assets?.[0]?.type;

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ marginTop: 5 }}>Select {task.mediaType} Attachment</Text>
      {(checkType && fileType?.includes("image")) || fileType?.includes("video") ? (
        <UploadMediaPreview imageUri={checkType} />
      ) : file ? (
        FileNameView(file)
      ) : (
        <></>
      )}

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 15, marginBottom: 10 }}>
        {task.mediaType == AttachmentType.Audio || task.mediaType == AttachmentType.Document ? (
          <Pressable onPress={pickImage} style={styles.button}>
            <Text style={{ color: "white" }}>{t("btn.attach-file")}</Text>
          </Pressable>
        ) : (
          <View style={{ justifyContent: "space-between", flexDirection: "row", alignItems: "center" }}>
            <Pressable onPress={onOpenCamera} style={styles.button}>
              <Text style={{ color: "white" }}>{t("Camera")}</Text>
            </Pressable>
            <Pressable onPress={pickImage} style={[styles.button, { marginLeft: 5 }]}>
              <Text style={{ color: "white" }}>{t("Gallery")}</Text>
            </Pressable>
          </View>
        )}
      </View>

      <DigitalSignature
        onPressSave={(image) => {
          setSignature(image);
          setModalVisible(!modalVisible);
        }}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />

      {signature ? (
        <View style={{ alignItems: "center" }}>
          <Image
            resizeMode={"contain"}
            style={{
              width: Dimensions.get("screen").width - 100,
              height: 110,
              backgroundColor: "#eee",
              marginTop: 10,
              borderRadius: 20,
              marginBottom: 20,
            }}
            source={{ uri: "data:image/png;base64," + signature }}
          />
        </View>
      ) : null}
      {!mediaRequiredOnOptions &&
        (!addTaskLoading ? (
          checkType && (
            <Button
              disabled={file ? false : true}
              buttonStyle={{ height: 45, borderRadius: 30, width: 280, alignSelf: "center" }}
              loading={false}
              title={t("btn.submit")}
              onPress={() => {
                let isSignatureDoneFromParent = isSignatureDone && isSignatureDone.length > 0;
                if (edge?.signature && !signature && !isSignatureDoneFromParent) {
                  setModalVisible(!modalVisible);
                  return;
                }
                onAddTaskResult(
                  edge,
                  task,
                  undefined,
                  file,
                  edge.location,
                  isSignatureDoneFromParent ? isSignatureDone : signature
                );
                setSignature("");
                setFile({});
              }}
              containerStyle={[]}
            />
          )
        ) : (
          <TaskDefaultLoadingButton />
        ))}
    </View>
  );
}

export default AttachFile;

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 25,
    height: 40,
    justifyContent: "center",
    width: 100,
  },
});
