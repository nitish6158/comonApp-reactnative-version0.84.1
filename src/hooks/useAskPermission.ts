import PermissionHandler from "@/Components/PermissionHandler";
import {
  askCameraPermission,
  askMediaPermission,
  checkCameraPermission,
  checkMediaPermission,
  checkMicrophonePermission,
} from "@/utils/permission";
import { TFunction } from "i18next";
import { PermissionsAndroid, Platform } from "react-native";
import Contacts from "react-native-contacts";

async function requestContactPermission() {
  let permissionRes = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
  ]);
}

async function handleAllPermissions(t: any) {
  const mediaPermission = await checkMediaPermission();
  if (!mediaPermission) {
    async function handlePressAgree(type: "contact" | "media") {
      if (type === "media") {
        await askMediaPermission();
        const cameraPermission = await checkCameraPermission();
        if (!cameraPermission) await askCameraPermission();
        const microphonePermission = await checkMicrophonePermission();
        console.log("Microphone permission", microphonePermission);
      }
    }
    return PermissionHandler({ type: "media", handlePressAgree, t });
  } else {
    const cameraPermission = await checkCameraPermission();
    if (!cameraPermission) await askCameraPermission();
    const microphonePermission = await checkMicrophonePermission();
    console.log("Microphone permission", microphonePermission);
  }
}

export async function AskPermissions(t: TFunction<"translation", undefined>) {
  if (Platform.OS === "android") {
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_CONTACTS)
      .then(async (response) => {
        if (!response) {
          async function handlePressAgree(type: "contact" | "media") {
            const contacts = await requestContactPermission();
            await handleAllPermissions(t);
          }
          const permissionType = PermissionHandler({ type: "contact", handlePressAgree, t });
          return permissionType;
        } else {
          await handleAllPermissions(t);
        }
      })
      .catch((Err) => {
        console.log("Error in checking contact permission", Err);
      });
  } else {
    const permissionStatus = await Contacts.requestPermission();
    const cameraPermission = await checkCameraPermission();
    if (!cameraPermission) await askCameraPermission();
    const microphonePermission = await checkMicrophonePermission();
  }
}
