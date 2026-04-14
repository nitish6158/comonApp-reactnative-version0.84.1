import { useEffect, useCallback, useRef, useContext } from "react";
import { useAtom } from "jotai";
import { useReadChatByRoomIdMutation } from "@Service/generated/room.generated";
import { singleRoom } from "@Atoms/singleRoom";
import notifee from "@notifee/react-native";
import { socketManager } from "@/utils/socket/SocketManager";
import { ChatMMKV } from "@/redux/backup/mmkv";
import { ChatContext, storage } from "@/Context/ChatProvider";
import { useAppSelector } from "@/redux/Store";

const useRoomDataFormatter = (RoomId: string) => {
  const [display, setDisplay] = useAtom(singleRoom);
  const [readChatRequest] = useReadChatByRoomIdMutation();
  const roomIdRef = useRef(RoomId);
  const { setConversation } = useContext(ChatContext);
  const myProfile = useAppSelector((state) => state.Chat.MyProfile);

  const applyBlockedState = useCallback(
    (roomData: any) => {
      if (!roomData) return roomData;
      if (!myProfile?.blockedRooms) return roomData;

      const roomType = roomData.roomType || roomData.type;
      if (roomType !== "individual") return roomData;

      const resolvedRoomId = roomData.roomId || roomData._id;
      const isCurrentRoomBlocked = myProfile.blockedRooms.some(
        (item) => item.room_Id === resolvedRoomId
      );

      // Keep existing value if present; profile blockedRooms does not always carry "blocked by other user" reliably.
      const isCurrentUserBlocked = roomData.isCurrentUserBlocked ?? false;

      return {
        ...roomData,
        isCurrentRoomBlocked,
        isCurrentUserBlocked,
        roomStatus: isCurrentRoomBlocked ? "blocked" : roomData.roomStatus,
      };
    },
    [myProfile?.blockedRooms]
  );

  const updateRoomData = useCallback(async () => {
    try {
      const currentRoomId = roomIdRef.current;

      const cachedRoomData = ChatMMKV.getString(`room_${currentRoomId}`);

      if (cachedRoomData) {
        try {
          const parsedData = JSON.parse(cachedRoomData);
          const hydratedRoomData = applyBlockedState(parsedData);
          setDisplay(hydratedRoomData);
        } catch (parseError) {
          console.error("Error parsing cached room data:", parseError);
        }
      } else {
        console.log(`No cache found for room_${currentRoomId}`);
      }

      socketManager.chatRoom.getFormattedRoomById(currentRoomId, (data) => {
        if (data.room) {
          const hydratedRoomData = applyBlockedState(data.room);
          if (currentRoomId === roomIdRef.current) {
            setDisplay(hydratedRoomData);
            // console.log("data.messages.length", data.messages.length)
            setConversation(data.messages);
            ChatMMKV.set(`room_${currentRoomId}`, JSON.stringify(hydratedRoomData));
            storage.set(
              `conversations_${roomIdRef.current}`,
              JSON.stringify(data.messages.slice(0, 100))
            );
            console.log(`Updated cache for room_${currentRoomId}`);
          } else {
            console.log(
              `Received data for old room ${currentRoomId}, current room is ${roomIdRef.current}`
            );
            ChatMMKV.set(`room_${currentRoomId}`, JSON.stringify(hydratedRoomData));
          }
        }
      });
    } catch (err) {
      console.error(
        `Error in getRoomDetailsByRoomId for ${roomIdRef.current}:`,
        err
      );
    }
  }, [setDisplay, setConversation, applyBlockedState]);

  useEffect(() => {
    if (RoomId) {
      roomIdRef.current = RoomId;
      updateRoomData();
    }
  }, [RoomId, updateRoomData]);

  useEffect(() => {
    notifee.cancelNotification(`CHAT_${RoomId}`);
    readChatRequest({
      variables: {
        input: {
          roomId: RoomId,
        },
      },
    }).then((res) => {
      console.log("read", res.data?.readChatByRoomId);
    });
    return () => {
      global.roomId = null;
    };
  }, [RoomId, readChatRequest]);

  return display;
};

export default useRoomDataFormatter;
