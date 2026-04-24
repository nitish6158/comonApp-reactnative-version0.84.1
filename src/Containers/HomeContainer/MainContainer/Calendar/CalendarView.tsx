import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from "react-native";
import {
  AgendaList,
  CalendarProvider,
  ExpandableCalendar,
  TimelineEventProps,
  TimelineList,
  TimelineListProps,
  WeekCalendar,
} from "react-native-calendars";
import { CURRENT_DATE } from "@Util/calendar.utils";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { Colors, fonts } from "@/Constants";
import {
  AllCalendarData,
  CalendarDotAtom,
  calendarGlobalReminder,
  CalendarLoader,
  CalendarMode,
  IAllCalendarData,
  IDailyModeData,
  ReminderEventData,
} from "@/Atoms/CalendarAtom";

import dayjs from "dayjs";

import { reminder } from "@/schemas/schema";

import CalendarEventItem from "./components/CalendarEventItem";
import CalendarTaskItem from "./components/CalendarTaskItem";
import _ from "lodash";
import { Chip, ListItem } from "react-native-ui-lib";
import { screenStyle as reminderStyle } from "../ReminderContainer/ViewReminderScreen/viewReminder.styles";
import { useTranslation } from "react-i18next";
import TaskDayComponent from "./components/TaskDayComponent";
import CalendarScheduleItem from "./components/CalendarScheduleItem";
import {
  useUpdateDragDropMutation,
  useUpdateReminderMutation,
} from "@/graphql/generated/reminder.generated";
import ToastMessage from "@/utils/ToastMesage";
import RecordEventItem from "./components/RecordEventItem";
import { use } from "i18next";

