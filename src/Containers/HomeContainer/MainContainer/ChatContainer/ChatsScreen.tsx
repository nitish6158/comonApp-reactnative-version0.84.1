import { AllChatRooms, FolderAndTabsAtom } from "@Atoms/allRoomsAtom";
import {
  Platform,
  Pressable,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  RoomActionData,
  RoomData,
  RoomMsgData,
  RoomParticipantData,
} from "@Store/Models/ChatModel";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import ArchiveContainer from "./ArchiveScreen/ArchiveChats";
import ChatComponent from "@/Components/SingleRoomComponent";
import Colors from "@/Constants/Colors";
import Header from "@/Components/header/Header";
import HiddenItem from "./HiddenFile";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import RealmContext from "../../../../schemas";

import { SwipeListView } from "react-native-swipe-list-view";
import TopTabs from "./ChatFolderContainer/TopFolderTabs";
import { conversationLimit } from "@Atoms/ChatMessageEvents";

import { navigate } from "@Navigation/utility";

import { socket } from "@/redux/Reducer/SocketSlice";
import store, { useAppSelector } from "@/redux/Store";
import useRoomLastMessage from "@/hooks/useRoomLastMessage";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import EmptyRoomList from "./ChatFolderContainer/EmptyFolderList";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { single } from "rxjs";
import { defaultgroupPermission, initialDisplayState, singleRoom } from "@/Atoms";
import { ChatContext } from "@/Context/ChatProvider";
import { useFocusEffect } from "@react-navigation/core";
import { socketManager } from "@/utils/socket/SocketManager";
import FastImage from "@d11/react-native-fast-image";
import LottieView from "lottie-react-native";
import NetInfo from "@react-native-community/netinfo";
import { t } from "i18next";
// const { useQuery, useRealm } = RealmContext;

export type participants = {
  // added_at: number;
  firstName: string; //
  lastName: string; //
  left_at: number;
  phone: number; //
  profile_img: string; //
  sound: null | string;
  unread_cid: string[];
  user_id: string; //
  user_type: string;
  lastSeen: string;
  status: string;
  wallpaper: null | string;
  notOnContact: boolean;
};

function getParticipantId(user: any): string {
  return String(
    user?.user_id?._id ??
      user?.user_id ??
      user?._id ??
      user?.userId?._id ??
      user?.pid ??
      ""
  );
}

function normalizePhone(value: any): string {
  return String(value ?? "").replace(/\D/g, "");
}

function getCandidateIds(user: any): string[] {
  return Array.from(
    new Set(
      [
        user?.user_id?._id,
        user?.user_id,
        user?._id,
        user?.userId?._id,
        user?.user?._id,
        user?.pid,
        user?.uid,
        user?.id,
      ]
        .map((item) => String(item ?? ""))
        .filter(Boolean)
    )
  );
}

function getCandidatePhones(user: any): string[] {
  return Array.from(
    new Set(
      [
        user?.phone,
        user?.userId?.phone,
        user?.user?.phone,
        user?.data?.phone,
      ]
        .map(normalizePhone)
        .filter(Boolean)
    )
  );
}

function isOnlineStatus(status: string): boolean {
  return status === "online" || status === "available" || status === "active";
}

