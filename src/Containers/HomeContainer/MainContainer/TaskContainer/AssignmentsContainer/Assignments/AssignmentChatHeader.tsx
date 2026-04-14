import { activeAssignmentAtom, activeReportAtom, activeScenarioAtom } from "@/Atoms/AssignmentAtom";
import HeaderWithAction from "@Components/header/HeaderWithAction";
import Colors from "@/Constants/Colors";
import { navigate, navigateBack } from "@/navigation/utility";
import { useAtom, useAtomValue } from "jotai";
import React, { useState } from "react";
import { Pressable, View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import NotificationIcon from "@Images/notification big.svg";
import { useReportLazyQuery } from "@/graphql/generated/report.generated";
import Feather from "react-native-vector-icons/Feather";

import { useScenarioLazyQuery } from "@/graphql/generated/scenario.generated";
import { Divider } from "react-native-elements";

export function AssignmentChatHeader() {
  const [loader, setLoader] = useState(false);

  const currentAssignment = useAtomValue(activeAssignmentAtom);

  const [currentReport, updateCurrentReport] = useAtom(activeReportAtom);
  const [activeScenario, setActiveScenario] = useAtom(activeScenarioAtom);

  const [reportRequest, reportResponse] = useReportLazyQuery({
    fetchPolicy: "no-cache",
  });
  const [scenarioRequest] = useScenarioLazyQuery({
    fetchPolicy: "no-cache",
  });
  console.log("Current assign", currentAssignment?._id, currentReport?._id);
  return (
    <>
      <HeaderWithAction
        screenName={currentAssignment?.scenario?.name.slice(0, 20) ?? ""}
        ActionComponent={() => {
          return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Pressable
                style={styles.notificationIconContainer}
                onPress={() =>
                  navigate("AssignmentNotificationScreen", {
                    previousScreen: true,
                  })
                }
              >
                <NotificationIcon {...styles.notificationIconStyle} fill={Colors.light.PrimaryColor} />
              </Pressable>
              {reportResponse.loading ? (
                <ActivityIndicator />
              ) : (
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      setLoader(true);
                      const res = await scenarioRequest({
                        variables: { input: { _id: activeScenario?._id, orgId: global.activeOrg } },
                      });
                      if (res.data?.scenario) {
                        setActiveScenario(res.data?.scenario);
                      }
                      const reportRes = await reportRequest({ variables: { input: { _id: currentReport?._id } } });
                      const data = await reportRes.refetch();
                      if (data.data?.report) {
                        updateCurrentReport(data.data?.report);
                      }
                      setLoader(false);
                    } catch (error) {
                      console.error("Error in refreshing scenario and report", error);
                      setLoader(false);
                    }
                  }}
                  disabled={loader}
                >
                  {loader ? (
                    <ActivityIndicator size={"small"} color={Colors.light.link} />
                  ) : (
                    <Feather name="refresh-ccw" size={20} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        onBackPress={navigateBack}
        isActionVisible={true}
      />
      <Divider />
    </>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(51,51,51,.1)",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: 350,
  },
  notificationIconContainer: {
    marginLeft: 10,
    tintColor: Colors.light.PrimaryColor,
  },
  notificationIconStyle: {
    height: 20,
    marginRight: 10,
    width: 20,
  },
  rowDirection: {
    alignItems: "center",
    flexDirection: "row",
  },
});
