import { CallListQuery, MyCallListReponse, useGetMyCallListLazyQuery } from "@Service/generated/call.generated";
import { Center, Typography } from "rnmuilib";
import { Dimensions, FlatList, RefreshControl, Text, View } from "react-native";
import { GroupUrl, ImageUrl } from "@Service/provider/endpoints";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { incoming, outgoing } from "@Util/CallHistoryIcon";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useIsFocused } from "@react-navigation/core";

import { AllCallListScreenProps } from "@/navigation/screenPropsTypes";
import CallParticipant from "./components/CallParticipant";
import Feather from "react-native-vector-icons/Feather";
import { Loader } from "@Components/Loader";
import { ParticipantType } from "@Service/generated/types";
import { RootState, useAppSelector } from "@Store/Store";

import { useTranslation } from "react-i18next";
import { updateCallList } from "@/redux/Reducer/CallReducer";
import { socket } from "@/redux/Reducer/SocketSlice";

const { width } = Dimensions.get("screen");

export default function AllCallsScreen({}: AllCallListScreenProps) {
  const [isPullToRefresh, setIsPushToRefresh] = useState<boolean>(false);

  const [allCallsData, setAllCallsData] = useState<Array<MyCallListReponse>>([]);
  const [loader, setLoader] = useState(false);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { callList } = useAppSelector((state) => state.Calls);
  const [allCallsRequest, allCallsResponse] = useGetMyCallListLazyQuery();
  const [isCallListLoading, setCallListLoading] = useState<boolean>(false);
  const allCallRef = useRef<FlatList>(null);

  const isFocus = useIsFocused();
  useEffect(() => {
    setLoader(true);
    allCallsRequest({
      variables: {
        input: {
          callStatus: "all",
          skip: 0,
          limit: 20,
        },
      },
    }).then((res) => {
      if (res.data?.getMyCallList) {
        // console.log(res.data?.getMyCallList);
        if (callList.length === res.data.getMyCallList.length) {
          allCallsResponse
            .fetchMore({
              variables: {
                input: {
                  skip: 0,
                  limit: 16,
                  callStatus: "all",
                },
              },
            })
            .then((res) => {
              setLoader(false);
              dispatch(updateCallList(res.data.getMyCallList?.filter((mc) => mc.call != null)));
            })
            .catch((err) => {
              console.log("Error in updating all call list", err);
              setLoader(false);
            });
        } else {
          dispatch(updateCallList(res.data.getMyCallList?.filter((mc) => mc.call != null)));
        }
      }
    });
  }, [isFocus]);

  useEffect(() => {
    if (callList?.length) {
      setAllCallsData(callList);
    }
  }, [callList]);

  // useEffect(() => {
  //   if (socket?.connected) {
  //     socket?.on("message", (data) => {
  //       if (data.type == "Call Ended!") {
  //         allCallsResponse
  //           .refetch()
  //           .then((res) => {
  //             dispatch(updateCallList(res.data.getMyCallList));
  //           })
  //           .catch((err) => {
  //             console.log("Error in updating all call list", err);
  //           });
  //       }
  //     });
  //   }
  // }, [socket]);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {loader && !allCallsData.length ? (
        <Loader />
      ) : (
        <FlatList
          ref={allCallRef}
          showsVerticalScrollIndicator={false}
          style={{ flexGrow: 1, paddingTop: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={isPullToRefresh}
              onRefresh={() => {
                setIsPushToRefresh(true);

                allCallsResponse
                  .refetch()
                  .then((res) => {
                    console.log("res.data?.getMyCallList", res.data?.getMyCallList?.length);
                    if (res.data?.getMyCallList != null) {
                      dispatch(updateCallList(res.data?.getMyCallList));
                      setIsPushToRefresh(false);
                    }
                  })
                  .catch((err) => {
                    console.log("Error in refreshing data", err);
                    setIsPushToRefresh(false);
                  });
              }}
            />
          }
          data={allCallsData}
          renderItem={({ item, index }) => {
            return <SingleCallItem item={item} index={index} />;
          }}
          ListEmptyComponent={() => (
            <Center flex={1}>
              <Feather name="phone" size={64} style={{ opacity: 0.3, marginBottom: 24, marginTop: "30%" }} />
              <Typography>{t("calls.noCalls")}</Typography>
            </Center>
          )}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (callList.length > 12) {
              setCallListLoading(true);
              allCallsResponse
                .fetchMore({
                  variables: {
                    input: {
                      skip: callList.length,
                      limit: 16,
                      callStatus: "all",
                    },
                  },
                })
                .then((res) => {
                  if (res.error) {
                    console.error("Error in refetching call response", res.error);
                  }
                  if (res.data?.getMyCallList != null) {
                    dispatch(updateCallList([...callList, ...res.data?.getMyCallList]));
                  }
                  setCallListLoading(false);
                });
            }
          }}
          contentContainerStyle={{
            flex: (callList ?? []).length === 0 ? 1 : 0,
          }}
          ListFooterComponent={
            callList.length > 10 ? (
              <View style={{ height: 120, width: width, justifyContent: "center", alignItems: "center" }}>
                <Text style={{ fontSize: 14, color: "rgba(51,51,51,.5)", marginBottom: 50 }}>
                  {isCallListLoading ? t("lookingForMore") : t("endReached")}
                </Text>
              </View>
            ) : (
              <></>
            )
          }
        />
      )}
    </View>
  );
}

