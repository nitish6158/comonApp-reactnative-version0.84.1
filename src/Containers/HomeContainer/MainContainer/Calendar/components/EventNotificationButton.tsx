import { View, Text, Pressable } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { navigate } from "@/navigation/utility";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Badge } from "react-native-ui-lib";
import { useAtomValue } from "jotai";
import { CalendarNotifications, CalendarScheduleMessage, notificationCount, ReminderEventData } from "@/Atoms/CalendarAtom";

export default function EventNotificationButton() {
  const count = useAtomValue(notificationCount);

  return (
    <Pressable
      style={{ width: 30 }}
      onPress={() => {
        navigate("CalenderNotifications", {});
      }}
    >
      <Ionicons name="notifications-outline" size={22} />
      {count > 0 && (
        <Badge
          style={{ position: "absolute", zIndex: 5, top: -5, right: 0 }}
          label={count > 99 ? `${99}+` : `${count}`}
          size={16}
        />
      )}
    </Pressable>
  );
}
