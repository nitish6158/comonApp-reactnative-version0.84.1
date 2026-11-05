import { View, Text, Pressable, SectionList } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ViewScheduleMessageProps } from "@/navigation/screenPropsTypes";
// import RealmContext from "../../../../../../schemas";
import { useAtomValue, useSetAtom } from "jotai";
import { singleRoom } from "@/Atoms";
import Ionicons from "react-native-vector-icons/Ionicons";
// const { useQuery } = RealmContext;
import { screenStyle as styles } from "./viewSchedule.styles";
import dayjs from "dayjs";
import { reminder } from "@/schemas/schema";

import { Menu, MenuOption, MenuOptions, MenuTrigger, renderers } from "react-native-popup-menu";
import Feather from "react-native-vector-icons/Feather";
import { useDeleteReminderMutation } from "@/graphql/generated/reminder.generated";
import { EventType, RecurrentTypes } from "@/graphql/generated/types";
import { useTranslation } from "react-i18next";
import { calendarGlobalReminder, calendarRefreshAtom, eventDeleteRequestAtom } from "@/Atoms/CalendarAtom";
import { capitalize } from "lodash";
import { Colors } from "@/Constants";
import {
  TimeSetterToMax,
  TimeSetterToZero,
  defaultFilter,
  filterType,
} from "../../../ReminderContainer/ViewReminderScreen/viewReminder.types";
import ReminderFilter from "../../../ReminderContainer/ViewReminderScreen/components/ReminderFilter";
import ToastMessage from "@/utils/ToastMesage";
import { useLazyQuery } from "@apollo/client";
import { GET_SCHEDULE_BY_ROOM_ID } from "@/graphql/reminder";
import { useFocusEffect } from "@react-navigation/native";

