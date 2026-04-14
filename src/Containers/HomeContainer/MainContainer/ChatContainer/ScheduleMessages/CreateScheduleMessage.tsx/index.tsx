import { View, Text, Pressable, FlatList, StatusBar, ActivityIndicator } from "react-native";
import React, { memo, useEffect, useMemo, useState } from "react";
import { CreateScheduleMessageProps } from "@/navigation/screenPropsTypes";
import { Colors } from "@/Constants";
import AntDesign from "react-native-vector-icons/AntDesign";
import { ActionSheet, Checkbox, DateTimePicker, Picker, RadioButton, RadioGroup } from "react-native-ui-lib";
import dayjs from "dayjs";
import { Controller, useForm } from "react-hook-form";
import { navigateBack } from "@/navigation/utility";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAtomValue, useSetAtom } from "jotai";
import { currentUserIdAtom, singleRoom } from "@/Atoms";
import { calendarRefreshAtom } from "@/Atoms/CalendarAtom";
import { useCreateScheduleMutation, useUpdateScheduleMutation } from "@/graphql/generated/reminder.generated";
import { DaysOfWeek, EventType, RecurrentTypes, ScheduleInput } from "@/graphql/generated/types";
import { ScheduleFormType } from "./createSchedule.types";
import { screenStyles as styles } from "./createSchedule.styles";
import FastImage from "@d11/react-native-fast-image";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Reducer";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import * as Progress from "react-native-progress";
import { backgroundUpload, Video as VideoCompress } from "react-native-compressor";

import { getUploadUrl, uploadThumbnail } from "./createSchedule.utils";
import UUID from "react-native-uuid";
import docIcon from "@Assets/images/docs";
import { windowWidth } from "@Util/ResponsiveView";
import _ from "lodash";
import { CustomNotification } from "@/Containers/HomeContainer/MainContainer/ReminderContainer/CreateReminderScreen/components/CustomNotification";
import MessageCommon from "../ViewScheduleMessage/components/MessageCommon";
import ToastMessage from "@Util/ToastMesage";
import { useTranslation } from "react-i18next";
import useRecursive from "@/hooks/useRecursive";
import { Days, daysData, DaysNum, monthsData } from "../../../ReminderContainer/CreateReminderScreen/reminder.types";
import Feather from "react-native-vector-icons/Feather";
import NumericInput from "react-native-numeric-input";
import InfoText from "../../../ReminderContainer/CreateReminderScreen/components/InfoText";
import { reminder } from "@/schemas/schema";
import UpdateConfirmationView from "../../../ReminderContainer/ViewReminderScreen/components/UpdateConfirmationView";

