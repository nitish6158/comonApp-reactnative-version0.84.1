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
  return getToken(messaging);
}