var calendar = require("dayjs/plugin/calendar");
dayjs.extend(calendar);
export default function ViewScheduleMessage({ route, navigation }: Readonly<ViewScheduleMessageProps>) {
  // const REALM_REMINDER = useQuery("reminder");
  const [scheduleMessage, setScheduleMessage] = useState<Array<{ title: string; data: reminder[] }>>([]);
  const display = useAtomValue(singleRoom);
  const setDeleteReminder = useSetAtom(eventDeleteRequestAtom);
  const setCalendarReminder = useSetAtom(calendarGlobalReminder);
  const reminderRefreshKey = useAtomValue(calendarRefreshAtom);
  const [filter, setFilter] = useState<filterType>(defaultFilter);
  const { t } = useTranslation();
  const [deleteEventRequest] = useDeleteReminderMutation();
  const [getScheduleByRoomId] = useLazyQuery(GET_SCHEDULE_BY_ROOM_ID, {
    fetchPolicy: "network-only",
  });

  const fetchScheduleMessages = useCallback(() => {
    const roomId = route?.params?.roomId ?? display?.roomId;
    if (!roomId) {
      setScheduleMessage([]);
      return Promise.resolve();
    }

    return getScheduleByRoomId({
      variables: {
        input: {
          roomId,
          From: TimeSetterToZero(filter.from),
          To: TimeSetterToMax(filter.to),
          pageNo: 1,
          limit: 50,
        },
      },
    })
      .then((res) => {
        const grouped = res?.data?.getScheduleByRoomID ?? [];
        const sections = grouped
          .map((group: any) => ({
            title: group?.date,
            data: (group?.reminders ?? []).filter(
              (event: any) => event?.type === EventType.Schedule
            ),
          }))
          .filter((section: any) => section?.title && section?.data?.length > 0);

        setScheduleMessage(sections as any);
      })
      .catch(() => {
        setScheduleMessage([]);
      });
  }, [route?.params?.roomId, display?.roomId, filter, getScheduleByRoomId]);

  useEffect(() => {
    fetchScheduleMessages();
  }, [fetchScheduleMessages, reminderRefreshKey]);

  useFocusEffect(
    useCallback(() => {
      fetchScheduleMessages();
      return () => {};
    }, [fetchScheduleMessages])
  );

  const messageTypeText = useCallback(
    (event) => {
      if (!event?.message || !Array.isArray(event.message) || event.message.length === 0) {
        return ["1 Message"];
      }
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

      const text = typeList.map(
        (v, vi) => `${typeList.length > 1 ? (vi > 0 ? "," : "") : ""} ${v.count} ${capitalize(v.type)}`
      );
      return text;
    },
    []
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="arrow-back" color="gray" size={30} onPress={navigation.goBack} />
          <Text style={styles.headingText}>{t("reminders.schedule-message").slice(0, 20)}</Text>
        </View>
        <ReminderFilter onSelected={setFilter} />
      </View>

      <SectionList
        keyExtractor={(item, index) => index.toString()}
        sections={scheduleMessage}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={{ marginVertical: 10, paddingHorizontal: 10, fontSize: 14, fontWeight: "500" }}>
            {dayjs(title).calendar(null, {
              sameDay: `[${t("reminders.today")}]`,
              nextDay: `[${t("reminders.tomorrow")}]`,
              nextWeek: `DD MMMM YYYY`,
              sameElse: "DD MMMM YYYY",
              lastDay: "DD MMMM YYYY",
              lastWeek: "DD MMMM YYYY",
            })}
          </Text>
        )}
        renderItem={({ item, index }) => {
          const text = messageTypeText(item);
          const isFutureEvent = dayjs(item.date).isSameOrAfter(dayjs(), "minutes");
          const isRejected = item?.participants?.[0]?.accepted === "REJECT";
          return (
            <Pressable
              onPress={() => {
                setCalendarReminder(item);
              }}
              key={item._id}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                backgroundColor: "#F3F9FC",
                marginVertical: 3,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <View>
                <Text style={{ textDecorationLine: isRejected ? "line-through" : "none" }}>
                  {text} {t("reminders.message-scheduled")}
                </Text>
                <View style={{ marginLeft: 5, marginTop: 5 }}>
                  <View
                    style={{
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      borderRadius: 10,
                      backgroundColor: Colors.light.PrimaryColor,
                      marginTop: 5,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text style={{ color: "white", fontSize: 12 }}>at {dayjs(item.time).format("HH:mm ")}</Text>
                  </View>
                  {item.approvalReminderTime.length > 0 && (
                    <View
                      style={{
                        paddingVertical: 4,
                        borderRadius: 10,
                        marginTop: 5,
                        alignSelf: "flex-start",
                      }}
                    >
                      <Text style={{ color: "bla", fontSize: 12 }}>
                        {t("reminders.approval-will-be")}
                        {` ${item.approvalReminderTime[0].Count} ${capitalize(item.approvalReminderTime[0].Unit)}`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <Menu key={index} renderer={renderers.Popover}>
                <MenuTrigger>
                  <View style={{ marginLeft: 10 }}>
                    <Feather name="more-vertical" size={18} color={"black"} />
                  </View>
                </MenuTrigger>
                <MenuOptions>
                  {isFutureEvent && (
                    <MenuOption
                      onSelect={() => {
                        navigation.navigate("CreateScheduleMessage", {
                          mode: "update",
                          ...item,
                        });
                      }}
                      text={t("reminders.change")}
                      customStyles={{
                        optionText: {
                          fontSize: 16,
                          marginRight: 10,
                          paddingHorizontal: 5,
                        },
                      }}
                    />
                  )}

                  <MenuOption
                    onSelect={() => {
                      const isNonOnce = item.recursive !== RecurrentTypes["Once"];
                      if (isNonOnce) {
                        setDeleteReminder(item);
                      } else {
                        const payload = {
                          variables: {
                            input: {
                              _id: item?._id,
                              thisOccurrence: true,
                              allOccurrence: false,
                            },
                          },
                        };
                        deleteEventRequest(payload)
                          .then((res) => {
                            
                            if (res.data?.deleteReminder) {
                              ToastMessage(t("reminders.event-deleted"));
                              fetchScheduleMessages();
                              
                            }
                          })
                          .catch((err) => {
                            ToastMessage(t("reminders.event-delete-error"));
                            
                          });
                      }
                    }}
                    text={t("reminders.delete")}
                    customStyles={{
                      optionText: {
                        fontSize: 16,
                        marginRight: 10,
                        paddingHorizontal: 5,
                      },
                    }}
                  />
                </MenuOptions>
              </Menu>
            </Pressable>
          );
        }}
        ListFooterComponent={<View style={{ marginBottom: 100 }} />}
        ListEmptyComponent={
          <View style={{ flex: 1, height: 650, justifyContent: "center", alignItems: "center" }}>
            <Text>{t("reminders.no-schedule-found")}</Text>
          </View>
        }
      />
    </View>
  );
}
