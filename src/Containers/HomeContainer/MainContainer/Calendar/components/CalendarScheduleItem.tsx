import { View, Text, Pressable, ViewStyle, StyleSheet } from "react-native";
import React, { useMemo, useEffect } from "react";
import { reminder } from "@/schemas/schema";
import { screenStyle as reminderStyle } from "../../ReminderContainer/ViewReminderScreen/viewReminder.styles";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { AllChatRooms } from "@/Atoms";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";
import { capitalize } from "lodash";
import { getStorage } from "@Util/storage";

type props = {
  eventStyle: ViewStyle[];
  event: reminder;
  onEventPressed: (data: reminder) => void;
  showTime?: boolean;
};

export default function CalendarScheduleItem({
  event,
  onEventPressed,
  eventStyle,
  showTime,
}: props) {
  const { t } = useTranslation();
  const chatRooms = useAtomValue(AllChatRooms);

  const currentRoom = useMemo(() => {
    return chatRooms.find((v) => v._id === event.roomId);
  }, [event.roomId]);

  const messageTypeText = useMemo(() => {
    let typeList = [] as Array<{ type: string; count: number }>;

    event.message.forEach((v) => {
      if (!typeList.find((b) => v.type == b.type)) {
        typeList.push({ type: v.type, count: 1 });
      } else {
        typeList = typeList.map((b) => {
          if (b.type == v.type) {
            return { ...b, count: b.count + 1 };
          } else {
            return b;
          }
        });
      }
    });

    let text = typeList.map(
      (v, vi) =>
        `${typeList.length > 1 ? (vi > 0 ? "," : "") : ""} ${
          v.count
        } ${capitalize(v.type)}`,
    );

    return text;
  }, [event.message]);

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

  if (!currentRoom) {
    return <></>;
  }

  return (
    <Pressable
      onPress={() => {
        onEventPressed(event);
      }}
      style={eventStyle}
    >
      {showTime && (
        <View style={styles.main}>
          <FastImage
            style={{ height: 25, width: 25, borderRadius: 30, marginRight: 10 }}
            source={{
              uri: `${DefaultImageUrl}${currentRoom.display.UserImage}`,
            }}
          />
          <Text>{currentRoom.display.UserName}</Text>
        </View>
      )}
      <View style={styles.message}>
        <Text style={{ fontSize: 14 }}>
          {messageTypeText + " " + t("message_scheduled")}
        </Text>
      </View>

      {showTime && (
        <View
          style={{
            marginLeft: 5,
            marginTop: 8,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  main: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A7E6FF",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  message: {
    marginTop: 5,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
});
