import { Alert, Image, Platform, Pressable, View } from "react-native";
import { Block, HStack } from "rnmuilib";
import React, { useMemo, useState } from "react";

import BouncyCheckbox from "react-native-bouncy-checkbox";
import Colors from "@/Constants/Colors";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import Icon from "@Images/Icon";
import { InternetAtom } from "@Atoms/InternetAtom";
import { RootState } from "@Store/Reducer";
import Text from "@Components/Text";
import _ from "lodash";
import { callAtom } from "@Atoms/callAtom";
import { checkCallPermissions } from "@Util/permission";
import { serverContactType } from "@Store/Reducer/ContactReducer";
import styles from "../ProfileContainer/contacts/ContactStyles";
import { useAtom } from "jotai";
import { useNavigation } from "@react-navigation/core";
import { useSelector } from "react-redux";
import useTimeHook from "@Hooks/useTimeHook";
import { useTranslation } from "react-i18next";

export const replaceNumberPhone = (phone?: string) => {
  return phone?.replace(/[-)(]/gi, "").split(" ").join("");
};

type propType = {
  participant: serverContactType & { isSelected: boolean };
  // onParticipantClicked: (participant: serverContactType) => void;
  isGroup: boolean;
  onGroupParticipantSelection: (isSelected: boolean) => void;
  changeMode: (isGroup: boolean) => void;
  isMyself: boolean;
  lastSeen: number;
};

function CallContact({ participant, isGroup, onGroupParticipantSelection, changeMode, isMyself, lastSeen }: propType) {
  const [callRequest, setCallRequest] = useAtom(callAtom);
  const [internet] = useAtom(InternetAtom);
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const { t } = useTranslation();

  const user = {
    userId: participant?.userId._id,
    number: participant?.phone,
    profileImage: participant?.userId.profile_img,
  };

  const isBlocked = MyProfile?.blockedRooms?.filter((blr) => blr.pid === participant?.userId?._id)?.length > 0;

  const { time } = useTimeHook(lastSeen);

  //If Participant is Blocked then don not render UI on participant selection.
  if (isGroup && isBlocked) {
    return <></>;
  }

  return (
    <Pressable
      disabled={isBlocked}
      style={[{ paddingHorizontal: 5 }, isBlocked && { opacity: 0.5 }]}
      onLongPress={() => changeMode(true)}
    >
      <View style={[styles.contact, { marginLeft: 10, marginRight: 5 }]}>
        {participant.userId?.profile_img ? (
          <Image source={{ uri: `${DefaultImageUrl}${participant.userId?.profile_img}` }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, isBlocked && isGroup && { marginLeft: 40 }]}>
            <Text size="md">{participant.firstName[0]}</Text>
          </View>
        )}
        <View style={styles.content}>
          <Text size="md" lineNumber={2}>{`${participant.firstName ?? ""} ${participant.lastName ?? ""}`}</Text>
          <Block height={4} />
          {participant.hasComon ? (
            lastSeen ? (
              <Text size="xs" style={{ color: Colors.light.grayText }}>
                {isBlocked ? "Blocked" : `${t("others.Last Seen")} at ${time}`}
              </Text>
            ) : (
              <></>
            )
          ) : (
            <Text size="xs" style={{ color: Colors.light.grayText }}>{`${participant.phone}`}</Text>
          )}
        </View>
        <Block flex={1} />
        {!isGroup && !isBlocked && (
          <HStack marginHorizontal={20}>
            {!isMyself && (
              <>
                <Pressable
                  // disabled={loading}
                  onPress={async () => {
                    const res = await checkCallPermissions("audio");
                    if (res === true) {
                      if (internet) {
                        setCallRequest({
                          callType: "audio",
                          roomType: "contact",
                          roomId: null,
                          callBackground: user.profileImage,
                          roomName: participant.firstName + " " + participant.lastName,
                          participants: [user.userId, MyProfile?._id],
                          isReceiver: false,
                        });
                      } else {
                        Alert.alert(
                          "",
                          t(
                            "others.Couldn't place call. Make sure your device have an internet connection and try again"
                          )
                        );
                      }
                    }
                  }}
                >
                  <Icon.AudioCall fontSize={12} />
                </Pressable>
                <Block width={8} />
                <Pressable
                  // disabled={loading}
                  onPress={async () => {
                    const res = await checkCallPermissions("video");
                    if (res === true) {
                      if (internet) {
                        setCallRequest({
                          callType: "video",
                          roomType: "contact",
                          roomId: null,
                          callBackground: user.profileImage,
                          roomName: participant.firstName + " " + participant.lastName,
                          participants: [user.userId, MyProfile?._id],
                          isReceiver: false,
                        });
                      } else {
                        Alert.alert(
                          "",
                          t(
                            "others.Couldn't place call. Make sure your device have an internet connection and try again"
                          )
                        );
                      }
                    }
                  }}
                >
                  <Icon.VideoCall />
                </Pressable>
              </>
            )}
          </HStack>
        )}
        {isGroup && (
          <BouncyCheckbox
            onPress={(isChecked: boolean) => !isBlocked && onGroupParticipantSelection(isChecked)}
            fillColor={Colors.light.PrimaryColor}
          />
        )}
      </View>
    </Pressable>
  );
}

export default CallContact;
