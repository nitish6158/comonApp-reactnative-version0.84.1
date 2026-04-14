import { AnyAction, Dispatch } from "redux";
import { DoubleUserAction, LastMessageType, ScreensList, SingleUserAction } from "@Types/types";
import { FlatList, StyleSheet, View } from "react-native";
import { RoomData, RoomParticipantData } from "@Store/Models/ChatModel";
import { useDispatch, useSelector } from "react-redux";

import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatComponent from "@Components/SingleRoomComponent";
import Colors from "@/Constants/Colors";
import { ImageUrl } from "@Service/provider/endpoints";
import React from "react";
// import RealmContext from "../../../../../../schemas";
import { RootState } from "@Store/Reducer";
import Text from "@Components/Text";
import { currentUserIdAtom } from "../../../../../../Atoms/RealmloginManager";
import { isEmpty } from "lodash";
import { navigate } from "@Navigation/utility";
import { useAtomValue } from "jotai";
import { useCreateRoomMutation } from "@Service/generated/room.generated";

import { useTranslation } from "react-i18next";

import useRoomLastMessage from "@/hooks/useRoomLastMessage";
import { socketManager } from "@/utils/socket/SocketManager";
import { socketConnect } from "@/utils/socket/SocketConnection";

// const { useQuery } = RealmContext;

interface ContactlistProps {
  setLoading: (value) => void;
  navigation: any;
  Data: {
    Name: string;
    Message: string;
    Timing: string;
    image: {
      uri: string;
    };
  };
  otherUsers?: {
    Name: string;
    Message: string;
    Timing: string;
    image: {
      uri: string;
    };
  };
  onlychat: {
    Name: string;
    Message: string;
    Timing: string;
    image: {
      uri: string;
    };
  };
  otherUsersProfileData?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    profile_img: string;
    status: string;
    lastSeen?: number;
  }>;
}
[];

const HeaderTitle = ({ Name }: String | undefined) => {
  return (
    <View style={styles.HeaderContainer}>
      <Text style={styles.headerText}>{Name}</Text>
    </View>
  );
};

function getFormattedMessage(message: string, t: any) {
  switch (message) {
    case "IMAGE":
      return t("image");
    case "contact":
      return t("contact");
    case "VIDEO":
      return t("videoType");
    case "AUDIO":
      return t("audioType");
    case "DOCUMENT":
      return t("document");
    default:
      return message;
  }
}

