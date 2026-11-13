// @ts-nocheck
import { Block, Center, Typography } from "rnmuilib";
import { MyCallListReponse, useGetMyCallListLazyQuery } from "@Service/generated/call.generated";
import { Dimensions, FlatList, RefreshControl, Text, View } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect } from "@react-navigation/core";

import SingleCallItem from "./components/SingleCallItem";
import { Loader } from "@Components/Loader";
import { MissedCallListScreenProps } from "@/navigation/screenPropsTypes";
import { RootState } from "@Store/Store";
import { useTranslation } from "react-i18next";
import { updateMissedList } from "@/redux/Reducer/CallReducer";
import { VectorIconCompat } from "@/Components/icons";

const { width } = Dimensions.get("screen");

function MissedCallsScreen({}: MissedCallListScreenProps) {
  const [missCallList, setMissCallList] = useState<Array<MyCallListReponse>>([]);
  const [isPullToRefresh, setIsPushToRefresh] = useState<boolean>(false);
  const { t } = useTranslation();
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
      void getMissedCallRequest({
        variables: {
          input: {
            callStatus: "missed",
            skip: 0,
            limit: 20,
          },
        },
      })
        .then((res) => {
          if (res.data?.getMyCallList) {
            if (missedList.length === res.data.getMyCallList.length) {
              void getMissedCallResponse
                .fetchMore({
                  variables: {
                    input: {
                      skip: 0,
                      limit: 20,
                      callStatus: "missed",
                    },
                  },
                })
                .then((moreRes) => {
                  dispatch(updateMissedList(moreRes.data.getMyCallList));
                  setLoader(false);
                })
                .catch((err) => {
                  console.log("Error in updating all call list", err);
                  setLoader(false);
                });
            } else {
              dispatch(updateMissedList(res.data?.getMyCallList));
              setLoader(false);
            }
          } else {
            setLoader(false);
          }
        })
        .catch(() => {
          setLoader(false);
        });
    }, [])
  );

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
          renderItem={({ item }: { item: MyCallListReponse }) => (
            <SingleCallItem item={item} isAllCalls={false} />
          )}
          ListEmptyComponent={() => (
            <Center flex={1}>
              <VectorIconCompat name="phone" size={64} style={{ opacity: 0.3, marginBottom: 24, marginTop: "30%" }} />
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
              void getMissedCallResponse
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
                    dispatch(updateMissedList([...missCallList, ...res.data.getMyCallList]));
                  }
                  setCallListLoading(false);
                })
                .catch(() => {
                  setCallListLoading(false);
                });
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={isPullToRefresh}
              onRefresh={() => {
                setIsPushToRefresh(true);

                void getMissedCallResponse
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
