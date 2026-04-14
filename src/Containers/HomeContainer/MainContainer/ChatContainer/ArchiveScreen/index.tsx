import { AllChatRooms, ArchiveRoomsAtom } from "@Atoms/allRoomsAtom";
import React from "react";
import { RoomData } from "@Store/Models/ChatModel";
import { StyleSheet, View } from "react-native";
import ChatComponent from "@/Components/SingleRoomComponent";
import { HeaderWithScreenName } from "@Components/header/HeaderWithScreenName";
import HiddenItem from "../HiddenFile";
import { SwipeListView } from "react-native-swipe-list-view";
import ToastMessage from "@Util/ToastMesage";
import { navigate } from "@Navigation/utility";
import { useAtom, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { useUnArchiveRoomMutation } from "@Service/generated/room.generated";
import { conversationLimit } from "@/Atoms";
import useRoomLastMessage from "@/hooks/useRoomLastMessage";
import { useAppSelector } from "@/redux/Store";
import { ArchiveChatListScreenProps } from "@/navigation/screenPropsTypes";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { socketManager } from "@/utils/socket/SocketManager";
import { produce } from "immer";

export default function ArchiveScreen({ }: ArchiveChatListScreenProps) {
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const [unArchiveRoomRequest] = useUnArchiveRoomMutation();
  const { formateLastMessage } = useRoomLastMessage();
  const userStatusData = useAppSelector(state => state.Chat.UserStatus || []);

  const [AllRooms, setAllRooms] = useAtom(AllChatRooms);
  const [ArchiveRooms, setArchiveRooms] = useAtom(ArchiveRoomsAtom);
  const setLimit = useSetAtom(conversationLimit);

  const { t } = useTranslation();

  return (
    <>
      <HeaderWithScreenName title={t("others.Archive")} />
      <View style={styles.container}>
        <SwipeListView
          data={ArchiveRooms}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => {
            const userStatusVisible = checkUserStatusVisibility(item);
            const roomLastMessage = formateLastMessage(item);

            return (
              <View key={index.toString()}>
                <ChatComponent
                  roomData={item}
                  clearChat={item?.last_msg[0]?.clear}
                  UserImage={item.display.UserImage}
                  isUnreadByMe={myUserIdExist(item?.unreadBy)}
                  date={resolveRoomTimestamp(item)}
                  Message={roomLastMessage}
                  isMutedByMe={myUserIdExist(item?.mutedBy)}
                  isPin={myUserIdExist(item?.fixedBy)}
                  Name={item.display.UserName}
                  isOnline={userStatusVisible}
                  showAlert
                  chatclear={item?.last_msg[0]?.message?.clear}
                  onPressContinaer={() => {
                    setLimit(20);
                    socketConnect.emit("removeDisappearedChats", {
                      roomId: item?._id,
                    });
                    navigate("ChatMessageScreen", {
                      RoomId: item?._id,
                    });
                  }}
                  isArchive={true}
                />
              </View>
            );
          }}
          renderHiddenItem={(data, rowMap) => (
            <HiddenItem
              onPressArchive={() => unArchive(data.item?._id)}
              Btnstyle={{ width: 80 }}
              data={data}
              rowMap={rowMap}
              HiddenBtnRightTextFirst={t("Hidden-Files.unarchive")}
              BtnRightContainerStyle={{ right: -35 }}
              isArchive="unArchiveRoom"
            />
          )}
          leftOpenValue={140}
          rightOpenValue={-160}
        />
      </View>
    </>
  );

  function checkUserStatusVisibility(room: RoomData) {
    switch (room.type) {
      case "broadcast":
      case "group":
        return false;
      case "individual":
        if (!room?.participants || room.blocked) {
          return false;
        }

        const currentUser = room.participants.find(
          (e) => e.user_id !== MyProfile?._id
        );

        if (currentUser) {
          const userStatus = userStatusData.find(
            (e) => e?._id === currentUser.user_id
          );
          return userStatus ? userStatus.status !== "offline" : false;
        }
        return false;
      default:
        return false;
    }
  }

  function myUserIdExist(data: any[] = []) {
    return data.findIndex(
      (item: { user_id: any }) => item.user_id === MyProfile?._id
    ) !== -1;
  }

  function resolveRoomTimestamp(room: RoomData): string {
    const rawTimestamp = room?.last_msg?.[0]?.created_at ?? room?.updated_at;
    if (rawTimestamp === undefined || rawTimestamp === null) return "";

    if (typeof rawTimestamp === "number") {
      if (!Number.isFinite(rawTimestamp) || rawTimestamp <= 0) return "";
      return String(rawTimestamp);
    }

    const numericFromString = Number(rawTimestamp);
    if (Number.isFinite(numericFromString)) {
      if (numericFromString <= 0) return "";
      return String(numericFromString);
    }

    return String(rawTimestamp);
  }

  function unArchive(id: string) {
    const myId = MyProfile?._id;
    const syncRoomsFromServer = () => {
      socketManager.chatRoom.fetchAndUpdateRooms((data: { rooms: RoomData[] }) => {
        if (!data?.rooms) return;
        const archives = data.rooms.filter((room) =>
          (room?.archivedBy || []).some((entry: any) => {
            const uid =
              typeof entry?.user_id === "string"
                ? entry.user_id
                : entry?.user_id?._id || entry?.user_id?.id || "";
            return uid === myId;
          })
        );
        setAllRooms(data.rooms);
        setArchiveRooms(archives);
      });
    };

    const nextRooms = produce(AllRooms || [], (draftrooms) => {
      return draftrooms.map((room) => {
        if (room._id !== id) return room;
        const archivedBy = (room?.archivedBy || []).filter((entry: any) => {
          const uid =
            typeof entry?.user_id === "string"
              ? entry.user_id
              : entry?.user_id?._id || entry?.user_id?.id || "";
          return uid !== myId;
        });
        return {
          ...room,
          archivedBy,
          isArchived: archivedBy.length > 0,
        };
      });
    });

    setAllRooms(nextRooms);
    setArchiveRooms((ArchiveRooms || []).filter((room) => room._id !== id));

    unArchiveRoomRequest({
      variables: {
        input: { roomId: id },
      },
    }).then((res) => {
      if (res.data?.unArchiveRoom.success) {
        syncRoomsFromServer();
        ToastMessage(`${t("toastmessage.unArchived-message")}`);
      } else {
        syncRoomsFromServer();
      }
    }).catch(() => {
      syncRoomsFromServer();
    });
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
});
