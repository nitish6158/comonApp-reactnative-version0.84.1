import ChatStackNavigator, { useChatRoomFormatter } from "./ChatStackNavigator";
import React, { useEffect } from "react";
import { Text, View } from "react-native";

import { BottomTabParamsList } from "./screenPropsTypes";
import CallTabNavigator from "./CallTabNavigator";
import Colors from "@/Constants/Colors";
import Entypo from "react-native-vector-icons/Entypo";
import Ionicons from "react-native-vector-icons/Ionicons";
import TaskTabNavigator from "./TaskTabNavigator";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTranslation } from "react-i18next";
import { atom, useAtomValue, useSetAtom } from "jotai";
import { taskNotificationLoader } from "@/Atoms/AssignmentAtom";
import Calendar from "@/Containers/HomeContainer/MainContainer/Calendar";
import { calendarGlobalReminder } from "@/Atoms/CalendarAtom";
import { navigate } from "./utility";
import { OverlayLoader } from "@/Components";
import { windowWidth } from "@/utils/ResponsiveView";
import { socketManager } from "@/utils/socket/SocketManager";

const BottomTabNavigator = createBottomTabNavigator<BottomTabParamsList>();
export const initialBottomTabScreenAtom = atom<{ name: string; payload: any }>({
  name: "TaskTabScreen",
  payload: null,
});

const BottomTabScreen = () => {
  const { t } = useTranslation();
  const initialScreen = useAtomValue(initialBottomTabScreenAtom);
  const setCalendarReminder = useSetAtom(calendarGlobalReminder);

  const taskNotification = useAtomValue(taskNotificationLoader);

  useEffect(() => {
    if (initialScreen.payload) {
      if (initialScreen.name == "CalendarTabScreen") {
        setCalendarReminder(initialScreen.payload);
        navigate("CalendarTabScreen", {});
      }
    }
  }, [initialScreen]);

  // Use the hook to set up chat room formatting
  useChatRoomFormatter();

  return (
    <View style={{ flex: 1 }}>
      <BottomTabNavigator.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveBackgroundColor: Colors.light.background,
          tabBarInactiveBackgroundColor: Colors.light.background,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: Colors.light.background,
            borderTopWidth: 0,
            height: 75,
            paddingVertical: 5,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
        }}
        initialRouteName={initialScreen.name}
      >
        <BottomTabNavigator.Screen
          name="TaskTabScreen"
          component={TaskTabNavigator}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  width: windowWidth / 5,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 15,
                    paddingVertical: 4,
                    borderRadius: 20,
                    backgroundColor: focused ? Colors.light.tabColor : "white",
                    height: 30,
                  }}
                >
                  <Ionicons
                    name={focused ? "briefcase" : "briefcase-outline"}
                    size={22}
                    color={"black"}
                  />
                </View>
                <Text
                  style={{
                    color: "black",
                    width: "100%",
                    fontWeight: focused ? "500" : "400",
                    textAlign: "center",
                  }}
                >
                  {t("navigation.tasks")}
                </Text>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              if (taskNotification) {
                e.preventDefault();
              }
            },
          }}
        />

        <BottomTabNavigator.Screen
          name="ChatTabScreen"
          component={ChatStackNavigator}
          options={({ route }) => ({
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  width: windowWidth / 5,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 15,
                    paddingVertical: 4,
                    borderRadius: 20,
                    backgroundColor: focused ? Colors.light.tabColor : "white",
                    height: 30,
                  }}
                >
                  <Ionicons
                    name={
                      focused
                        ? "chatbubble-ellipses"
                        : "chatbubble-ellipses-outline"
                    }
                    size={22}
                    color={"black"}
                  />
                </View>
                <Text
                  style={{
                    color: "black",
                    width: "100%",
                    fontWeight: focused ? "500" : "400",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  {t("navigation.chats")}
                </Text>
              </View>
            ),
          })}
          listeners={{
            tabPress: (e) => {
              if (taskNotification) {
                e.preventDefault();
              }
            },
          }}
        />

        <BottomTabNavigator.Screen
          name="CallTabScreen"
          component={CallTabNavigator}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  width: windowWidth / 5,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 15,
                    paddingVertical: 4,
                    borderRadius: 20,
                    backgroundColor: focused ? Colors.light.tabColor : "white",
                    height: 30,
                  }}
                >
                  <Ionicons
                    name={focused ? "call-sharp" : "call-outline"}
                    size={22}
                    color={"black"}
                  />
                </View>
                <Text
                  style={{
                    color: "black",
                    width: "100%",
                    fontWeight: focused ? "500" : "400",
                    textAlign: "center",
                  }}
                >
                  {t("navigation.calls")}
                </Text>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              if (taskNotification) {
                e.preventDefault();
              }
            },
          }}
        />
        <BottomTabNavigator.Screen
          name="CalendarTabScreen"
          component={Calendar}
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  width: windowWidth / 5,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 15,
                    paddingVertical: 4,
                    borderRadius: 20,
                    backgroundColor: focused ? Colors.light.tabColor : "white",
                    height: 30,
                  }}
                >
                  <Ionicons
                    name={focused ? "calendar" : "calendar-outline"}
                    size={22}
                    color={"black"}
                  />
                </View>
                <Text
                  style={{
                    color: "black",
                    width: "100%",
                    fontWeight: focused ? "500" : "400",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  {t("reminders.calender")}
                </Text>
              </View>
            ),
          }}
          listeners={{
            tabPress: (e) => {
              if (taskNotification) {
                e.preventDefault();
              }
            },
          }}
        />
      </BottomTabNavigator.Navigator>
      {taskNotification && <OverlayLoader />}
    </View>
  );
};

export default BottomTabScreen;
