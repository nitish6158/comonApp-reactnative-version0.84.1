import { View, Text } from "react-native";
import React from "react";
import { useAppSelector } from "@/redux/Store";
import { TFunction, useTranslation } from "react-i18next";
import {
  RoomData,
  RoomMsgData,
  RoomParticipantData,
} from "@/redux/Models/ChatModel";
import { LastMessageType } from "@Types/types";
import { warnMessageHelper } from "@/utils/helpers/WarnMessageHelper";

export default function useRoomLastMessage() {
  const { comonContact } = useAppSelector((state) => state.Contact);
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const { t } = useTranslation();

  function formateLastMessage(item: RoomData) {
    let isUserLeftTheRoom = item?.participants?.find(
      (e) => e.user_id === MyProfile?._id && e.left_at > 0
    );

    //If user already left from group then show "Left Room"
    if (
      isUserLeftTheRoom &&
      (item.type == "group" || item.type == "broadcast")
    ) {
      return t("leftTheGroup");
    }

    if (item?.last_msg.length > 0) {
      const lastMsg = item?.last_msg?.[0];

      if (lastMsg.type == "poll") {
        return t("chatPoll.new-poll-last-message");
      }

      //If Last Message is a System Message then show system message
      if (LastMessageType[lastMsg.type ?? ""]) {
        return (
          warnMessageHelper(item, comonContact, MyProfile?._id) +
          lastMsg.message
        );
      }

      //If User present in delete array then handle it.
      const deleteArr = item.last_msg[0]?.deletedBy;
      let currentUser = deleteArr?.find(
        (user) => user.user_id == MyProfile?._id
      );
      if (currentUser) {
        //Show Message Deleted if cause is "deleted"
        if (currentUser?.cause == "deleted") {
          return t("deletedMessage");
        }

        //Show Message userLeft if cause is "left_room"
        if (currentUser?.cause == "left_room") {
          return t("leftTheGroup");
        }

        //Show Message empty if cause is "block" or type is "clear"
        if (currentUser?.cause == "block" || currentUser?.type == "clear") {
          //Check if user is still blocked then show "Blocked" else show empty
          if (item.blocked) {
            return t("blockedContact");
          } else {
            return "";
          }
        }
      }

      //If last message is related to Task Module then formate it
      if (lastMsg?.type == "invited" || lastMsg?.type == "declined") {
        const parsedMsg = JSON.parse(lastMsg?.message);
        if (lastMsg?.type == "declined") {
          if (lastMsg?.sender == MyProfile?._id) {
            return `${t("declinedOrg")} ${parsedMsg?.orgName}`;
          } else {
            return `${item?.display?.UserName} ${t("hasDeclined")} ${
              parsedMsg?.orgName
            }`;
          }
        } else {
          let inviterName = "";
          let message = JSON.parse(lastMsg.message);

          let inviterUser = item.participants.find(
            (v) => v.user_id == message.pid
          );
          if (inviterUser) {
            const getContact = comonContact.find(
              (e) => e?.userId?._id == message.pid
            );
            if (getContact) {
              inviterName = `${getContact?.firstName} ${getContact?.lastName}`;
            } else {
              inviterName = inviterUser.phone;
            }
          }

          let senderName = "";
          let senderUser = item.participants.find(
            (v) => v.user_id == lastMsg.sender
          );
          if (senderUser) {
            const getContact = comonContact.find(
              (e) => e?.userId?._id == lastMsg.sender
            );
            if (getContact) {
              senderName = `${getContact?.firstName} ${getContact?.lastName}`;
            } else {
              senderName = senderUser.phone;
            }
          }

          if (lastMsg?.sender == MyProfile?._id) {
            return `${t("youInvited")} ${inviterName} ${t("joinOrg")} ${
              parsedMsg?.orgName
            }`;
          } else {
            return `${senderName} ${t("invitedOrg")} ${parsedMsg?.orgName}`;
          }
        }
      }

      //If last message is related to Task Module then formate it
      if (lastMsg?.type == "taskAssigned") {
        const getContact = comonContact.find(
          (e) => e?.userId?._id == lastMsg?.sender
        );
        let inviterName = "";
        if (getContact) {
          inviterName = `${getContact?.firstName} ${getContact?.lastName}`;
        } else {
          inviterName = item?.display?.UserName;
        }
        const orgName = JSON.parse(lastMsg?.message);

        if (lastMsg?.sender == MyProfile?._id) {
          return `${t("assignedNewTask")} ${orgName?.scenarioName} ${t(
            "to"
          )} ${inviterName}`;
        } else {
          return `${inviterName} ${t("hasAssigned")} ${orgName?.scenarioName}`;
        }
      }

      //If No condition match then it is a chat message, so formate it
      if (item?.last_msg.length > 0) {
        // return getMessage(item?.last_msg, item.participants, MyProfile?._id ?? "", comonContact, t);
        return getMessage(item?.last_msg, item.participants);
      }
    }
  }

  function isUserExistInCommonList(id: string) {
    return comonContact.find((item) => item.userId?._id == id);
  }

  function getCommonUserName(senderID: string, fallbackName: string) {
    if (MyProfile?._id == senderID) {
      return t("navigation.you");
    } else {
      const isCommonUser = isUserExistInCommonList(senderID);
      return isCommonUser
        ? `${isCommonUser?.firstName} ${isCommonUser?.lastName}`
        : fallbackName;
    }
  }

  function getMessage(
    itemMessage: RoomMsgData[],
    participants: RoomParticipantData[]
  ) {
    const lastMsg = itemMessage[0];
    const participant = participants.find(
      (item) => item?.user_id == lastMsg.sender
    );
    const LastMessageSenderName = getCommonUserName(
      lastMsg.sender,
      participant?.phone ?? ""
    );
    return getMessageContent(lastMsg, LastMessageSenderName, participants);
  }

  function handleCallMessage(
    lastMsg: RoomMsgData,
    LastMessageSenderName: string,
    t: any
  ) {
    const spited = lastMsg.type.replace("Call", "");
    const callType = spited == "audio" ? t("audio") : t("video");
    return `${LastMessageSenderName} ${t("started")} ${callType} ${t("call")}`;
  }

  // function getFormattedMessage(message: string, t: any) {
  //   switch (message) {
  //     case "IMAGE":
  //       return t("image");
  //     case "contact":
  //       return t("contact");
  //     case "VIDEO":
  //       return t("videoType");
  //     case "AUDIO":
  //       return t("audioType");
  //     case "DOCUMENT":
  //       return t("document");
  //     default:
  //       return message;
  //   }
  // }
  function getFormattedMessage(messageType: string, t: any) {
    const category = getMessageCategory(messageType);

    switch (category) {
      case "image":
        return t("image");
      case "contact":
        return t("contact");
      case "video":
        return t("videoType");
      case "audio":
        return t("audioType");
      case "document":
        return t("document");
      default:
        return messageType;
    }
  }

  function handleMediaMessage(
    lastMsg: string,
    LastMessageSenderName: string,
    t: any
  ) {
    return `${LastMessageSenderName} ${t("shared")} ${getFormattedMessage(
      lastMsg,
      t
    )}`;
  }

  function handleAddedUserMessage(
    lastMsg: RoomMsgData,
    LastMessageSenderName: string,
    participants: RoomParticipantData[]
  ) {
    let pid = JSON.parse(lastMsg?.message)?.pid;

    if (pid === MyProfile?._id) {
      return `${LastMessageSenderName} ${t("addedYou")}`;
    } else {
      let user = participants.find((v) => v.user_id === pid);

      let isComon = comonContact.find((v) => v.userId?._id == user?.user_id);
      if (isComon) {
        return `${isComon.firstName} ${isComon.lastName} ${t(
          "added-to-group"
        )}`;
      } else {
        return `${user?.phone} ${t("added-to-group")}`;
      }
    }
  }

  function handleRemovedUserMessage(
    lastMsg: RoomMsgData,
    LastMessageSenderName: string,
    participants: RoomParticipantData[]
  ) {
    let pid = JSON.parse(lastMsg?.message)?.pid;

    if (pid === MyProfile?._id) {
      return `${LastMessageSenderName} ${t("userRemoved")}`;
    } else {
      let user = participants.find((v) => v.user_id === pid);
      let isComon = comonContact.find((v) => v.userId?._id == user?.user_id);
      if (isComon) {
        return `${isComon.firstName} ${isComon.lastName} ${t("userRemoved")}`;
      } else {
        return `${user?.phone} ${t("userRemoved")}`;
      }
    }
  }

  // function getMessageContent(lastMsg: RoomMsgData, LastMessageSenderName: string, participants: RoomParticipantData[]) {
  //   const messageType = lastMsg.type;

  //   switch (messageType) {
  //     case "audioCall":
  //     case "videoCall":
  //       return handleCallMessage(lastMsg, LastMessageSenderName, t);
  //     case "LOADING/image/png":
  //     case "LOADING/image/jpg":
  //     case "LOADING/video/mp4":
  //     case "LOADING/audio/mp3":
  //     case "IMAGE":
  //     case "contact":
  //     case "VIDEO":
  //     case "AUDIO":
  //     case "DOCUMENT":
  //       return handleMediaMessage(lastMsg, LastMessageSenderName, t);

  //     case "invited":
  //       return `${LastMessageSenderName} ${t("invitedYou")}`;

  //     case "addedUser":
  //       return handleAddedUserMessage(lastMsg, LastMessageSenderName, participants);

  //     case "changedName":
  //       return t("groupNameChange");

  //     case "removedUser":
  //       return handleRemovedUserMessage(lastMsg, LastMessageSenderName, participants);

  //     case "changedDescription":
  //       return t("groupDesc");

  //     case "createdRoom":
  //       return t("groupCreated");

  //     case "leftRoom":
  //       return `${LastMessageSenderName} ${t("leftGroup")}`;

  //     default:
  //       if (lastMsg?.message?.includes("turned on disappearing messages")) {
  //         return t("disappearingMessage");
  //       } else if (lastMsg?.message?.includes("turned off disappearing messages")) {
  //         return t("turnedOffDisappearingMessage");
  //       }
  //       return lastMsg.message;
  //   }
  // }
  function getMessageCategory(
    type: string
  ): "image" | "video" | "audio" | "contact" | "document" | null {
    if (!type || typeof type !== "string") return null;

    const normalized = type.toLowerCase().replace(/^loading\//, "");

    if (normalized.includes("image")) return "image";
    if (normalized.includes("video")) return "video";
    if (
      normalized.includes("audio") ||
      normalized.includes("mpeg") ||
      normalized.includes("recording")
    ) {
      return "audio";
    }
    if (normalized.includes("contact")) return "contact";

    // If 'document' is in the path, including 'LOADING/DOCUMENT/undefined'
    if (normalized.includes("document")) return "document";

    return null;
  }

  function getMessageContent(
    lastMsg: RoomMsgData,
    LastMessageSenderName: string,
    participants: RoomParticipantData[]
  ) {
    const messageType = lastMsg.type;
    const category = getMessageCategory(messageType);
    if (messageType == "audioCall" || messageType == "videoCall") {
      return handleCallMessage(lastMsg, LastMessageSenderName, t);
    }

    if (category) {
      return handleMediaMessage(category, LastMessageSenderName, t);
    }

    switch (messageType) {
      case "invited":
        return `${LastMessageSenderName} ${t("invitedYou")}`;
      case "addedUser":
        return handleAddedUserMessage(
          lastMsg,
          LastMessageSenderName,
          participants
        );
      case "changedName":
        return t("groupNameChange");
      case "removedUser":
        return handleRemovedUserMessage(
          lastMsg,
          LastMessageSenderName,
          participants
        );
      case "changedDescription":
        return t("groupDesc");
      case "createdRoom":
        return t("groupCreated");
      case "leftRoom":
        return `${LastMessageSenderName} ${t("leftGroup")}`;
      default:
        if (lastMsg?.message?.includes("turned on disappearing messages")) {
          return t("disappearingMessage");
        } else if (
          lastMsg?.message?.includes("turned off disappearing messages")
        ) {
          return t("turnedOffDisappearingMessage");
        }
        return lastMsg.message;
    }
  }

  return {
    formateLastMessage,
  };
}
