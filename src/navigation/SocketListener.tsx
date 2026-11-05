import { Platform } from "react-native";
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

import ToastMessage from "@Util/ToastMesage";
import { currentUserIdAtom } from "@Atoms/RealmloginManager";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  setChatsInCommonList,
  setFavoriteChatList,
  setFolderDataList,
  setMyProfile,
  setRoomMediaData,
} from "@/redux/Reducer/ChatReducer";
import { addOrganisationInvite, deleteAssignment, setOrganisationInvites } from "@/redux/Reducer/OrganisationsReducer";
import { useAppSelector } from "@/redux/Store";
import { socket } from "@/redux/Reducer/SocketSlice";

let currentUser = undefined;


// export default function SocketListener() {
//   const setCurrentUserData = useSetAtom(currentUserIdAtom);

//   const OrganisationInvites = useAppSelector((state) => state.Organisation.invites);

//   const dispatch = useDispatch();
//   const { t } = useTranslation();

//   useEffect(() => {
//     if (socket?.connected) {
//       socket.on("message", (data) => {
//         if (data.type == "setRoomPicture") {
//           ToastMessage(t("toastmessage.group-image-updated-successfully"));
//         }

//         // if (data.type == "online") {
//         //   if (currentUser && Object.keys(currentUser).length > 0) {
//         //     if (currentUser._id !== data.msg.user_id) {
//         //       socket.emit("sendStatusToAUser", {
//         //         type: "online",
//         //         user_id: data.msg.user_id,
//         //         roomId: data.msg.roomId,
//         //       });
//         //     }
//         //   }
//         // }
//         if (data.type == "pinChat") {
//           ToastMessage(data.msg);
//         }
//         if (data.type == "unpinChat") {
//           ToastMessage(data.msg);
//         }

//         if (data?.type == "invited") {
//           dispatch(addOrganisationInvite(data.msg));
//         }

//         if (data?.type == "assigmentDeleted") {
//           dispatch(deleteAssignment(data.msg.assignmentId));
//         }

//         if (data.type == "updateRoomName") {
//           ToastMessage(t("toastmessage.group-name-updated-successfully"));
//         }
//         if (data?.type == "deleteInvite") {
//           const removedInvitation = OrganisationInvites?.filter((e) => e?._id != data?.msg?.inviteId);
//           dispatch(setOrganisationInvites(removedInvitation));
//         }

//         if (data.type == "profile") {
//           if (data?.msg) currentUser = data?.msg;
//           dispatch(setMyProfile(data.msg));
//           dispatch(setFolderDataList(data.msg.folders));
//           setCurrentUserData(data.msg);
//         }

//         if (data.type == "createFolder") {
//           dispatch(setFolderDataList(data.msg));
//           setCurrentUserData((d) => {
//             if (d != null) {
//               return { ...d, folders: data.msg };
//             } else {
//               return null;
//             }
//           });
//         }
//         if (
//           data.type == "deleteRoomFromFolder" ||
//           data.type == "deleteFolder" ||
//           data.type == "editFolder" ||
//           data.type == "addRoomToFolder"
//         ) {
//           setCurrentUserData((d) => {
//             if (d != null) {
//               return { ...d, folders: data.msg };
//             } else {
//               return null;
//             }
//           });
//           dispatch(setFolderDataList(data.msg));
//           console.log(data?.msg);
//         }

//         if (data.type == "onJoinRoom") {
//           socketConnect.emit("connectToRoom", { roomId: data.msg._id });
//         }

//         if (data.type == "blockRoom") {
//           console.log("Block room data", data?.msg);
//           ToastMessage(t("toastmessage.user-blocked-successfully"));
//         }
//         if (data.type == "unblockRoom") {
//           ToastMessage(t("toastmessage.user-unBlocked-successfully"));
//         }
//         if (data?.type == "onBlockRoom") {
//           socket?.emit("getProfile");
//         }
//         if (data?.type == "onUnblockRoom") {
//           socket?.emit("getProfile");
//         }

//         if (data.type == "getUserMediaByRoomId") {
//           dispatch(setRoomMediaData(data.msg));
//         }
//         if (data.type == "getFavouriteChats") {
//           dispatch(setFavoriteChatList(data.msg));
//         }

//         if (data.type == "getRoomInComon") {
//           dispatch(setChatsInCommonList(data.msg));
//         }
//         if (data.type == "clearAllChats") {
//           if (data?.msg?.message) {
//             ToastMessage(`${t("chatClear")}`);
//           }
//         }
//       });
//     }
//     if (typeof socket?.on === "function") {
//       socket?.on("connect", (data) => {
//         console.log(`<---${Platform.OS} Socket connected successfully--->`);
//       });
//       socket?.on("disconnect", () => {
//         console.log(`<----${Platform.OS} Socket disconnected successfully--->`);
//       });
//     }

//     return () => {
//       console.log("Socket removed");
//     };
//   }, [socket?.connected]);

//   return <></>;
// }
