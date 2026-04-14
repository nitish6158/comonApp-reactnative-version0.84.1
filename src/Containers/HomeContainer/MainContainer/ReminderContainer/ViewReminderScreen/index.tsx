import { View, Text, Pressable, SectionList } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ViewReminderScreenProps } from "@/navigation/screenPropsTypes";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Reducer";
import { reminder } from "@/schemas/schema";
import Ionicons from "react-native-vector-icons/Ionicons";
import dayjs from "dayjs";
import { Colors } from "@/Constants";
import Entypo from "react-native-vector-icons/Entypo";
import { windowWidth } from "@Util/ResponsiveView";
import { Chip } from "react-native-ui-lib";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import { Menu, MenuOption, MenuOptions, MenuTrigger, renderers } from "react-native-popup-menu";
import Feather from "react-native-vector-icons/Feather";
import { EventType, ParticipantAcceptStatus, RecurrentTypes } from "@/graphql/generated/types";
import {
  useDeleteReminderMutation,
  useUpdateReminderApprovalStatusMutation,
} from "@/graphql/generated/reminder.generated";
import { useAtomValue, useSetAtom } from "jotai";
import { useFocusEffect } from "@react-navigation/native";
import { singleRoom } from "@/Atoms";
var calendar = require("dayjs/plugin/calendar");
dayjs.extend(calendar);
import { screenStyle as styles } from "./viewReminder.styles";
import ToastMessage from "@Util/ToastMesage";
import { useComonContacts } from "@/hooks/useComonContacts";
import { useTranslation } from "react-i18next";
import { useLazyQuery } from "@apollo/client";
import { GET_REMINDER_RANGE } from "@/graphql/reminder";
import { defaultFilter, filterType, TimeSetterToMax, TimeSetterToZero } from "./viewReminder.types";
import { calendarGlobalReminder, calendarRefreshAtom, eventDeleteRequestAtom } from "@/Atoms/CalendarAtom";
import ReminderFilter from "./components/ReminderFilter";

