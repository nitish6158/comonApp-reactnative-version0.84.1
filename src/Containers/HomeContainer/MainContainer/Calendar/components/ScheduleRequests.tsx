import { View, Text, FlatList } from "react-native";
import React, { useMemo } from "react";

import { useAtomValue } from "jotai";
import { CalendarScheduleMessage } from "@/Atoms/CalendarAtom";

import { screenStyle as schStyles } from "../../ChatContainer/ScheduleMessages/ViewScheduleMessage/viewSchedule.styles";

import ApprovalCard from "./ApprovalCard";
import { useTranslation } from "react-i18next";
import { reminder } from "@/schemas/schema";

export default function ScheduleRequests() {
  const scheduleMessage = useAtomValue(CalendarScheduleMessage);
  const { t } = useTranslation();

  // const parentNotifications = useMemo(() => {
  //   const parent = [] as reminder[];
  //   scheduleMessage.forEach((v) => {
  //     const find = parent.find((p) => p.parent_id == v.parent_id);
  //     if (!find) {
  //       parent.push(v);
  //     }
  //   });
  //   return parent;
  // }, [scheduleMessage]);

  return (
    <View style={{ marginTop: 10 }}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={scheduleMessage}
        ItemSeparatorComponent={() => <View style={schStyles.messageSeparator} />}
        renderItem={({ item, index }) => <ApprovalCard item={item} index={index} />}
        ListFooterComponent={<View style={{ marginBottom: 100 }} />}
        ListEmptyComponent={() => {
          return (
            <View style={{ flex: 1, height: 650, justifyContent: "center", alignItems: "center" }}>
              <Text>{t("reminders.no-approval-request-found")}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}
