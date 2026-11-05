import { View, Text, Pressable, ViewStyle } from "react-native";
import React from "react";
import { reminder } from "@/schemas/schema";
import { screenStyle as reminderStyle } from "../../ReminderContainer/ViewReminderScreen/viewReminder.styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import { ParticipantAcceptStatus } from "@/graphql/generated/types";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import Feather from "react-native-vector-icons/Feather";
import { Colors } from "@/Constants";

type props = {
  eventStyle: ViewStyle[];
  event: reminder;
  onEventPressed: (data: reminder) => void;
  showTime?: boolean;
};

export default function RecordEventItem({ event, onEventPressed, eventStyle, showTime }: props) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={() => {
        onEventPressed(event);
      }}
      style={eventStyle}
    >
      <View
        style={{
          paddingVertical: 5,
          paddingHorizontal: 10,
          borderRadius: 5,
          backgroundColor: Colors.light.PrimaryColor,
          flexDirection: "row",
          alignItems: "flex-start",
          alignSelf: "flex-start",
        }}
      >
        <Feather name="database" size={18} color="white" />
        <Text style={{ color: "white", fontSize: 14, marginLeft: 10 }}>{event.title}</Text>
      </View>
      <Text style={{ color: "black", fontSize: 12, marginTop: 10, marginLeft: 3 }}>{event.description}</Text>

      {showTime && (
        <View style={[reminderStyle.reminder_times, { marginLeft: 3 }]}>
          {event.date && (
            <Text style={[reminderStyle.dateText, reminderStyle[`text_${event.currentUser?.accepted}`]]}>
              {dayjs(event.date).format("DD MMMM YYYY")}
            </Text>
          )}
        </View>
      )}

      {showTime && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: 3,
          }}
        >
          <View style={[reminderStyle.recurrent, reminderStyle[`type_box_${event.type}`]]}>
            <Text style={reminderStyle.recurrentText}>{t(`reminders.${event.recursive?.toLowerCase()}`)}</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={reminderStyle.participantIcon}>
              <Ionicons
                name="people"
                size={18}
                color={reminderStyle[`type_text_${event.type}`].color}
                style={{ marginRight: 5 }}
              />
              <Text>{event.participants.length}</Text>
            </View>

            {event.attachment && event.attachment.length > 0 && (
              <View style={reminderStyle.participantIcon}>
                <Entypo
                  name="attachment"
                  size={16}
                  color={reminderStyle[`type_text_${event.type}`].color}
                  style={{ marginLeft: 12, marginRight: 5 }}
                />
                <Text>{event.attachment.length}</Text>
              </View>
            )}
            {event.approvalReminderTime && event.approvalReminderTime.length > 0 && (
              <View style={[reminderStyle.participantIcon, { marginHorizontal: 5 }]}>
                {event.currentUser?.accepted === ParticipantAcceptStatus["Pause"] && (
                  <Ionicons
                    name="notifications-off-sharp"
                    size={16}
                    color={reminderStyle[`type_text_${event.type}`].color}
                  />
                )}

                {(event.currentUser?.accepted === ParticipantAcceptStatus["Accept"] ||
                  event.currentUser?.accepted === ParticipantAcceptStatus["Reject"]) && (
                  <Ionicons name="notifications" size={16} color={reminderStyle[`type_text_${event.type}`].color} />
                )}
                {event.currentUser?.accepted === ParticipantAcceptStatus["Pending"] && (
                  <Ionicons
                    name="notifications-outline"
                    size={16}
                    color={reminderStyle[`type_text_${event.type}`].color}
                  />
                )}
                <Text style={{ marginLeft: 2 }}>{event.approvalReminderTime.length}</Text>
              </View>
            )}
            {event.location && <Ionicons name="location-sharp" size={18} color="red" style={{ marginHorizontal: 3 }} />}
          </View>
        </View>
      )}
    </Pressable>
  );
}
