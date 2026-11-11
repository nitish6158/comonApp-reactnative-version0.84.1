import {
  getMessaging,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  registerDeviceForRemoteMessages,
} from "@react-native-firebase/messaging";
import { Platform } from "react-native";

export async function ensureRemoteMessagesRegistered() {
  if (Platform.OS !== "ios") {
    return;
  }

  const messaging = getMessaging();

  if (!isDeviceRegisteredForRemoteMessages(messaging)) {
    await registerDeviceForRemoteMessages(messaging);
  }
}

export async function getFirebaseMessagingToken() {
  const messaging = getMessaging();
  await ensureRemoteMessagesRegistered();
  try {
    return await getToken(messaging);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    const message = (error as { message?: string })?.message;
    console.warn("FCM token request failed", code || "", message || error);
    throw error;
  }
}
