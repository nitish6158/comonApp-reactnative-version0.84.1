import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";

import Colors from "@/Constants/Colors";
import Feather from "react-native-vector-icons/Feather";
import { FlatList, RefreshControl } from "react-native-gesture-handler";
import Ionicons from "react-native-vector-icons/Ionicons";
import { RootState } from "@Store/Reducer";
import { ShowCallTimeUI } from "./CallTimer";
import { useFocusEffect } from "@react-navigation/core";
import { useAddParticipantsMutation, useGetParticipantsFromContactLazyQuery } from "@Service/generated/call.generated";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Icon from "@Assets/images/Icon";
import { fonts } from "@/Constants";
import { callAtom } from "@/Atoms";
import ToastMessage from "@Util/ToastMesage";
import dayjs from "dayjs";

type participantsType = {
  _id: string;
  uid: number;
  profile_img: string;
  userName: string;
  callStatus: string;
  micEnable: boolean;
  pId: string;
  createdAt: string;
};

type CallParticipantsModeType = {
  switchToFullCallMode: () => void;
  duration: string;
  participants: participantsType[];
  callID: string;
  isReceiver: boolean;
  setFormattedParticipants: (data) => {};
};

export const participantsFormatted = atom<Array<participantsType>>([]);

export default function CallParticipantsMode({
  switchToFullCallMode,
  setFormattedParticipants,
  duration,
  participants,
  callID,
}: CallParticipantsModeType) {
  const [callingLoader, setCallingLoader] = useState(false);
  const [refreshing, setRefershing] = useState<boolean>(false);
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const { comonContact } = useSelector((state: RootState) => state.Contact);
  const [getCallParticipant, getCallParticipantResponse] = useGetParticipantsFromContactLazyQuery();
  const [addParticipantRequest, addParticipantResponse] = useAddParticipantsMutation();

  const [parti, setParti] = useAtom(participantsFormatted);
  const updatePart = useSetAtom(participantsFormatted);

  const { t } = useTranslation();

  useFocusEffect(useCallback(getParticipants, [participants.length, callID]));
  const onRefesh = useCallback(() => {
    getParticipants();
  }, []);

  return (
    <View style={styles.main}>
      <View style={styles.headerContainer}>
        <Pressable style={styles.headerContainer_BackContainer} onPress={switchToFullCallMode}>
          <Ionicons name="chevron-back" size={26} color="black" />
          <Text style={styles.headerContainer_BackContainer_text}>{t("calls.participants")}</Text>
        </Pressable>
        <ShowCallTimeUI color="black" />
      </View>
      <FlatList
        onRefresh={onRefesh}
        refreshControl={<RefreshControl refreshing={getCallParticipantResponse.loading} onRefresh={onRefesh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        data={parti}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          const { callStatus, createdAt, profile_img, userName, status, micEnable } = item;

          const isTimePassed = dayjs().diff(createdAt, "seconds") > 90;
          const inCall = callStatus === "In call";

          //there is 4 condition when Your can call Participant again
          const canCallAgain =
            (isTimePassed && callStatus == "calling") ||
            (isTimePassed && status === "missed") ||
            status === "rejected" ||
            callStatus === "Left call";

          const notAnswered = (status === "missed" && isTimePassed) || (callStatus === "calling" && isTimePassed);
          const leftCall = callStatus === "Left call" && status !== "rejected";

          const callStatusText = inCall
            ? t("inCall")
            : notAnswered
            ? t("NotAnswered")
            : status === "rejected"
            ? "Rejected"
            : leftCall
            ? t("leftCall")
            : "Ringing";

          return (
            <View key={index} style={styles.participantItemContainer}>
              <View style={styles.participantItemContainer_details}>
                <Image source={{ uri: DefaultImageUrl + profile_img }} style={styles.participantItemContainer_image} />
                <View style={styles.participantItemContainer_NameContainer}>
                  <Text style={styles.participantItemContainer_NameContainer_Name}>{userName}</Text>
                  <Text
                    style={[
                      styles.call_status,
                      inCall && { color: "green" },
                      callStatus === "Left call" && { color: "red" },
                    ]}
                  >
                    {callStatusText}
                  </Text>
                </View>
              </View>
              {canCallAgain && !inCall ? (
                <Pressable onPress={() => handlePressCall(item)}>
                  <Icon.AudioCall fontSize={12} />
                </Pressable>
              ) : (
                <Pressable style={micEnable ? styles.microphoneEnableContainer : styles.microphoneDisableContainer}>
                  <Feather name={micEnable ? "mic" : "mic-off"} size={22} color="white" />
                </Pressable>
              )}
            </View>
          );
        }}
      />

      {callingLoader && (
        <View style={styles.container}>
          <Text style={{ color: Colors.light.White, marginBottom: 20, fontFamily: fonts.Lato, fontSize: 20 }}>
            {t("Calling..")}.
          </Text>
          <ActivityIndicator size={20} color={Colors.light.White} />
        </View>
      )}
    </View>
  );

  function handlePressCall(item: participantsType) {
    setCallingLoader(true);
    const participant = typeof item?.userId == "object" ? [item?.userId?._id] : [item?.userId];
    const payload = {
      variables: {
        input: {
          callId: callID,
          participants: participant,
        },
      },
    };
    // console.log("Payload", JSON.stringify(payload));
    addParticipantRequest(payload)
      .then((response) => {
        if (response.errors) {
          console.error("Error in adding participant in error first callback", response.errors);
          setCallingLoader(false);
          return;
        }
        if (response.data?.addParticipants) {
          updatePart((prev) =>
            prev.map((prv) => ({
              ...prv,
              callStatus: prv.uid === item.uid ? "calling" : prv.callStatus,
            }))
          );
          let mapped = participants.map((prv) => {
            return {
              ...prv,
              callStatus: prv.uid === item.uid ? "calling" : prv.callStatus,
            };
          });
          setFormattedParticipants(mapped);
          switchToFullCallMode();
        }
        setCallingLoader(false);
      })
      .catch((Err) => {
        console.error("Error in adding participant in call participant mode", Err);
        setCallingLoader(false);
      });
  }

  function getParticipants() {
    getCallParticipant({
      variables: {
        input: {
          _id: callID,
        },
      },
      fetchPolicy: "network-only",
      nextFetchPolicy: "network-only",
    }).then((res) => {
      if (res.data?.getParticipantsFromContact) {
        const data = res.data?.getParticipantsFromContact
          .map((cp) => {
            const isCom = comonContact.filter((cc) => cc?.userId?._id == cp?._id);
            const ppd = participants.find((pp) => pp.pId == cp._id);
            try {
              if (isCom.length > 0) {
                return {
                  ...ppd,
                  status: cp.callStatus,
                  userName: `${isCom[0].firstName} ${isCom[0].lastName}`,
                  profile_img: cp?.profile_img,
                  createdAt: cp.createdAt,
                };
              } else {
                return { ...ppd, userName: cp.userName, profile_img: cp?.profile_img, createdAt: cp.createdAt };
              }
            } catch (error) {
              console.log(error);
            }
          })
          .filter((mp) => mp?.pId != MyProfile?._id);

        setParti(data ?? []);

        // setFormattedParticipants(data ?? participants);
      }
      setRefershing(false);
    });
  }
}

