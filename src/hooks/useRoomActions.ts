import { useState, useCallback, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  useMuteRoomMutation,
  useUnmuteRoomMutation,
  useDeleteRoomMutation,
  useRemoveUserFromRoomMutation,
  useDeleteBroadcastRoomMutation,
} from "@/graphql/generated/room.generated";
import { socketManager } from "@/utils/socket/SocketManager";
import { socketConnect } from "@/utils/socket/SocketConnection";
import ToastMessage from "@/utils/ToastMesage";
import { navigate, navigateAndSimpleReset } from "@/navigation/utility";
import { useDispatch } from "react-redux";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";
import { useAppSelector } from "@/redux/Store";
import { useAtom } from "jotai";
import { singleRoom } from "@/Atoms";
import { produce } from "immer";
import { ChatContext, storage as chatStorage } from "@/Context/ChatProvider";
import { useSetAtom } from "jotai";
import { AllChatRooms, ArchiveRoomsAtom } from "@/Atoms/allRoomsAtom";

interface UseRoomActionsProps {
  roomId: string;
  roomName: string;
  profileId: string;
}

/**
 * Custom hook to manage common room actions
 */
export default function useRoomActions({
  roomId,
  roomName,
  profileId,
}: UseRoomActionsProps) {
  // State for modal visibility
  const [muteModalVisible, setMuteModalVisible] = useState(false);
  const [clearChatVisible, setClearChatVisible] = useState(false);
  const [blockVisible, setBlockVisible] = useState(false);
  const [camerarollVisible, setCamerarollVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [unmuteModalVisible, setUnmuteModalVisible] = useState(false);
  const [deleteBroadcastVisible, setDeleteBroadcastVisible] = useState(false);
  const [deleteBroadcastLoader, setDeleteBroadcastLoader] = useState(false);

  // GraphQL mutations
  const [muteRoomRequest] = useMuteRoomMutation();
  const [unMuteRoomRequest] = useUnmuteRoomMutation();
  const [deleteRoomRequest, deleteRoomResponse] = useDeleteRoomMutation();
  const [removeParticipantRequest, removeParticipantResponse] =
    useRemoveUserFromRoomMutation();
  const [deleteBroadcastRoom] = useDeleteBroadcastRoomMutation();
  const [display, setDisplay] = useAtom(singleRoom);
  const setChatRooms = useSetAtom(AllChatRooms);
  const setArchiveRooms = useSetAtom(ArchiveRoomsAtom);
  const myProfileData = useAppSelector((state) => state.Chat.MyProfile);

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { roomId: activeRoomId, setConversation, setRoomId } = useContext(ChatContext);

  /**
   * Mute chat functionality
   */
  const muteChat = useCallback(
    (time: string) => {
      setMuteModalVisible(false);
      muteRoomRequest({
        variables: {
          input: {
            roomId,
            expired_at: time,
          },
        },
      })
        .then((res) => {
          if (res.data?.muteRoom?.success) {
            ToastMessage(res?.data?.muteRoom.message);
            socketManager.chatRoom.fetchAndUpdateRooms();

            setDisplay((currentDisplay) =>
              produce(currentDisplay, (draftDisplay) => {
                const newMutedBy = {
                  user_id: profileId,
                  expired_at: time,
                  muted_at: Date.now(),
                };
                draftDisplay.mutedBy = Array.isArray(draftDisplay.mutedBy)
                  ? [...draftDisplay.mutedBy, newMutedBy]
                  : [newMutedBy];
                draftDisplay.isCurrentRoomMuted = true;
              })
            );
          }
        })
        .catch((error) => {
          console.error("Error muting room:", error);
          ToastMessage(t("error.failed-to-mute"));
        });
    },
    [roomId, muteRoomRequest, t, profileId]
  );

  useEffect(() => {
    console.log("display data: ", display.mutedBy);
  }, [display]);

  const unmuteChat = useCallback(() => {
    unMuteRoomRequest({
      variables: {
        input: {
          roomId,
        },
      },
    })
      .then((res) => {
        if (res.data?.unmuteRoom?.success) {
          socketManager.chatRoom.fetchAndUpdateRooms();
          ToastMessage(res?.data?.unmuteRoom.message);

          setDisplay((currentDisplay) =>
            produce(currentDisplay, (draftDisplay) => {
              draftDisplay.mutedBy = Array.isArray(draftDisplay.mutedBy)
                ? draftDisplay.mutedBy.filter((e) => e.user_id !== profileId)
                : [];
              draftDisplay.isCurrentRoomMuted = false;
            })
          );
        }
      })
      .catch((error) => {
        console.error("Error unmuting room:", error);
        ToastMessage(t("error.failed-to-unmute"));
      });
    setUnmuteModalVisible(false);
  }, [roomId, unMuteRoomRequest, t, profileId]);

  /**
   * Clear chat functionality
   */
  const clearChat = useCallback(() => {
    // Optimistic local clear to reflect immediately in UI
    if (activeRoomId === roomId) {
      setConversation([]);
    }
    chatStorage.delete(`conversations_${roomId}`);

    socketManager.conversation.clearAllChat({ roomId });
    socketConnect.emit("clearAllChats", { roomId });
    setClearChatVisible(false);
  }, [roomId, activeRoomId, setConversation]);

  /**
   * Handle camera roll setting
   */
  const handleCameraRollSetting = useCallback(
    (type: "On" | "Off") => {
      socketConnect.emit("setCameraRoll", { roomId, type });
      setCamerarollVisible(false);
      return type === "On"; // Returns true if setting is turned on
    },
    [roomId]
  );

  /**
   * Handle broadcast list deletion
   */
  const handleBroadcastListDelete = useCallback(() => {
    setDeleteBroadcastVisible(false);
    setDeleteBroadcastLoader(true);
    deleteBroadcastRoom({
      variables: {
        input: {
          _id: roomId,
        },
      },
    })
      .then((response) => {
        if (response.errors) {
          console.error("Error in deleting broadcast room", response.errors);
          setDeleteBroadcastLoader(false);
          ToastMessage(t("errorDeletingBroadcastRoom"));
          return;
        }
        if (response.data?.deleteBroadcastRoom?.success) {
          chatStorage.delete(`conversations_${roomId}`);
          socketConnect.emit("deleteRoom", { roomId } as any);
          socketConnect.emit("deleteRoom", roomId as any);
          socketManager.chatRoom.fetchAndUpdateRooms((data) => {
            if (!data?.rooms) return;
            const archives = data.rooms.filter((room: any) => room.isArchived);
            setChatRooms(data.rooms);
            setArchiveRooms(archives);
          });

          if (activeRoomId === roomId) {
            setConversation([]);
            setRoomId("");
          }
          navigateAndSimpleReset("BottomTabScreen", {
            screen: "ChatTabScreen",
            params: {
              screen: "ChatListScreen",
            },
          });
        }
        setDeleteBroadcastLoader(false);
      })
      .catch((err) => {
        console.error("Error in deleting broadcast room", err);
        setDeleteBroadcastLoader(false);
        ToastMessage(t("errorDeletingBroadcastRoom"));
      });
  }, [
    roomId,
    deleteBroadcastRoom,
    t,
    setChatRooms,
    setArchiveRooms,
    activeRoomId,
    setConversation,
    setRoomId,
  ]);

  /**
   * Block user functionality
   */
  const applyLocalBlockState = useCallback(() => {
    const blockedUserId =
      display?.participants?.find((item) => item.user_id !== profileId)
        ?.user_id || "";

    if (myProfileData && blockedUserId) {
      const alreadyBlocked = myProfileData?.blockedRooms?.some(
        (item) => item.room_Id === roomId
      );
      if (!alreadyBlocked) {
        dispatch(
          setMyProfile({
            ...myProfileData,
            blockedRooms: [
              ...(myProfileData?.blockedRooms || []),
              { room_Id: roomId, pid: blockedUserId },
            ],
          })
        );
      }
    }

    setDisplay((currentDisplay) =>
      produce(currentDisplay, (draftDisplay) => {
        draftDisplay.isCurrentRoomBlocked = true;
        draftDisplay.isCurrentUserBlocked = false;
        draftDisplay.roomStatus = "blocked";
      })
    );
  }, [display?.participants, profileId, myProfileData, roomId, dispatch, setDisplay]);

  const blockUser = useCallback(() => {
    applyLocalBlockState();

    socketConnect.emit("blockRoom", { roomId });
    socketManager.chatRoom.fetchAndUpdateRooms();

    setBlockVisible(false);
  }, [roomId, applyLocalBlockState]);

  /**
   * Unblock user functionality
   */
  const unblockUser = useCallback(
    (myProfileData) => {
      const blockedRooms = myProfileData?.blockedRooms?.filter(
        (item) => item.room_Id !== roomId
      );
      dispatch(setMyProfile({ ...myProfileData, blockedRooms }));
      setDisplay((currentDisplay) =>
        produce(currentDisplay, (draftDisplay) => {
          draftDisplay.isCurrentRoomBlocked = false;
          draftDisplay.isCurrentUserBlocked = false;
          if (draftDisplay.roomStatus === "blocked") {
            draftDisplay.roomStatus = "offline";
          }
        })
      );
      setBlockVisible(false);
      navigate("ChatListScreen", {});

      setTimeout(() => {
        socketConnect.emit("unblockRoom", { roomId });
      }, 300);
      setTimeout(() => {
        socketManager.chatRoom.fetchAndUpdateRooms();
      }, 2000);
    },
    [roomId, dispatch, setDisplay]
  );

  /**
   * Report user functionality
   */
  const reportUser = useCallback(
    (reason: string) => {
      // Keep UI in sync immediately (same behavior as block contact).
      applyLocalBlockState();
      socketConnect.emit("reportRoom", { roomId, reason });
      socketManager.chatRoom.fetchAndUpdateRooms();
    },
    [roomId, applyLocalBlockState]
  );

  /**
   * Leave group functionality
   */
  const leaveGroup = useCallback(() => {
    setLeaveModalVisible(false);
    setTimeout(() => {
      removeParticipantRequest({
        variables: {
          input: {
            roomId,
            pid: profileId,
          },
        },
      })
        .then((res) => {
          if (res.data?.removeUserFromRoom.success) {
            ToastMessage(
              `${t("toastmessage.you-no-longer-part-of")} ${roomName} ${t(
                "others.Group"
              )}`
            );
            navigate("ChatListScreen", {});
          }
        })
        .catch((err) => {
          console.error("Error leaving group:", err);
          ToastMessage(t("error.failed-to-leave-group"));
        });
    }, 300);
  }, [roomId, roomName, profileId, removeParticipantRequest, t]);

  /**
   * Delete chat functionality
   */
  const deleteChat = useCallback(() => {
    deleteRoomRequest({
      variables: {
        input: {
          roomId,
        },
      },
    })
      .then((res) => {
        if (res.data?.deleteRoom?.success) {
          navigate("ChatListScreen", {});
          ToastMessage(res.data?.deleteRoom.message);
        }
      })
      .catch((err) => {
        console.error("Error deleting room:", err);
        ToastMessage(t("error.failed-to-delete-chat"));
      });
  }, [roomId, deleteRoomRequest, t]);

  return {
    // Modal visibility states
    muteModalVisible,
    setMuteModalVisible,
    clearChatVisible,
    setClearChatVisible,
    blockVisible,
    setBlockVisible,
    camerarollVisible,
    setCamerarollVisible,
    reportVisible,
    setReportVisible,
    leaveModalVisible,
    setLeaveModalVisible,
    unmuteModalVisible,
    setUnmuteModalVisible,
    deleteBroadcastVisible,
    setDeleteBroadcastVisible,
    deleteBroadcastLoader,

    // Action functions
    muteChat,
    unmuteChat,
    clearChat,
    handleCameraRollSetting,
    handleBroadcastListDelete,
    blockUser,
    unblockUser,
    reportUser,
    leaveGroup,
    deleteChat,

    // Loading states
    deleteRoomLoading: deleteRoomResponse.loading,
    removeParticipantLoading: removeParticipantResponse.loading,
  };
}
