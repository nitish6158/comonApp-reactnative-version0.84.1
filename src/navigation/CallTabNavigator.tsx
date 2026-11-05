import { NavigationProp, findFocusedRoute, useNavigation } from "@react-navigation/core";

import AllCallsScreen from "@/Containers/HomeContainer/MainContainer/CallContainer/AllCallsScreen";
import { CallHeader } from "../Components/header/CallHeader";
import { CallTabStackParamsList } from "./screenPropsTypes";
import Colors from "@/Constants/Colors";
// import { JoinCallChecker } from "./ChatStackNavigator";
import MissedCallsScreen from "@/Containers/HomeContainer/MainContainer/CallContainer/MissedCallsScreen";
/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-unused-styles */
import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTranslation } from "react-i18next";
import { SurveyChecker } from "@/Containers/HomeContainer/MainContainer/SurveyContainer/SurveyChecker";
import { SurveyEventType } from "@/graphql/generated/types";

const CallTabStack = createMaterialTopTabNavigator<CallTabStackParamsList>();

export default function CallTabNavigator(props) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <React.Fragment>
      {/* <JoinCallChecker /> */}
      <CallHeader
        layout={{
          width: 0,
          height: 0,
        }}
        options={undefined}
        route={undefined}
        navigation={props.navigation}
      />

      <CallTabStack.Navigator
        screenOptions={() => ({
          tabBarInactiveTintColor: Colors.dark.background,
          tabBarActiveTintColor: Colors.dark.background,
          tabBarPressColor: Colors.light.backgroundGray,
          tabBarStyle: { backgroundColor: Colors.light.background },
          tabBarIndicatorStyle: { backgroundColor: Colors.light.link },
        })}
      >
        <CallTabStack.Screen
          name="AllCallListScreen"
          component={AllCallsScreen}
          options={{ tabBarLabel: t("calls.all"), tabBarItemStyle: {} }}
        />
        <CallTabStack.Screen
          name="MissedCallListScreen"
          component={MissedCallsScreen}
          options={{ tabBarLabel: t("calls.missed") }}
        />
      </CallTabStack.Navigator>
      <SurveyChecker type={SurveyEventType['Call']} />
    </React.Fragment>
  );
}