export default function CreateScheduleMessage({ route, navigation }: Readonly<CreateScheduleMessageProps>) {
  const defaultDate = dayjs().add(30, "minutes").toISOString();
  const [isMonthDay, setIsMonthDay] = useState<"day" | "week">("day");

  const { control, getValues, setValue, handleSubmit, watch } = useForm<ScheduleInput>();
  const [scheduleMessageRequest, scheduleMessageResponse] = useCreateScheduleMutation();

  const [PreNotification, setPreNotification] = useState<boolean>(false);
  const [customNotification, setCustomNotification] = useState<boolean>(false);
  const [updateRequest, updateResponse] = useUpdateScheduleMutation();
  const { t } = useTranslation();
  const { calculateRecurrence, recursiveList } = useRecursive();
  const [updateAllRequest, setUpdateAllRequest] = useState<reminder | null>(null);
  const triggerCalendarRefresh = useSetAtom(calendarRefreshAtom);

  useEffect(() => {
    setValue("startDate", route.params.startDate);
    setValue("message", route.params.message);
    setValue("time", route.params.time);
    setValue("isApprovalNeeded", route.params.isApprovalNeeded);
    setValue("approvalReminderTime", route.params.approvalReminderTime);
    setValue("recursive", route.params.recursive ?? "ONCE");
    setValue("endDate", route.params.endDate);
    setValue("monthlyParams.onWeek.dayOfWeeks", route.params?.monthlyParams?.onWeek?.dayOfWeeks ?? []);
    setValue("monthlyParams.onWeek.everyWeek", route.params?.monthlyParams?.onWeek?.everyWeek ?? 1);

    setValue("monthlyParams.onDay", route.params?.monthlyParams?.onDay ?? 1);
    setValue("monthlyParams.months", route.params?.monthlyParams?.months ?? []);
    setValue("monthlyParams.twicePerMonth", route.params?.monthlyParams?.twicePerMonth ?? true);

    setValue("daylyParams.dayOfWeeks", route.params?.daylyParams?.dayOfWeeks ?? []);
    setValue("daylyParams.everyWeek", route.params?.daylyParams?.everyWeek ?? 1);

    if (route.params?.monthlyParams?.onDay) {
      setIsMonthDay("day");
    }

    if (route.params?.monthlyParams?.onWeek) {
      setIsMonthDay("week");
    }

    if (route.params.mode == "update") {
      setValue("parent_id", route.params?.parent_id);
      setValue("date", route.params.date);
      // calculateRecurrence({
      //   type: route.params.recursive ?? "ONCE",
      //   startDate: route.params?.startDate ?? dayjs().toISOString(),
      //   endDate: route.params?.endDate ?? dayjs().toISOString(),
      //   daysOfWeek: route.params?.daylyParams?.dayOfWeeks ?? ([] as string[]),
      //   weekRepeatNumber: route.params.daylyParams?.everyWeek ?? 1,
      //   isMonthDay: route.params?.monthlyParams?.onDay ? true : false,
      //   day: route.params?.monthlyParams?.onDay ?? 1,
      //   dayOfWeek: route.params?.monthlyParams?.onWeek?.dayOfWeeks
      //     ? DaysNum[route.params?.monthlyParams?.onWeek?.dayOfWeeks[0]]
      //     : 1,
      //   weekNumber: route.params.monthlyParams?.onWeek?.everyWeek ?? 1,
      // });
    } else {
      calculateRecurrence({
        type: route.params.recursive ?? "ONCE",
        startDate: route.params.startDate,
        endDate: route.params.endDate,
      });
    }
  }, []);

  const preNotificationList = useMemo(() => {
    let diff = null;
    let recurrence = getValues("recursive");
    let pre = getValues("approvalReminderTime");

    let noti = [];

    if (recursiveList.length > 0) {
      let diff = dayjs(recursiveList[0].occurrencesDate).diff(dayjs(), "minutes");
      if (diff >= 5 || recurrence != RecurrentTypes["Once"]) {
        noti.push({
          Count: 5,
          Unit: "MINUTE",
          label: `5 ${t("reminders.minutes")} ${t("reminders.before")}`,
          onPress: () => {
            let current = getValues("approvalReminderTime");
            if (current) {
              setValue("approvalReminderTime", [{ Count: 5, Unit: "MINUTE" }]);
            }
          },
        });
      }
      if (diff >= 10 || recurrence != RecurrentTypes["Once"]) {
        noti.push({
          Count: 10,
          Unit: "MINUTE",
          label: `10 ${t("reminders.minutes")} ${t("reminders.before")}`,
          onPress: () => {
            let current = getValues("approvalReminderTime");
            if (current) {
              setValue("approvalReminderTime", [{ Count: 10, Unit: "MINUTE" }]);
            }
          },
        });
      }
      if (diff >= 15 || recurrence != RecurrentTypes["Once"]) {
        noti.push({
          Count: 15,
          Unit: "MINUTE",
          label: `15 ${t("reminders.minutes")} ${t("reminders.before")}`,
          onPress: () => {
            let current = getValues("approvalReminderTime");
            if (current) {
              setValue("approvalReminderTime", [{ Count: 15, Unit: "MINUTE" }]);
            }
          },
        });
      }

      if (diff >= 30 || recurrence != RecurrentTypes["Once"]) {
        noti.push({
          Count: 30,
          Unit: "MINUTE",
          label: `30 ${t("reminders.minutes")} ${t("reminders.before")}`,
          onPress: () => {
            let current = getValues("approvalReminderTime");
            if (current) {
              setValue("approvalReminderTime", [{ Count: 30, Unit: "MINUTE" }]);
            }
          },
        });
      }

      if (diff >= 60 || recurrence != RecurrentTypes["Once"]) {
        noti.push({
          Count: 1,
          Unit: "HOUR",
          label: `1 ${t("reminders.hours")} ${t("reminders.before")}`,
          onPress: () => {
            let current = getValues("approvalReminderTime");
            if (current) {
              setValue("approvalReminderTime", [{ Count: 1, Unit: "HOUR" }]);
            }
          },
        });
      }

      if (diff >= 1440 || recurrence != RecurrentTypes["Once"]) {
        noti.push({
          Count: 1,
          Unit: "DAY",
          label: `1 ${t("reminders.days")} ${t("reminders.before")}`,
          onPress: () => {
            let current = getValues("approvalReminderTime");
            if (current) {
              setValue("approvalReminderTime", [{ Count: 1, Unit: "DAY" }]);
            }
          },
        });
      }

      noti.push({
        label: t("custom"),
        onPress: () => {
          setCustomNotification(true);
        },
      });
    }

    return noti.filter((v) => {
      let found = pre?.find((b) => b.Count === v.Count && b.Unit === v.Unit);
      return found ? false : true;
    });
  }, [watch("approvalReminderTime"), recursiveList]);

  const availableMonths = useMemo(() => {
    if (getValues("recursive") == RecurrentTypes["Monthly"]) {
      let month = recursiveList.map((v) => {
        return { name: dayjs(v.occurrencesDate).format("MMM").toUpperCase(), date: v.occurrencesDate };
      });

      let totalMonths = monthsData.map((v) => {
        let find = month.find((b) => v === b.name);
        return {
          isSelectable: find ? true : false,
          name: v,
          occurrenceDate: find ? find?.date : "",
        };
      });

      return totalMonths;
    }
    return [];
  }, [recursiveList, watch("recursive")]);

  const weekNumbers = [
    { label: t("reminders.first"), value: 1 },
    { label: t("reminders.second"), value: 2 },
    { label: t("reminders.third"), value: 3 },
    { label: t("reminders.forth"), value: 4 },
    { label: t("reminders.last"), value: 5 },
  ];

  const weekDays = [
    { label: t("reminders.monday"), value: Days["Mon"] },
    { label: t("reminders.tuesday"), value: Days["Tue"] },
    { label: t("reminders.wednesday"), value: Days["Wed"] },
    { label: t("reminders.thursday"), value: Days["Thu"] },
    { label: t("reminders.friday"), value: Days["Fri"] },
    { label: t("reminders.saturday"), value: Days["Sat"] },
    { label: t("reminders.sunday"), value: Days["Sun"] },
  ];

  const reminderOccurrence = [
    { label: t("reminders.once"), value: "ONCE" },
    { label: t("reminders.daily"), value: "DAILY" },
    { label: t("reminders.weekly"), value: "WEEKLY" },
    { label: t("reminders.monthly"), value: "MONTHLY" },
    // { label: "Annually", value: "ANNUALLY" },
  ];

  return (
    <View style={styles.main}>
      <View>
        <View style={styles.headerContainer}>
          <Pressable onPress={navigateBack}>
            <AntDesign name="arrowleft" color="black" size={28} />
          </Pressable>
          <Text style={styles.headingText}>{t("reminders.schedule-message")}</Text>
        </View>
        <View style={styles.messageMain}>
          <Controller
            control={control}
            // defaultValue={route.params.message}
            name="message"
            rules={{
              validate: {
                isUploadable: (value) => {
                  let isUploaded = value.filter((v) => !v.isUploaded && v.type !== "text").length;
                  if (route.params.mode == "create") {
                    return isUploaded == 0 || "Please wait till upload finish.";
                  } else {
                    return true;
                  }
                },
              },
            }}
            render={({ field, fieldState, formState }) => {
              return (
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={field.value}
                  renderItem={({ item, index }) => {
                    return (
                      <View key={index} style={styles.messageContainer}>
                        <MessageCommon message={item.message ?? ""}>
                          <View>
                            {(item.type === "doc" || item.type === "DOCUMENT") && (
                              <View
                                style={{
                                  marginHorizontal: 5,
                                  flexDirection: "row",
                                  alignItems: "center",
                                  backgroundColor: "rgba(243,243,243,1)",
                                  marginBottom: 5,
                                }}
                              >
                                <View
                                  style={{
                                    backgroundColor: "white",
                                    paddingHorizontal: 5,
                                    paddingVertical: 5,
                                    borderRadius: 5,
                                    justifyContent: "center",
                                    alignItems: "center",
                                  }}
                                >
                                  <FastImage source={docIcon.doc} style={{ width: 30, height: 30 }} />
                                </View>
                                <Text style={{ fontSize: 12, marginHorizontal: 10 }}>
                                  {item.fileURL?.split("/").pop()}
                                </Text>
                              </View>
                            )}
                            {(item.type === "image" || item.type === "IMAGE") && (
                              <Pressable
                                style={{ marginBottom: 5 }}
                                onPress={() => {
                                  navigation.navigate("ViewScheduleAttachment", {
                                    url: `${route.params.mode == "update" ? DefaultImageUrl : ""}${item.fileURL}`,
                                    type: "image",
                                  });
                                }}
                              >
                                <FastImage
                                  source={{
                                    uri: `${route.params.mode == "update" ? DefaultImageUrl : ""}${item.fileURL}`,
                                  }}
                                  style={styles.imageContainer}
                                />
                              </Pressable>
                            )}
                            {(item.type === "video" || item.type === "VIDEO") && (
                              <Pressable
                                style={{ marginBottom: 5 }}
                                onPress={() => {
                                  navigation.navigate("ViewScheduleAttachment", {
                                    url: `${route.params.mode == "update" ? DefaultImageUrl : ""}${item.fileURL}`,
                                    type: "video",
                                  });
                                }}
                                style={styles.imageContainer}
                              >
                                {item.thumbnail.length > 0 && (
                                  <FastImage
                                    source={{
                                      uri: `${route.params.mode == "update" ? DefaultImageUrl : ""}${item.thumbnail}`,
                                    }}
                                    style={{ height: "100%", width: "100%", marginBottom: 5 }}
                                  />
                                )}
                                <View style={styles.videoPlayButton}>
                                  <Ionicons name="ios-play-sharp" size={30} color="white" />
                                </View>
                              </Pressable>
                            )}

                            {!item.isUploaded && item.mimeType && (
                              <MediaUploadComponent
                                type={item.type}
                                file={{
                                  url: item.fileURL,
                                  mimeType: item.mimeType ?? "",
                                  name: item.fileURL.slice(-10),
                                  isUploaded: item.isUploaded,
                                }}
                                onUploadDone={(thumbnail, media) => {
                                  // console.log(thumbnail, media);
                                  let updated = field.value.map((v, vi) => {
                                    if (vi === index) {
                                      return {
                                        ...v,
                                        thumbnail: thumbnail.length > 0 ? `${DefaultImageUrl}${thumbnail}` : "",
                                        fileURL: `${DefaultImageUrl}${media}`,
                                        isUploaded: true,
                                      };
                                    } else {
                                      return v;
                                    }
                                  });
                                  field.onChange(updated);
                                }}
                              />
                            )}
                          </View>
                        </MessageCommon>
                      </View>
                    );
                  }}
                  ListFooterComponent={<View style={{ height: 100 }} />}
                />
              );
            }}
          />
        </View>
      </View>
      <View style={styles.bottomContainer}>
        {route.params.mode !== "update" ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.dates}>
              <Controller
                control={control}
                name="startDate"
                defaultValue={defaultDate}
                rules={{
                  required: {
                    value: true,
                    message: "Schedule Date is required",
                  },
                }}
                // defaultValue={}
                render={({ field, fieldState, formState }) => {
                  return (
                    <View style={[styles.dateContainer, fieldState.error && styles.dateError]}>
                      <DateTimePicker
                        editable={!scheduleMessageResponse.loading}
                        minimumDate={new Date()}
                        placeholder={"Select Date"}
                        mode={"date"}
                        // defaultValue={dayjs(field.value).toDate()}
                        value={dayjs(field.value).toDate()}
                        onChange={(text) => {
                          let time = dayjs(getValues("time"));
                          let start = dayjs(text)
                            .set("hours", time.get("hours"))
                            .set("minutes", time.get("minutes"))
                            .toISOString();
                          let endDate = getValues("endDate");
                          field.onChange(start);
                          let recursive = getValues("recursive");
                          switch (recursive) {
                            case RecurrentTypes["Once"]:
                              let onceEndValue = dayjs(text).toISOString();
                              setValue("endDate", onceEndValue);
                              updateRecurrentList({ endDate: onceEndValue, startDate: start });
                              break;
                            case RecurrentTypes["Daily"]:
                              let dailyEndValue = dayjs(text).add(1, "days").toISOString();
                              if (dayjs(endDate).isSameOrBefore(dailyEndValue)) {
                                setValue("endDate", dailyEndValue);
                                updateRecurrentList({ endDate: dailyEndValue, startDate: start });
                              }
                              break;
                            case RecurrentTypes["Weekly"]:
                              let endWValue = dayjs(text).add(7, "days").toISOString();
                              if (dayjs(endDate).isSameOrBefore(endWValue)) {
                                setValue("endDate", endWValue);
                                updateRecurrentList({ endDate: endWValue, startDate: start });
                              }
                              break;
                            case RecurrentTypes["Monthly"]:
                              let endMValue = dayjs(text).add(31, "days").toISOString();
                              if (dayjs(endDate).isSameOrBefore(endMValue)) {
                                setValue("endDate", endMValue);
                                let list = updateRecurrentList({ endDate: endMValue, startDate: start });
                                setMonthList(list);
                              } else {
                                let list = updateRecurrentList({ endDate: endDate, startDate: start });
                                setMonthList(list);
                              }
                              break;

                            default:
                              break;
                          }
                          updateRecurrentList({
                            startDate: start,
                          });
                        }}
                        dateTimeFormatter={(date, mode) => dayjs(date.toISOString()).format("DD MMMM YYYY")}
                      />
                      <AntDesign
                        name="clockcircleo"
                        size={22}
                        color={Colors.light.PrimaryColor}
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  );
                }}
              />
              <View style={{ width: 10 }} />
              <Controller
                control={control}
                name="endDate"
                defaultValue={defaultDate}
                rules={{
                  required: {
                    value: true,
                    message: "Schedule Date is required",
                  },
                }}
                render={({ field, fieldState, formState }) => {
                  return (
                    <View style={[styles.dateContainer, fieldState.error && styles.dateError]}>
                      <DateTimePicker
                        editable={watch("recursive") !== RecurrentTypes["Once"]}
                        minimumDate={getMinimumEndDate()}
                        placeholder={"Select Date"}
                        mode={"date"}
                        // defaultValue={dayjs(field.value).toDate()}
                        value={dayjs(field.value).toDate()}
                        onChange={(text) => {
                          let end = dayjs(text).toISOString();
                          field.onChange(end);
                          let list = updateRecurrentList({ endDate: end });
                          setMonthList(list);
                        }}
                        dateTimeFormatter={(date, mode) => dayjs(date.toISOString()).format("DD MMMM YYYY")}
                      />
                      <AntDesign
                        name="clockcircleo"
                        size={22}
                        color={Colors.light.PrimaryColor}
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  );
                }}
              />
            </View>
          </View>
        ) : (
          <View style={styles.dates}>
            <Controller
              control={control}
              name="date"
              defaultValue={defaultDate}
              rules={{
                required: {
                  value: true,
                  message: "Schedule Date is required",
                },
              }}
              // defaultValue={}
              render={({ field, fieldState, formState }) => {
                return (
                  <View style={[styles.dateContainer, fieldState.error && styles.dateError]}>
                    <DateTimePicker
                      editable={!scheduleMessageResponse.loading}
                      minimumDate={new Date()}
                      placeholder={"Select Date"}
                      mode={"date"}
                      // defaultValue={dayjs(field.value).toDate()}
                      value={dayjs(field.value).toDate()}
                      onChange={(text) => {
                        let time = dayjs(getValues("time"));
                        let start = dayjs(text)
                          .set("hours", time.get("hours"))
                          .set("minutes", time.get("minutes"))
                          .toISOString();
                        // let endDate = getValues("endDate");
                        field.onChange(start);
                      }}
                      dateTimeFormatter={(date, mode) => dayjs(date.toISOString()).format("DD MMMM YYYY")}
                    />
                    <AntDesign
                      name="clockcircleo"
                      size={22}
                      color={Colors.light.PrimaryColor}
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                );
              }}
            />
          </View>
        )}
        <View style={{ marginVertical: 10 }}>
          <Controller
            control={control}
            defaultValue={dayjs(defaultDate).add(30, "minutes").toISOString()}
            name="time"
            rules={{
              required: {
                value: true,
                message: "Schedule Time is required",
              },
              validate: {
                minForToday: (value) => {
                  if (dayjs(getValues("startDate")).isToday()) {
                    return (
                      dayjs(value).isAfter(dayjs(), "minutes") ||
                      "For Today date, time must be greater then current time"
                    );
                  } else {
                    return true;
                  }
                },
              },
            }}
            render={({ field, fieldState, formState }) => {
              return (
                <View style={[styles.dateContainer, fieldState.error && styles.dateError, { alignSelf: "flex-start" }]}>
                  <DateTimePicker
                    editable={!scheduleMessageResponse.loading}
                    placeholder={"Select Time"}
                    mode={"time"}
                    value={dayjs(field.value).toDate()}
                    // defaultValue=""
                    onChange={(text) => {
                      let time = dayjs(text);
                      field.onChange(time.toISOString());
                      let startD = getValues("startDate");
                      let start = dayjs(startD)
                        .set("hours", time.get("hours"))
                        .set("minutes", time.get("minutes"))
                        .toISOString();
                      setValue("startDate", start);
                      updateRecurrentList({
                        startDate: start,
                      });
                    }}
                    dateTimeFormatter={(date, mode) => dayjs(date.toISOString()).format("HH:mm ")}
                  />
                  <AntDesign
                    name="clockcircleo"
                    size={22}
                    color={Colors.light.PrimaryColor}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              );
            }}
          />
        </View>
        {route.params.mode !== "update" && (
          <View style={{ paddingVertical: 15 }}>
            <Controller
              control={control}
              name="recursive"
              defaultValue={RecurrentTypes["Once"]}
              render={({ field, fieldState, formState }) => {
                let value = getValues("recursive") ?? RecurrentTypes["Once"];
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Feather name="repeat" size={18} color="black" style={styles.iconStyle} />
                    <Picker
                      defaultValue={formState.defaultValues?.recursive ?? RecurrentTypes["Once"]}
                      style={styles.picker}
                      value={value}
                      placeholder={t("reminders.select-repeat")}
                      useDialog
                      onChange={(value) => {
                        field.onChange(value);
                        let start = watch("startDate");
                        let end = watch("endDate");
                        let diff = dayjs(end).diff(dayjs(start), "days");
                        let startTime = getValues("time");
                        let newStart = dayjs(start)
                          .set("hours", dayjs(startTime).get("hours"))
                          .set("minutes", dayjs(startTime).get("minutes"))
                          .toISOString();

                        if (value === RecurrentTypes["Once"]) {
                          if (diff !== 0) {
                            setValue("endDate", start);
                            updateRecurrentList({ type: value, endDate: start, startDate: newStart });
                          }
                        }

                        if (value === RecurrentTypes["Daily"]) {
                          if (diff < 1) {
                            let val = dayjs(start).add(1, "days").toISOString();

                            setValue("endDate", val);

                            updateRecurrentList({
                              type: value,
                              endDate: val,
                              startDate: newStart,
                            });
                          }
                        }

                        if (value === RecurrentTypes["Weekly"]) {
                          if (diff < 30) {
                            let val = dayjs(start).add(30, "days").toISOString();
                            setValue("endDate", val);

                            updateRecurrentList({
                              type: value,
                              endDate: val,
                              startDate: newStart,
                            });
                          }
                        }

                        if (value === RecurrentTypes["Monthly"]) {
                          if (diff < 35) {
                            let val = dayjs(start).add(1, "years").toISOString();

                            setValue("endDate", val);

                            let list = updateRecurrentList({
                              type: value,
                              endDate: val,
                              startDate: newStart,
                              isMonthDay: isMonthDay == "day",
                            });

                            setMonthList(list);
                            setValue("monthlyParams.twicePerMonth", true);
                          } else {
                            let list = updateRecurrentList({
                              type: value,
                              endDate: end,
                              startDate: dayjs(start)
                                .set("hours", dayjs().get("hours"))
                                .set("minutes", dayjs().get("minutes"))
                                .toISOString(),
                              isMonthDay: isMonthDay == "day",
                            });
                            setMonthList(list);

                            setValue("monthlyParams.twicePerMonth", true);
                          }
                        }
                      }}
                    >
                      {_.map(reminderOccurrence, (options, index) => {
                        return <Picker.Item key={options.value} value={options.value} label={options.label} />;
                      })}
                    </Picker>
                  </View>
                );
              }}
            />

            {watch("recursive") === RecurrentTypes["Weekly"] && (
              <View style={{ marginLeft: 40, marginTop: 20 }}>
                <Controller
                  control={control}
                  defaultValue={[]}
                  rules={{
                    validate: {
                      isRequired: (value) => {
                        if (getValues("recursive") == RecurrentTypes["Weekly"]) {
                          return value.length > 0 || "Week day can't be empty for weekly reminders.";
                        }
                        return true;
                      },
                    },
                  }}
                  name="daylyParams.dayOfWeeks"
                  render={({ field, fieldState, formState }) => {
                    return (
                      <View style={{ marginBottom: 15 }}>
                        <Text style={[styles.labelText, { marginBottom: 8, color: "gray" }]}>
                          {t("reminders.select-days")}
                        </Text>
                        <FlatList
                          style={fieldState.error && styles.errorBox}
                          data={daysData}
                          keyExtractor={(_, index) => index.toString()}
                          horizontal={true}
                          showsHorizontalScrollIndicator={false}
                          renderItem={({ item, index }) => {
                            let isSelected = field.value.find((v) => v === item.day);
                            return (
                              <Pressable
                                key={index}
                                onPress={() => {
                                  if (isSelected) {
                                    let removed = shortWeek(field.value.filter((v) => v !== item.day));
                                    field.onChange(removed);
                                    updateRecurrentList({ daysOfWeek: removed });
                                  } else {
                                    let added = shortWeek([...field.value, item.day]);

                                    field.onChange(added);

                                    updateRecurrentList({ daysOfWeek: added });
                                  }
                                }}
                                style={{
                                  backgroundColor: isSelected ? Colors.light.PrimaryColor : "white",
                                  borderRadius: 50,
                                  paddingHorizontal: 8,
                                  paddingVertical: 10,
                                  marginHorizontal: 3,
                                }}
                              >
                                <Text
                                  style={{ fontSize: 10, fontWeight: "500", color: isSelected ? "white" : "black" }}
                                >
                                  {t(`dayList.${item.day.slice(0, 3)}`)}
                                </Text>
                              </Pressable>
                            );
                          }}
                        />
                      </View>
                    );
                  }}
                />

                <Controller
                  control={control}
                  defaultValue={1}
                  name="daylyParams.everyWeek"
                  render={({ field, fieldState, formState }) => {
                    return (
                      <View style={{ marginBottom: 15 }}>
                        <Text style={[styles.labelText, { color: "gray" }]}>{t("reminders.repeat-for-every")}</Text>

                        <RadioGroup
                          style={{ marginTop: 15, marginLeft: 10 }}
                          initialValue={field.value}
                          onValueChange={(value: number) => {
                            field.onChange(value);
                            updateRecurrentList({ weekRepeatNumber: value });
                          }}
                        >
                          <RadioButton
                            value={1}
                            label={t("reminders.every-week")}
                            color={Colors.light.PrimaryColor}
                            containerStyle={{ marginBottom: 5 }}
                          />
                          <RadioButton
                            value={2}
                            label={t("reminders.every-2nd-week")}
                            color={Colors.light.PrimaryColor}
                            containerStyle={{ marginBottom: 5 }}
                          />
                          <RadioButton
                            value={3}
                            label={t("reminders.every-3rd-week")}
                            color={Colors.light.PrimaryColor}
                            containerStyle={{ marginBottom: 5 }}
                          />
                          <RadioButton
                            value={4}
                            label={t("reminders.every-4th-week")}
                            color={Colors.light.PrimaryColor}
                            containerStyle={{ marginBottom: 5 }}
                          />
                        </RadioGroup>
                      </View>
                    );
                  }}
                />
              </View>
            )}

            {watch("recursive") === RecurrentTypes["Monthly"] && (
              <View style={{ marginLeft: 20, marginBottom: 10, marginTop: 20 }}>
                <Controller
                  control={control}
                  name="monthlyParams.months"
                  defaultValue={[]}
                  rules={{
                    validate: {
                      mustHaveMinimumOneMonth: (value) => {
                        let isRepeat = getValues("monthlyParams.twicePerMonth");
                        if (!isRepeat) {
                          return value.length > 0 || "Minimum 1 month selection is must.";
                        }
                        return true;
                      },
                    },
                  }}
                  render={({ field, fieldState, formState }) => {
                    return (
                      <View style={{}}>
                        <Text style={[styles.labelText, { marginBottom: 5, color: "gray" }]}>
                          {t("reminders.select-months")}
                        </Text>
                        <FlatList
                          data={availableMonths}
                          style={fieldState.error && styles.errorBox}
                          keyExtractor={(_, index) => index.toString()}
                          showsVerticalScrollIndicator={false}
                          numColumns={6}
                          renderItem={({ item, index }) => {
                            let isSelected = field.value.find((v) => v === item.name);

                            return (
                              <Pressable
                                key={index}
                                disabled={!item.isSelectable}
                                onPress={() => {
                                  let isAllMonth = getValues("monthlyParams.twicePerMonth");
                                  if (isAllMonth) {
                                    return;
                                  }
                                  if (isSelected) {
                                    let removed = field.value.filter((v) => v !== item.name);
                                    field.onChange(removed);
                                  } else {
                                    let added = [...field.value, item.name].sort((a, b) => {
                                      let f = availableMonths.find((v) => v.name == a);
                                      let l = availableMonths.find((v) => v.name == b);
                                      return dayjs(f?.occurrenceDate).toDate() > dayjs(l?.occurrenceDate).toDate();
                                    });

                                    field.onChange(added);
                                  }
                                  updateRecurrentList({});
                                }}
                                style={{
                                  backgroundColor: isSelected ? Colors.light.PrimaryColor : "white",
                                  borderRadius: 50,
                                  paddingHorizontal: 12,
                                  paddingVertical: 10,
                                  marginHorizontal: 3,
                                  marginBottom: 5,
                                  opacity: item.isSelectable ? 1 : 0.3,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 10,
                                    fontWeight: "500",
                                    color: isSelected ? "white" : "black",
                                  }}
                                >
                                  {t(`monthList.${item.name}`)}
                                </Text>
                              </Pressable>
                            );
                          }}
                        />
                      </View>
                    );
                  }}
                />

                <Controller
                  control={control}
                  defaultValue={true}
                  name="monthlyParams.twicePerMonth"
                  render={({ field, fieldState, formState }) => {
                    return (
                      <View style={{ marginTop: 10 }}>
                        <Checkbox
                          color={Colors.light.PrimaryColor}
                          style={{ borderRadius: 5, height: 20, width: 20, marginLeft: 5 }}
                          label={t("reminders.select-all-months")}
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (!value) {
                              setValue("monthlyParams.months", []);
                              updateRecurrentList({});
                            } else {
                              let list = updateRecurrentList({});
                              setMonthList(list);
                            }
                          }}
                        />
                      </View>
                    );
                  }}
                />

                <View style={{ marginTop: 20, marginBottom: 10 }}>
                  <Text style={[styles.labelText, { marginBottom: 5, color: "gray" }]}>
                    {t("reminders.select-months")}
                  </Text>
                  <RadioGroup
                    style={{ marginLeft: 5, flexDirection: "row" }}
                    initialValue={isMonthDay}
                    onValueChange={(value) => {
                      setIsMonthDay(value);
                      if (value == "day") {
                        setValue("monthlyParams.onDay", 1);
                      } else {
                        setValue("monthlyParams.onWeek.dayOfWeeks", [DaysOfWeek["Mon"]]);
                        setValue("monthlyParams.onWeek.everyWeek", 1);
                      }
                      let isRepeat = getValues("monthlyParams.twicePerMonth");
                      if (!isRepeat) {
                        setValue("monthlyParams.months", []);
                      }
                      let list = updateRecurrentList({ isMonthDay: value == "day" });
                      isRepeat && setMonthList(list);
                    }}
                  >
                    <RadioButton
                      value={"day"}
                      label={t("reminders.on-day")}
                      size={20}
                      color={Colors.light.PrimaryColor}
                    />
                    <View style={{ width: 15 }} />

                    <RadioButton
                      style={{}}
                      value={"week"}
                      label={t("reminders.on-the")}
                      color={Colors.light.PrimaryColor}
                      size={20}
                    />
                  </RadioGroup>
                </View>

                {isMonthDay == "week" && (
                  <View style={[{ marginLeft: 35, marginTop: 10, flexDirection: "row" }]}>
                    <Controller
                      control={control}
                      defaultValue={1}
                      name="monthlyParams.onWeek.everyWeek"
                      render={({ field, fieldState, formState }) => {
                        return (
                          <View style={{ borderWidth: 1, borderRadius: 5, borderColor: "gray", paddingHorizontal: 10 }}>
                            <Picker
                              value={field.value ?? 1}
                              onChange={(value) => {
                                field.onChange(value);
                                let isRepeat = getValues("monthlyParams.twicePerMonth");
                                if (!isRepeat) {
                                  setValue("monthlyParams.months", []);
                                }
                                let list = updateRecurrentList({ isMonthDay: false, weekNumber: value as number });
                                isRepeat && setMonthList(list);
                              }}
                              placeholder={"Select Week"}
                              useDialog
                              style={styles.picker}
                            >
                              {_.map(weekNumbers, (options, index) => {
                                return <Picker.Item key={options.value} value={options.value} label={options.label} />;
                              })}
                            </Picker>
                          </View>
                        );
                      }}
                    />
                    <View style={{ width: 10 }} />
                    <Controller
                      control={control}
                      defaultValue={[DaysOfWeek["Mon"]]}
                      name="monthlyParams.onWeek.dayOfWeeks"
                      render={({ field, fieldState, formState }) => {
                        return (
                          <View style={{ borderWidth: 1, borderRadius: 5, borderColor: "gray", paddingHorizontal: 20 }}>
                            <Picker
                              value={field.value[0] ?? DaysOfWeek["Mon"]}
                              placeholder={"Placeholder"}
                              onChange={(value) => {
                                field.onChange([value]);
                                let isRepeat = getValues("monthlyParams.twicePerMonth");
                                if (!isRepeat) {
                                  setValue("monthlyParams.months", []);
                                }
                                let list = updateRecurrentList({ isMonthDay: false, dayOfWeek: value as number });
                                isRepeat && setMonthList(list);
                              }}
                              useDialog
                            >
                              {_.map(weekDays, (options, index) => {
                                return <Picker.Item key={options.value} value={options.value} label={options.label} />;
                              })}
                            </Picker>
                          </View>
                        );
                      }}
                    />
                  </View>
                )}

                {isMonthDay == "day" && (
                  <View style={[{ marginLeft: 35, marginVertical: 10 }]}>
                    <Controller
                      control={control}
                      defaultValue={1}
                      name="monthlyParams.onDay"
                      render={({ field, fieldState, formState }) => {
                        return (
                          <NumericInput
                            value={field.value}
                            onChange={(value) => {
                              isMonthDay == "day" && field.onChange(value);
                              let isRepeat = getValues("monthlyParams.twicePerMonth");
                              if (!isRepeat) {
                                setValue("monthlyParams.months", []);
                              }
                              let list = updateRecurrentList({ day: value });
                              isRepeat && setMonthList(list);
                            }}
                            maxValue={31}
                            minValue={1}
                            totalWidth={100}
                            totalHeight={30}
                            iconSize={20}
                            step={1}
                            valueType="real"
                            rounded
                            textColor="black"
                            iconStyle={{ color: "white" }}
                            rightButtonBackgroundColor={Colors.light.PrimaryColor}
                            leftButtonBackgroundColor={Colors.light.PrimaryColor}
                          />
                        );
                      }}
                    />
                  </View>
                )}
              </View>
            )}

            {/* <InfoText
            style={{ marginLeft: 55, marginRight: 20, marginVertical: 5 }}
            recursiveList={createInfoList()}
            text={""}
          /> */}
          </View>
        )}
        <View>
          {recursiveList.length > 0 && (
            <View>
              <Controller
                control={control}
                name="isApprovalNeeded"
                defaultValue={false}
                render={({ field, fieldState, formState }) => {
                  return (
                    <Checkbox
                      containerStyle={{ marginTop: 20, marginLeft: 3 }}
                      style={{ height: 20, width: 20, borderRadius: 5 }}
                      label={t("reminders.approval-needed-before-send")}
                      color={Colors.light.PrimaryColor}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  );
                }}
              />

              {watch("isApprovalNeeded") && (
                <Controller
                  control={control}
                  defaultValue={[]}
                  name="approvalReminderTime"
                  rules={{
                    validate: {
                      notEmpty: (value) => {
                        return value.length > 0 || "Approval reminder is required";
                      },
                    },
                  }}
                  render={({ field, fieldState, formState }) => {
                    if (fieldState.error) {
                      ToastMessage(t("reminders.please-select-approval-time"));
                    }
                    return (
                      <View style={[styles.peopleContainer]}>
                        <Ionicons name="notifications-outline" size={22} color={"black"} style={styles.iconStyle} />
                        <View style={{ width: windowWidth - 100 }}>
                          <FlatList
                            data={field.value}
                            ListFooterComponent={
                              field.value && field.value.length < 1 ? (
                                <Pressable onPress={() => setPreNotification(true)}>
                                  <Text style={{ color: "gray", fontSize: 15, marginTop: 2 }}>
                                    {t("reminders.select-approval-time")}
                                  </Text>
                                </Pressable>
                              ) : (
                                <></>
                              )
                            }
                            renderItem={({ item, index }) => {
                              return (
                                <Pressable style={{ marginTop: 2 }} onPress={() => setPreNotification(true)}>
                                  <Text style={{ fontSize: 15 }}>{`${item.Count} ${t(
                                    `reminders.${item.Unit?.toLowerCase()}s`
                                  )} ${t("reminders.before")}`}</Text>
                                </Pressable>
                              );
                            }}
                          />
                        </View>
                        <ActionSheet
                          visible={PreNotification}
                          useNativeIOS
                          onDismiss={() => {
                            setPreNotification(false);
                          }}
                          optionsStyle={{ width: "100%", paddingHorizontal: 20 }}
                          options={preNotificationList}
                        />

                        <CustomNotification
                          isVisible={customNotification}
                          onClose={() => {
                            setCustomNotification(false);
                          }}
                          onValueChange={(value) => {
                            const currentValues = getValues("approvalReminderTime");

                            if (currentValues) {
                              const newValue = { Count: value.count, Unit: value.unit };

                              setValue("approvalReminderTime", [newValue]);
                            }
                          }}
                        />
                      </View>
                    );
                  }}
                />
              )}
            </View>
          )}
          <View style={{ alignSelf: "flex-end" }}>
            {scheduleMessageResponse.loading || updateResponse.loading ? (
              <ActivityIndicator color={Colors.light.PrimaryColor} />
            ) : (
              <Pressable
                disabled={scheduleMessageResponse.loading}
                onPress={handleSubmit(handleForm, (error) => console.log(error))}
                style={styles.sendButton}
              >
                <Ionicons name="send" color="white" size={18} style={{ marginLeft: 2 }} />
              </Pressable>
            )}
          </View>
        </View>
      </View>
      <UpdateConfirmationView
        reminder={updateAllRequest}
        onClose={(status) => {
          if (status == "BACK") {
            setUpdateAllRequest(null);
            navigation.goBack();
          } else {
            setUpdateAllRequest(null);
          }
        }}
      />
    </View>
  );

  function handleForm(data: ScheduleInput) {
    let messageFormatted = data.message.map((v) => {
      return {
        duration: v.duration,
        fileURL: v.fileURL?.replace(DefaultImageUrl, ""),
        fontStyle: v.fontStyle,
        isForwarded: v.isForwarded,
        message: v.message,
        roomId: v.roomId,
        thumbnail: v.thumbnail?.replace(DefaultImageUrl, ""),
        type: route.params.mode == "update" ? v.type : MessageType[v.type],
      };
    });

    let date = dayjs(data.startDate)
      .set("hours", dayjs(data.time).get("hours"))
      .set("minutes", dayjs(data.time).get("minutes"))
      .toISOString();
    let end = dayjs(data.endDate)
      .set("hours", dayjs(date).get("hours"))
      .set("minutes", dayjs(date).get("minutes"))
      .toISOString();

    let form = {
      time: data.time,
      roomId: route.params.roomId,
      roomType: route.params.roomType,
      startDate: date,
      endDate: end,
      recursive: data.recursive,
      message: messageFormatted,
      type: EventType["Schedule"],
      isApprovalNeeded: data.isApprovalNeeded,
      approvalReminderTime: data.approvalReminderTime,
    };

    if (data.recursive === RecurrentTypes["Weekly"]) {
      form["daylyParams"] = {
        dayOfWeeks: data.daylyParams?.dayOfWeeks ?? [],
        everyWeek: data.daylyParams?.everyWeek ?? 1,
      };
    }

    if (data.recursive === RecurrentTypes["Monthly"]) {
      form["monthlyParams"] = {
        months: data.monthlyParams?.months ?? [],
        twicePerMonth: data.monthlyParams?.twicePerMonth ?? true,
        onWeek: isMonthDay === "week" ? data.monthlyParams?.onWeek : undefined,
        onDay: isMonthDay === "day" ? data.monthlyParams?.onDay : undefined,
      };
    }

    console.log(form);

    if (route.params.mode == "create") {
      scheduleMessageRequest({
        variables: {
          input: {
            ...form,
          },
        },
      }).then((res) => {
        if (res.data?.createSchedule) {
          triggerCalendarRefresh((v) => v + 1);
          navigateBack();
          ToastMessage(t("label.message-scheduled"));
        }
      });
    }

    if (route.params.mode === "update") {
      const isSameDate = dayjs(route.params.date?.slice(0, 10)).isSame(data.date.slice(0, 10));
      const isOnce = data.recursive === RecurrentTypes["Once"]

      if (isSameDate && isOnce) {
        updateRequest({
          variables: {
            input: {
              _id: route.params._id,
              date: data.date,
              ...form,
              thisOccurrence: true,
              allOccurrence: false,
            },
          },
        }).then((res) => {
          if (res.data?.updateSchedule) {
            triggerCalendarRefresh((v) => v + 1);
            navigateBack();
            ToastMessage(t("label.message-updated"));
          }
        });
      } else {
        setUpdateAllRequest({ ...form, parent_id: route.params.parent_id, _id: route.params._id });
      }
    }
  }

  function updateRecurrentList(config: {
    type?: RecurrentTypes;
    startDate?: string;
    endDate?: string;
    day?: number;
    weekNumber?: number;
    weekRepeatNumber?: number;
    daysOfWeek?: string[];
    dayOfWeek?: number;
    isMonthDay?: boolean;
  }) {
    return calculateRecurrence({
      type: config.type ?? getValues("recursive"),
      startDate: config.startDate ?? getValues("startDate"),
      endDate: config.endDate ?? getValues("endDate"),

      daysOfWeek: config.daysOfWeek ?? getValues("daylyParams.dayOfWeeks") ?? [],
      weekRepeatNumber: config.weekRepeatNumber ?? getValues("daylyParams.everyWeek") ?? 1,

      isMonthDay: config.isMonthDay ?? isMonthDay == "day" ? true : false,
      day: config.day ?? getValues("monthlyParams.onDay") ?? 1,
      dayOfWeek:
        config.dayOfWeek ?? getValues("monthlyParams.onWeek.dayOfWeeks")
          ? DaysNum[getValues("monthlyParams.onWeek.dayOfWeeks")[0]]
          : 1,
      weekNumber: config.weekNumber ?? getValues("monthlyParams.onWeek.everyWeek") ?? 1,
    });
  }

  function createInfoList() {
    let list = recursiveList
      ? recursiveList.filter((v) => {
          let m = dayjs(v.occurrencesDate).format("MMM").toUpperCase();
          let rec = getValues("recursive");
          if (rec === RecurrentTypes["Monthly"]) {
            let find = getValues("monthlyParams.months")
              ?.filter((b) => {
                let find = availableMonths.find((m) => m.name == b);
                if (find) return true;
                else return false;
              })
              .find((b) => b == m);
            if (find) return true;
            else return false;
          } else {
            return true;
          }
        })
      : [];
    return list;
  }

  function getMinimumEndDate() {
    let start = getValues("startDate");
    switch (watch("recursive")) {
      case RecurrentTypes["Once"]:
        return dayjs(start).toDate();
      case RecurrentTypes["Daily"]:
        return dayjs(start).add(1, "days").toDate();
      case RecurrentTypes["Weekly"]:
        return dayjs(start).add(7, "days").toDate();
      case RecurrentTypes["Monthly"]:
        return dayjs(start).add(31, "days").toDate();

      default:
        return dayjs(start).toDate();
    }
  }
  function shortWeek(weekList) {
    weekList.sort((a, b) => {
      if (DaysNum[a] == 0) {
        return 7 > DaysNum[b];
      } else if (DaysNum[b] == 0) {
        return DaysNum[a] > 7;
      } else {
        return DaysNum[a] > DaysNum[b];
      }
    });
    return weekList;
  }

  function setMonthList(list: Array<{ occurrencesDate: string }>) {
    let isMonthly = getValues("recursive") === RecurrentTypes["Monthly"];
    if (isMonthly) {
      let month = list.map((v) => {
        return dayjs(v.occurrencesDate).format("MMM").toUpperCase();
      });
      setValue("monthlyParams.months", month);
    }
  }
}

