import { Dimensions, FlatList, Platform, RefreshControl, StyleSheet, Text, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useGetMyNotificationsLazyQuery, useSetNotificationSeenMutation } from "@Service/generated/task.generated";

import Colors from "@/Constants/Colors";
import CommonHeader from "@Components/header/CommonHeader";
import { Loader } from "@Components/Loader";
import { RootState } from "@Store/Reducer";
import fonts from "@/Constants/fonts";
import notifee from "@notifee/react-native";
import { useFocusEffect } from "@react-navigation/core";
import { useSelector } from "react-redux";
import useTimeHook, { formatTime } from "@Hooks/useTimeHook";
import { useTranslation } from "react-i18next";
import { AssignmentNotificationScreenProps } from "@/navigation/screenPropsTypes";
import HeaderWithAction from "@Components/header/HeaderWithAction";
import { navigateBack } from "@/navigation/utility";

const { height } = Dimensions.get("window");

interface INotificationData {
  _id: string;
  title: string;
  type: string;
  body: string;
  payload: string;
  isSeen: boolean;
  createdAt: number;
}

const LIMIT = 20;

const taskType = {
  TASK_COMPLETE: "Completed",
  TASK_SUBMIT: "Information",
  TASK: "Assigned",
};

let updatedData: any[] = [];
let total = 0;

export default function AssignmentNotificationScreen({ route }: AssignmentNotificationScreenProps) {
  const [notificationData, setNotificationData] = useState<Array<INotificationData>>([]);
  const [page, setPage] = useState(0);
  const [notificationQuery, notificationResponse] = useGetMyNotificationsLazyQuery();
  const [loader, setLoader] = useState(true);
  const [renderPage, setRenderPage] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const { t } = useTranslation();

  const [readNotification] = useSetNotificationSeenMutation();
  const organisationData = useSelector((state: RootState) => state.Organisation);

  function resetAll() {
    updatedData = [];
    total = 0;
    setNotificationData(updatedData);
    setLoader(true);
    setPage(0);
    setRenderPage(true);
    setRefresh(false);
  }

  useFocusEffect(
    useCallback(() => {
      resetAll();
      notifee
        .getDisplayedNotifications()
        .then((res) => {
          const notificationId = res
            .filter((e) => {
              const checkForTaskNotification = Platform.select({
                ios: e.notification.ios?.categoryId,
                android: e.notification.android?.pressAction?.id,
              });
              if (checkForTaskNotification === "taskNotification") return true;
              return false;
            })
            .map((e) => e.id);
          if (notificationId.length) notifee.cancelAllNotifications(notificationId);
        })
        .catch((err) => {
          console.log("Error in getting displayed notifications", err);
        });
    }, [])
  );

  useEffect(() => {
    if (renderPage) {
      setRenderPage(false);
      return;
    }
    notificationQuery({
      variables: {
        input: {
          skip: page * LIMIT,
          limit: LIMIT,
          assignmentId: organisationData?.currentAssignment?._id,
        },
      },
    })
      .then((res) => {
        res
          .refetch()
          .then(async (res) => {
            if (res.data?.getMyNotifications?.data) {
              const allIds = res.data?.getMyNotifications?.data.map((e) => e._id);
              await readNotification({
                variables: {
                  input: {
                    notificationIds: allIds,
                  },
                },
              });
              updatedData = [...updatedData, ...res.data.getMyNotifications.data];
            }
            setLoader(false);
            total = res.data.getMyNotifications?.total;
            setNotificationData(updatedData);
          })
          .catch((err) => {
            console.log("Error in refetch", JSON.stringify(err));
            setLoader(false);
          });
      })
      .catch((Err) => {
        console.log("Error in getting task notification", Err);
        setLoader(false);
      });
  }, [page, renderPage, organisationData?.currentAssignment?._id]);

  function renderItem({ item }: { item: INotificationData }) {
    let createdAt = undefined;
    if (item?.createdAt) {
      const  time  = formatTime(item?.createdAt);
      createdAt = time;
    }
    return (
      <View style={styles.cardContainer}>
        <View style={{ marginBottom: 15 }}>
          <Text style={[styles.textTypo, styles.headingStyle]}>{item?.title}</Text>
        </View>

        <Text style={[styles.textTypo, styles.bodyStyle, { width: "80%" }]}>{item?.body}</Text>

        <View style={[styles.rowDirection, { justifyContent: "space-between", paddingTop: 10 }]}>
          {createdAt && <Text style={[styles.textTypo, styles.bodyStyle, { fontWeight: "500" }]}>{createdAt}</Text>}
          {taskType[item?.type] && (
            <View style={styles.taskTypeContainer}>
              <Text style={[styles.textTypo, styles.bodyStyle]}>{taskType[item?.type]}</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  function EmptyComponent() {
    if (loader) {
      return (
        <View style={styles.emptyComponent}>
          <Loader />
        </View>
      );
    } else {
      return (
        <View style={styles.emptyComponent}>
          <Text style={[styles.textTypo, styles.headingStyle]}>{t("others.No notifications.")}</Text>
        </View>
      );
    }
  }

  function FooterComponent() {
    return total > notificationData.length ? (
      <View style={{ height: 50, justifyContent: "center", alignItems: "center" }}>
        <Text>{t("others.Loading more...")}</Text>
      </View>
    ) : (
      <></>
    );
  }

  return (
    <View style={styles.container}>
      <HeaderWithAction
        screenName={t("others.Task Notification")}
        onBackPress={navigateBack}
        isActionVisible={false}
        ActionComponent={() => null}
      />
      <View style={styles.listContainer}>
        <FlatList
          data={notificationData}
          renderItem={renderItem}
          keyExtractor={(item) => item?._id}
          onEndReachedThreshold={0.7}
          onEndReached={() => {
            if (total > notificationData.length) {
              setPage((previousValue) => previousValue + 1);
            }
          }}
          refreshControl={<RefreshControl refreshing={refresh} onRefresh={resetAll} />}
          ListEmptyComponent={EmptyComponent}
          ListFooterComponent={FooterComponent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bodyStyle: {
    color: Colors.light.black,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 16,
  },
  cardContainer: {
    backgroundColor: "white",
    // borderColor: "rgba(51,51,51,.5)",
    borderRadius: 10,
    // borderWidth: 0.5,
    marginHorizontal: 10,
    marginVertical: 3,
    padding: 15,
  },
  container: {
    backgroundColor: Colors.light.LightBlue,
    flex: 1,
  },
  emptyComponent: {
    alignItems: "center",
    flex: 1,
    height: height,
    justifyContent: "center",
  },
  headingStyle: {
    color: Colors.light.black,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
  },
  listContainer: {
    flex: 1,
    paddingTop: 10,
  },
  rowDirection: {
    alignItems: "center",
    flexDirection: "row",
  },
  taskTypeContainer: {
    borderColor: Colors.light.gray,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
});
