import { BACKGROUND_API, PUBLIC_API, PUBLIC_API_HOST } from "@Service/provider/endpoints";
import {
  ChangeCallStatusRequest,
  ChatDeliveredRequest,
  MarkAsReadRequest,
  MarkAsReadResponse,
  ReplyChatRequest,
  ReplyChatResponse,
} from "./Interfaces/APICall";
import { SessionKeys, getSession } from "@Util/session";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { CallNotification } from "./Interfaces/Call";
import { Chat } from "./Interfaces/Chat";
import { ParticipantAcceptStatus } from "@/graphql/generated/types";
import { user } from "@/schemas/schema";
import { storage } from "@/redux/backup/mmkv";
import { keys } from "@/redux/backup/keys";
import { Platform } from "react-native";

const BASE_URL = BACKGROUND_API;
const REPLY_CHAT = "/chat/replyChat";
const MARK_CHAT_READ = "/chat/setChatReadBy";
const CHAT_DELIVERED = "/chat/setChatDelivered";
const CHANGE_CALL_STATUS = "/call/changeCallStatus";

type dataType = Chat & { TYPE: string };

export const updateChat = async (data: dataType, input: string) => {
  const token = await AsyncStorage.getItem(SessionKeys.TOKEN);
  //console.log(data)

  let roomId = "";
  let cid = "";
  if (data.myMessage == undefined) {
    let datap = JSON.parse(data?.data) as Chat;
    roomId = datap.myMessage.roomId;
    cid = datap.myMessage.roomId;
  } else {
    (roomId = data?.myMessage?.roomId), (cid = data.myMessage._id);
  }
  const requestBody: ReplyChatRequest = {
    roomId: roomId,
    cid: cid,
    message: input,
  };
  const res = await fetch(`${BASE_URL}${REPLY_CHAT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });

  const resData = (await res.json()) as ReplyChatResponse;
  if (resData.success) {
    console.log("updateChat API", "success");
  } else {
    //console.log('resData.status is false',resData)
  }
};

export const markChatRead = async (data: dataType) => {
  const token = await AsyncStorage.getItem(SessionKeys.TOKEN);
  const requestBody: MarkAsReadRequest = {
    roomId: data.myMessage.roomId,
    cid: [data.myMessage._id],
  };
  const res = await fetch(`${BASE_URL}${MARK_CHAT_READ}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });
  const resData = (await res.json()) as MarkAsReadResponse;
  if (resData.success) {
    console.log("markChatRead API", "success");
  } else {
    //console.log('mark as read resData.status is false')
  }
};

export const chatDelivered = async (data: dataType) => {
  const token = await AsyncStorage.getItem(SessionKeys.TOKEN);
  let requestBody: ChatDeliveredRequest = {
    roomId: data?.myMessage?.roomId,
    cid: data.myMessage._id,
  };

  const res = await fetch(`${BASE_URL}${CHAT_DELIVERED}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestBody),
  });

  const resData = (await res.json()) as MarkAsReadResponse;
  if (resData.success) {
    console.log("chatDelivered API", "success");
  } else {
    //console.log('CHAT_DELIVEREDresData.status is false')
  }
};

export const changeCallStatus = async (data: CallNotification & { TYPE: string }) => {
  const token = await AsyncStorage.getItem(SessionKeys.TOKEN);
  let userId = await AsyncStorage.getItem("MyProfile");

  //console.log(token,userId)
  if (token != null && userId != null) {
    let requestBody: ChangeCallStatusRequest = {
      callId: data?.data?._id,
      status: "rejected",
      userId: userId?.user?._id,
    };

    const res = await fetch(`${BASE_URL}${CHANGE_CALL_STATUS}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const resData = (await res.json()) as MarkAsReadResponse;
    if (resData.success) {
      console.log("changeCallStatus API", "success");
    } else {
      //console.log('CHANGE CALL STATUS resData.status is false')
    }
  }
};