const MessageType = {
  text: "text",
  image: "IMAGE",
  video: "VIDEO",
  doc: "DOCUMENT",
};

type UploadMediaProps = {
  type: "image" | "video" | "doc";
  file: fileType;
  onUploadDone: (thumbnail: string, media: string) => void;
};

type fileType = {
  url: string;
  mimeType: string;
  name: string;
};

function UploadMedia({ type, file, onUploadDone }: Readonly<UploadMediaProps>) {
  const [progress, setProgress] = useState<number>(0);
  const display = useAtomValue(singleRoom);

  useEffect(() => {
    console.log(file.url, file.isUploaded);
    if (!file.isUploaded) {
      if (type === "video") {
        uploadVideoFile();
      }
      if (type === "image" || type === "doc") {
        uploadMedia();
      }
    }
  }, []);

  return (
    <Progress.Bar
      animated={true}
      width={180}
      progress={progress}
      color={Colors.light.PrimaryColor}
      style={{ marginLeft: 5, marginTop: 5 }}
    />
  );

  async function uploadMedia() {
    let bucketPath = `${display.roomId}/${display.currentUserUtility.user_id}/${file.name}`;
    await getUploadUrl(bucketPath, file.mimeType).then(async (urlResponse) => {
      if (urlResponse.data?.getUploadSignedUrl.url) {
        await backgroundUpload(
          urlResponse.data?.getUploadSignedUrl.url,
          file.url,
          {
            httpMethod: "PUT",
            headers: {
              "Content-Type": file.mimeType,
            },
          },
          (written, total) => {
            setProgress(written / (total / 100) / 1000);
          }
        );
        onUploadDone("", bucketPath);
      }
    });
  }

  function uploadVideoFile() {
    let bucketThumbnailPath = `${display.roomId}/${display.currentUserUtility.user_id}/thumbnail/${UUID.v4()}.jpg`;
    let bucketVideoPath = `${display.roomId}/${display.currentUserUtility.user_id}/${file.name}`;
    uploadThumbnail(file.url, bucketThumbnailPath);
    getUploadUrl(bucketVideoPath, file.mimeType).then(async (urlResponse) => {
      if (urlResponse.data?.getUploadSignedUrl.url) {
        const compressedUrl = await VideoCompress.compress(
          file.url,
          {
            compressionMethod: "auto",
          },
          (progress) => {
            setProgress(progress / 2);
          }
        );

        await backgroundUpload(
          urlResponse.data?.getUploadSignedUrl.url,
          compressedUrl,
          {
            httpMethod: "PUT",
            headers: {
              "Content-Type": file.mimeType,
            },
          },
          (written, total) => {
            setProgress(written / (total / 100) / 100 / 2 + 0.47);
          }
        );
        onUploadDone(bucketThumbnailPath, bucketVideoPath);
      }
    });
  }
}

const MediaUploadComponent = memo(UploadMedia);
