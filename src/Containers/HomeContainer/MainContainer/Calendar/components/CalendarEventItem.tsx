import { View, Text, Pressable, ViewStyle } from "react-native";
import React, { useEffect } from "react";
import { reminder } from "@/schemas/schema";
import { screenStyle as reminderStyle } from "../../ReminderContainer/ViewReminderScreen/viewReminder.styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import { ParticipantAcceptStatus } from "@/graphql/generated/types";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { currentUserIdAtom } from "@/Atoms/RealmloginManager";
import { useAtomValue } from "jotai";
import { getStorage } from "@/utils/storage";

type props = {
  eventStyle: ViewStyle[];
  event: reminder;
  onEventPressed: (data: reminder) => void;
  showTime?: boolean;
};

export default function CalendarEventItem({
  event,
  onEventPressed,
  eventStyle,
  showTime,
}: props) {
  const { t } = useTranslation();
  const MyProfile = useAtomValue(currentUserIdAtom);

  const myUserId = MyProfile?._id;

  const getLocale = async () => {
    const loc = await getStorage("LANGUAGE");
    console.log("language=", loc);

    if (loc) {
      return loc;
    }
    return "en";
  };

  useEffect(() => {
    const initLocale = async () => {
      const language = await getLocale();
      dayjs.locale(language);
    };

    initLocale();
  }, []);

  const currentUser = React.useMemo(() => {
    return event?.participants?.find((p) => p._id === myUserId);
  }, [event?.participants, myUserId]);
  return (
    <Pressable
      onPress={() => {
        onEventPressed(event);
      }}
      style={eventStyle}
    >
      <Text style={{ color: "black", fontSize: !showTime ? 14 : 16 }}>
        {event.title}
      </Text>

      {showTime && (
        <View style={reminderStyle.reminder_times}>
          {event.date && (
            <Text
              style={[
                reminderStyle.dateText,
                reminderStyle[`text_${event.currentUser?.accepted}`],
              ]}
            >
              {dayjs(event.date).format("DD MMMM YYYY")}
            </Text>
          )}

          <Text
            style={[
              reminderStyle.timeText,
              reminderStyle[`text_${event.currentUser?.accepted}`],
            ]}
          >
            |{" "}
            {event.isAllDay
              ? t("all_day") + " "
              : dayjs(event.time).format("HH:mm")}
          </Text>
        </View>
      )}

      {showTime && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={[
              reminderStyle.recurrent,
              reminderStyle[`type_box_${event.type}`],
            ]}
          >
            <Text style={reminderStyle.recurrentText}>
              {t(`reminders.${event.recursive?.toLowerCase()}`)}
            </Text>
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
            {event.approvalReminderTime &&
              event.approvalReminderTime.length > 0 && (
                <View
                  style={[
                    reminderStyle.participantIcon,
                    { marginHorizontal: 5 },
                  ]}
                >
                  {currentUser?.accepted ===
                    ParticipantAcceptStatus["Pause"] && (
                    <Ionicons
                      name="notifications-off-sharp"
                      size={16}
                      color={reminderStyle[`type_text_${event.type}`].color}
                    />
                  )}

                  {(currentUser?.accepted ===
                    ParticipantAcceptStatus["Accept"] ||
                    currentUser?.accepted ===
                      ParticipantAcceptStatus["Reject"]) && (
                    <Ionicons
                      name="notifications"
                      size={16}
                      color={reminderStyle[`type_text_${event.type}`].color}
                    />
                  )}
                  {currentUser?.accepted ===
                    ParticipantAcceptStatus["Pending"] && (
                    <Ionicons
                      name="notifications-outline"
                      size={16}
                      color={reminderStyle[`type_text_${event.type}`].color}
                    />
                  )}
                  <Text style={{ marginLeft: 2 }}>
                    {event.approvalReminderTime.length}
                  </Text>
                </View>
              )}
            {event.location && (
              <Ionicons
                name="location-sharp"
                size={18}
                color="red"
                style={{ marginHorizontal: 3 }}
              />
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}
