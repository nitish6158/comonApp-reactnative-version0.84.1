import { View, Text } from "react-native";
import React from "react";
import { CalenderNotificationsProps } from "@/navigation/screenPropsTypes";

import { screenStyle as styles } from "../ReminderContainer/ViewReminderScreen/viewReminder.styles";
import Ionicons from "react-native-vector-icons/Ionicons";

import EventRequests from "./components/EventRequests";
import ScheduleRequests from "./components/ScheduleRequests";
import { TabController } from "react-native-ui-lib";
import { useTranslation } from "react-i18next";
import CalendarDataManipulator from "./CalendarDataManipulator";

export default function CalenderNotifications({ route, navigation }: Readonly<CalenderNotificationsProps>) {
  const {t} = useTranslation()
  return (
    <View style={styles.main}>
      <View style={styles.header}>
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Ionicons name="arrow-back" color="gray" size={30} onPress={navigation.goBack} />
          <Text style={styles.headingText}>{t("reminders.notification")}</Text>
        </View>
        <CalendarDataManipulator/>
      </View>
      <TabController initialIndex={route.params.tabIndex ?? 0} items={[{ label: t("reminders.invitation") }, { label: t("reminders.approval") }]}>
        <TabController.TabBar
          selectedLabelColor={"black"}
          labelColor={"black"}
          indicatorStyle={{ backgroundColor: "black" }}
        />
        <View style={{ flex: 1 }}>
          <TabController.TabPage index={0}>
            <EventRequests />
          </TabController.TabPage>
          <TabController.TabPage index={1} lazy>
            <ScheduleRequests />
          </TabController.TabPage>
        </View>
      </TabController>
    </View>
  );
}
