import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { HStack, Picture } from "rnmuilib";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  covertUtcToLocalDate,
  getCallHistoryDate,
  getLastSeen,
} from "@Util/date";
import { incoming, outgoing } from "@Util/CallHistoryIcon";
import {
  ParticipantTypes,
  useGetCallListWithAParticipantLazyQuery,
  useGetCallListWithAParticipantQuery,
} from "@Service/generated/call.generated";

import Call from "@Images/Profile/call.svg";
import { CallWithParticipant } from "@Service/generated/scenario.generated";
import Colors from "@/Constants/Colors";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import { InternetAtom } from "@Atoms/InternetAtom";
import Message from "@Images/Profile/message.svg";
import { RootState } from "@Store/Reducer";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { Typography } from "rnmuilib";
import VideoCall from "@Images/Profile/VideoCall.svg";
import { callAtom } from "@Atoms/callAtom";
import { checkCallPermissions } from "@Util/permission";
import dayjs from "dayjs";
import { navigate } from "@Navigation/utility";
import { participants } from "../ChatContainer/ChatsScreen";
import { useAtom } from "jotai";
import { useFocusEffect } from "@react-navigation/core";
import { useSelector } from "react-redux";
import useTimeHook from "@Hooks/useTimeHook";
import { useTranslation } from "react-i18next";
import { windowHeight } from "@Util/ResponsiveView";
import { Loader } from "@Components/Loader";
import { ListItem } from "react-native-elements";
import FastImage from "@d11/react-native-fast-image";
import moment from "moment";
import { fonts } from "@/Constants";
import Feather from "react-native-vector-icons/Feather";

const { width } = Dimensions.get("window");

