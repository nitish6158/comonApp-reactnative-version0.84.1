// Polyfill for Array.findLastIndex (Fix Android Back crash)
if (!Array.prototype.findLastIndex) {
  Array.prototype.findLastIndex = function (callback, thisArg) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (callback.call(thisArg, this[i], i, this)) {
        return i;
      }
    }
    return -1;
  };
}
/**
 * @format
 */
import "react-native-get-random-values";
import { registerGlobals } from "@livekit/react-native";
registerGlobals();

import "react-native/Libraries/Renderer/shims/ReactNative";

if (__DEV__) {
  require("./ReactotronConfig");
}

import messaging from "@react-native-firebase/messaging";
import { getApps, initializeApp } from "@react-native-firebase/app";
import { atom, useAtom, useSetAtom } from "jotai";

const firebaseConfig = {
  apiKey: "AIzaSyAklcd4K7w-IDAOvtbj54lkmWINrfAqwHU",
  appId: "1:825164035184:android:814f0e66c330c6b04b30b5",
  messagingSenderId: "825164035184",
  projectId: "meetus-c10a1",
  storageBucket: "meetus-c10a1.firebasestorage.app",
  databaseURL: "",
};

function ensureFirebaseApp() {
  if (getApps().length > 0) {
    return;
  }

  Promise.resolve(initializeApp(firebaseConfig)).catch((error) => {
    // If native startup created it while JS was loading, ignore the duplicate init race.
    const message = error?.message || "";
    if (!message.includes("already exists")) {
      console.error("Firebase initialization failed", error);
    }
  });
}

import {
  onMessageReceived,
  setCategoriesIOS,
  setChannelGroups,
  invokeVoipCall,
  detectDeviceId,
  DisplayMissedCall,
} from "./src/notification/NotificationDispaly";
import App from "./App";
import { name as appName } from "./app.json";
import notifee, { EventType } from "@notifee/react-native";
import {
  updateChat,
  markChatRead,
  changeCallStatus,
  leftCallRequest,
  RequestCallWaiting,
  changeEventParticipantStatus,
  dismissNotification,
  ChangeScheduleMessageStatus,
} from "./src/notification/BackgroundCalls";
import { AppRegistry, Platform, Text, TextInput } from "react-native";
import {
  getDataFromAsync,
  removeDataFromAsync,
  setDataInAsync,
} from "./src/utils/asyncstorage.utils";
import { asyncStorageKeys } from "./src/Constants/asyncStorageKeys";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { stopAllPlayers } from "./src/utils/player.utils";
import RNVoipCall from "react-native-voips-calls";
import dayjs from "dayjs";
import { storage } from "@/redux/backup/mmkv";
import { keys } from "@/redux/backup/keys";

ensureFirebaseApp();

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("remoteMessage", JSON.stringify(remoteMessage, null, 2));
  const { data, type } = remoteMessage.data;

  const invokeVoipCallData = typeof data === "string" ? JSON.parse(data) : data;

  switch (type) {
    case "CALL":
      if (Platform.OS == "android") {
        console.log(
          "BACKGROUND CALL RECEIVED ANDROID",
          JSON.stringify(invokeVoipCallData, null, 2)
        );
        await AndroidBackgroundCallHandler(invokeVoipCallData);
      }
      break;
    case "ON_ACCEPT":
      console.log("ON_ACCEPT", invokeVoipCallData);
      if (invokeVoipCallData?.data?.notificationId) {
        await rejectAndroidCall(invokeVoipCallData);
      }
      break;
    default:
      await onMessageReceived(remoteMessage);
      break;
  }
});

void Promise.resolve(setChannelGroups()).catch(() => {});
void Promise.resolve(setCategoriesIOS()).catch(() => {});
void Promise.resolve(detectDeviceId()).catch(() => {});

