import React, { useMemo } from "react";
import { View, Pressable, Image, StyleSheet, Alert } from "react-native";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useNavigation } from "@react-navigation/core";
import { useTranslation } from "react-i18next";
import _ from 'lodash';

// Custom hooks and components
import { navigate } from "@Navigation/utility";
import { windowHeight } from "@Util/ResponsiveView";
import { checkCallPermissions } from "@Util/permission";
import Message from "@Images/Profile/message.svg";
import Colors from "@/Constants/Colors";

// Components

import Text from '@Components/Text';
import LastSeenView from '../components/LastSeenView';
import CallActions from '../components/CallActions';
import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import { callFullScreenState, callMiniScreenState, groupCallActiveData, InternetAtom, singleRoom } from "@/Atoms";
import { useAppSelector } from "@/redux/Store";

// Define props type for clarity
interface ProfileImageProps {
  lastSeen: {
    time: string;
    status: string;
    isBlocked: boolean;
  };
  isBroadcastRoom: boolean;
  hasPermission?: boolean;
}

function ProfileImage({
  lastSeen,
  isBroadcastRoom,
  hasPermission
}: ProfileImageProps) {
  const navigation = useNavigation();
  const [display] = useAtom(singleRoom);
  const contacts = useAppSelector((state) => state.Contact.contacts);
  const myProfileId = useAppSelector((state) => state.Chat.MyProfile?._id);
  const onGoingCallsData = useAtomValue(groupCallActiveData);
  const [internet] = useAtom(InternetAtom);
  const toggleFullScreenMode = useSetAtom(callFullScreenState);
  const toggleMiniScreenMode = useSetAtom(callMiniScreenState);

  const { t } = useTranslation();

  // Memoize group calls data to prevent unnecessary re-renders
  const groupCallsData = useMemo(() => {
    const isExist = onGoingCallsData.filter((gl) => gl.roomId === display.roomId);
    return isExist.length ? isExist[0] : null;
  }, [onGoingCallsData, display.roomId]);

  // Determine if audio and video buttons should be hidden
  const hideAudioAndVideo = useMemo(() => {
    if (isBroadcastRoom) {
      return true;
    }

    if (display.roomType === "individual") {
      return display.isCurrentRoomBlocked && !display.isMyself;
    }

    if (display.roomType === "self") {
      return true;
    }

    if (display.roomType === "group") {
      return display.participantsNotLeft.length === 1;
    }

    return false;
  }, [
    display.roomType,
    display.isCurrentRoomBlocked,
    display.isMyself,
    display.participantsNotLeft,
    isBroadcastRoom
  ]);

  const liveRoomName = useMemo(() => {
    if (display.roomType !== "individual") return display.roomName;
    const otherParticipant = display.participants?.find((p) => p.user_id !== myProfileId);
    if (!otherParticipant) return display.roomName;

    const found = contacts.find((c) => c.userId?._id === otherParticipant.user_id);
    if (found) {
      const fullName = `${found.firstName ?? ""} ${found.lastName ?? ""}`.trim();
      if (fullName) return fullName;
    }

    const participantName = `${otherParticipant.firstName ?? ""} ${otherParticipant.lastName ?? ""}`.trim();
    return participantName || display.roomName;
  }, [display, contacts, myProfileId]);

  return (
    <View style={{ backgroundColor: "white" }}>
      {/* Profile Image */}
      <View style={styles.imageCon}>
        <Image
          source={{
            uri: `${DefaultImageUrl}${display.isCurrentRoomBlocked ? ImageUrl : display.roomImage}`,
          }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Call Container with User Info & Call Actions */}
      <View style={styles.CallCon}>
        {/* User/Room Name & Last Seen Status */}
        <View style={{ width: 200, justifyContent: "center" }}>
          <Text
            size="lg"
            style={{ fontWeight: "500", fontFamily: "Lato" }}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {liveRoomName}
          </Text>

          <LastSeenView
            roomType={display.roomType}
            participants={display.participants}
            isCurrentRoomBlocked={display.isCurrentRoomBlocked}
            isMyself={display.isMyself}
            lastSeen={lastSeen}
          />
        </View>

        {/* Call Actions (Message, Audio, Video) */}
        {display.currentUserUtility.left_at === 0 && !display.isMyself && (
          <View style={styles.CallIconCon}>
            <Pressable onPress={() => navigation.goBack()}>
              <Message />
            </Pressable>

            <CallActions
              display={display}
              internet={internet}
              groupCallsData={groupCallsData}
              hideAudioAndVideo={hideAudioAndVideo}
              toggleFullScreenMode={toggleFullScreenMode}
              toggleMiniScreenMode={toggleMiniScreenMode}
            />
          </View>
        )}
      </View>

      {/* Group Description Section */}
      {display.currentUserUtility.left_at === 0 && (display.roomType === "group" || isBroadcastRoom) && (
        <Pressable
          style={styles.DateNamecon}
          onPress={() => {
            navigate("ChatDescriptionScreen", {
              RoomId: display.roomId,
              OldStatus: display.roomDescription,
            });
          }}
        >
          <View style={{ paddingVertical: 5 }}>
            <Text
              size="md"
              style={{
                fontFamily: "Lato",
                color: _.isEmpty(display.roomDescription) ? "rgba(51,51,51,.5)" : "black"
              }}
              lineNumber={5}
            >
              {_.isEmpty(display.roomDescription)
                ? isBroadcastRoom
                  ? t("addGroupDesc")
                  : `${t("chatProfile.add-group-description")}`
                : display.roomDescription}
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

// define your styles
const styles = StyleSheet.create({
  CallCon: {
    backgroundColor: Colors.light.LightBlue,
    flexDirection: "row",
    height: 76,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  CallIconCon: {
    flexDirection: "row",
    alignItems: "center"
  },
  CallSpace: {
    marginHorizontal: 8
  },
  DateNamecon: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 12,
    paddingBottom: 10
  },
  image: {
    height: "100%",
    width: "100%"
  },
  imageCon: {
    height: windowHeight / 2.3
  },
});

export default React.memo(ProfileImage);