type SingleCallItemProps = {
  item: MyCallListReponse;
  index: number;
};

function SingleCallItem({ item, index }: SingleCallItemProps) {
  const MyProfile = useSelector((state: RootState) => state.Chat.MyProfile);
  const { comonContact } = useSelector((state: RootState) => state.Contact);
  //extractCallDetails
  const { initiator, status, participants } = useMemo(
    () => ExtractCallDetails(),
    [item?.call?.callParticipants, comonContact, item?.call?.origin]
  );
  //checkCallStatus for current call
  const callStatus = useMemo(() => checkCallStatus(), [initiator, status]);
  //modify call Type
  const type = useMemo(() => item?.call?.type.toUpperCase(), [item?.call?.type]);
  //construct Item UI data
  const { name, phone, profile_img, callRequestData, lastSeen } = useMemo(
    () => getItemDetails(item, participants),
    [item, participants]
  );

  return (
    <CallParticipant
      item={item}
      name={name}
      phone={phone}
      lastSeen={lastSeen}
      ProfileImage={profile_img}
      callCount={item.count ? item.count.toString() : 0}
      type={callStatus}
      roomType={item?.call?.roomType}
      callRequestData={callRequestData}
      mode={type}
      time={item.call?.callStartedAt ? item.call?.callStartedAt.toString() : ""}
      categoryId={item.categoryId ? item.categoryId : ""}
      isAllCalls={true}
    />
  );
  function getItemDetails(item: MyCallListReponse, participants: ParticipantType[]) {
    switch (item?.call?.roomType) {
      case "group":
        // console.log("roomid", item.call.roomId == null ? item.categoryId : "");
        return {
          name: item.call.roomId != null ? item.call.roomId.name : "Group call",
          profile_img: item.call.roomId != null ? item.call.roomId.profile_img : GroupUrl,
          phone: "",
          lastSeen: "",
          callRequestData: {
            callType: item.call.type,
            roomType: item.call.roomType,
            roomId: item.call.roomId?._id,
            callBackground: item.call.roomId != null ? item.call.roomId.profile_img : "",
            roomName: item.call.roomId != null ? item.call.roomId.name : "Group call",
            participants: [],
            isReceiver: false,
          },
        };

      case "contact_group":
        const participantNames = participants.reduce((accumulator, participant, index) => {
          if (index === 0) {
            return participant.userId.firstName;
          } else {
            return accumulator + ", " + participant.userId.firstName;
          }
        }, null);

        return {
          name: participantNames !== null ? participantNames : "Contact Group call",
          profile_img: `${ImageUrl}`,
          phone: "",
          lastSeen: "",
          callRequestData: {
            callType: item.call.type,
            roomType: item.call.roomType,
            roomId: null,
            callBackground: `${ImageUrl}`,
            roomName: participantNames !== null ? participantNames : "Contact Group call",
            participants: participants.map((par) => par.userId._id),
            isReceiver: false,
          },
        };

      case "contact":
        const participantWithoutMe = participants.filter((e) => e?.userId?._id != MyProfile?._id);
        let participantName = "";
        if (participantWithoutMe.length > 1) {
          participantName = `${participants[0]?.userId?.firstName} ${participants[0]?.userId?.lastName}(+${
            participantWithoutMe?.length - 1
          })`;
        } else {
          participantName = participants[0]?.userId?.firstName + " " + participants[0]?.userId?.lastName;
        }
        return {
          name: participantName,
          profile_img: participants.length > 0 ? participants[0].userId.profile_img : "",
          phone: participants.length > 0 ? participants[0].userId.phone : "",
          lastSeen: participants.length > 0 ? participants[0].userId.lastSeen : "0",
          callRequestData: {
            callType: item.call.type,
            roomType: item.call.roomType,
            roomId: null,
            callBackground: participants.length > 0 ? participants[0].userId.profile_img : "",
            roomName:
              participants.length > 0
                ? participants[0]?.userId?.firstName + " " + participants[0]?.userId?.lastName
                : "",
            participants: participants.map((par) => par.userId._id),
            isReceiver: false,
          },
        };

      case "individual":
        const participantExcludingMe = participants.filter((e) => e?.userId?._id != MyProfile?._id);
        let name = "";
        if (participantExcludingMe.length > 1) {
          name = `${participants[0]?.userId?.firstName} ${participants[0]?.userId?.lastName}(+${
            participantExcludingMe?.length - 1
          })`;
        } else {
          name = participants[0]?.userId?.firstName + " " + participants[0]?.userId?.lastName;
        }
        return {
          name: name,
          profile_img: participants.length > 0 ? participants[0].userId.profile_img : "",
          phone: participants.length > 0 ? participants[0].userId.phone : "",
          lastSeen: participants.length > 0 ? participants[0].userId.lastSeen : "0",
          callRequestData: {
            callType: item.call.type,
            roomType: item.call.roomType,
            roomId: participantExcludingMe.length > 1 ? null : item.call.roomId?._id,
            callBackground: participants.length > 0 ? participants[0].userId.profile_img : "",
            roomName:
              participants.length > 0 ? participants[0].userId?.firstName + " " + participants[0].userId?.lastName : "",
            participants:
              participantExcludingMe.length > 1 ? item?.call?.callParticipants.map((e) => e.userId._id) : [],
            isReceiver: false,
          },
        };
      default:
        return {
          name: "",
          profile_img: "",
          phone: "",
          participantsData: [],
        };
    }
  }

  function checkCallStatus() {
    return initiator ? outgoing[status == "missed" ? "initiator" : status] : incoming[status];
  }

  function ExtractCallDetails() {
    const participants: ParticipantType[] = [];
    let initiator = false;
    let status = "";
    let myCall = null;

    item?.call?.callParticipants.forEach((it) => {
      if (it.userId._id != MyProfile?._id) {
        const cc = comonContact.filter((item) => {
          if (item.userId?._id == it.userId._id) {
            return true;
          }
        });

        if (cc.length > 0) {
          const { firstName, lastName } = cc[0];
          participants.push({
            ...it,
            userId: {
              ...it.userId,
              firstName: firstName ? firstName : "",
              lastName: lastName ? lastName : "",
            },
          });
        } else {
          participants.push({
            ...it,
            userId: {
              ...it.userId,
              firstName: it.userId.phone,
              lastName: "",
            },
          });
        }
      } else {
        initiator = MyProfile?._id === item?.call?.origin;
        status = it.callStatus;
        myCall = it;
      }
    });
    return { initiator, status, participants };
  }
}
