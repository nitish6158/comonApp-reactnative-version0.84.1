import { createSlice } from "@reduxjs/toolkit";
import io, { Socket } from "socket.io-client";
import { Platform } from "react-native";

import { SOCKET_URL } from "@/graphql/provider/endpoints";
import ToastMessage from "@/utils/ToastMesage";
import store from "../Store";
import { addOrganisationInvite, deleteAssignment, setOrganisationInvites } from "./OrganisationsReducer";
import {
  setChatsInCommonList,
  setFavoriteChatList,
  setFolderDataList,
  setMyProfile,
  setRoomMediaData,
} from "./ChatReducer";

export let socket = {} as Socket;

type socketSliceType = {
  socketID: string;
};

const initialState: socketSliceType = {
  socketID: "",
};

function initBaseListener() {
  const dispatch = store.dispatch;

  if (typeof socket?.on === "function") {
    socket.on("message", (data) => {
      if (data.type == "online") {
        let currentUserID = store.getState().Chat.MyProfile?._id;
        if (currentUserID) {
          if (currentUserID !== data.msg.user_id) {
            // console.log("online",data.msg)
            socket.emit("sendStatusToAUser", {
              type: "online",
              user_id: data.msg.user_id,
              roomId: data.msg.roomId,
            });
          }
        }
      }
      if (data.type == "pinChat") {
        ToastMessage(data.msg);
      }
      if (data.type == "unpinChat") {
        ToastMessage(data.msg);
      }

      if (data?.type == "invited") {
        dispatch(addOrganisationInvite(data.msg));
      }

      if (data?.type == "assigmentDeleted") {
        dispatch(deleteAssignment(data.msg.assignmentId));
      }

      // if (data.type == "updateRoomName") {
      //   // ToastMessage(t("toastmessage.group-name-updated-successfully"));
      // }
      if (data?.type == "deleteInvite") {
        const removedInvitation = store.getState().Organisation.invites?.filter((e) => e?._id != data?.msg?.inviteId);
        dispatch(setOrganisationInvites(removedInvitation));
      }

      if (data.type == "profile") {
        // dispatch(setMyProfile(data.msg));
        // dispatch(setFolderDataList(data.msg.folders));
        // console.log(data.msg)
        // setCurrentUserData(data.msg);
      }

      if (data.type == "onJoinRoom") {
        socket.emit("connectToRoom", { roomId: data.msg._id });
      }

      // if (data.type == "blockRoom") {
      //   console.log("Block room data", data?.msg);
      //   // ToastMessage(t("toastmessage.user-blocked-successfully"));
      // }
      // if (data.type == "unblockRoom") {
      //   console.log("unblockRoom room data", data?.msg);
      //   // ToastMessage(t("toastmessage.user-unBlocked-successfully"));
      // }
      // if (data?.type == "onBlockRoom") {
      //   socket?.emit("getProfile");
      // }
      if (data?.type == "newUser") {
        console.log("newUser", data.msg);
      }

      if (data.type == "getUserMediaByRoomId") {
        dispatch(setRoomMediaData(data.msg));
      }
      if (data.type == "getFavouriteChats") {
        dispatch(setFavoriteChatList(data.msg));
      }

      if (data.type == "getRoomInComon") {
        dispatch(setChatsInCommonList(data.msg));
      }
      // if (data.type == "clearAllChats") {
      //   if (data?.msg?.message) {
      //     // ToastMessage(`${t("chatClear")}`);
      //   }
      // }
    });
    socket?.on("connect", (data) => {
      console.log(`<---${Platform.OS} Socket connected successfully--->`);
    });
    socket?.on("disconnect", () => {
      console.log(`<----${Platform.OS} Socket disconnected successfully--->`);
    });
  }
}

export const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    connectToSocket: (state, { payload }) => {
      const Remote = `${SOCKET_URL}${payload}`;
      let socketInit = io(Remote);
      socket = socketInit;

      initBaseListener();
    },
    disconnectToSocket: (state, { payload }) => {
      if (Object.keys(socket).length > 0) {
        console.log("Socket disconnect called");
        socket.disconnect();
      }
    },
    reconnectToSocket: (state, { payload }) => {
      if (Object.keys(socket).length > 0) {
        socket.disconnect();
        socket.connect();
        state.socketID = socket.id;
      }
    },
    updateSocketID: (state, { payload }) => {
      state.socketID = payload;
    },
  },
  // extraReducers: {},
});

export const { connectToSocket, disconnectToSocket, reconnectToSocket, updateSocketID } = socketSlice.actions;

export default socketSlice.reducer;
