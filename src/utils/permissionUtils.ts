import messaging from "@react-native-firebase/messaging";
import { askCameraPermission } from "@/utils/permission";

/** Push notification permission (FCM) — keep here; camera lives in utils/permission */
export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    await messaging().registerDeviceForRemoteMessages();
  }
}

/**
 * Legacy wrapper — prefer `askCameraPermission` from `@/utils/permission`.
 * Returns "granted" | "denied" for older call sites (e.g. GlobalCallContainer).
 */
export const requestCameraPermission = async () => {
  try {
    const granted = await askCameraPermission();
    return granted ? "granted" : "denied";
  } catch (error) {
    console.warn("Error requesting camera permission", error);
    return "denied";
  }
};
