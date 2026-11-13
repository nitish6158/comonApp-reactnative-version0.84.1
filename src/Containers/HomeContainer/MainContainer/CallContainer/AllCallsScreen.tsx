// @ts-nocheck
import { MyCallListReponse, useGetMyCallListLazyQuery } from "@Service/generated/call.generated";
import { Center, Typography } from "rnmuilib";
import { Dimensions, FlatList, RefreshControl, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useIsFocused } from "@react-navigation/core";

import { AllCallListScreenProps } from "@/navigation/screenPropsTypes";
import SingleCallItem from "./components/SingleCallItem";

import { Loader } from "@Components/Loader";
import { useAppSelector } from "@Store/Store";

import { useTranslation } from "react-i18next";
import { updateCallList } from "@/redux/Reducer/CallReducer";
import { socket } from "@/redux/Reducer/SocketSlice";

import { VectorIconCompat } from "@/Components/icons";

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
    void allCallsRequest({
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
          renderItem={({ item }) => {
            return <SingleCallItem item={item} isAllCalls={true} />;
          }}
          ListEmptyComponent={() => (
            <Center flex={1}>
              <VectorIconCompat name="phone" size={64} style={{ opacity: 0.3, marginBottom: 24, marginTop: "30%" }} />
              <Typography>{t("calls.noCalls")}</Typography>
            </Center>
          )}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (callList.length > 12) {
              setCallListLoading(true);
              void allCallsResponse
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
                    dispatch(updateCallList([...callList, ...res.data.getMyCallList]));
                  }
                  setCallListLoading(false);
                })
                .catch(() => {
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