function Contactlist({ setLoading, otherUsers, onlychat, navigation, otherUsersProfileData }: ContactlistProps) {
  const { t } = useTranslation();
  const Dispatch = useDispatch();
  const MyProfile = useAtomValue(currentUserIdAtom);
  const { formateLastMessage } = useRoomLastMessage();
  const { comonContact, contacts } = useSelector((state: RootState) => state.Contact);

  const [createRoomRequest, createRoomResponse] = useCreateRoomMutation();
  // const allUserStatus = useQuery("user");

  async function fetchFormattedRoom(roomId: string) {
    return await new Promise<any>((resolve) => {
      let settled = false;
      const settleOnce = (data: any) => {
        if (!settled) {
          settled = true;
          resolve(data);
        }
      };

      socketManager.chatRoom.getFormattedRoomById(roomId, (data) => {
        settleOnce(data);
      });

      setTimeout(() => settleOnce(null), 1200);
    });
  }

  async function restoreIfNeeded(roomId: string) {
    const roomData = await fetchFormattedRoom(roomId);
    const leftAt = roomData?.room?.currentUserUtility?.left_at ?? 0;
    if (leftAt <= 0) {
      return;
    }

    // Some socket backends expect object payload and some expect raw id.
    await socketConnect.emit("undeleteRoom", { roomId } as any);
    await socketConnect.emit("undeleteRoom", roomId as any);
    socketManager.chatRoom.fetchAndUpdateRooms(() => {});

    // Wait until room participant status is updated.
    for (let attempt = 0; attempt < 8; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const updatedRoomData = await fetchFormattedRoom(roomId);
      const updatedLeftAt = updatedRoomData?.room?.currentUserUtility?.left_at ?? 0;
      if (updatedLeftAt <= 0) {
        return;
      }
    }
  }

  function getMessage(itemMessage: any[], participants: RoomParticipantData[], item: RoomData) {
    const lastMsg: { created_at: string; message: string; sender: string; type: string } = itemMessage[0];

    let message = "";
    const finduser = comonContact.find((item) => item.userId?._id == lastMsg.sender);
    const participantdata = participants.find((item) => item?.user_id == lastMsg.sender);
    let LastMessageSenderName = "";
    let sameUser = false;
    if (MyProfile?._id == lastMsg?.sender) {
      LastMessageSenderName = "You";
    } else {
      LastMessageSenderName = finduser ? `${finduser?.firstName} ${finduser?.lastName}` : participantdata?.phone;
    }
    if (
      lastMsg?.type === "addedUser" &&
      (typeof lastMsg?.message === "string" ? JSON.parse(lastMsg?.message)?.pid === MyProfile?._id : false)
    ) {
      sameUser = true;
    }
    switch (lastMsg.type) {
      case "poll":
        return t("chatPoll.new-poll-last-message");
      case "audioCall":
        const splitted = lastMsg?.type?.replace("Call", "");
        const callType = splitted == "audio" ? t("audio") : t("video");
        return (message = `${LastMessageSenderName} ${t("started")} ${callType} ${t("call")}`);
      case "videoCall":
        return (message = `${LastMessageSenderName} ${t("started")}  ${callType} ${t("call")}`);
      case "IMAGE":
        return (message = `${LastMessageSenderName} ${t("shared")} ${getFormattedMessage(lastMsg.type, t)}`);
      case "contact":
        return (message = `${LastMessageSenderName} ${t("shared")} ${getFormattedMessage(lastMsg.type, t)}`);

      case "VIDEO":
        return (message = `${LastMessageSenderName} ${t("shared")} ${getFormattedMessage(lastMsg.type, t)}`);

      case "AUDIO":
        return (message = `${LastMessageSenderName} ${t("shared")} ${getFormattedMessage(lastMsg.type, t)}`);
      case "DOCUMENT":
        return (message = `${LastMessageSenderName} ${t("shared")} ${getFormattedMessage(lastMsg.type, t)}`);

      case "addedUser":
        return (message = sameUser ? `${LastMessageSenderName} ${t("addedYou")}` : t("userAdded"));
        break;
      case "changedName":
        return (message = t("groupNameChange"));
        break;
      case "removedUser":
        return (message = t("userRemoved"));
        break;
      case "changedDescription":
        return (message = t("groupDesc"));
        break;
      case "createdRoom":
        return (message = t("groupCreated"));
        break;
      case "leftRoom":
        return (message = t("leftRoom"));
      case "invited":
        const parsedMsg = JSON.parse(lastMsg?.message);
        const getContact = contacts.find((e) => e?.userId?._id == lastMsg?.sender);
        let inviterName = "";
        if (getContact) {
          inviterName = `${getContact?.firstName} ${getContact?.lastName}`;
        } else {
          inviterName = item?.display?.UserName;
        }
        if (lastMsg?.sender == MyProfile?._id) {
          return (message = `${t("youInvited")} ${inviterName} ${t("joinOrg")} ${parsedMsg?.orgName}`);
        } else {
          return (message = `${inviterName} ${t("invitedOrg")} ${parsedMsg?.orgName}`);
        }
      case "declined":
        const msg = JSON.parse(lastMsg?.message);
        if (lastMsg?.sender == MyProfile?._id) {
          return (message = `${t("declinedOrg")} ${msg?.orgName}`);
        } else {
          return (message = `${item?.display?.UserName} ${t("hasDeclined")} ${msg?.orgName}`);
        }
      case "taskAssigned":
        const contact = contacts.find((e) => e?.userId?._id == lastMsg?.sender);
        let name = "";
        if (getContact) {
          name = `${contact?.firstName} ${contact?.lastName}`;
        } else {
          name = item?.display?.UserName;
        }
        const orgName = JSON.parse(lastMsg?.message);
        if (lastMsg?.sender == MyProfile?._id) {
          return (message = `${t("assignedNewTask")} ${orgName?.scenarioName} ${t("to")} ${name}`);
        } else {
          return (message = `${name} ${t("hasAssigned")} ${orgName?.scenarioName}`);
        }
      default:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return (message = lastMsg.message);
    }
  }

  function myUserIdExist(data: any[]) {
    return data.findIndex((item: { user_id: any }) => item.user_id._id == MyProfile?._id) !== -1;
  }

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

        const currentUser = room.participants.find((e) => e.user_id !== MyProfile?._id);

        if (currentUser) {
         
          return  false;
        }
        return false;
      default:
        return false;
    }
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

  const RenderChat = ({ Item }: { Item: Array<{}> }) => {
    let roomLastMessage = formateLastMessage(Item);
    const userStatusVisible = checkUserStatusVisibility(Item);

    return (
      <View style={styles.container}>
        <ChatComponent
          roomData={Item}
          clearChat={Item?.last_msg[0]?.clear}
          UserImage={Item.display.UserImage}
          isUnreadByMe={myUserIdExist(Item?.unreadBy)}
          date={resolveRoomTimestamp(Item)}
          Message={roomLastMessage}
          isMutedByMe={myUserIdExist(Item?.mutedBy)}
          isPin={myUserIdExist(Item?.fixedBy)}
          Name={Item.display.UserName}
          isOnline={userStatusVisible}
          showAlert
          chatclear={Item?.last_msg[0]?.message?.clear}
          onPressContinaer={async () => {
            await restoreIfNeeded(Item?._id);
            navigate("ChatMessageScreen", {
              RoomId: Item?._id,
            });
          }}
        />
      </View>
    );
  };
  const OtherContacts = ({ Item }) => {
    const { firstName, _id, lastName, phone, userId } = Item;
    let profileImage = "";
    if (otherUsersProfileData?.length) {
      profileImage = otherUsersProfileData?.find((e) => e._id === Item?.userId?._id)?.profile_img;
    }

    const userName = `${firstName} ${lastName ?? ""}`;

    const isBlocked = MyProfile?.blockedRooms?.filter((blr) => blr?.pid == Item?._id)?.length;
    return (
      <>
        {/* {MyProfile?._id !== Item?._id && ( */}
        <View style={styles.container}>
          <ChatComponent
            roomData={{ ...Item, _id: Item?.userId?._id }}
            Message={phone}
            UserImage={isBlocked > 0 ? ImageUrl : profileImage}
            Name={userName}
            onPressContinaer={async () => {
              setLoading(true);
              try {
                console.log(Item?.userId?._id, MyProfile?._id);
                const res = await createRoomRequest({
                  variables: {
                    input: {
                      type: "individual",
                      users: [Item?.userId?._id],
                      localId: "0",
                      profile_img: null,
                      name: "",
                    },
                  },
                });

                if (res.data?.createRoom.success) {
                  const roomId = res.data.createRoom.roomId;
                  if (res.data.createRoom.isAlreadyExists) {
                    await restoreIfNeeded(roomId);
                  }

                  navigate("ChatMessageScreen", {
                    RoomId: roomId,
                  });
                }
              } finally {
                setLoading(false);
              }
            }}
          />
        </View>
        {/* )} */}
      </>
    );
  };

  return (
    <>
      {!isEmpty(onlychat) && <HeaderTitle Name={t("navigation.chats")} />}

      <FlatList
        data={onlychat}
        renderItem={({ item }: any) => {
          return <RenderChat Item={item} />;
        }}
      />
      {!isEmpty(otherUsers) && <HeaderTitle Name={t("errors.contacts.other-contacts")} />}

      <FlatList
        data={otherUsers}
        renderItem={({ item }: any) => {
          return <OtherContacts Item={item} />;
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  HeaderContainer: { backgroundColor: Colors.light.HighLighter, marginVertical: 10, paddingVertical: 6 },
  container: {
    backgroundColor: Colors.light.background,
    flex: 1,
  },
  headerText: { marginLeft: 20 },
});

export default Contactlist;
