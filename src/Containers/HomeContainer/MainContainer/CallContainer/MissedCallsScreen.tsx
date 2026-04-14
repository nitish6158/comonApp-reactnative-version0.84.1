import { Block, Center, Typography } from "rnmuilib";
import { CallListQuery, MyCallListReponse, useGetMyCallListLazyQuery } from "@Service/generated/call.generated";
import { Dimensions, FlatList, RefreshControl, Text, View } from "react-native";
import { GroupUrl, ImageUrl } from "@Service/provider/endpoints";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { incoming, outgoing } from "@Util/CallHistoryIcon";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useIsFocused } from "@react-navigation/core";

import CallParticipant from "./components/CallParticipant";
import Feather from "react-native-vector-icons/Feather";
import { Loader } from "@Components/Loader";
import { MissedCallListScreenProps } from "@/navigation/screenPropsTypes";
import { RootState, useAppSelector } from "@Store/Store";
import { useTranslation } from "react-i18next";
import { updateMissedList } from "@/redux/Reducer/CallReducer";

const { width } = Dimensions.get("screen");


function MissedCallsScreen({}: MissedCallListScreenProps) {
  const [missCallList, setMissCallList] = useState<Array<MyCallListReponse>>([]);
  const [isPullToRefresh, setIsPushToRefresh] = useState<boolean>(false);
  const { t } = useTranslation();
  const me = useAppSelector(state=> state.Chat.MyProfile)
  const MyProfile = useSelector((state: RootState) => state.Chat.MyProfile);
  const { comonContact } = useSelector((state: RootState) => state.Contact);
  const { missedList } = useSelector((state: RootState) => state.Calls);
  const dispatch = useDispatch();
  const missedCallRef = useRef<FlatList>(null);

  const [getMissedCallRequest, getMissedCallResponse] = useGetMyCallListLazyQuery();
  const [isCallListLoading, setCallListLoading] = useState<boolean>(false);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    console.log("Missed length", missedList.length);
    if (missedList?.length) {
      setMissCallList(missedList);
    }
  }, [missedList.length]);

  useFocusEffect(
    useCallback(() => {
      setLoader(true);
      getMissedCallRequest({
        variables: {
          input: {
            callStatus: "missed",
            skip: 0,
            limit: 20,
          },
        },
      }).then((res) => {
        if (res.data?.getMyCallList) {
          if (missedList.length === res.data.getMyCallList.length) {
            getMissedCallResponse
              .fetchMore({
                variables: {
                  input: {
                    skip: 0,
                    limit: 20,
                    callStatus: "missed",
                  },
                },
              })
              .then((res) => {
                dispatch(updateMissedList(res.data.getMyCallList));
                setLoader(false);
              })
              .catch((err) => {
                console.log("Error in updating all call list", err);
                setLoader(false);
              });
          } else {
            dispatch(updateMissedList(res.data?.getMyCallList));
          }
        }
      });
    }, [])
  );

  const getItemDetails = (item: MyCallListReponse, participants: ParticipantType[]) => {
    switch (item.call?.roomType) {
      case "group":
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
          name: participantNames !== null ? participantNames : "null",
          profile_img: `${ImageUrl}`,
          phone: "",
          lastSeen: "",
          callRequestData: {
            callType: item.call.type,
            roomType: item.call.roomType,
            roomId: null,
            callBackground: `${ImageUrl}`,
            roomName: participantNames !== null ? participantNames : "null",
            participants: participants.map((par) => par.userId._id),
            isReceiver: false,
          },
        };

      case "contact":
        return {
          name: participants.length > 0 ? participants[0].userId.firstName + " " + participants[0].userId.lastName : "",
          profile_img: participants.length > 0 ? participants[0].userId.profile_img : "",
          phone: participants.length > 0 ? participants[0].userId.phone : "",
          lastSeen: participants.length > 0 ? participants[0].userId.lastSeen : "0",
          callRequestData: {
            callType: item.call.type,
            roomType: item.call.roomType,
            roomId: null,
            callBackground: participants.length > 0 ? participants[0].userId.profile_img : "",
            roomName:
              participants.length > 0 ? participants[0].userId.firstName + " " + participants[0].userId.lastName : "",
            participants: participants.map((par) => par.userId._id),
            isReceiver: false,
          },
        };

      case "individual":
        // //console.log(participants);
        return {
          name: participants.length > 0 ? participants[0].userId.firstName + " " + participants[0].userId.lastName : "",
          profile_img: participants.length > 0 ? participants[0].userId.profile_img : "",
          phone: participants.length > 0 ? participants[0].userId.phone : "",
          lastSeen: participants.length > 0 ? participants[0].userId.lastSeen : "0",
          callRequestData: {
            callType: item.call.type,
            roomType: item.call.roomType,
            roomId: item.call.roomId?._id,
            callBackground: participants.length > 0 ? participants[0].userId.profile_img : "",
            roomName:
              participants.length > 0 ? participants[0].userId.firstName + " " + participants[0].userId.lastName : "",
            participants: [],
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
  };

  return (
    <Block flex={1} backgroundColor="white">
      {loader && !missCallList.length ? (
        <Loader />
      ) : (
        <FlatList
          ref={missedCallRef}
          showsVerticalScrollIndicator={false}
          style={{ flexGrow: 1 }}
          data={missCallList}
          renderItem={({ item, index }: { item: MyCallListReponse; index: number }) => {
            const participants: ParticipantType[] = [];

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
              }
            });

            const initiator = me?._id === item?.call?.origin ? true : false;
            const status = participants.length > 0 ? participants[0].callStatus : "";
            //to display call icon incoming | outgoing | missed
            const callStatus = initiator ? outgoing[status] : incoming[status];
            const type = item?.call?.type.toUpperCase();

            const { name, phone, profile_img, callRequestData, lastSeen } = getItemDetails(item, participants);

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
                prevMode=""
                channelName=""
                preRoomType=""
                photo=""
                preTime=""
              />
            );
          }}
          ListEmptyComponent={() => (
            <Center flex={1}>
              <Feather name="phone" size={64} style={{ opacity: 0.3, marginBottom: 24, marginTop: "30%" }} />
              <Typography>{t("calls.noCalls")}</Typography>
            </Center>
          )}
          contentContainerStyle={{
            flex: (missedList ?? []).length === 0 ? 1 : 0,
          }}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (missCallList.length > 12) {
              setCallListLoading(true);
              getMissedCallResponse
                .fetchMore({
                  variables: {
                    input: {
                      skip: missCallList.length,
                      limit: 20,
                      callStatus: "missed",
                    },
                  },
                })
                .then((res) => {
                  if (res.data?.getMyCallList != null) {
                    dispatch(updateMissedList([...missCallList, ...res.data?.getMyCallList]));
                  }
                  setCallListLoading(false);
                });
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={isPullToRefresh}
              onRefresh={() => {
                setIsPushToRefresh(true);

                getMissedCallResponse
                  .fetchMore({
                    variables: {
                      input: {
                        skip: 0,
                        limit: 20,
                        callStatus: "missed",
                      },
                    },
                  })
                  .then((res) => {
                    console.log("res.data?.getMyCallList", res.data.getMyCallList?.length);
                    if (res.data?.getMyCallList != null) {
                      dispatch(updateMissedList(res.data?.getMyCallList));
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
          ListFooterComponent={
            missedList.length > 10 ? (
              <View style={{ height: 120, width: width, justifyContent: "center", alignItems: "center" }}>
                <Text>{isCallListLoading ? t("lookingForMore") : t("endReached")}</Text>
              </View>
            ) : (
              <></>
            )
          }
        />
      )}
    </Block>
  );
}

export default MissedCallsScreen;