export default function ChatsScreen({ navigation }: any) {
  // const allUserStatus = useRealm();
  const setdisplay = useSetAtom(singleRoom);
  const [AllRooms, setAllRooms] = useAtom(AllChatRooms);
  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);
  const currentTab = useAtomValue(FolderAndTabsAtom);
  const setLimit = useSetAtom(conversationLimit);
  const commonContact = useAppSelector((state) => state.Contact.comonContact);
  const contacts = useAppSelector((state) => state.Contact.contacts);
  const [filteredRooms, setFilteredRooms] = useState<RoomData[]>([]);
  const { formateLastMessage } = useRoomLastMessage();
  const { setRoomId, setConversation } = useContext(ChatContext);
  const [refreshing, setRefreshing] = useState(false);
  const [networkOffline, setNetworkOffline] = useState<boolean>(false);
  const [activeContacts, setActiveContacts] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkOffline(!state.isConnected);
    });

    return () => {
      unsubscribe(); // cleanup listener
    };
  }, []);

  const activeContactLookup = useMemo(() => {
    const ids = new Map<string, string>();
    const phones = new Map<string, string>();

    activeContacts.forEach((contact) => {
      const status = String(
        contact?.status ?? contact?.userId?.status ?? ""
      ).toLowerCase();

      getCandidateIds(contact).forEach((id) => {
        ids.set(id, status);
      });

      getCandidatePhones(contact).forEach((phone) => {
        phones.set(phone, status);
      });
    });

    return { ids, phones };
  }, [activeContacts]);

  useEffect(() => {
    let isMounted = true;

    const refreshActiveContacts = () => {
      socketManager.chatRoom.getActiveContacts((data: any) => {
        const nextContacts = Array.isArray(data)
          ? data
          : Array.isArray(data?.activeContacts)
          ? data.activeContacts
          : [];

        if (isMounted) {
          setActiveContacts(nextContacts);
        }
      });
    };

    refreshActiveContacts();
    const interval = setInterval(refreshActiveContacts, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      setdisplay(initialDisplayState);
      setConversation([]);
    }, [])
  );

  useEffect(() => {
    // console.log('initial displaye called')
    // setdisplay(initialDisplayState);
    if (currentTab == 0) {
      const removeArchivedChat = AllRooms?.filter(
        (r) =>
          !myUserIdExist(r.archivedBy, MyProfile?._id ?? "") &&
          !myUserIdExist(r.deletedBy, MyProfile?._id ?? "") &&
          !myUserIdExist(r.fixedBy, MyProfile?._id ?? "")
      );

      const pinnedChat = AllRooms?.filter((r) =>
        myUserIdExist(r.fixedBy, MyProfile?._id ?? "")
      );

      setFilteredRooms([...pinnedChat, ...removeArchivedChat]);
    } else {
      const selectedFolder = MyProfile?.folders.find(
        (fl, fli) => fli == currentTab - 1
      );
      console.log("currentTab", currentTab, selectedFolder);
      if (selectedFolder) {
        const result = AllRooms?.filter(
          (r) =>
            selectedFolder?.roomId.includes(r._id) &&
            !myUserIdExist(r.archivedBy, MyProfile?._id ?? "")
        );
        setFilteredRooms([...result]);
      }
    }
    setRefreshing(false);
  }, [currentTab, AllRooms, MyProfile?._id, MyProfile?.folders]);

  function getRoomDisplayName(room: RoomData) {
    if (room.type !== "individual") return room.display.UserName;
    if (!MyProfile?._id) return room.display.UserName;

    const otherUser = room.participants?.find((p) => getParticipantId(p) !== MyProfile?._id);
    if (!otherUser) return room.display.UserName;

    const otherUserId = getParticipantId(otherUser);
    const found = contacts.find((c) => c.userId?._id === otherUserId);
    if (found) {
      const fullName = `${found.firstName ?? ""} ${found.lastName ?? ""}`.trim();
      if (fullName) return fullName;
    }

    const participantName = `${otherUser.firstName ?? ""} ${otherUser.lastName ?? ""}`.trim();
    if (participantName) return participantName;

    return room.display.UserName;
  }

  if (refreshing) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <LottieView
          style={{ height: 300, width: 300 }}
          source={require("../../../../../assets/lottie/chatloading.json")}
          autoPlay
          loop
        />

        <FastImage
          style={{ height: 40, width: 40, borderRadius: 30, marginBottom: 30 }}
          source={require("../../../../../assets/images/avatar/IndivitualAvtaar.png")}
        />
        <>
          <Text
            style={{ fontSize: 18, color: "rgba(51,51,51,1)", marginTop: 5 }}
          >
            {t("chat-screen.loading-chats")}
          </Text>
          <Text
            style={{ fontSize: 14, color: "rgba(51,51,51,.7)", marginTop: 5 }}
          >
            {t("chat-screen.fetch-chats")}
          </Text>
        </>
      </View>
    );
  }
  if (filteredRooms.length < 1 && networkOffline && !refreshing) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <FastImage
          style={{ height: 40, width: 40, borderRadius: 30, marginBottom: 30 }}
          source={require("../../../../../assets/images/avatar/IndivitualAvtaar.png")}
        />
        <>
          <Text
            style={{ fontSize: 18, color: "rgba(51,51,51,1)", marginTop: 5 }}
          >
            {t('chat-screen.unable-to-load-chat-from-storage')}
          </Text>
          <Text
            style={{ fontSize: 14, color: "rgba(51,51,51,.7)", marginTop: 5 }}
          >
            {t('chat-screen.try-again')}
          </Text>
        </>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Header />
      <TopTabs />
      <ArchiveContainer />
      <SwipeListView
        data={filteredRooms}
        extraData={contacts}
        keyExtractor={(item, index) => item._id.toString()}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          socketManager.chatRoom.fetchAndUpdateRooms((data) => {
            if (data.rooms) {
              setAllRooms(data.rooms);
            }
          });
          setTimeout(() => {
            setRefreshing(false);
          }, 3000);
        }}
        renderItem={({ item, index }) => {
    
          //user visibility status
          const userStatusVisible = checkUserStatusVisibility(item);
          const roomLastMessage = formateLastMessage(item);
          const roomDisplayName = getRoomDisplayName(item);

          return (
            <View key={index.toString()}>
              <ChatComponent
                roomData={item}
                clearChat={item?.last_msg[0]?.clear}
                UserImage={item.display.UserImage}
                isUnreadByMe={myUserIdExist(
                  item?.unreadBy,
                  MyProfile?._id ?? ""
                )}
                date={resolveRoomTimestamp(item)}
                Message={roomLastMessage}
                isMutedByMe={myUserIdExist(item?.mutedBy, MyProfile?._id ?? "")}
                isPin={myUserIdExist(item?.fixedBy, MyProfile?._id ?? "")}
                Name={roomDisplayName}
                isOnline={userStatusVisible}
                showAlert
                chatclear={item?.last_msg[0]?.message?.clear}
                onPressContinaer={() => {
                  const currentUserUtility =
                    item.participants?.find((participant) => getParticipantId(participant) === MyProfile?._id) ??
                    ({} as RoomParticipantData);
                  const participantsNotLeft =
                    item.participants?.filter((participant) => participant.left_at === 0) ?? [];

                  setdisplay({
                    ...initialDisplayState,
                    roomId: item._id,
                    roomType: item.type,
                    roomName: roomDisplayName,
                    roomImage: item.display.UserImage,
                    roomDescription: item.bio?.status ?? "",
                    roomStatus: item.display?.userStatus ? "online" : "offline",
                    roomLastSeen: Number(item.display?.lastSeen) || 0,
                    participants: item.participants ?? [],
                    participantsNotLeft,
                    roomPermission: defaultgroupPermission,
                    isCurrentRoomMuted: myUserIdExist(item?.mutedBy, MyProfile?._id ?? ""),
                    currentUserUtility,
                    log: item.log,
                    cacheTime: Date.now(),
                    ringtone: item.ringtone ?? [],
                    receipts: item.receipts ?? [],
                  });
                  setLimit(20);
                  socketConnect.emit("removeDisappearedChats", { roomId: item?._id });
                  setRoomId(item?._id);
                  socketManager.conversation.onSetChatReadBy((data) => {
                    console.log('Chat read by:', data);
                  })
                  navigate("ChatMessageScreen", {
                    RoomId: item?._id,
                  });
                }}
              />
            </View>
          );
        }}
        renderHiddenItem={(rowData, rowMap) => (
          <HiddenItem
            data={rowData}
            rowMap={rowMap}
            isArchive="archiveRoom"
            navigation={navigation}
          />
        )}
        leftOpenValue={140}
        rightOpenValue={-160}
        ListEmptyComponent={EmptyRoomList}
      />

      {commonContact.length > 0 && (
        <Pressable
          onPress={() => {
            navigate("CreateChatRooms", {});
          }}
          style={{
            height: 50,
            width: 50,
            backgroundColor: Colors.light.PrimaryColor,
            marginBottom: 20,
            position: "absolute",
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 50,
            right: 20,
          }}
        >
          <MaterialIcons name="chat" size={26} color="white" />
        </Pressable>
      )}
    </View>
  );

  function checkUserStatusVisibility(room: RoomData) {
    switch (room.type) {
      case "broadcast":
      case "group":
        return false;
      case "individual":
        if (!room?.participants) {
          return false;
        }

        if (room.blocked) {
          return false;
        }

        const currentUser = room.participants.find(
          (e) => getParticipantId(e) !== String(MyProfile?._id ?? "")
        );

        if (!currentUser) {
          return false;
        }

        const currentUserIds = getCandidateIds(currentUser);
        const currentUserPhones = getCandidatePhones(currentUser);
        const matchedStatusById = currentUserIds.find((id) =>
          isOnlineStatus(activeContactLookup.ids.get(id) ?? "")
        );

        if (matchedStatusById) {
          return true;
        }

        const matchedStatusByPhone = currentUserPhones.find((phone) =>
          isOnlineStatus(activeContactLookup.phones.get(phone) ?? "")
        );

        return Boolean(matchedStatusByPhone);
      default:
        return false;
    }
  }
  function myUserIdExist(data: any[] = [], currenUserId: string) {
    return (
      data.findIndex((item: any) => {
        const userId = item?.user_id;
        const altUserId = item?.userId;
        const normalizedUserId =
          (typeof userId === "string" ? userId : userId?._id || userId?.id || "") ||
          (typeof altUserId === "string" ? altUserId : altUserId?._id || altUserId?.id || "") ||
          item?.pid ||
          item?._id ||
          "";
        return normalizedUserId == currenUserId;
      }) !== -1
    );
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
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.White,
    flex: 1,
  },
});
