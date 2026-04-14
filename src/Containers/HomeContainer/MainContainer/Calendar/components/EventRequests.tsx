import { FlashList } from "@shopify/flash-list";
import { useAtomValue } from "jotai";
import { Text, View } from "react-native";
import React, { useMemo } from "react";
import InvitationCard from "./InvitationCard";
import { CalendarNotifications } from "@/Atoms/CalendarAtom";
import { screenStyle as styles } from "../../ReminderContainer/ViewReminderScreen/viewReminder.styles";
import { useTranslation } from "react-i18next";
import { reminder } from "@/schemas/schema";

export default function EventRequests() {
  const Notifications = useAtomValue(CalendarNotifications);
  console.log("Event Requests Rendered", Notifications);
  const { t } = useTranslation();

  const parentNotifications = useMemo(() => {
    const parent = [] as reminder[];
    Notifications.forEach((v) => {
      const find = parent.find((p) => p.parent_id == v.parent_id);
      if (!find) {
        parent.push(v);
      }
    });
    return parent;
  }, [Notifications]);

  return (
    <View style={styles.main}>
      <FlashList
        estimatedItemSize={30}
        data={parentNotifications}
        renderItem={({ item, index }) => <InvitationCard item={item} index={index} />}
        ListEmptyComponent={
          <View style={{ flex: 1, height: 650, justifyContent: "center", alignItems: "center" }}>
            <Text>{t("reminders.no-invitation-request-found")}</Text>
          </View>
        }
      />
    </View>
  );
}