notifee.registerForegroundService(() => {
  return new Promise(() => {
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      if (
        type === EventType.ACTION_PRESS &&
        detail?.pressAction?.id === "reject"
      ) {
        await leftCallRequest();
        await notifee.stopForegroundService();
        await notifee.cancelNotification(detail.notification?.id);
        await AsyncStorage.setItem(
          "backgroundCallReject",
          JSON.stringify(detail.notification.data)
        );
        await AsyncStorage.removeItem("activeCallData");
        global.engine.leaveChannel();
      }
    });
  });
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification } = detail;
  if (type === EventType.ACTION_PRESS) {
    if (detail.pressAction.id === "reply") {
      await updateChat(detail.notification.data, detail.input);
      await notifee.cancelNotification("CHAT");
    } else if (detail.pressAction.id === "mark-as-read") {
      await markChatRead(detail.notification.data);
      await notifee.cancelNotification("CHAT");
    } else if (detail.pressAction.id === "decline") {
      await changeCallStatus(detail.notification.data);
      await notifee.cancelNotification(detail?.notification?.id);
    } else if (detail.pressAction.id === "event-accept") {
      await changeEventParticipantStatus(notification.data._id, "ACCEPT");
      await notifee.cancelNotification(notification.id);
    } else if (detail.pressAction.id === "event-reject") {
      await changeEventParticipantStatus(notification.data._id, "REJECT");
      await notifee.cancelNotification(notification.id);
    } else if (detail.pressAction.id === "approve-message") {
      await ChangeScheduleMessageStatus(detail.notification.data._id, "ACCEPT");
      await notifee.cancelNotification(notification.id);
    } else if (detail.pressAction.id === "reject-message") {
      await ChangeScheduleMessageStatus(detail.notification.data._id, "REJECT");
      await notifee.cancelNotification(notification.id);
    } else if (detail.pressAction.id === "dismiss") {
      let contact = JSON.parse(detail.notification?.data.data);
      if (contact.length > 0) {
        await dismissNotification(true, contact[0]._id);
      }
      await notifee.cancelNotification(detail.notification?.id);
    } else if (detail.pressAction.id === "try-now") {
      setAndroidBackgroundPressEvents(detail);
    }
  } else if (type === EventType.PRESS) {
    setAndroidBackgroundPressEvents(detail);
  }
});

function setAndroidBackgroundPressEvents(data) {
  global.androidBackgroundNotificationPress = data;
}

async function rejectAndroidCall(data) {
  if (data?.data?.notificationId) {
    RNVoipCall.endAllCalls();
    RNVoipCall.stopRingtune();
    await removeDataFromAsync(asyncStorageKeys.backgroundHandler);
  }
}

async function AndroidBackgroundCallHandler(callData) {
  console.log("AndroidBackgroundCallHandler callData", JSON.stringify(callData, null, 2));
  switch (callData.notificationType) {
    case "CALL":
      const alreadyCallData = await getDataFromAsync("activeCallData");

      if (alreadyCallData == null) {
        await setDataInAsync(asyncStorageKeys.backgroundHandler, {
          ...callData,
          expiry: new Date().toISOString(),
          fromForeground: false,
        });
        await stopAllPlayers();
        await invokeVoipCall(callData);
      } else {
        await RequestCallWaiting(callData?.data?.callId);
      }
      break;
    case "END_CALL":
      const data = await getDataFromAsync(asyncStorageKeys.backgroundHandler);
      RNVoipCall.endAllCalls();
      RNVoipCall.stopRingtune();

      if (data && Object.keys(data).length) {
        await AsyncStorage.setItem("endCallQueue", data.data.callId);
        console.log("callStatus1");
        if (!data.callAccepted && data.fromForeground === false) {
          console.log("📵 SHOW MISSED CALL UI");

          await DisplayMissedCall({
            callId: data.data.callId,
            callType: data.data.type,
            roomType: data.data.roomType,
            roomId: data.data.roomId,
            callBackground: data.data.callBackground,
            roomName: data.notification?.title,
            participants: data.data.callParticipants,
            isReceiver: true,
          });
        }
        if (data.data.callId == callData?.data?.callId) {
          await AsyncStorage.removeItem(asyncStorageKeys.backgroundHandler);
        }
      }
      break;
    default:
      break;
  }
}

AppRegistry.registerComponent(appName, () => App);
