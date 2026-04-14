import { Alert, Linking, Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { PERMISSIONS, RESULTS, check, checkMultiple, openSettings, request, requestMultiple } from "react-native-permissions";

const androidVersion = Number(DeviceInfo.getSystemVersion().split(".")[0] || 0);
const permissions =
  androidVersion > 0 && androidVersion <= 12
    ? [PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]
    : [PERMISSIONS.ANDROID.READ_MEDIA_IMAGES, PERMISSIONS.ANDROID.READ_MEDIA_VIDEO];

const checkPermission = (result: any) =>
  androidVersion > 0 && androidVersion <= 12
    ? result["android.permission.READ_EXTERNAL_STORAGE"] == "granted" &&
      result["android.permission.WRITE_EXTERNAL_STORAGE"] == "granted"
    : result["android.permission.READ_MEDIA_IMAGES"] == "granted" &&
      result["android.permission.READ_MEDIA_VIDEO"] == "granted";

const isAndroid = Platform.OS === "android";
const isAllowed = (status?: string) => status === RESULTS.GRANTED || status === RESULTS.LIMITED;

export const checkMediaPermission = async () => {
  if (isAndroid) {
    const result = await checkMultiple(permissions);
    if (checkPermission(result)) {
      return true;
    } else {
      return false;
    }
  } else {
    const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
    return isAllowed(result);
  }
};

export const askMediaPermission = async () => {
  if (isAndroid) {
    const result = await requestMultiple(permissions);
    if (checkPermission(result)) {
      return true;
    } else {
      return false;
    }
  } else {
    const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    return isAllowed(result);
  }
};

export const checkCameraPermission = async () => {
  const permissionCheck = Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  });
  if (!permissionCheck) return;
  const result = await check(permissionCheck);
  if (isAllowed(result)) {
    return true;
  } else {
    return false;
  }
};

export const askCameraPermission = async () => {
  const permissionCheck = Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  });
  if (!permissionCheck) return;
  const result = await request(permissionCheck);
  if (isAllowed(result)) {
    return true;
  } else {
    return false;
  }
};

export const checkMicrophonePermission = async () => {
  const permissionCheck = Platform.select({
    ios: PERMISSIONS.IOS.MICROPHONE,
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
  });
  if (!permissionCheck) return;
  const res = await check(permissionCheck);
  if (isAllowed(res)) {
    return true;
  } else {
    const res = await request(permissionCheck);
    if (isAllowed(res)) {
      return true;
    }
    return false;
  }
};

export const getMicrophonePermission = async () => {
  const permissionCheck = Platform.select({
    ios: PERMISSIONS.IOS.MICROPHONE,
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
  });
  if (!permissionCheck) return;
  const res = await request(permissionCheck);
  if (isAllowed(res)) {
    return true;
  }
  return false;
};

export function permissionAlert(permissionName: "Camera" | "Microphone", func?: Function) {
  Alert.alert(
    "Permission alert",
    `Without ${permissionName} permission you cannot place the call or use attachment in chat room . Give access to ${permissionName} permission`,
    [
      {
        text: "Cancel",
        onPress: () => (func ? func() : {}),
        style: "cancel",
      },
      {
        text: "OK",
        onPress: async () => {
          if (func) {
            await func();
          }
          openSettings().catch(() => {
            Linking.openSettings();
          });
        },
      },
    ]
  );
}

export async function checkCallPermissions(typeofCall: "audio" | "video") {
  const audioPermissionCheck = Platform.select({
    ios: PERMISSIONS.IOS.MICROPHONE,
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
  });
  const cameraPermissionCheck = Platform.select({
    ios: PERMISSIONS.IOS.CAMERA,
    android: PERMISSIONS.ANDROID.CAMERA,
  });
  if (!audioPermissionCheck) return;
  if (typeofCall === "audio") {
    const res = await check(audioPermissionCheck);
    if (res === "blocked" || res === "denied") {
      return permissionAlert("Microphone");
    } else {
      return true;
    }
  } else {
    if (!cameraPermissionCheck) return;
    const res = await check(audioPermissionCheck);
    if (res === "blocked" || res === "denied") {
      return permissionAlert("Microphone");
    } else {
      const cam = await check(cameraPermissionCheck);
      if (cam === "blocked" || cam === "denied") {
        return permissionAlert("Camera");
      } else {
        return true;
      }
    }
  }
}