export const selectedDateAtom = atom(CURRENT_DATE);
export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const calendarMode = useAtomValue(CalendarMode);
  const reminderData = useAtomValue(ReminderEventData);
  const allCalendarData = useAtomValue(AllCalendarData);
  const calenderDots = useAtomValue(CalendarDotAtom);
  // const [loading, setLoading] = useState(true);
  const loading = useAtomValue(CalendarLoader);
  const setLoading = useSetAtom(CalendarLoader);

  console.log("loadinggggggg", loading);

  useEffect(() => {
    if (!loading) return;

    const timer = setTimeout(() => {
      console.log("Force stopping loader...");
      setLoading(false);
    }, 8000); // 8 seconds fallback

    return () => clearTimeout(timer);
  }, [loading]);

  // if (!loading) return null;
  // useEffect(()=>{
  // setTimeout(() => {
  //   setLoading(false)
  // }, 1000);
  // },[])
  const { t } = useTranslation();
  const setCalendarReminder = useSetAtom(calendarGlobalReminder);
  const [updateTime] = useUpdateDragDropMutation();
  const agendaListRef = useRef<any>(null);
  const monthlyScrollRef = useRef<ScrollView | null>(null);
  const monthlySectionPositionsRef = useRef<Record<string, number>>({});

  const MultiDateEvent = useMemo(() => {
    if (calendarMode == 1) {
      return CreateMonthlySection();
    }
    if (calendarMode == 2) {
      return CreateWeeklySection();
    }
    if (calendarMode == 3) {
      const data = reminderData;
      Object.entries(allCalendarData).forEach(([key, value]) => {
        const isFound = data[key];
        if (isFound) {
          data[key] = _.uniqBy([...data[key], ...value], (n) => n.id);
        } else {
          data[key] = value;
        }
      });

      return data;
    } else {
      return {};
    }
  }, [calendarMode, selectedDate, reminderData, allCalendarData]);

  const scrollToSelectedDate = useCallback(
    (dateToScroll: string) => {
      if (calendarMode === 1) {
        const monthlyOffset = monthlySectionPositionsRef.current[dateToScroll];
        if (monthlyOffset !== undefined) {
          monthlyScrollRef.current?.scrollTo({
            y: Math.max(0, monthlyOffset - 8),
            animated: true,
          });
        }
        return;
      }

      if (calendarMode !== 2) {
        return;
      }

      const sectionIndex = MultiDateEvent.findIndex(
        (section: { title: string }) => section.title === dateToScroll
      );

      if (sectionIndex < 0 || !agendaListRef.current?.scrollToLocation) {
        return;
      }

      agendaListRef.current?.scrollToLocation({
        animated: true,
        sectionIndex,
        itemIndex: 0,
        viewPosition: 0,
      });
    },
    [calendarMode, MultiDateEvent]
  );

  const onCalendarDayPress = useCallback(
    (dateString: string) => {
      setSelectedDate(dateString);
      scrollToSelectedDate(dateString);
    },
    [scrollToSelectedDate, setSelectedDate]
  );
  const CalendarModes = useCallback(() => {
    switch (calendarMode) {
      case 1:
        return (
          <ExpandableCalendar
            markingType={"multi-dot"}
            markedDates={calenderDots}
            initialPosition={ExpandableCalendar.positions.OPEN}
            firstDay={1}
            disablePan={true}
            hideKnob
            onDayPress={(date) => {
              onCalendarDayPress(date.dateString);
            }}
          />
        );
      case 2:
        return (
          <WeekCalendar
            firstDay={1}
            onDayPress={(date) => {
              onCalendarDayPress(date.dateString);
            }}
          />
        );
      case 3:
        return (
          <ExpandableCalendar
            initialPosition={ExpandableCalendar.positions.CLOSED}
            firstDay={1}
            disablePan={true}
            hideKnob
            onDayPress={(date) => {
              onCalendarDayPress(date.dateString);
            }}
          />
        );
      default:
        return <></>;
    }
  }, [calendarMode, calenderDots, onCalendarDayPress]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer = setTimeout(() => {
      scrollToSelectedDate(selectedDate);
    }, 0);

    return () => clearTimeout(timer);
  }, [loading, scrollToSelectedDate, selectedDate]);

  return (
    <View style={styles.container}>
      <CalendarProvider
        showTodayButton={false}
        date={selectedDate}
        onDateChanged={(date, source) => {
          setSelectedDate(date);
        }}
      >
        <View>
          <View
            onLayout={(e) => console.log("Layout", e.nativeEvent.layout.height)}
          >
            <CalendarModes />
          </View>
          {(calendarMode == 1 || calendarMode == 2) && (
            <>
              {loading ? (
                <View
                  style={{
                    height: "50%",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <ActivityIndicator size="large" color={Colors.dark.overlay} />
                </View>
              ) : (
                <>
                  {calendarMode == 1 ? (
                    <ScrollView
                      ref={monthlyScrollRef}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={styles.monthlyScrollContent}
                    >
                      {MultiDateEvent.length > 0 ? (
                        <>
                          {MultiDateEvent.map((section, sectionIndex) => (
                            <View
                              key={section.title}
                              onLayout={(event) => {
                                monthlySectionPositionsRef.current[
                                  section.title
                                ] = event.nativeEvent.layout.y;
                              }}
                              style={styles.monthlySection}
                            >
                              <Text style={styles.sectionTitle}>
                                {dayjs(section.title).format("DD MMMM YYYY")}
                              </Text>

                              {section.data.map((item, index) => {
                                const data = JSON.parse(item.extraData) as reminder;

                                return (
                                  <View
                                    key={`${section.title}-${item.id ?? index}`}
                                    style={{ marginTop: 5 }}
                                  >
                                    {data.type === "SCHEDULE" && (
                                      <CalendarScheduleItem
                                        event={data}
                                        eventStyle={[
                                          {
                                            width: "100%",
                                            backgroundColor: item.color,
                                            paddingHorizontal: 20,
                                            paddingVertical: 20,
                                          },
                                        ]}
                                        onEventPressed={() => {
                                          setCalendarReminder(data);
                                        }}
                                        showTime={true}
                                      />
                                    )}

                                    {(data.type === "REMINDER" ||
                                      data.type === "APPOINTMENT" ||
                                      data.type === "CALLREMINDER") && (
                                      <CalendarEventItem
                                        event={data}
                                        eventStyle={[
                                          {
                                            width: "100%",
                                            backgroundColor: item.color,
                                            paddingHorizontal: 20,
                                            paddingVertical: 20,
                                          },
                                        ]}
                                        onEventPressed={() => {
                                          setCalendarReminder(data);
                                        }}
                                        showTime={true}
                                      />
                                    )}

                                    {data.type === "Record_Reminder" && (
                                      <RecordEventItem
                                        event={data}
                                        eventStyle={[
                                          {
                                            width: "100%",
                                            backgroundColor: item.color,
                                            paddingHorizontal: 20,
                                            paddingVertical: 20,
                                          },
                                        ]}
                                        onEventPressed={() => {
                                          setCalendarReminder(data);
                                        }}
                                        showTime={true}
                                      />
                                    )}

                                    {data.type == "TASK" && (
                                      <CalendarTaskItem
                                        event={{ ...data, ct: section.title }}
                                        eventStyle={[
                                          {
                                            width: "100%",
                                            backgroundColor: item.color,
                                            paddingHorizontal: 20,
                                            paddingVertical: 20,
                                          },
                                        ]}
                                        onEventPressed={() => {
                                          // setCalendarReminder(data);
                                        }}
                                        showTime={true}
                                      />
                                    )}
                                  </View>
                                );
                              })}
                            </View>
                          ))}

                          <View style={{ marginBottom: 350 }} />
                        </>
                      ) : (
                        <View style={styles.emptyState}>
                          <Text>{t("no_event_found")}</Text>
                        </View>
                      )}
                    </ScrollView>
                  ) : (
                  <AgendaList
                    ref={agendaListRef}
                    sections={MultiDateEvent}
                    renderItem={({ item, index, section }) => {
                      const data = JSON.parse(item.extraData) as reminder;

                      return (
                        <View key={index} style={{ marginTop: 5 }}>
                          {data.type === "SCHEDULE" && (
                            <CalendarScheduleItem
                              event={data}
                              eventStyle={[
                                {
                                  width: "100%",
                                  backgroundColor: item.color,
                                  paddingHorizontal: 20,
                                  paddingVertical: 20,
                                },
                              ]}
                              onEventPressed={() => {
                                setCalendarReminder(data);
                              }}
                              showTime={true}
                            />
                          )}

                          {(data.type === "REMINDER" ||
                            data.type === "APPOINTMENT" ||
                            data.type === "CALLREMINDER") && (
                            <CalendarEventItem
                              event={data}
                              eventStyle={[
                                {
                                  width: "100%",
                                  backgroundColor: item.color,
                                  paddingHorizontal: 20,
                                  paddingVertical: 20,
                                },
                              ]}
                              onEventPressed={() => {
                                setCalendarReminder(data);
                              }}
                              showTime={true}
                            />
                          )}

                          {data.type === "Record_Reminder" && (
                            <RecordEventItem
                              event={data}
                              eventStyle={[
                                {
                                  width: "100%",
                                  backgroundColor: item.color,
                                  paddingHorizontal: 20,
                                  paddingVertical: 20,
                                },
                              ]}
                              onEventPressed={() => {
                                setCalendarReminder(data);
                              }}
                              showTime={true}
                            />
                          )}

                          {data.type == "TASK" && (
                            <CalendarTaskItem
                              event={{ ...data, ct: section.title }}
                              eventStyle={[
                                {
                                  width: "100%",
                                  backgroundColor: item.color,
                                  paddingHorizontal: 20,
                                  paddingVertical: 20,
                                },
                              ]}
                              onEventPressed={() => {
                                // setCalendarReminder(data);
                              }}
                              showTime={true}
                            />
                          )}
                        </View>
                      );
                    }}
                    ListFooterComponent={() => {
                      return (
                        <View
                          style={{
                            marginBottom: calendarMode == 1 ? 350 : 150,
                          }}
                        />
                      );
                    }}
                    ListEmptyComponent={() => {
                      return (
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            height: 400,
                          }}
                        >
                          {/* {CalendarLoader ? (<ActivityIndicator size="large" color={Colors.dark.overlay} />) : (<Text>No Events Found</Text>)} */}
                          <Text>{t("no_event_found")}</Text>
                        </View>
                      );
                    }}
                    render
                    avoidDateUpdates={true}
                    initialNumToRender={20}
                    maxToRenderPerBatch={20}
                    windowSize={9}
                  />
                  )}
                </>
              )}
            </>
          )}
          {calendarMode == 3 && (
            <View>
              <View
                style={{
                  paddingVertical: 5,
                  backgroundColor: "#F3F9FC",
                  flexDirection: "row",
                  alignItems: "center",
                  height: 45,
                  paddingLeft: 10,
                }}
              >
                <Text style={{ marginRight: 8 }}>
                  {t("reminders.all-day")} :{" "}
                </Text>

                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                >
                  {MultiDateEvent[selectedDate ?? ""] &&
                    MultiDateEvent[selectedDate ?? ""]
                      .filter((v: IAllCalendarData) => v.isAllDay)
                      ?.map((event: IAllCalendarData, index: number) => {
                        const data = JSON.parse(event.extraData) as reminder;

                        if (data.type == "SCHEDULE") {
                          return <></>;
                        }

                        if (data.type === "TASK") {
                          return (
                            <TaskDayComponent
                              event={event}
                              data={data}
                              title={event.title}
                            />
                          );
                        }

                        return (
                          <Chip
                            key={index}
                            label={event.title.slice(0, 20)}
                            labelStyle={{ color: "white" }}
                            onPress={() => {
                              setCalendarReminder(data);
                            }}
                            containerStyle={[
                              {
                                marginRight: 5,
                                borderColor: "gray",
                                borderRadius: 5,
                              },
                              reminderStyle[`type_box_${data.type}`],
                            ]}
                          />
                        );
                      })}
                </ScrollView>
              </View>

              <TimelineList
                timelineProps={{
                  format24h: false,
                  overlapEventsSpacing: 8,
                  rightEdgeSpacing: 24,
                }}
                events={MultiDateEvent}
                showNowIndicator={false}
                onDragFailed={() => {
                  ToastMessage(t("reminders.drag-drop-disabled"));
                }}
                // scrollToNow
                onDateScroll={setSelectedDate}
                onDrag={onEventDropped}
                eventTapped={(event) => {
                  const data = JSON.parse(event?.extraData) as reminder;
                  if (data.type != "TASK") {
                    setCalendarReminder(data);
                  }
                }}
                renderEvent={(event, styles) => {
                  const data = JSON.parse(event.extraData) as reminder;

                  if (data.isAllDay) {
                    return <></>;
                  }

                  return (
                    <View>
                      {data.type !== "TASK" &&
                        (data.type === "SCHEDULE" ? (
                          <CalendarScheduleItem
                            event={data}
                            eventStyle={styles}
                            onEventPressed={() => {
                              setCalendarReminder(data);
                            }}
                          />
                        ) : (
                          <CalendarEventItem
                            event={data}
                            eventStyle={styles}
                            onEventPressed={() => {
                              setCalendarReminder(data);
                            }}
                          />
                        ))}
                      {data.type === "TASK" && (
                        <CalendarTaskItem
                          event={data}
                          eventStyle={styles}
                          onEventPressed={() => {
                            // setCalendarReminder(data);
                          }}
                        />
                      )}
                    </View>
                  );
                }}
              />
            </View>
          )}
        </View>
      </CalendarProvider>
    </View>
  );

  function onEventDropped(changeTime, item) {
    const singleUnitOfTime = 100 / 60; // 1 unit of UI == 1.66
    const totalTimeMoved = changeTime / singleUnitOfTime;
    const date = dayjs(item.start);
    console.log(
      totalTimeMoved,
      date.toISOString(),
      date.add(totalTimeMoved, "minutes").toISOString(),
    );
    const data = JSON.parse(item?.extraData) as reminder;
    const time = date.add(totalTimeMoved, "minutes").toISOString();

    const payload = {
      variables: {
        input: {
          _id: data._id,
          time: time,
          hasComon: data.hasComon,
          allOccurrence: false,
          thisOccurrence: true,
        },
      },
    };
    console.log(payload);
    updateTime(payload)
      .then((res) => {
        if (res.data?.updateDragDrop) {
          ToastMessage(t("reminders.time-updated"));
        }
      })
      .catch((err) => {
        ToastMessage(t("reminders.time-update-error"));
      });
  }

  function CreateWeeklySection() {
    let data = [];
    const from = dayjs(selectedDate).startOf("weeks").format("YYYY-MM-DD");
    for (let i = 1; i < 8; i++) {
      let a = dayjs(from).add(i, "days").format("YYYY-MM-DD");
      let dat = reminderData[a] ?? [];
      let task = allCalendarData[a] ?? [];
      let list = _.uniqBy([...dat, ...task], (n) => n.id);
      if (list.length > 0) {
        data.push({ title: a, data: list });
      }
    }
    return data;
  }

  function CreateMonthlySection() {
    let data = [];
    const from = dayjs(selectedDate).startOf("month").format("YYYY-MM-DD");
    const daysInMonth = dayjs(selectedDate).daysInMonth();
    for (let i = 0; i < daysInMonth; i++) {
      let a = dayjs(from).add(i, "day").format("YYYY-MM-DD");
      let dat = reminderData[a] ?? [];
      let task = allCalendarData[a] ?? [];
      let list = _.uniqBy([...dat, ...task], (n) => n.id);
      if (list.length > 0) {
        data.push({ title: a, data: list });
      }
    }
    return data;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.White,
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
  textStyle: {
    fontSize: 14,
    lineHeight: 15,
    color: Colors.light.black,
    fontWeight: "600",
  },
  anyTimeContainer: {
    borderColor: "green",
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 3,
  },
  monthlyScrollContent: {
    paddingBottom: 16,
  },
  monthlySection: {
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.black,
    marginBottom: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 400,
  },
});
