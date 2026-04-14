import AssignmentsHomeScreen from "@/Containers/HomeContainer/MainContainer/TaskContainer/AssignmentsContainer/AssignmentsHomeScreen";
import Colors from "@/Constants/Colors";
import MyReportsScreen from "@/Containers/HomeContainer/MainContainer/TaskContainer/ReportsContainer/MyReportsScreen";
import React, { useEffect } from "react";
import { TaskTabNavigatorParamList } from "./screenPropsTypes";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTranslation } from "react-i18next";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { MyReportAtom } from "@/Atoms/taskAtom";
import { useMyReportsLazyQuery } from "@/graphql/generated/report.generated";
import { SurveyChecker } from "@/Containers/HomeContainer/MainContainer/SurveyContainer/SurveyChecker";
import { SurveyEventType } from "@/graphql/generated/types";
import TaskHeader from "@/Components/header/TaskHeader";

const TaskTabStack = createMaterialTopTabNavigator<TaskTabNavigatorParamList>();

const TaskTabNavigator = ({ navigation }: any) => {
  const { t } = useTranslation();
  const setMyReports = useSetAtom(MyReportAtom);
  const [fetchMyReport] = useMyReportsLazyQuery();

  useEffect(() => {
    setTimeout(() => {
      fetchMyReport({
        variables: {
          input: {
            skip: 0,
            limit: 50,
          },
        },
        fetchPolicy: "no-cache",
      })
        .then((res) => {
          // console.log("res.data?.myReports?.data?.length", res.data?.myReports?.data?.length);
          if (res.data?.myReports?.data?.length) {
            setMyReports(res.data.myReports.data);
          } else {
            setMyReports([]);
          }
        })
        .catch((err) => {
          console.log("Error in fetching my reports", err);
        });
    }, 2000);
  }, []);

  return (
    <>
      <TaskHeader />
      {/* <Header navigation={navigation} /> */}
      <TaskTabStack.Navigator
        screenOptions={() => ({
          tabBarInactiveTintColor: Colors.dark.background,
          tabBarActiveTintColor: Colors.dark.background,
          tabBarPressColor: Colors.light.backgroundGray,
          tabBarStyle: { backgroundColor: Colors.light.background },
          tabBarIndicatorStyle: { backgroundColor: Colors.light.link },
        })}
      >
        <TaskTabStack.Screen
          name="AssignmentsHomeScreen"
          component={AssignmentsHomeScreen}
          options={{ tabBarLabel: t("navigation.goals") }}
        />
        <TaskTabStack.Screen
          name="MyReportsScreen"
          component={MyReportsScreen}
          options={{ tabBarLabel: t("navigation.reports") }}
        />
      </TaskTabStack.Navigator>
      <SurveyChecker type={SurveyEventType['Task']} />
      
    </>
  );
};

export default TaskTabNavigator;
