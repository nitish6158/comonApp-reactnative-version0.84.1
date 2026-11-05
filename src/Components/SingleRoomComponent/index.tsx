import Animated from "react-native-reanimated";
import { Image, Pressable, View } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import Color from "@/Constants/Colors";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import FormatTextRender from "../formatTextRender";
import { Hidemessage } from "@Types/types";
import Info from "@Images/Info.svg";
import Mute from "@Images/mute.svg";
import Pin from "@Images/pin.svg";

import { RootState } from "@Store/Reducer";
import { Styles } from "./Styles";
import Text from "../Text";
import { cloneDeep } from "@Util/helpers/customLodash";
import { currentUserIdAtom } from "@/Atoms";
import fonts from "@/Constants/fonts";
import { useAtomValue } from "jotai";
import { useSelector } from "react-redux";
import useTimeHook, { useTimeHookNew } from "@Hooks/useTimeHook";
import { RoomData, RoomParticipantData } from "@/redux/Models/ChatModel";


interface ChatProps {
  roomData: RoomData;
  isOnline?: boolean;
  date?: string;
  Name?: string;
  UserImage?: string;
  Message?: string;
  isUnreadByMe?: boolean;
  isMutedByMe?: boolean;
  isPin?: boolean;
  showAlert?: true;
  info?: true;
  onPressContinaer: () => {};
  chatclear?: boolean;
}
export default function SingleRoomComponent({
  roomData,
  date,
  Name,
  isPin,
  Message,
  isMutedByMe,
  info,
  showAlert,
  isOnline,
  onPressContinaer,
  isUnreadByMe,
  UserImage,
  chatclear,
}: Readonly<ChatProps>) {
  const { comonContact } = useSelector((state: RootState) => state.Contact);
  const MyProfile = useAtomValue(currentUserIdAtom);

  const { time } = useTimeHookNew(date);
  // const { time } = useTimeHook(date);
  const unreadCount = useMemo(() => {
    if (typeof roomData?.unread === "number") {
      return roomData.unread;
    }

    const participants = Array.isArray(roomData?.participants)
      ? roomData.participants
      : [];
    const me = participants.find((participant: any) => {
      const uid = participant?.user_id;
      const normalizedUserId =
        typeof uid === "string" ? uid : uid?._id || uid?.id || "";
      return normalizedUserId === MyProfile?._id;
    });

    if (Array.isArray(me?.unread_cid)) {
      return me.unread_cid.length;
    }

    return 0;
  }, [roomData?.unread, roomData?.participants, MyProfile?._id]);

  const FormattedMessage = useMemo(() => {
    const regex = /@\[([^\]]+)\]\(([a-zA-Z0-9]{24})\)/g;
    let resultMessage = Message;

    if (resultMessage) {
      const matches = resultMessage.match(regex) ?? [];

      if (matches.length > 0) {
        const ids = [];
        for (let i = 0; i < matches?.length; i++) {
          const start = matches[i].indexOf("(");
          const end = matches[i].indexOf(")");
          const userID = matches[i].slice(start + 1, end);
          const phoneStart = matches[i].indexOf("[");
          const phoneEnd = matches[i].indexOf("]");
          const phone = matches[i].slice(phoneStart + 1, phoneEnd - 1);

          if (MyProfile?._id == userID) {
            ids?.push("You");
          } else {
            const isExist = comonContact.find((contact) => contact.userId?._id == userID);
            if (isExist) {
              ids?.push(`${isExist.firstName} ${isExist.lastName}`);
            } else {
              ids?.push(phone);
            }
          }
        }

        for (let i = 0; i < matches.length; i++) {
          resultMessage = resultMessage?.replace(matches[i], ` @${ids[i]}  @`);
        }
      }
    }
    return resultMessage ?? "";
  }, [roomData.type, Message, roomData.participants, comonContact, MyProfile?._id]);

  const normalizedUserImage =
    typeof UserImage === "string" ? UserImage.trim() : "";
  const hasValidUserImage =
    normalizedUserImage.length > 0 &&
    normalizedUserImage !== "null" &&
    normalizedUserImage !== "undefined";
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [normalizedUserImage, roomData?.type]);

  const avatarSource = useMemo(() => {
    if (hasValidUserImage && !imageLoadFailed) {
      return { uri: `${DefaultImageUrl}${normalizedUserImage}` };
    }

    if (roomData?.type === "broadcast" || roomData?.type === "group") {
      return require("../../../assets/images/groupImage.png");
    }

    return require("../../../assets/images/avatar/IndivitualAvtaar.png");
  }, [normalizedUserImage, hasValidUserImage, imageLoadFailed, roomData?.type]);

  return (
    <Animated.View>
      <Pressable onPress={onPressContinaer}>
        <View style={[Styles.Container]}>
          <View style={Styles.AvataarContainer}>
            <Image
              source={avatarSource}
              style={{ height: "100%", width: "100%" }}
              onError={() => {
                if (hasValidUserImage) {
                  setImageLoadFailed(true);
                }
              }}
            />
          </View>
          {roomData?.type == "broadcast" && (
            <Image source={require("../../../assets/images/broadcast.png")} style={Styles.broadcastLogo} />
          )}
          {isOnline && roomData?.type == "individual" && <View style={Styles.onLine} />}

          <View style={Styles.TextandIconContainer}>
            <View style={Styles.NameCon}>
              <Text size="md" style={Styles.roomName} numberOfLines={1}>
                {Name}
              </Text>
              <View style={Styles.TimeIconCon}>
                {date && !chatclear ? (
                  <Text style={{ fontSize: 12, color: Color.light.grayText, fontFamily: fonts.Lato }}>{`${time}`}</Text>
                ) : null}

                {info && <Info style={{ marginLeft: 6 }} />}
              </View>
            </View>
            <View style={Styles.messageContainer}>
              <Text style={{ fontSize: 14, width: "70%" }}>
                <FormatTextRender message={FormattedMessage} />
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "center", width: "30%" }}>
                {isMutedByMe && <Mute style={{ marginLeft: 5 }} />}
                {isPin && <Pin style={{ marginHorizontal: 5 }} />}
                <UnreadChatMessages
                  unread={unreadCount}
                  isUnreadByMe={!!isUnreadByMe}
                />
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

type unreadProps = {
  unread: number;
  isUnreadByMe: boolean;
};

function UnreadChatMessages({ unread, isUnreadByMe }: Readonly<unreadProps>) {
  return (
    <View style={Styles.NotifyCon}>
      {(unread > 0 || isUnreadByMe) && (
        <View style={Styles.UnreadMessageIcon}>
          {unread > 0 ? (
            <Text style={{ fontSize: 9, color: Color.light?.background }}>{unread}</Text>
          ) : (
            <Text style={{ fontSize: 9, color: Color.light?.background }}> </Text>
          )}
        </View>
      )}
    </View>
  );
}
