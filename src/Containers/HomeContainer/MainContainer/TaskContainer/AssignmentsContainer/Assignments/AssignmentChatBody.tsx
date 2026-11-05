import React from "react";
import { activeAssignmentAtom, activeReportAtom } from "@/Atoms/AssignmentAtom";
import { taskExecutor } from "../utils/task.utils";
import { useAtomValue } from "jotai";
import { View, StyleSheet, Dimensions } from "react-native";
import { AssignmentChatWrapper } from "./AssignmentChatWrapper";
import { NotStartedView } from "./NotStartedView";

export function AssignmentChatBody() {
  const currentAssignment = useAtomValue(activeAssignmentAtom);
  const currentReport = useAtomValue(activeReportAtom);
  const { executingTime, isCorrectTime } = taskExecutor(currentAssignment);

  if (isCorrectTime && currentReport) {
    return (
      <View style={styles.main}>
        <AssignmentChatWrapper />
      </View>
    );
  }

  return <NotStartedView executingTime={executingTime} />;
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: "white",
    flex: 1,
    justifyContent: "space-between",
  },
});
