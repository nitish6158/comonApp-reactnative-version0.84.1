import { CallNotification, CallNotificationData } from "./Interfaces/Call";
import { Chat, MessageData } from "./Interfaces/Chat";
import {
  getDataFromAsync,
  removeDataFromAsync,
} from "@Util/asyncstorage.utils";
import notifee, {
  AndroidImportance,
  AndroidStyle,
  IOSNotificationAttachment,
} from "@notifee/react-native";

import Colors from "@/Constants/Colors";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import DeviceInfo from "react-native-device-info";
import { Platform } from "react-native";
import RNVoipCall from "react-native-voips-calls";
import type { androidStyle } from "./Interfaces/DispalyType";
import { asyncStorageKeys } from "@/Constants/asyncStorageKeys";
import {
  chatDelivered,
  getNotificationPayload,
  notificationLog,
} from "./BackgroundCalls";
import { formateBody } from "./BodyFormater";

export type Message = MessageData | CallNotificationData;

let deviceID = "";

export async function onMessageReceived(message: Message) {
  console.log("message---------->", message);
  const { data, type } = message.data;
  const dataObject: CallNotification | Chat =
    typeof data === "string" ? JSON.parse(data) : data;

  console.log("onMessageReceived dataObject--------->", dataObject);

  notificationLog(type);

  if (type == "CHAT") {
    const dataQ = dataObject as Chat;
    chatDelivered({ ...dataQ, TYPE: type });
    let attachments: IOSNotificationAttachment[] = [];
    let androidStyle: androidStyle = {} as androidStyle;
    // console.log("dataQ", dataQ);
    const isCustomRoom = await notifee.getChannel(dataQ.myMessage.roomId);
    // console.log(`global.roomId:- ${global.roomId}`);
    if (global.roomId != dataQ.myMessage.roomId) {
      let extraConfig = {
        body: formateBody(dataQ.notification.body),
      };
      let androidConfig = {};

      switch (dataQ.myMessage.type) {
        case "taskAssigned":
        case "text":
          if (dataQ.notification.body.length > 47) {
            androidStyle = {
              type: AndroidStyle.BIGTEXT,
              text: formateBody(dataQ.notification.body),
            };
          }
          break;
        case "IMAGE":
          attachments = [
            {
              url: DefaultImageUrl + dataQ.myMessage.fileURL,
            },
          ];
          androidStyle = {
            type: AndroidStyle.BIGPICTURE,
            picture: DefaultImageUrl + dataQ.myMessage.fileURL,
          };
          extraConfig = {
            ...extraConfig,
            body: `📷 ${formateBody(dataQ.notification.body)}`,
          };
          break;
        case "VIDEO":
          attachments = [
            {
              url: DefaultImageUrl + dataQ.myMessage.fileURL,
            },
          ];
          const videoFilePath = dataQ.myMessage.fileURL.split("/");
          extraConfig = {
            ...extraConfig,
            body: `🎥 ${videoFilePath[videoFilePath.length - 1]}`,
          };
          break;
        case "AUDIO":
          const audioFilePath = dataQ.myMessage.fileURL.split("/");
          extraConfig = {
            ...extraConfig,
            body: `🎤 ${audioFilePath[audioFilePath.length - 1]}`,
          };
          break;
        case "contact":
          type contact = {
            firstName: string;
            lastName: string;
            phone: string;
          };
          //FIXME:- dataQ.myMessage.message will be array so get 1st element and show names
          const contact = JSON.parse(dataQ.myMessage.message) as contact;

          extraConfig = {
            ...extraConfig,
            body: `📱 ${
              contact.firstName.length > 0
                ? contact.firstName + " " + contact.lastName
                : contact.phone
            }`,
          };
          break;
        case "link":
          extraConfig = {
            ...extraConfig,
            body: `${dataQ.notification.body}`,
          };
          break;
        case "Link":
          extraConfig = {
            ...extraConfig,
            body: `${dataQ.notification.body}`,
          };
          break;
        case "invited":
          const parsedMsg =
            typeof dataQ?.myMessage?.message == "string"
              ? JSON.parse(dataQ?.myMessage?.message)
              : dataQ?.myMessage?.message;
          extraConfig = {
            ...extraConfig,
            body: parsedMsg?.msg ? parsedMsg?.msg : dataQ?.notification?.body,
          };
          break;
        case "declined":
          const declinedParsedMsg =
            typeof dataQ?.myMessage?.message == "string"
              ? JSON.parse(dataQ?.myMessage?.message)
              : dataQ?.myMessage?.message;
          extraConfig = {
            ...extraConfig,
            body: declinedParsedMsg?.msg
              ? declinedParsedMsg?.msg
              : dataQ?.notification?.body,
          };
          break;
        case "poll":
          extraConfig = {
            ...extraConfig,
            body: `New Poll is created`,
          };
          break;
        default:
          const docFilePath = dataQ.myMessage.fileURL.split("/");
          extraConfig = {
            ...extraConfig,
            body: `📄 ${docFilePath[docFilePath.length - 1]}`,
          };
          break;
      }

      if (dataQ.subtitle.length > 0) {
        extraConfig = {
          ...extraConfig,
          subtitle: dataQ.subtitle,
        };
      }

      if (Object.keys(androidStyle).length > 0) {
        androidConfig = {
          style: androidStyle,
        };
      }
      // console.log('CHECKING BEFORE FIRING NOTIFICATION =====>>>>>')
      try {
        await notifee.displayNotification({
          ...extraConfig,
          id: `CHAT_${dataQ.myMessage.roomId}`,
          title: dataQ.notification.title,
          data: { ...dataObject, TYPE: "CHAT" },
          ios: {
            categoryId: "message",
            attachments: attachments,
            sound: dataQ.sound,
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
          android: {
            smallIcon: "ic_small_icon",
            color: Colors.light.PrimaryColor,
            channelId: isCustomRoom != null ? isCustomRoom.id : "chat",
            largeIcon: DefaultImageUrl + dataQ.profile_img,
            ...androidConfig,
            groupId: dataQ.myMessage.roomId,
            timestamp: Date.now(), // 5 minutes ago
            showTimestamp: true,
            circularLargeIcon: true,
            actions: [
              {
                title: "Reply",
                icon: DefaultImageUrl + dataQ.profile_img,
                pressAction: {
                  id: "reply",
                },
                input: true, // enable free text input
              },
              {
                title: "Mark as read",
                // icon: 'https://my-cdn.com/icons/open-chat.png',
                pressAction: {
                  id: "mark-as-read",
                  // launchActivity: 'default',
                },
              },
            ],
            pressAction: {
              id: "message",
              launchActivity: "default",
            },
          },
        });
        // console.log("NOTIFICATION SENT SUCCESSFULLY")
      } catch (err) {
        console.log("ERROR SENDING NOTIFICATION", err);
      }
    }
  } else {
    let res = await getNotificationPayload(dataObject.data.notificationId);
    let result = JSON.parse(res.payload);

    //TASK Notifications not have result.data
    let resultData =
      typeof result.data == "string" ? JSON.parse(result.data) : result;

    switch (type) {
      case "CONTACT_REMINDER":
        let { isDismiss, _id, ...restData } = resultData[0];
        console.log("online", restData);
        notifee.displayNotification({
          id: _id,
          title: dataObject.notification.title,
          body: dataObject.notification.body,
          data: { ...restData },
          ios: {
            sound: "default",
            categoryId: "contact_reminder",
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
          android: {
            channelId: "contact_reminder",
            smallIcon: "ic_small_icon",
            color: Colors.light.PrimaryColor,
            timestamp: Date.now(),
            showTimestamp: true,
            actions: [
              {
                title: "try now",
                pressAction: {
                  id: "try-now",
                  launchActivity: "default",
                },
              },
              {
                title: "dismiss",
                pressAction: {
                  id: "dismiss",
                },
              },
            ],
            pressAction: {
              id: "contact_reminder",
              launchActivity: "default",
            },
          },
        });
        break;

      case "TASK_SUBMIT":
        const taskData = dataObject;
        const { attachment, ...main } = resultData;
        const x = { ...main, TYPE: "TASK_SUBMIT" };
        notifee.displayNotification({
          title: taskData?.notification?.title,
          body: taskData?.notification?.body,
          data: x,
          ios: {
            sound: "default",
            categoryId: "taskNotification",
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
          android: {
            smallIcon: "ic_small_icon",
            color: Colors.light.PrimaryColor,
            channelId: "assignment",
            timestamp: Date.now(), // 5 minutes ago
            showTimestamp: true,
            pressAction: {
              id: "taskNotification",
              launchActivity: "default",
            },
          },
        });
        break;
      case "TASK_COMPLETE":
        notifee.displayNotification({
          title: dataObject?.notification?.title,
          body: dataObject?.notification?.body,
          data: { ...resultData, TYPE: "TASK_COMPLETE" },
          ios: {
            sound: "default",
            categoryId: "taskNotification",
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
          android: {
            smallIcon: "ic_small_icon",
            color: Colors.light.PrimaryColor,
            channelId: "assignment",
            timestamp: Date.now(), // 5 minutes ago
            showTimestamp: true,
            pressAction: {
              id: "taskNotification",
              launchActivity: "default",
            },
          },
        });
        break;

      case "TASK_REMINDER":
        const taskR = dataObject;
        notifee.displayNotification({
          title: taskR.notification.title,
          body: taskR.notification.body,
          data: { ...resultData, TYPE: "TASK" },
          ios: {
            sound: "default",
            categoryId: "taskNotification",
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
          android: {
            smallIcon: "ic_small_icon",
            color: Colors.light.PrimaryColor,
            channelId: "assignment",
            timestamp: Date.now(), // 5 minutes ago
            showTimestamp: true,
            pressAction: {
              id: "task_reminder",
              launchActivity: "default",
            },
          },
        });
        break;
      case "REMINDER":
        const taskRM = dataObject;
        notifee.displayNotification({
          title: taskRM.notification.title,
          body: taskRM.notification.body,
          data: { ...resultData, TYPE: "TASK" },
          ios: {
            sound: "default",
            categoryId: "taskNotification",
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
          android: {
            smallIcon: "ic_small_icon",
            color: Colors.light.PrimaryColor,
            channelId: "assignment",
            timestamp: Date.now(), // 5 minutes ago
            showTimestamp: true,
            pressAction: {
              id: "taskNotification",
              launchActivity: "default",
            },
          },
        });
        break;
      case "EVENT_NOTIFICATION_REMINDER":
      case "EVENT_MAIN_CALLREMINDER":
      case "EVENT_BEFORE_REMINDER":
      case "EVENT_MAIN_REMINDER":
        let androidConfig = {};

        if (dataObject?.notification.body.length > 47) {
          androidConfig = {
            style: {
              type: AndroidStyle.BIGTEXT,
              text: dataObject?.notification.body,
            },
          };
        }

        notifee.displayNotification({
          title: dataObject?.notification.title,
          body: dataObject?.notification.body,
          data: { data: resultData, TYPE: type, _id: result.reminderID },
          ios: {
            sound: "default",
            categoryId: "event_main_reminder",
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
          android: {
            smallIcon: "ic_small_icon",
            color: Colors.light.PrimaryColor,
            channelId: "event",
            timestamp: Date.now(), // 5 minutes ago
            showTimestamp: true,
            circularLargeIcon: true,
            ...androidConfig,
            pressAction: {
              id: "event_main_reminder",
              launchActivity: "default",
            },
            // pressAction: {
            //   id: "message",
            //   launchActivity: "default",
            // },
          },
        });
        break;

      case "EVENT_INVITATION_REMINDER":
        let bodyConfig = {};

        if (dataObject?.notification.body.length > 47) {
          bodyConfig = {
            style: {
              type: AndroidStyle.BIGTEXT,
              text: dataObject?.notification.body,
            },
          };
        }

        notifee.displayNotification({
          title: dataObject?.notification.title,
          body: dataObject?.notification.body,
          data: { data: resultData, TYPE: type, _id: result.reminderID },
          ios: {
            sound: "default",
            categoryId: "event_invitation_reminder",
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
          android: {
            smallIcon: "ic_small_icon",
            color: Colors.light.PrimaryColor,
            channelId: "event",
            timestamp: Date.now(), // 5 minutes ago
            showTimestamp: true,
            circularLargeIcon: true,
            ...bodyConfig,
            pressAction: {
              id: "event_invitation_reminder",
              launchActivity: "default",
            },
            actions: [
              {
                title: "Approve",
                // icon: DefaultImageUrl + dataQ.profile_img,
                pressAction: {
                  id: "event-accept",
                },
              },
              {
                title: "Reject",
                // icon: 'https://my-cdn.com/icons/open-chat.png',
                pressAction: {
                  id: "event-reject",
                  // launchActivity: 'default',
                },
              },
            ],
            // pressAction: {
            //   id: "message",
            //   launchActivity: "default",
            // },
          },
        });
        break;
      case "SCHEDULE_BEFORE_REMINDER":
        let scheduleConfig = {};

        if (dataObject?.notification.body.length > 47) {
          scheduleConfig = {
            style: {
              type: AndroidStyle.BIGTEXT,
              text: dataObject?.notification.body,
            },
          };
        }

        notifee.displayNotification({
          title: dataObject?.notification.title,
          body: dataObject?.notification.body,
          data: { data: resultData, TYPE: type, _id: result.reminderID },
          ios: {
            sound: "default",
            categoryId: "schedule_before_reminder",
            foregroundPresentationOptions: {
              badge: true,
              sound: true,
              banner: true,
              list: true,
            },
          },
          android: {
            smallIcon: "ic_small_icon",
            color: Colors.light.PrimaryColor,
            channelId: "event",
            timestamp: Date.now(), // 5 minutes ago
            showTimestamp: true,
            ...scheduleConfig,
            circularLargeIcon: true,
            pressAction: {
              id: "schedule_before_reminder",
              launchActivity: "default",
            },
            actions: [
              {
                title: "Approve",
                // icon: DefaultImageUrl + dataQ.profile_img,
                pressAction: {
                  id: "approve-message",
                },
              },
              {
                title: "Reject",
                // icon: 'https://my-cdn.com/icons/open-chat.png',
                pressAction: {
                  id: "reject-message",
                  // launchActivity: 'default',
                },
              },
            ],
            // pressAction: {
            //   id: "message",
            //   launchActivity: "default",
            // },
          },
        });
        break;
      default:
        return;
    }
  }
}

export function invokeVoipCall(data: any) {
  if (Platform.OS === "android") {
    displayVoipCall(data);
  }
}

function displayVoipCall(data: CallNotification) {
  const ringtone = data?.data?.ringtone ? data?.data?.ringtone : "";
  const payload = {
    callerId: "825f4094-a674-4765-96a7-1ac512c02a71", // Important uuid must in this format
    ios: {
      phoneNumber: "",
      name: data?.notification?.title,
      hasVideo: data?.data?.type === "audio" ? false : true,
    },
    android: {
      ringtuneSound: true,
      ringtune: ringtone == "default" ? "" : ringtone,
      duration: 59000, // defualt 30000
      vibration: false, // defualt is true
      channel_name: data?.data?.channelName, //
      notificationId: Number(data?.data?.channelName),
      notificationTitle: data?.notification?.body,
      notificationBody: data?.notification?.title,
      answerActionTitle: "Answer",
      declineActionTitle: "Decline",
    },
  };
  console.log("PAyload is", payload);
  if (deviceID === data.device.token && data.data.roomType === "individual") {
    displayCall(payload);
    return;
  }
  displayCall(payload);
}

function displayCall(payload: any) {
  RNVoipCall.displayIncomingCall(payload)
    .then((response: any) => {
      console.log("Voip call success response", response);
    })
    .catch((err: any) => {
      console.log("Error in displaying incoming voip call", err);
    });
}

export async function setCategoriesIOS() {
  await notifee.setNotificationCategories([
    {
      id: "contact_reminder",
      actions: [
        {
          id: "try-now",
          title: "Try Now",
        },
        {
          title: "Dismiss",
          id: "dismiss",
        },
      ],
    },
    {
      id: "message",
      actions: [
        {
          id: "reply",
          title: "Reply",
          input: {
            placeholderText: "Send a message...",
            buttonText: "Send Now",
          },
        },
        {
          title: "Mark as read",
          id: "mark-as-read",
        },
      ],
    },
    {
      id: "event_invitation_reminder",
      actions: [
        {
          id: "event-accept",
          title: "Accept",
        },
        {
          title: "Reject",
          id: "event-reject",
        },
      ],
    },
    {
      id: "schedule_before_reminder",
      actions: [
        {
          id: "approve-message",
          title: "Approve",
        },
        {
          title: "Reject",
          id: "reject-message",
        },
      ],
    },
    {
      id: "event_main_reminder",
      actions: [],
    },
    {
      id: "missedCall",
      actions: [],
    },
  ]);
}

export async function setChannelGroups() {
  //channel groups
  await notifee.createChannelGroup({
    id: "CON",
    name: "Conversation",
  });

  await notifee.createChannel({
    id: "contact_reminder",
    name: "Contact Reminder",
    lights: true,
    vibration: true,
    importance: AndroidImportance.HIGH,
    sound: "default",
  });

  //channels
  await notifee.createChannel({
    id: "chat",
    name: "Chat",
    lights: true,
    vibration: true,
    importance: AndroidImportance.HIGH,
    sound: "default",
  });
  await notifee.createChannel({
    id: "event",
    name: "Event Reminders",
    lights: true,
    vibration: true,
    importance: AndroidImportance.HIGH,
    sound: "default",
  });
  await notifee.createChannel({
    id: "call",
    name: "Call",
    lights: true,
    vibration: true,
    importance: AndroidImportance.HIGH,
    sound: "default",
  });
  await notifee.createChannel({
    id: "other",
    name: "Other",
    lights: false,
    vibration: false,
    importance: AndroidImportance.LOW,
  });

  await notifee.createChannel({
    id: "assignment",
    name: "Assignments",
    lights: true,
    vibration: true,
    importance: AndroidImportance.HIGH,
    sound: "default",
  });
}

export async function DisplayMissedCall(data) {
  console.log("DisplayMissedCall", data);

  let payload = { data: JSON.stringify(data) };

  notifee.displayNotification({
    id: `Missed_${data.callID}_${Date.now()}`,
    title: data.roomName,
    body: `Missed ${data.callType == "audio" ? "audio" : "video"} call`,
    data: payload,
    ios: {
      categoryId: "missedCall",
    },
    android: {
      showTimestamp: true,
      channelId: "call",
      timestamp: Date.now(),
      smallIcon: "ic_small_icon",
      color: Colors.light.PrimaryColor,
      actions: [
        {
          title: "Call Back",
          pressAction: {
            id: "callback",
            launchActivity: "default",
          },
        },
      ],
      pressAction: {
        id: "missedCall",
        launchActivity: "default",
      },
    },
  });
  const asyncData = await getDataFromAsync(asyncStorageKeys.backgroundHandler);
  if (asyncData) {
    console.log(
      "Call id match",
      data.callId === asyncData.data.callId,
      data.callId,
      asyncData.data.callId
    );
    if (data.callId === asyncData.data.callId) {
      removeDataFromAsync(asyncStorageKeys.backgroundHandler);
    }
  }
}

export async function displayOnGoingCall(payload) {
  let id = notifee.displayNotification({
    id: payload.callId,
    title: payload.roomName,
    body: payload.body,
    data: payload,
    android: {
      smallIcon: "ic_small_icon",
      channelId: "other",
      color: Colors.light.PrimaryColor,
      asForegroundService: true,
      ongoing: true,
      colorized: true,
      timestamp: Date.now(),
      showTimestamp: true,
      actions: [
        {
          title: "Reject",
          pressAction: {
            id: "reject",
          },
        },
      ],
    },
  });
  return id;
}

export async function detectDeviceId() {
  const deviceId = await DeviceInfo.getUniqueId();
  deviceID = deviceId;
}

export function endBackgroundCall() {
  RNVoipCall.endAllCalls();
  RNVoipCall.stopRingtune();
}
