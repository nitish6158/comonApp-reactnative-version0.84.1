import React, { useCallback, useEffect, useMemo, useState } from "react";

import { SingleAssignment } from "./Assignments/SingleAssignment";
import { ActivityIndicator, Alert, FlatList, View } from "react-native";
import { useSelector, useDispatch } from "react-redux";

import Colors from "@/Constants/Colors";
import { EmptyList } from "@/Components/EmptyList";
import { RootState } from "@Store/Reducer";
import { useTaskReport } from "@Hooks/useTaskReport";
import { Assignment } from "@/graphql/generated/types";
import ItemSeparator from "@/Components/FlatList/ItemSeparator";
import { useFocusEffect } from "@react-navigation/core";
const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;
import { TouchableOpacity, StyleSheet } from "react-native";
import { navigate } from "@/navigation/utility";
import { useAtom } from "jotai";
import { currentUserIdAtom } from "@/Atoms";

export default function AssignmentsHomeScreen() {
  const { currentOrganization, assignments } = useSelector(
    (state: RootState) => state.Organisation,
  );
  const currentOrg = useSelector(
    (state: RootState) => state.Organisation.currentOrganization,
  );
  const { responseAssignment, refreshAssignment, loader } = useTaskReport();
  const [currentUserId] = useAtom(currentUserIdAtom);
  const [taskCreate, setTaskCreate] = useState(false);
  useFocusEffect(
    useCallback(() => {
      refreshAssignment();
    }, []),
  );
  const { members } = currentOrg;
  useEffect(() => {
    members?.map((member) => {
      if (member?.role == "OWNER") {
        if (checkCurrentOrgAccess(member) !== undefined) {
          setTaskCreate(true);
        } else {
          setTaskCreate(false);
        }
      }
    });
  }, [currentOrganization]);
  const checkCurrentOrgAccess = (member: any) => {
    const availableID = member?.organizationId.find(
      (org: any) => org == currentOrganization?._id,
    );
    if (availableID) {
      if (member?.user?._id == currentUserId?._id) {
        return member?.user?._id;
      }
    }
    return undefined;
  };

  const OrganizationTasks = useMemo(() => {
    return AssignmentList(assignments);
  }, [assignments, currentOrganization?._id]);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={{ flex: 1, backgroundColor: Colors.light.White, paddingTop: 10 }}
        refreshing={loader}
        showsVerticalScrollIndicator={false}
        onRefresh={() => refreshAssignment(true)}
        data={OrganizationTasks}
        renderItem={(Task) => Task.item}
        onEndReachedThreshold={0.3}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={
          <EmptyAssignmentView isLoading={responseAssignment.loading} />
        }
        keyExtractor={(item, index) => index.toString()}
      />
      {taskCreate && (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.7}
          onPress={() => {
            navigate("CreateTask", {});
            // navigate("TaskList", {})
          }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={40}
            color={Colors.light.PrimaryColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );
  function AssignmentList(data: Assignment[]) {
    if (data?.length) {
      return data.map((item, index) => {
        return <SingleAssignment item={item} key={item._id} />;
      });
    } else {
      return [];
    }
  }
  function EmptyAssignmentView({
    isLoading,
  }: Readonly<{ isLoading: boolean }>) {
    if (isLoading) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return <EmptyList title="task.empty-organization" />;
  }
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 24,
    bottom: 24,
    backgroundColor: Colors.light.White,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});