export async function ChangeScheduleMessageStatus(scheduleId: string, Status: ParticipantAcceptStatus) {
  const token = await AsyncStorage.getItem(SessionKeys.TOKEN);
  // let userId = await AsyncStorage.getItem("userId");
  console.log("scheduleId", scheduleId);

  const EventStatusChange = `
    mutation updateReminderApprovalStatus($input: UpdateAprovalStatusInput!) {
      updateReminderApprovalStatus(input: $input) {
        type
      }
    }
`;
  if (token != null) {
    // Perform the Fetch request
    fetch(PUBLIC_API_HOST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: EventStatusChange,
        variables: {
          input: {
            _id: scheduleId,
            ApprovalStatus: Status,
          },
        },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the data returned from the mutation
        console.log("Schedule Message Status", "success");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

export async function changeEventParticipantStatus(reminderID: string, Status: ParticipantAcceptStatus) {
  const token = await AsyncStorage.getItem(SessionKeys.TOKEN);
  // let userId = await AsyncStorage.getItem("userId");
  console.log("parentId", reminderID);

  const EventStatusChange = `
    mutation updateReminderApprovalParent($input: UpdateAprovalStatusInput!) {
      updateReminderApprovalParent(input: $input) {
        type
      }
    }
`;
  if (token != null) {
    // Perform the Fetch request
    fetch(PUBLIC_API_HOST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: EventStatusChange,
        variables: {
          input: {
            _id: reminderID,
            ApprovalStatus: Status,
          },
        },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        // Handle the data returned from the mutation
        console.log("changeEventParticipantStatus API", "success");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

export async function notificationLog(type: string) {
  const NotificationLogs = `
  mutation NotificationApi($input:notificationAPiInput!){
    NotificationApi(input:$input){
      success
      message
    }
  }
`;

  let deviceId = storage.getString(keys.deviceId);
  let user = JSON.parse(storage.getString(keys.user) ?? "{}");

  // let userId = await AsyncStorage.getItem("userId");
  fetch(PUBLIC_API_HOST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: NotificationLogs,
      variables: {
        input: {
          userId: user._id,
          name: `${user.firstName ?? ""} ${user.lastName ?? ""}`,
          PlatformType: Platform.OS,
          NotificationType: type,
          deviceId,
          duration: 0,
        },
      },
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the data returned from the mutation
      console.log("notificationLog API", "success");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

export async function getNotificationPayload(_id: string) {
  const token = await AsyncStorage.getItem(SessionKeys.TOKEN);
  // let userId = await AsyncStorage.getItem("userId");

  const notificationById = `
    query getNotificationById($input:IdDto!){
    getNotificationById(input:$input){
      _id
      title
      body
      type
      payload
      user {
        _id
      }
    }
  }
`;
  let response = await fetch(PUBLIC_API_HOST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: notificationById,
      variables: {
        input: {
          _id,
        },
      },
    }),
  });

  let res = await response.json();
  if (res) {
    console.log("Notification Payload")
    return res.data.getNotificationById;
  }
}

export async function dismissNotification(isDismiss: boolean, _id: string) {
  const token = await AsyncStorage.getItem(SessionKeys.TOKEN);
  // let userId = await AsyncStorage.getItem("userId");

  const dismissMutation = `
    mutation updateDismiss($input: updateDisMissInput!) {
      updateDismiss(input: $input) {
        _id
      }
    }
`;
  if (token != null) {
    // Perform the Fetch request
    fetch(PUBLIC_API_HOST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: dismissMutation,
        variables: {
          input: {
            _id,
            isDismiss,
          },
        },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the data returned from the mutation
        console.log("dismissNotification api", "success");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

export async function leftCallRequest() {
  const token = await AsyncStorage.getItem(SessionKeys.TOKEN);
  let userId = await AsyncStorage.getItem("userId");

  const LeftCallDocument = `
  mutation leftCall($input: IdDto!) {
    leftCall(input: $input) {
      time
      status
    }
  }
`;
  if (token != null && userId != null) {
    // Perform the Fetch request
    fetch(PUBLIC_API_HOST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: LeftCallDocument,
        variables: {
          input: {
            _id: userId,
          },
        },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the data returned from the mutation
        console.log("leftCallRequest API", "success");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

export async function RequestCallWaiting(callID: string) {
  console.log("RequestCallWaiting start", callID);
  const token = await AsyncStorage.getItem(SessionKeys.TOKEN);

  const CallWaitingDocument = `
  mutation callWaiting($input: IdDto!) {
    callWaiting(input: $input) {
      success
      message
    }
  }
`;

  if (token != null) {
    // Perform the Fetch request
    fetch(PUBLIC_API_HOST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: CallWaitingDocument,
        variables: {
          input: {
            _id: callID,
          },
        },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the data returned from the mutation
        console.log("RequestCallWaiting response", JSON.stringify(data));
        console.log("RequestCallWaiting API", "success");
      })
      .catch((error) => {
        console.log("RequestCallWaiting error", JSON.stringify(error));
        console.error("Error:", error);
      });
  }
}