// create a component
export default function CallHistoryDetails({ navigation, route }: any) {
  const { userDetails, categoryId } = route.params;
  const [history, setHistory] = useState<CallWithParticipant[]>([]);
  const [isHistoryListLoading, setIsHistoryListLoading] =
    useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [particpants, setParticipants] = useState<ParticipantTypes[]>([]);
  const [expanded, setExpanded] = useState({
    activeExpandedList: "",
    status: false,
  });
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const [callRequest, setCallRequest] = useAtom(callAtom);
  const [internet] = useAtom(InternetAtom);
  const { t } = useTranslation();
  const [getHistoryRequest, getHistoryResponse] =
    useGetCallListWithAParticipantLazyQuery({ fetchPolicy: "no-cache" });
  const commonContact = useSelector(
    (state: RootState) => state.Contact.comonContact
  );

  useFocusEffect(
    useCallback(() => {
      setHistory([]);
      getHistoryRequest({
        variables: {
          input: {
            categoryId: categoryId,
            skip: 0,
            take: 20,
          },
        },
      }).then((res) => {
        if (res.error) {
          setLoading(false);
        }

        if (res.data?.getCallListWithAParticipant) {
          setHistory(res.data?.getCallListWithAParticipant);
        }
        setLoading(false);
      });
    }, [])
  );

  function msToTime(s: any) {
    const ms = s % 1000;
    s = (s - ms) / 1000;
    const secs = s % 60;
    s = (s - secs) / 60;
    const mins = s % 60;
    const hrs = (s - mins) / 60;

    // let str = hrs > 0 ? hrs + " hours" : "";
    // str = mins ? (str ? ", " + str + mins + " Minutes" : str + mins + " Minutes") : "";
    // str = secs ? (str ? ", " + str + secs + " Seconds" : str + secs + " Seconds") : "";

    return `${hrs > 0 ? hrs + ` ${t("hours")}` : ""} ${
      mins > 0 ? mins + ` ${t("minutes")}` : ""
    } ${secs > 0 ? secs + ` ${t("seconds")}` : ""}`;
  }

  const sDate = "" + history[0]?.callStartedAt;
  const LastSeen = getLastSeen(parseInt(sDate));
  const { time } = useTimeHook(userDetails?.lastSeen);
  // const Day: any = getCallHistoryDate(userDetails?.lastSeen);

  const SinglePersonCallHistory = ({ item }: { item: CallWithParticipant }) => {
    const otherUser = item.callParticipants.filter(
      (cp) => cp.userId._id != MyProfile?._id
    );
    const initiator = MyProfile?._id === item.origin?._id ? true : false;
    if (otherUser.length > 1) {
      const profileImage = initiator
        ? MyProfile?.profile_img
        : otherUser.find((e) => e?.userId?._id == item?.origin?._id)?.userId
            ?.profile_img;
      let callTime = 0;
      item?.callParticipants.forEach((participant) => {
        const timeDiff =
          participant?.callHistory[0]?.callEndedAt -
          participant?.callHistory[0]?.callJoinedAt;

        if (callTime <= timeDiff) {
          callTime = timeDiff;
        }
      });

      const differenceTime = callTime;

      return (
        <View style={{}}>
          <View
            style={[
              styles.rowDirection,
              { marginHorizontal: 10, marginTop: 10, alignItems: "flex-start" },
            ]}
          >
            <View>
              <FastImage
                source={{ uri: `${DefaultImageUrl}${profileImage}` }}
                style={{ height: 80, width: 80, borderRadius: 80 }}
              />
            </View>
            <View style={{ margin: 10, marginLeft: 15 }}>
              <View style={styles.rowDirection}>
                <Feather
                  name={initiator ? "arrow-up-right" : "arrow-down-left"}
                  color={
                    initiator
                      ? Colors.light.PrimaryColor
                      : Colors.light.onlineGreen
                  }
                  size={20}
                  style={{ marginRight: 0 }}
                />

                <Text
                  style={{
                    fontSize: 14,
                    color: initiator
                      ? Colors.light.PrimaryColor
                      : Colors.light.onlineGreen,
                    lineHeight: 17,
                    fontFamily: fonts.Lato,
                  }}
                >
                  {initiator ? t("OUTGOING") : t("INCOMING")}
                </Text>
              </View>

              <Text
                style={{
                  fontSize: 12,
                  lineHeight: 15,
                  fontFamily: fonts.Lato,
                  color: Colors.light.grayText,
                  marginTop: 3,
                }}
              >
                {moment(item?.callStartedAt)?.format("DD MMM, hh:mm")}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  lineHeight: 15,
                  fontFamily: fonts.Lato,
                  color: Colors.light.grayText,
                  marginTop: 3,
                }}
              >
                {msToTime(differenceTime)}
              </Text>
            </View>
          </View>
          {otherUser.map((e, i) => {
            const status = e?.callStatus;
            const callStatus = initiator ? outgoing[status] : incoming[status];

            const type = item.type;
            const callStartedAt =
              e.callHistory.length > 0 ? e.callHistory[0].callJoinedAt : 0;
            const callEndedAt =
              e.callHistory.length > 0 ? e.callHistory[0].callEndedAt : 0;
            const diff = parseInt(callEndedAt) - parseInt(callStartedAt);
            const timeFormatter = diff != 0 ? msToTime(diff) : "";
            const localContact = commonContact.find(
              (el) => el?.userId?._id == e?.userId?._id
            );
            const name = localContact?.firstName
              ? `${localContact.firstName} ${localContact?.lastName}`
              : e?.userId?.phone;

            return (
              <View
                key={i}
                style={{
                  paddingHorizontal: 20,
                  marginTop: 10,
                  borderBottomWidth: 1.5,
                  borderColor: Colors.light.gray,
                }}
              >
                <View
                  key={item?._id}
                  style={{
                    marginVertical: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <FastImage
                      source={{
                        uri: `${DefaultImageUrl}${e.userId?.profile_img}`,
                      }}
                      style={{
                        height: 40,
                        width: 40,
                        borderRadius: 30,
                        marginRight: 10,
                      }}
                    />
                    {/* <Picture
                      source={callStatus?.[type == "audio" ? "audioIcon" : "videoIcon"]}
                      height={20}
                      style={{ marginRight: 10 }}
                      width={20}
                      resizeMode="contain"
                    /> */}
                    <View>
                      <Text ellipsizeMode={"tail"}>{name}</Text>
                      {timeFormatter && (
                        <Text
                          style={{
                            color: Colors.light.grayText,
                            lineHeight: 24,
                          }}
                        >
                          {timeFormatter}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View>
                    <Typography
                      style={{ lineHeight: 24 }}
                      fontSize={14}
                      textTransform="capitalize"
                    >
                      {t(`${status.toUpperCase()}`)} {t("call")}
                    </Typography>
                    {/* {item.callStartedAt && (
                      <Text style={{ fontSize: 14, textAlign: "right" }}>
                        {covertUtcToLocalDate(item.callStartedAt).format("HH:mm")}
                      </Text>
                    )} */}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      );
    } else {
      const status = otherUser[0].callStatus;

      const callStatus = initiator ? outgoing[status] : incoming[status];
      const type = item.type;
      const callStartedAt =
        otherUser[0].callHistory.length > 0
          ? otherUser[0].callHistory[0].callJoinedAt
          : 0;
      const callEndedAt =
        otherUser[0].callHistory.length > 0
          ? otherUser[0].callHistory[0].callEndedAt
          : 0;
      const diff = parseInt(callEndedAt) - parseInt(callStartedAt);
      const timeFormatter = diff != 0 ? msToTime(diff) : "";

      return (
        <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
          <View
            key={item?._id}
            style={{
              marginVertical: 10,
              flexDirection: "row",
              borderBottomWidth: 1.5,
              borderColor: Colors.light.gray,
              paddingBottom: 10,
            }}
          >
            {item.callStartedAt && (
              <Text style={{ fontSize: 14 }}>
                {covertUtcToLocalDate(item.callStartedAt).format("HH:mm")}
              </Text>
            )}
            <Picture
              source={callStatus?.[type == "audio" ? "audioIcon" : "videoIcon"]}
              height={20}
              style={{ marginLeft: 20, marginRight: 10 }}
              width={20}
              resizeMode="contain"
            />
            <View style={{ justifyContent: "center" }}>
              <Typography fontSize={14} textTransform="capitalize">
                {t(`${status.toUpperCase()}`)} {t("call")}
              </Typography>

              {timeFormatter && (
                <Text
                  style={{
                    color: Colors.light.grayText,
                    lineHeight: 24,
                    marginTop: 5,
                  }}
                >
                  {timeFormatter}
                </Text>
              )}
            </View>
          </View>
        </View>
      );
    }
  };

  const MultiPersonCallHistory = useCallback(
    ({
      item,
      participants,
    }: {
      item: CallWithParticipant;
      participants: ParticipantType[];
    }) => {
      const otherUser = item.callParticipants.filter(
        (cp) => cp.userId._id != MyProfile?._id
      );
      const currentUser = item.callParticipants.filter(
        (cp) => cp.userId._id == MyProfile?._id
      );
      const initiator = MyProfile?._id === item.origin?._id ? true : false;
      const status = otherUser[0].callStatus;
      const callStatus = initiator
        ? outgoing[status == "missed" ? "initiator" : status]
        : incoming[status];
      const callStartedAt =
        otherUser[0].callHistory.length > 0
          ? otherUser[0].callHistory[0].callJoinedAt
          : 0;
      const callEndedAt =
        otherUser[0].callHistory.length > 0
          ? otherUser[0].callHistory[0].callEndedAt
          : 0;

      const diff = parseInt(callEndedAt) - parseInt(callStartedAt);
      const date = dayjs().isSame(item.callStartedAt, "day")
        ? t("others.Today")
        : dayjs().subtract(1, "day").isSame(dayjs(item.callStartedAt), "day")
        ? t("others.Yesterday")
        : dayjs(item.callStartedAt).format("DD.MM.YYYY");
      const timeFormatted = diff != 0 ? msToTime(diff) : "";
      return (
        <ListItem.Accordion
          isExpanded={expanded.activeExpandedList == item?._id ? true : false}
          containerStyle={{
            borderBottomWidth: 1.5,
            borderColor: Colors.light.gray,
          }}
          onPress={() => {
            // console.log("OOnPres");
            if (expanded.activeExpandedList != item?._id) {
              setExpanded({
                activeExpandedList: item?._id,
                status: true,
              });
            } else {
              setExpanded({
                activeExpandedList: "",
                status: false,
              });
            }
            setParticipants(otherUser);
          }}
          content={
            <View
              style={{
                paddingRight: 20,
                flexDirection: "row",
                borderRadius: 15,
                width: "85%",
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  // backgroundColor: "rgba(51,51,51,.1)",
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                  borderTopLeftRadius: 20,
                  borderBottomLeftRadius: 20,
                }}
              >
                <Text style={{ marginBottom: 5, fontSize: 14 }}>{date}</Text>
                <Text style={{ color: "rgba(51,51,51,.5)", fontSize: 12 }}>
                  {covertUtcToLocalDate(item.callStartedAt).format("HH:mm")}
                </Text>
              </View>
              <View style={{ marginLeft: 20, justifyContent: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Picture
                    source={
                      callStatus?.[
                        item.type == "audio" ? "audioIcon" : "videoIcon"
                      ]
                    }
                    height={15}
                    style={{ marginRight: 5 }}
                    width={15}
                    resizeMode="contain"
                  />
                  <Text style={{ color: "black", fontSize: 15, marginLeft: 5 }}>
                    {currentUser.length > 0
                      ? t(`${currentUser[0].callStatus.toUpperCase()}`)
                      : ""}
                  </Text>
                </View>
                {timeFormatted.length > 0 && (
                  <Text style={{ marginLeft: 20, fontSize: 14, color: "gray" }}>
                    {timeFormatted}
                  </Text>
                )}
              </View>
            </View>
          }
        >
          {expanded.activeExpandedList == item?._id &&
            participants.map((e, i) => {
              const status = e?.callStatus;

              const callStatus = initiator
                ? outgoing[status]
                : incoming[status];

              const type = item.type;
              const callStartedAt =
                e.callHistory.length > 0 ? e.callHistory[0].callJoinedAt : 0;
              const callEndedAt =
                e.callHistory.length > 0 ? e.callHistory[0].callEndedAt : 0;
              const diff = parseInt(callEndedAt) - parseInt(callStartedAt);
              const timeFormatter = diff != 0 ? msToTime(diff) : "";
              const localContact = commonContact.find(
                (el) => el?.userId?._id == e?.userId?._id
              );
              const name = localContact?.firstName
                ? `${localContact.firstName} ${localContact?.lastName}`
                : e?.userId?.phone;
              return (
                <View
                  key={i}
                  style={{
                    paddingHorizontal: 20,
                    marginTop: 10,
                    borderBottomWidth: 1.5,
                    borderColor: Colors.light.gray,
                  }}
                >
                  <View
                    key={item?._id}
                    style={{
                      marginVertical: 10,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Picture
                        source={
                          callStatus?.[
                            type == "audio" ? "audioIcon" : "videoIcon"
                          ]
                        }
                        height={20}
                        style={{ marginRight: 10 }}
                        width={20}
                        resizeMode="contain"
                      />
                      <View>
                        <Text ellipsizeMode={"tail"}>{name}</Text>
                        {timeFormatter && (
                          <Text
                            style={{
                              color: Colors.light.grayText,
                              lineHeight: 24,
                            }}
                          >
                            {timeFormatter}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View>
                      <Typography
                        style={{ lineHeight: 24 }}
                        fontSize={14}
                        textTransform="capitalize"
                      >
                        {t(`${status.toUpperCase()}`)} {t("call")}
                      </Typography>
                      {item.callStartedAt && (
                        <Text style={{ fontSize: 14, textAlign: "right" }}>
                          {covertUtcToLocalDate(item.callStartedAt).format(
                            "HH:mm"
                          )}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
        </ListItem.Accordion>
      );
    },
    [particpants, expanded]
  );

  const CallHistoryHeader = () => {
    if (
      userDetails.roomType == "contact" ||
      userDetails.roomType == "individual"
    ) {
      return (
        <View
          style={{
            paddingHorizontal: 20,
            backgroundColor: Colors.light.LightBlue,
          }}
        >
          <Text style={{ color: "black", fontSize: 17, marginVertical: 10 }}>
            {userDetails.callStartedAt.length < 6
              ? t("others.Today")
              : userDetails.callStartedAt}
          </Text>
        </View>
      );
    } else {
      return <></>;
    }
  };

  const isDisplayProfile = useMemo(() => {
    if (userDetails.roomType == "individual") {
      let isMultipleUserCall = true;
      for (let item of history) {
        if (
          item.callParticipants.filter((e) => e?.userId?._id != MyProfile?._id)
            .length > 1
        ) {
          isMultipleUserCall = false;
          break;
        }
      }
      return isMultipleUserCall;
    } else {
      return false;
    }
  }, [userDetails.roomType, history, MyProfile?._id]);

  const SingleUserHistory = useMemo(() => {
    if (
      userDetails.roomType == "individual" ||
      userDetails.roomType == "contact"
    ) {
      return history.map((gcp, index) => {
        return (
          <View key={index}>
            <SinglePersonCallHistory item={gcp} />
          </View>
        );
      });
    } else {
      return [];
    }
  }, [history, userDetails.roomType, commonContact]);

  const MultipleUserHistory = useMemo(() => {
    if (
      userDetails.roomType == "group" ||
      userDetails.roomType == "contact_group"
    ) {
      return history.map((gcp, index) => {
        return (
          <View key={index}>
            <MultiPersonCallHistory
              item={gcp}
              participants={userDetails.participants.filter(
                (up) => up.userId._id != MyProfile?._id
              )}
            />
          </View>
        );
      });
    } else {
      return [];
    }
  }, [history, userDetails.roomType, expanded]);

  function PaginationAPI() {
    setIsHistoryListLoading(true);
    getHistoryRequest({
      variables: {
        input: {
          categoryId: categoryId,
          skip: history.length,
          take: 20,
        },
      },
    }).then((res) => {
      if (res.data?.getCallListWithAParticipant) {
        setHistory([...history, ...res.data?.getCallListWithAParticipant]);
      }
      setIsHistoryListLoading(false);
    });
  }

  function FooterComponent() {
    if (history.length < 10) {
      return <></>;
    }

    return (
      <View
        style={{
          height: 120,
          width: width,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: "rgba(51,51,51,.5)",
            marginBottom: 50,
          }}
        >
          {isHistoryListLoading
            ? t("others.Wait, looking for more.")
            : t("others.You've reached the end of your call history")}
        </Text>
      </View>
    );
  }

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      {(userDetails.roomType == "individual" ||
        userDetails.roomType == "contact") && (
        <FlatList
          data={SingleUserHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => item}
          onEndReachedThreshold={0.5}
          onEndReached={PaginationAPI}
          ListHeaderComponent={
            isDisplayProfile ? (
              <View>
                <View>
                  <View style={styles.imageCon}>
                    <Image
                      source={{
                        uri: `${DefaultImageUrl}${userDetails.profile_img}`,
                      }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.CallCon}>
                    <View style={{ width: 200 }}>
                      <Text
                        size="md"
                        // eslint-disable-next-line react-native/no-inline-styles
                        style={{
                          fontWeight: "500",
                          fontFamily: "Lato",
                          lineHeight: 24,
                        }}
                        ellipsizeMode="tail"
                        numberOfLines={1}
                      >
                        {userDetails.name}
                      </Text>
                      {userDetails.phone.length > 0 && (
                        <Text style={{ color: Colors.light.PhoneNoColor }}>
                          {userDetails.phone}
                        </Text>
                      )}
                    </View>
                    <View style={styles.CallIconCon}>
                      <Pressable
                        onPress={() => {
                          console.log(userDetails.callRequestData);
                          navigate("ChatMessageScreen", {
                            RoomId: userDetails.callRequestData.roomId,
                          });
                        }}
                      >
                        <Message />
                      </Pressable>

                      <Pressable
                        onPress={async () => {
                          const res = await checkCallPermissions("audio");
                          if (res === true) {
                            if (internet) {
                              if (callRequest == null) {
                                const par = [
                                  ...userDetails.callRequestData.participants,
                                  MyProfile?._id,
                                ];
                                setCallRequest({
                                  ...userDetails.callRequestData,
                                  participants: par,
                                  name: userDetails.name,
                                  callType: "audio",
                                });
                              } else {
                                ToastMessage(
                                  `${t("toastmessage.incall-already-message")}`
                                );
                              }
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
                        <Call style={styles.CallSpace} />
                      </Pressable>

                      <Pressable
                        onPress={async () => {
                          const res = await checkCallPermissions("video");
                          if (res === true) {
                            if (internet) {
                              if (callRequest == null) {
                                const par = [
                                  ...userDetails.callRequestData.participants,
                                  MyProfile?._id,
                                ];
                                setCallRequest({
                                  ...userDetails.callRequestData,
                                  participants: par,
                                  name: userDetails.name,
                                  callType: "video",
                                });
                              } else {
                                ToastMessage(
                                  `${t("toastmessage.incall-already-message")}`
                                );
                              }
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
                        <VideoCall />
                      </Pressable>
                    </View>
                  </View>
                  <View style={{ paddingHorizontal: 20 }}>
                    <Text
                      style={{
                        color: Colors.light.grayText,
                        marginVertical: 20,
                      }}
                    >
                      {" "}
                      {t("others.Last Seen at")} {time}
                    </Text>
                  </View>
                </View>
                <CallHistoryHeader />
              </View>
            ) : (
              <></>
            )
          }
          ListFooterComponent={FooterComponent}
        />
      )}
      {(userDetails.roomType == "group" ||
        userDetails.roomType == "contact_group") && (
        <FlatList
          data={MultipleUserHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => item}
          onEndReachedThreshold={0.5}
          onEndReached={PaginationAPI}
          ListFooterComponent={FooterComponent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  container: {
    backgroundColor: Colors.light.White,
    flex: 1,
  },
  rowDirection: {
    flexDirection: "row",
    alignItems: "center",
  },
  // eslint-disable-next-line react-native/sort-styles
  CallCon: {
    backgroundColor: "#F3F9FC",
    flexDirection: "row",
    height: 76,
    justifyContent: "space-between",
    // marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  CallIconCon: { flexDirection: "row" },
  CallSpace: { marginHorizontal: 8 },
  image: { height: "100%", width: "100%" },
  // eslint-disable-next-line react-native/no-color-literals
  imageCon: { height: windowHeight / 2.3 },
});

//make this component available to the app