const styles = StyleSheet.create({
  call_status: {
    color: "rgba(51,51,51,.6)",
    fontSize: 14,
    marginTop: 2,
  },
  headerContainer: {
    alignItems: "center",
    borderBottomColor: "rgba(51,51,51,.2)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 30,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  headerContainer_BackContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  headerContainer_BackContainer_icon: {},
  headerContainer_BackContainer_text: {
    color: "black",
    fontSize: 17,
    marginLeft: 10,
  },
  headerContainer_durationText: {
    color: "black",
    fontSize: 16,
  },
  main: {
    flex: 1,
  },
  microPhoneImage: {},
  microphoneDisableContainer: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 20,
    height: 35,
    justifyContent: "center",
    opacity: 0.5,
    width: 35,
  },
  microphoneEnableContainer: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 20,
    height: 35,
    justifyContent: "center",
    width: 35,
  },
  participantItemContainer: {
    alignItems: "center",
    borderBottomColor: "rgba(51,51,51,.1)",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  participantItemContainer_NameContainer: {
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginLeft: 10,
  },
  participantItemContainer_NameContainer_Name: {
    fontSize: 16,
    fontWeight: "400",
  },
  participantItemContainer_details: {
    alignItems: "center",
    flexDirection: "row",
    // marginLeft: 10,
    maxWidth: "80%",
  },
  participantItemContainer_image: {
    borderRadius: 25,
    height: 45,
    width: 45,
  },
  participantsContainer: {
    flex: 1,
    marginTop: 20,
  },
  container: {
    flex: 1,
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.7)",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});
