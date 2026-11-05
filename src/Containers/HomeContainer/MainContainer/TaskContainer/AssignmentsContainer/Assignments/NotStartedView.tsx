import { activeAssignmentAtom, activeReportAtom } from "@/Atoms/AssignmentAtom";
import { Colors } from "@/Constants";
import { useStartReportMutation } from "@/graphql/generated/report.generated";
import { useAtom, useAtomValue } from "jotai";
import React from "react";
import { useTranslation } from "react-i18next";
import { View, Image, Dimensions, Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";


const { height, width } = Dimensions.get("screen");

type NotStartedViewProps = {
  executingTime: string;
};

export function NotStartedView({ executingTime }: Readonly<NotStartedViewProps>) {
  
  const { t } = useTranslation();
  const [currentReport, setCurrentReport] = useAtom(activeReportAtom);
  const currentAssignment = useAtomValue(activeAssignmentAtom);
  const [startReportRequest, startReportResponse] = useStartReportMutation();

  return (
    <View style={styles.main}>
      <View style={styles.topBanner}>
        <Image
          source={require("@Images/startTask.png")}
          resizeMode="contain"
          style={{ resizeMode: "contain", height: 400, width: 300 }}
        />
      </View>
      <View style={styles.bottomSection}>
        {currentReport ? (
          <View style={styles.upcomingTaskMain}>
            <Text style={styles.upcomingTaskText}>{`${t("task.task-start-on")} ${executingTime}`}</Text>
          </View>
        ) : startReportResponse.loading ? (
          <View style={{ height: 80, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator />
          </View>
        ) : (
          <Pressable onPress={onStartReport} style={styles.startAssignmentContainer}>
            <Text style={styles.startAssignmentText}>{t("btn.start-assignment")}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  async function onStartReport() {

    try {
      
      const res = await startReportRequest({
        variables: {
          input: {
            assignmentId: currentAssignment?._id,
            orgId: currentAssignment?.organizationId,
            masterOrg: global?.activeOrg,
          },
        },
      });
      setCurrentReport(res.data?.startReport);
    } catch (error) {
      console.log( error);
    }
  }
}

const styles = StyleSheet.create({
  bottomSection: {
    alignItems: "center",
    flex: 0.4,
    justifyContent: "center",
  },
  main: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "space-between",
  },
  startAssignmentContainer: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 30,
    height: 50,
    justifyContent: "center",
    width: 320,
  },
  startAssignmentText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  topBanner: {
    alignItems: "center",
    height: height / 2,
    justifyContent: "center",
  },
  upcomingTaskMain: {
    backgroundColor: "rgba(51,51,51,.1)",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  upcomingTaskText: {
    maxWidth: 300,
    textAlign: "center",
  },
});