export default function ViewReminderScreen({ navigation, route }: ViewReminderScreenProps) {
  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const [reminders, setReminder] = useState<Array<{ title: string; data: reminder[] }>>([]);
  const display = useAtomValue(singleRoom);
  const { filterParticipants } = useComonContacts();
  const { t } = useTranslation();
  const setSingleReminder = useSetAtom(calendarGlobalReminder);
  const setDeleteReminder = useSetAtom(eventDeleteRequestAtom);
  const reminderRefreshKey = useAtomValue(calendarRefreshAtom);

  const [updateParticipantStatus] = useUpdateReminderApprovalStatusMutation();
  const [deleteEventRequest] = useDeleteReminderMutation();
  const [filter, setFilter] = useState<filterType>(defaultFilter);

  const [getReminderRange] = useLazyQuery(GET_REMINDER_RANGE, {
    fetchPolicy: "network-only",
  });

  const fetchReminders = useCallback(() => {
    if (!MyProfile?._id || !route?.params?.roomId) {
      setReminder([]);
      return Promise.resolve();
    }

    return getReminderRange({
      variables: {
        input: {
          _id: MyProfile._id,
          roomId: route.params.roomId,
          From: TimeSetterToZero(filter.from),
          To: TimeSetterToMax(filter.to),
          pageNo: 1,
          limit: 100,
        },
      },
    })
      .then((res) => {
        const grouped = res?.data?.getReminderRange ?? [];
        const sections = grouped
          .map((group: any) => {
            const sectionData = (group?.reminders ?? []).filter((event: any) => {
              if (event?.type !== EventType.Reminder) return false;
              const me = event?.participants?.find((p: any) => p?._id == MyProfile?._id);
              return me?.accepted == "ACCEPT" || me?.accepted == "PAUSE" || me?.role == "ADMIN";
            });

            return {
              title: group?.date,
              data: sectionData,
            };
          })
          .filter((section: any) => section?.title && section?.data?.length > 0);

        setReminder(sections as any);
      })
      .catch(() => {
        setReminder([]);
      });
  }, [MyProfile?._id, route?.params?.roomId, filter, getReminderRange]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders, reminderRefreshKey]);

  useFocusEffect(
    useCallback(() => {
      fetchReminders();
      return () => {};
    }, [fetchReminders])
  );

  return (
    <View style={styles.main}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: 10,
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="arrow-back" color="gray" size={30} onPress={navigation.goBack} />
          <Text style={styles.headingText}>{t("reminders.reminders")}</Text>
        </View>
        <ReminderFilter onSelected={setFilter} />
      </View>

      <SectionList
        keyExtractor={(item, index) => index.toString()}
        sections={reminders}
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
          const currentUser = item.participants.find((v) => v._id === MyProfile?._id);
          const adminUser = item.participants.find((v) => v.role === "ADMIN");
          const isCurrentUserAdmin = currentUser?.role == "ADMIN";
          const isFutureEvent = dayjs(item.date).isSameOrAfter(dayjs(), "minutes");
          return (
            <Pressable
              onPress={() => setSingleReminder(item)}
              key={index}
              style={[styles.reminder, styles[`type_light_${item.type}`]]}
            >
              <View style={styles.icon}>
                <FastImage source={{ uri: DefaultImageUrl + adminUser?.profile_img }} style={styles.admin_profile} />
              </View>

              <View style={styles.reminder_details}>
                <View style={styles.title_container}>
                  <Text style={[styles.titleText, styles[`text_${currentUser?.accepted}`]]}>{item.title}</Text>
                  {isCurrentUserAdmin && (
                    <Menu key={index} renderer={renderers.Popover}>
                      <MenuTrigger>
                        <View style={{ marginLeft: 10 }}>
                          <Feather name="more-vertical" size={18} color={"black"} />
                        </View>
                      </MenuTrigger>
                      <MenuOptions>
                        {isCurrentUserAdmin && isFutureEvent && (
                          <MenuOption
                            onSelect={() => {
                              navigation.navigate("CreateReminderScreen", {
                                roomType: item.roomType,
                                roomId: item.roomId,
                                participants: filterParticipants(display.participantsNotLeft),
                                reminder: item,
                              });
                            }}
                            text={t("reminders.edit")}
                            customStyles={{
                              optionText: {
                                fontSize: 16,
                                marginRight: 10,
                              },
                            }}
                          />
                        )}
                        {isCurrentUserAdmin && (
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
                                      fetchReminders();
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
                              },
                            }}
                          />
                        )}
                      </MenuOptions>
                    </Menu>
                  )}
                </View>
                <View style={styles.reminder_times}>
                  <Text style={[styles.timeText, styles[`text_${currentUser?.accepted}`]]}>
                    {dayjs(item.time).format("HH:mm")}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    width: windowWidth - 75,
                    // justifyContent: "space-between",
                  }}
                >
                  <View style={[styles.recurrent, styles[`type_box_${item.type}`]]}>
                    <Text style={styles.recurrentText}>{t(`reminders.${item.recursive?.toLowerCase()}`)}</Text>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={styles.participantIcon}>
                      <Ionicons
                        name="people"
                        size={18}
                        color={styles[`type_text_${item.type}`].color}
                        style={{ marginRight: 5 }}
                      />
                      <Text>{item.participants.length}</Text>
                    </View>

                    {item.attachment && item.attachment.length > 0 && (
                      <View style={styles.participantIcon}>
                        <Entypo
                          name="attachment"
                          size={16}
                          color={styles[`type_text_${item.type}`].color}
                          style={{ marginLeft: 12, marginRight: 5 }}
                        />
                        <Text>{item.attachment.length}</Text>
                      </View>
                    )}
                    {item.approvalReminderTime && item.approvalReminderTime.length > 0 && (
                      <View style={[styles.participantIcon, { marginHorizontal: 5 }]}>
                        {currentUser?.accepted === ParticipantAcceptStatus["Pause"] && (
                          <Ionicons
                            name="notifications-off-sharp"
                            size={16}
                            color={styles[`type_text_${item.type}`].color}
                          />
                        )}

                        {(currentUser?.accepted === ParticipantAcceptStatus["Accept"] ||
                          currentUser?.accepted === ParticipantAcceptStatus["Reject"]) && (
                          <Ionicons name="notifications" size={16} color={styles[`type_text_${item.type}`].color} />
                        )}
                        {currentUser?.accepted === ParticipantAcceptStatus["Pending"] && (
                          <Ionicons
                            name="notifications-outline"
                            size={16}
                            color={styles[`type_text_${item.type}`].color}
                          />
                        )}
                        <Text style={{ marginLeft: 2 }}>{item.approvalReminderTime.length}</Text>
                      </View>
                    )}
                    {item.location && (
                      <Ionicons name="location-sharp" size={18} color="red" style={{ marginHorizontal: 3 }} />
                    )}
                  </View>
                </View>

                <View style={{ alignSelf: "flex-end", flexDirection: "row", marginTop: 1 }}>
                  {currentUser?.role !== "ADMIN" && currentUser?.accepted == ParticipantAcceptStatus["Pending"] ? (
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Chip
                        label={"Accept"}
                        onPress={() => updateStatus(ParticipantAcceptStatus["Accept"], item._id)}
                      />
                      <View style={{ width: 5 }} />
                      <Chip
                        label={"Reject"}
                        onPress={() => updateStatus(ParticipantAcceptStatus["Reject"], item._id)}
                      />
                    </View>
                  ) : (
                    <></>
                  )}
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={{ flex: 1, height: 650, justifyContent: "center", alignItems: "center" }}>
            <Text>{t("reminders.no-reminders-found")}</Text>
            <Pressable
              onPress={() => {
                navigation.navigate("CreateReminderScreen", {
                  roomType: display.roomType,
                  roomId: display.roomId,
                  participants: filterParticipants(display.participantsNotLeft),
                });
              }}
              style={{
                marginVertical: 20,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(243,243,243,1)",
                paddingRight: 18,
                paddingLeft: 10,
                paddingVertical: 5,
                borderRadius: 10,
              }}
            >
              <Ionicons name="add-outline" size={28} color={Colors.light.PrimaryColor} />
              <Text style={{ fontWeight: "500", marginLeft: 5 }}>{t("reminders.add-new")}</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );

  function updateStatus(value: ParticipantAcceptStatus, _id: string) {
    updateParticipantStatus({
      variables: {
        input: {
          _id,
          ApprovalStatus: value,
        },
      },
    }).then((res) => {
      if (res.data?.updateReminderApprovalStatus) {
        if (value === ParticipantAcceptStatus["Accept"]) {
          ToastMessage(t("label.event-added-to-calender"));
        }
        fetchReminders();
      }
    });
  }
}
