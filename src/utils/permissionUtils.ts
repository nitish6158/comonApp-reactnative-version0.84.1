import messaging from "@react-native-firebase/messaging";
import { Platform } from "react-native";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    await messaging().registerDeviceForRemoteMessages();
  }
}

export const requestCameraPermission = async () => {
  try {
    const permission = Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    });

    const result = await request(permission);

    if (result === RESULTS.GRANTED) {
      return "granted";
    } else if (result === RESULTS.DENIED) {
      return "denied";
    } else if (result === RESULTS.BLOCKED) {
      return "denied";
    }
  } catch (error) {
    console.warn("Error requesting camera permission", error);
    return false;
  }
};
