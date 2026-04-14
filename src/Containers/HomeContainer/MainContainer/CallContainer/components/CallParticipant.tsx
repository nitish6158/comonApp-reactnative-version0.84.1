import { Alert, Image, Pressable, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { Block, HStack, Picture, Typography } from "rnmuilib";
import { DefaultImageUrl, GroupUrl } from "@Service/provider/endpoints";
import { IOngoingCall, groupCallActiveData } from "@Atoms/callActiveStatusAtom";
import React, { useMemo, useState } from "react";
import { SenderType, callAtom } from "@Atoms/callAtom";
import { callFullScreenState, callMiniScreenState } from "@Atoms/GlobalCallController";
import { useAtom, useAtomValue } from "jotai";

import Colors from "@/Constants/Colors";
import FastImage from "@d11/react-native-fast-image";
import Icon from "@Images/Icon";
import InCallButton from "./InCallButtton";
import { InternetAtom } from "@Atoms/InternetAtom";
import JoinCallButton from "./JoinCallButton";
import Model from "react-native-modal";
import { MyCallListReponse } from "@Service/generated/types";
import RNText from "react-native";
import { RootState } from "@Store/Reducer";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { checkCallPermissions } from "@Util/permission";
import { navigate } from "@Navigation/utility";
import { useNavigation } from "@react-navigation/core";
import { useSelector } from "react-redux";
import useTimeHook from "@Hooks/useTimeHook";
import { useTranslation } from "react-i18next";

export type CallParticipantProps = {
  name: string;
  categoryId?: string;
  lastSeen: string;
  type: string;
  mode: string;
  time: string;
  phone: string;
  roomType: "contact" | "contact_group" | "group" | "individual" | string;
  ProfileImage: any;
  item: MyCallListReponse;
  callRequestData: {
    callType: string;
    roomType: string;
    roomId: string;
    callBackground: string;
    roomName: string;
    participants: number[];
    isReceiver: false;
  };
  isAllCalls?: boolean;
  isGroupCallStillActive?: undefined | IOngoingCall;
};

function CallParticipant(props: CallParticipantProps) {
  const navigation = useNavigation();

  const {
    name,
    type,
    mode,
    time,
    lastSeen,
    categoryId,
    phone,
    roomType,
    ProfileImage,
    item,
    callRequestData,
    isAllCalls,
  } = props;

  const { time: date } = useTimeHook(parseInt(time));
  const [onGoingCallsData] = useAtom(groupCallActiveData);
  const [callRequest, setCallRequest] = useAtom(callAtom);
  const [, toggleFullScreenMode] = useAtom(callFullScreenState);
  const [, toggleMiniScreenMode] = useAtom(callMiniScreenState);
  const [internet] = useAtom(InternetAtom);
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const { t } = useTranslation();
  const [isCallRequestModel, setIsCallRequestModel] = useState<boolean>(false);

  const isBlocked = useMemo(() => {
    const isRoomBlocked = MyProfile?.blockedRooms?.filter((blr) => blr?.room_Id === callRequestData?.roomId).length > 0;
    const isUserBlocked = MyProfile?.blockedRooms?.filter((blr) => blr?.pid === MyProfile?._id).length > 0;
    return isRoomBlocked || isUserBlocked;
  }, [callRequestData, MyProfile]);

  const isGroupCallStillActive = useMemo(() => {
    const isExist = onGoingCallsData.filter((gc) => gc.roomId == callRequestData.roomId);
    if (isExist) {
      return isExist[0];
    } else {
      return null;
    }
  }, [callRequestData, onGoingCallsData]);

  const OnCallPress = async () => {
    setIsCallRequestModel(false);
    if (!isBlocked) {
      if (internet) {
        if (callRequest == null) {
          const res = await checkCallPermissions(callRequestData.callType === "audio" ? "audio" : "video");
          if (res === true) {
            if (roomType == "contact" || roomType == "contact_group") {
              const par = [...callRequestData.participants, MyProfile?._id];
              setCallRequest({
                ...callRequestData,
                participants: par,
              });
            } else {
              setCallRequest(callRequestData);
            }
          }
        } else {
          ToastMessage(`${t("toastmessage.incall-already-message")}`);
        }
      } else {
        Alert.alert(
          "",
          t("others.Couldn't place call. Make sure your device have an internet connection and try again")
        );
      }
    } else {
      ToastMessage(t("label.not-allowed-to-make-call"));
    }
  };

  const onItemPress = () => {
    if (item.call) {
      navigate("CallHistoryScreen", {
        userDetails: {
          name: name,
          phone: phone,
          profile_img: ProfileImage,
          roomType: roomType,
          lastSeen: lastSeen,
          callType: type,
          callRequestData: callRequestData,
          callStartedAt: date,
          participants: item?.call?.callParticipants,
        },
        categoryId: categoryId,
      });
    }
  };

  async function onPressJoinCall() {
    const res = await checkCallPermissions(isGroupCallStillActive?.type === "audio" ? "audio" : "video");
    if (res == true) {
      if (callRequest == null) {
        const partipantsData = isGroupCallStillActive?.callParticipants.map((e) => {
          if (e.userId._id) {
            return {
              ...e.userId,
              userId: e.userId._id,
              uid: e.uid,
            };
          }
          return e;
        });

        setCallRequest({
          roomName: name,
          isReceiver: true,
          callId: isGroupCallStillActive?._id,
          channelId: isGroupCallStillActive?.channelName,
          channelName: isGroupCallStillActive?.channelName,
          roomId: callRequestData.roomId,
          callType: isGroupCallStillActive?.type,
          roomType: isGroupCallStillActive?.roomType,
          participants: partipantsData,
          callBackground: callRequestData.callBackground,
        });
      } else {
        if (item.call?._id == callRequest.callId) {
          toggleFullScreenMode(true);
          toggleMiniScreenMode(false);
        } else {
          ToastMessage(`${t("toastmessage.already-incall-canjoin")}`);
        }
      }
    }
  }

  const CallTimer = () => {
    return (
      <View style={styles.rightMain}>
        <View>
          <Typography fontSize={12} color={Colors.light.grayText}>
            {date}
          </Typography>
        </View>
        <Pressable
          onPress={() => onItemPress()}
          // eslint-disable-next-line react-native/no-inline-styles
          style={{ width: 30, height: 30, alignItems: "center", justifyContent: "center" }}
        >
          <Block>
            <Icon.info
              // eslint-disable-next-line react-native/no-inline-styles
              style={{
                height: 40,
                width: 50,
                marginLeft: 10,
              }}
            />
          </Block>
        </Pressable>
      </View>
    );
  };

  return (
    <>
      <View
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16 }}
      >
        <Pressable
          style={styles.main}
          onPress={() => {
            if (isGroupCallStillActive?.roomId && callRequest?.roomId) {
              if (isGroupCallStillActive?.roomId != callRequest?.roomId) {
                setIsCallRequestModel(true);
              }
            } else {
              if (item.call) {
                setIsCallRequestModel(true);
              }
            }
          }}
        >
          <View style={styles.leftMain}>
            <Image
              source={{
                uri: `${DefaultImageUrl}${ProfileImage}`,
              }}
              style={{ height: 45, width: 45, borderRadius: 25 }}
            />
            <View style={{ marginLeft: 10, flexGrow: 1 }}>
              <Text numberOfLines={2}>
                {item.call?.roomType == "contact_group"
                  ? `${item.call.callParticipants.length - 3 != 0 ? name.slice(0, 14) + "..." : name}`
                  : name}
                {item.call?.roomType == "contact_group" &&
                  item.call.callParticipants.length - 3 != 0 &&
                  ` +${item.call.callParticipants.length - 3}`}
                {item.count > 1 && ` (${item.count})`}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", paddingTop: 3 }}>
                <FastImage
                  source={type?.[mode == "AUDIO" ? "audioIcon" : "videoIcon"]}
                  resizeMode="contain"
                  style={{ height: 16, width: 16, marginRight: 6 }}
                />

                <Typography fontSize={14} color={Colors.light.grayText}>
                  {t(`${type?.msg}`)}
                </Typography>
              </View>
            </View>
          </View>
        </Pressable>

        {isAllCalls &&
        isGroupCallStillActive &&
        Object.keys(isGroupCallStillActive).length &&
        isGroupCallStillActive?.channelName == item.call?.channelName ? (
          <>
            {isGroupCallStillActive?.channelName == callRequest?.channelId ? (
              <InCallButton />
            ) : (
              <JoinCallButton onPress={onPressJoinCall} />
            )}
          </>
        ) : (
          <CallTimer />
        )}
      </View>
      <Model onBackButtonPress={() => setIsCallRequestModel(false)} isVisible={isCallRequestModel}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
          <View
            style={{
              height: 200,
              width: "100%",
              backgroundColor: "white",
              borderRadius: 20,
              justifyContent: "space-around",
              alignItems: "center",
              paddingVertical: 10,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 18, marginBottom: 10, fontWeight: "600" }}>
                {`${t("others.Do you want to start")} ${item.call?.type} ${t("others.call ?")}`}
              </Text>
              <RNText.Text style={{ fontSize: 16, textAlign: "center", maxWidth: "70%", color: "rgba(51,51,51,.7)" }}>
                {name}
              </RNText.Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                width: "100%",
                paddingHorizontal: 20,
              }}
            >
              <Pressable
                onPress={() => setIsCallRequestModel(false)}
                style={{
                  // marginTop: 30,
                  backgroundColor: "rgba(240,240,240,1)",
                  paddingHorizontal: 30,
                  paddingVertical: 10,
                  borderRadius: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: Colors.light.PrimaryColor }}>{t("others.Cancel")}</Text>
              </Pressable>
              <Pressable
                onPress={OnCallPress}
                style={{
                  // marginTop: 30,
                  backgroundColor: Colors.light.PrimaryColor,
                  paddingHorizontal: 30,
                  paddingVertical: 10,
                  borderRadius: 20,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white" }}>{t("others.Call")}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Model>
    </>
  );
}

const styles = StyleSheet.create({
  leftMain: {
    alignItems: "center",
    flexDirection: "row",
  },
  main: {
    // alignItems: "center",
    // flexDirection: "row",
    // justifyContent: "space-between",
    paddingVertical: 16,
    width: "60%",
  },
  rightMain: {
    alignItems: "center",
    flexDirection: "row",
  },
});

export default CallParticipant;
