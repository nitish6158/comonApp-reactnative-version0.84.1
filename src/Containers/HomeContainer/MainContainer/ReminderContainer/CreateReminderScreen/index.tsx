import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { CreateReminderScreenProps } from "@/navigation/screenPropsTypes";
import { useTranslation } from "react-i18next";
import { pickContact } from "react-native-contact-pick";

import {
  ActionSheet,
  Checkbox,
  Chip,
  ChipsInput,
  DateTimePicker,
  Hint,
  NumberInput,
  Picker,
  RadioButton,
  RadioGroup,
  Switch,
  TextField,
} from "react-native-ui-lib";

import Modal from "react-native-modal";
import FileViewer from "react-native-file-viewer";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from "react-native-popup-menu";
import { Colors } from "@/Constants";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import Entypo from "react-native-vector-icons/Entypo";
import AntDesign from "react-native-vector-icons/AntDesign";
import _, { uniqueId } from "lodash";
import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
import { currentUserIdAtom, singleRoom } from "@/Atoms";
import { useAtomValue } from "jotai";
import { FlatList } from "react-native";
import DocumentPicker, {
  DocumentPickerResponse,
} from "react-native-document-picker";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isToday from "dayjs/plugin/isToday";
dayjs.extend(isToday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
import ToastMessage from "@Util/ToastMesage";
import { windowHeight, windowWidth } from "@Util/ResponsiveView";
import { Controller, useForm } from "react-hook-form";
import {
  AppointmentInput,
  AttachmentType,
  DaysOfWeek,
  EventType,
  MediaType,
  ParticipantAcceptStatus,
  RecurrentTypes,
  ReminderInput,
  ReminderParticipantRole,
} from "@/graphql/generated/types";
import NumericInput from "react-native-numeric-input";
import {
  useCreateAppointmentMutation,
  useCreateReminderMutation,
  useUpdateReminderMutation,
} from "@/graphql/generated/reminder.generated";

import { reminderStyle as styles } from "./reminder.styles";
import { Days, daysData, DaysNum, monthsData } from "./reminder.types";
import { CustomNotification } from "./components/CustomNotification";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/Reducer";
import LocationSelection from "./components/LocationSelection";
import UploadAttachmentView from "./components/UploadAttachmentView";
import ParticipantSelection from "./components/ParticipantSelection";
import InfoText from "./components/InfoText";
import useRecursive from "@/hooks/useRecursive";
import UpdateConfirmationView from "../ViewReminderScreen/components/UpdateConfirmationView";
import { reminder } from "@/schemas/schema";
import ReminderAttachment from "./components/ReminderAttachment";
import { selectedDateAtom } from "../../Calendar/CalendarView";

export default function CreateReminderScreen({
  route,
  navigation,
}: Readonly<CreateReminderScreenProps>) {
  const selectedDate = useAtomValue(selectedDateAtom);
  // console.log("selectedDate", selectedDate);

  const defaultDate = useMemo(() => {
    const currentDate = dayjs();
    return dayjs(selectedDate).isBefore(currentDate, "dates")
      ? currentDate.add(30, "minutes").toISOString()
      : dayjs(selectedDate)
          .add(dayjs(currentDate).get("minutes") + 30, "minutes")
          .add(dayjs(currentDate).get("hours"), "hours")
          .toISOString();
  }, [selectedDate]);

  const { t } = useTranslation();
  const { comonContact } = useSelector((state: RootState) => state.Contact);
  const { handleSubmit, setValue, getValues, control, watch, resetField } =
    useForm<ReminderInput | AppointmentInput>();

  const MyProfile = useSelector((state: RootState) => state.Chat.MyProfile);
  const [attachmentModel, setAttachmentModel] = useState<boolean>(false);
  const [participantSelection, setParticipantSelection] =
    useState<boolean>(false);
  const [PreNotification, setPreNotification] = useState<boolean>(false);
  const [createReminderRequest, createReminderResponse] =
    useCreateReminderMutation();
  const [locationSelection, setLocationSelection] = useState<boolean>(false);
  const [customNotification, setCustomNotification] = useState<boolean>(false);
  const { calculateRecurrence, recursiveList } = useRecursive();

  const [updateReminderRequest, updateReminderResponse] =
    useUpdateReminderMutation();
  const [createAppointmentRequest, createAppointmentResponse] =
    useCreateAppointmentMutation();
  const [isMonthDay, setIsMonthDay] = useState<"day" | "week">("day");

  const [toBeUploadFiles, setToBeUploadFiles] = useState<[]>([]);
  const [fromPhoneBook, setFromPhoneBook] = useState<boolean>(false);
  const [updateAllRequest, setUpdateAllRequest] = useState<reminder | null>(
    null,
  );

  useEffect(() => {
    if (route.params.reminder) {
      setValue("attachment", route.params.reminder?.attachment ?? []);
      setValue(
        "approvalReminderTime",
        route.params.reminder?.approvalReminderTime ?? [],
      );
      setValue("description", route.params.reminder.description);
      setValue("endDate", route.params.reminder.endDate);
      setValue("startDate", route.params.reminder.startDate);
      setValue("location", route.params.reminder.location);
      setValue("recursive", route.params.reminder.recursive);
      setValue("startTimeInMs", route.params.reminder.startTimeInMs);
      setValue("roomId", route.params.reminder.roomId);
      setValue("time", route.params.reminder.time);
      setValue("title", route.params.reminder.title);
      setValue("type", route.params.reminder.type);
      setValue(
        "endTime",
        route.params.reminder.endTime ?? route.params.reminder.time,
      );
      setValue("isAllDay", route.params.reminder.isAllDay);

      setValue(
        "monthlyParams.onWeek.dayOfWeeks",
        route.params.reminder?.monthlyParams?.onWeek?.dayOfWeeks ?? [],
      );
      setValue(
        "monthlyParams.onWeek.everyWeek",
        route.params.reminder?.monthlyParams?.onWeek?.everyWeek ?? 1,
      );

      setValue(
        "monthlyParams.onDay",
        route.params.reminder?.monthlyParams?.onDay ?? 1,
      );
      setValue(
        "monthlyParams.months",
        route.params.reminder?.monthlyParams?.months ?? [],
      );
      setValue(
        "monthlyParams.twicePerMonth",
        route.params.reminder?.monthlyParams?.twicePerMonth ?? true,
      );

      setValue(
        "daylyParams.dayOfWeeks",
        route.params.reminder?.daylyParams?.dayOfWeeks ?? [],
      );
      setValue(
        "daylyParams.everyWeek",
        route.params.reminder?.daylyParams?.everyWeek ?? 1,
      );
      setValue(
        "isConfirmationNeeded",
        route.params.reminder.isConfirmationNeeded,
      );
      setValue("date", route.params.reminder.date);
      setValue("parent_id", route.params.reminder.parent_id);

      if (route.params.reminder?.hasComon == false) {
        setFromPhoneBook(true);
      }

      if (route.params.reminder?.monthlyParams?.onDay) {
        setIsMonthDay("day");
      }

      if (route.params.reminder?.monthlyParams?.onWeek) {
        setIsMonthDay("week");
      }

      // calculateRecurrence({
      //   type: route.params.reminder.recursive ?? "ONCE",
      //   startDate: route.params.reminder?.startDate ?? dayjs().toISOString(),
      //   endDate: route.params.reminder?.endDate ?? dayjs().toISOString(),

      //   daysOfWeek: route.params.reminder?.daylyParams?.dayOfWeeks ?? ([] as string[]),
      //   weekRepeatNumber: route.params.reminder.daylyParams?.everyWeek ?? 1,

      //   isMonthDay: route.params.reminder?.monthlyParams?.onDay ? true : false,
      //   day: route.params.reminder?.monthlyParams?.onDay ?? 1,
      //   dayOfWeek: route.params.reminder?.monthlyParams?.onWeek?.dayOfWeeks
      //     ? DaysNum[route.params.reminder?.monthlyParams?.onWeek?.dayOfWeeks[0]]
      //     : 1,
      //   weekNumber: route.params.reminder.monthlyParams?.onWeek?.everyWeek ?? 1,
      // });
    } else {
      setValue("recursive", RecurrentTypes["Once"]);
      setValue("isConfirmationNeeded", null);
      calculateRecurrence({
        type: "ONCE",
        startDate: defaultDate,
        endDate: dayjs().toISOString(),
      });
    }
  }, [route.params.reminder]);

  const otherParticipants = useMemo(() => {
    if (route.params.participants) {
      let formatted = route.params.participants.map((v) => {
        let found = comonContact.find((b) => b.userId?._id == v.user_id);
        if (found) {
          return { ...v, name: `${found.firstName} ${found.lastName}` };
        } else {
          return { ...v, name: v.phone };
        }
      });

      if (route.params.roomType) {
        let selected = formatted
          .map((v) => {
            return {
              ...v,
              _id: v.user_id,
              role: ReminderParticipantRole["User"],
              accepted: ParticipantAcceptStatus["Accept"],
              firstName: v.name,
              lastName: "",
              phone: v.phone,
            };
          })
          .filter((v) => v.user_id !== MyProfile?._id);
        setValue("participants", selected);
      }

      if (route.params.reminder) {
        let selected = route.params.reminder.participants
          .map((v) => {
            let found = comonContact.find((b) => b.userId?._id == v._id);
            if (found) {
              return { ...v, name: `${found.firstName} ${found.lastName}` };
            } else {
              return { ...v, name: v.phone };
            }
          })
          .filter((v) => v._id !== MyProfile?._id)
          .filter((v) => {
            let isBlocked = MyProfile?.blockedRooms.find((b) => b.pid == v._id);
            return !isBlocked;
          });
        setValue("participants", selected);
      }
      return formatted;
    } else {
      return [];
    }
  }, [
    route.params.participants,
    route.params.reminder,
    route.params.roomId,
    route.params.roomType,
    comonContact,
    MyProfile?._id,
    MyProfile?.blockedRooms,
    setValue,
  ]);

  const preNotificationList = useMemo(() => {
    let diff = null;
    let recurrence = getValues("recursive");
    let pre = getValues("approvalReminderTime");

    let noti = [];

    if (recursiveList.length > 0) {
      let diff = dayjs(recursiveList[0].occurrencesDate).diff(
        dayjs(),
        "minutes",
      );
      if (diff >= 5 || recurrence != RecurrentTypes["Once"]) {
        noti.push({
          Count: 5,
          Unit: "MINUTE",
          label: `5 ${t("reminders.minutes")} ${t("reminders.before")}`,
          onPress: () => {
            let current = getValues("approvalReminderTime");
            if (current) {
              setValue("approvalReminderTime", [
                ...current,
                { Count: 5, Unit: "MINUTE" },
              ]);
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
              setValue("approvalReminderTime", [
                ...current,
                { Count: 10, Unit: "MINUTE" },
              ]);
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
              setValue("approvalReminderTime", [
                ...current,
                { Count: 15, Unit: "MINUTE" },
              ]);
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
              setValue("approvalReminderTime", [
                ...current,
                { Count: 30, Unit: "MINUTE" },
              ]);
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
              setValue("approvalReminderTime", [
                ...current,
                { Count: 1, Unit: "HOUR" },
              ]);
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
              setValue("approvalReminderTime", [
                ...current,
                { Count: 1, Unit: "DAY" },
              ]);
            }
          },
        });
      }
    }

    noti.push({
      label: t("custom"),
      onPress: () => {
        setCustomNotification(true);
      },
    });

    let data = noti.filter((v) => {
      let found = pre?.find((b) => b.Count === v.Count && b.Unit === v.Unit);
      return found ? false : true;
    });

    return data;
  }, [watch("approvalReminderTime"), recursiveList]);

  const availableMonths = useMemo(() => {
    if (getValues("recursive") == RecurrentTypes["Monthly"]) {
      let month = recursiveList.map((v) => {
        return {
          name: dayjs(v.occurrencesDate).format("MMM").toUpperCase(),
          date: v.occurrencesDate,
        };
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
      <View
        style={[styles.headerContainer, { justifyContent: "space-between" }]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons
            name="arrow-back"
            color="gray"
            size={30}
            onPress={navigation.goBack}
          />
          <Text style={styles.headerText}>{t("moreOption.remind-at")}</Text>
        </View>
      </View>
      <View style={{ justifyContent: "space-between", flex: 1 }}>
        <KeyboardAwareScrollView
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          extraScrollHeight={50}
          style={styles.FormContainer}
        >
          <Controller
            control={control}
            name="title"
            disabled={false}
            rules={{
              required: {
                value: true,
                message: "Title is required for reminders",
              },
              maxLength: {
                value: 100,
                message: "Title is too long",
              },
            }}
            render={({ field, fieldState, formState }) => {
              return (
                <View
                  style={[
                    {
                      marginBottom: 10,
                      paddingBottom: 50,
                      paddingTop: 30,
                      paddingHorizontal: 20,
                    },
                    styles[`type_light_${watch("type") ?? "REMINDER"}`],
                  ]}
                >
                  <Text style={styles.labelText}>
                    {t("reminders.event-title")}
                  </Text>
                  <TextField
                    key={field.name}
                    editable={!formState.disabled}
                    defaultValue={formState.defaultValues?.title}
                    value={field.value}
                    placeholder={""}
                    placeholderTextColor={"gray"}
                    onChangeText={field.onChange}
                    style={[
                      styles.inputText,
                      {
                        fontSize: 16,
                        borderWidth: 1,
                        borderRadius: 5,
                        borderColor: "gray",
                        height: 45,
                        marginTop: 10,
                        paddingHorizontal: 15,
                      },
                    ]}
                  />
                  {fieldState.error && (
                    <Text style={styles.errorLabel}>
                      {fieldState.error.message}
                    </Text>
                  )}
                </View>
              );
            }}
          />

          <Controller
            control={control}
            name="type"
            defaultValue={EventType["Reminder"]}
            render={({ field, fieldState, formState }) => {
              return (
                <View style={styles.reminderTypeContainer}>
                  <Chip
                    style={[
                      styles.reminderType,
                      field.value == EventType["Reminder"] &&
                        styles[`type_box_${field.value}`],
                    ]}
                    label={t("reminders.reminder")}
                    onPress={() => {
                      field.onChange(EventType["Reminder"]);
                      setValue("endTime", getValues("time"));
                    }}
                    labelStyle={[
                      styles.reminderTypeText,
                      field.value == EventType["Reminder"] && {
                        color: "white",
                      },
                    ]}
                  />
                  <Chip
                    style={[
                      styles.reminderType,
                      field.value == EventType["Appointment"] &&
                        styles[`type_box_${field.value}`],
                    ]}
                    label={t("reminders.appointment")}
                    labelStyle={[
                      styles.reminderTypeText,
                      field.value == EventType["Appointment"] && {
                        color: "white",
                      },
                    ]}
                    onPress={() => field.onChange(EventType["Appointment"])}
                  />
                  <Chip
                    style={[
                      styles.reminderType,
                      field.value == EventType["Callreminder"] &&
                        styles[`type_box_${field.value}`],
                    ]}
                    label={t("reminders.call")}
                    labelStyle={[
                      styles.reminderTypeText,
                      field.value == EventType["Callreminder"] && {
                        color: "white",
                      },
                    ]}
                    onPress={() => {
                      field.onChange(EventType["Callreminder"]);
                      setValue("endTime", getValues("time"));
                    }}
                  />
                </View>
              );
            }}
          />

          {watch("recursive") == RecurrentTypes["Once"] &&
            !dayjs(watch("endDate")).isToday() && (
              <Controller
                control={control}
                name="isAllDay"
                defaultValue={false}
                render={({ field, fieldState, formState }) => {
                  return (
                    <View
                      style={[
                        styles.dateContainer,
                        { justifyContent: "space-between", marginTop: 20 },
                      ]}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <AntDesign
                          name="clockcircleo"
                          size={22}
                          color="black"
                        />
                        <Text style={{ marginLeft: 10, fontSize: 16 }}>
                          {t("reminders.all-day")}
                        </Text>
                      </View>
                      <Switch
                        onColor={
                          styles[`type_text_${watch("type") ?? "REMINDER"}`]
                            .color
                        }
                        value={field.value ?? false}
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value) {
                            let start = dayjs()
                              .set("hours", 0)
                              .set("minutes", 0)
                              .toISOString();
                            setValue("time", start);
                            setValue(
                              "endTime",
                              dayjs()
                                .set("hours", 23)
                                .set("minutes", 59)
                                .toISOString(),
                            );
                            updateRecurrentList({
                              startDate: start,
                            });
                          } else {
                            let start = dayjs().add(1, "minutes").toISOString();
                            setValue("time", start);
                            setValue("endTime", start);
                            updateRecurrentList({
                              startDate: start,
                            });
                          }
                        }}
                      />
                    </View>
                  );
                }}
              />
            )}

          {!route.params.reminder ? (
            <View style={styles.dateContainer}>
              <Controller
                control={control}
                name="startDate"
                defaultValue={defaultDate}
                rules={{
                  required: {
                    value: true,
                    message: "Start date is required for reminders",
                  },
                  validate: {
                    // notGraterThenEndDate: (value) => {
                    //   let isGraterThenEnd = dayjs(value).isAfter(dayjs(getValues("endDate"), "date"));
                    //   return !isGraterThenEnd || "Start Date can't be grater then end date";
                    // },
                  },
                  deps: ["endDate"],
                }}
                render={({ field, fieldState, formState }) => {
                  return (
                    <View style={fieldState.error && styles.errorBox}>
                      <Text style={styles.labelText}>
                        {t("reminders.start-date")}
                      </Text>
                      <View style={styles.dateInput}>
                        <DateTimePicker
                          style={styles.inputText}
                          minimumDate={dayjs().toDate()}
                          defaultValue={defaultDate}
                          value={dayjs(field.value).toDate()}
                          placeholder={"Start Date"}
                          mode={"date"}
                          onChange={(value) => {
                            let time = getValues("time");
                            let start = dayjs(value)
                              .set("hours", dayjs(time).get("hours"))
                              .set("minutes", dayjs(time).get("minutes"))
                              .toISOString();
                            field.onChange(start);
                            let recursive = getValues("recursive");
                            let endDate = getValues("endDate");
                            switch (recursive) {
                              case RecurrentTypes["Once"]:
                                let onceEndValue = dayjs(value).toISOString();
                                setValue("endDate", onceEndValue);
                                let isToday = dayjs(onceEndValue).isToday();
                                if (isToday) {
                                  setValue("isAllDay", false);
                                  let start = dayjs()
                                    .add(1, "minutes")
                                    .toISOString();
                                  setValue("time", start);
                                  setValue("endTime", start);
                                }
                                updateRecurrentList({
                                  endDate: onceEndValue,
                                  startDate: start,
                                });
                                break;
                              case RecurrentTypes["Daily"]:
                                let dailyEndValue = dayjs(value)
                                  .add(1, "days")
                                  .toISOString();
                                if (
                                  dayjs(endDate).isSameOrBefore(dailyEndValue)
                                ) {
                                  setValue("endDate", dailyEndValue);
                                  updateRecurrentList({
                                    endDate: dailyEndValue,
                                    startDate: start,
                                  });
                                }
                                break;
                              case RecurrentTypes["Weekly"]:
                                let endWValue = dayjs(value)
                                  .add(7, "days")
                                  .toISOString();
                                if (dayjs(endDate).isSameOrBefore(endWValue)) {
                                  setValue("endDate", endWValue);
                                  updateRecurrentList({
                                    endDate: endWValue,
                                    startDate: start,
                                  });
                                }
                                break;
                              case RecurrentTypes["Monthly"]:
                                let endMValue = dayjs(value)
                                  .add(31, "days")
                                  .toISOString();
                                if (dayjs(endDate).isSameOrBefore(endMValue)) {
                                  setValue("endDate", endMValue);
                                  let list = updateRecurrentList({
                                    endDate: endMValue,
                                    startDate: start,
                                  });
                                  setMonthList(list);
                                } else {
                                  let list = updateRecurrentList({
                                    endDate: endDate,
                                    startDate: start,
                                  });
                                  setMonthList(list);
                                }
                                break;

                              default:
                                break;
                            }
                          }}
                          dateTimeFormatter={(date, mode) => {
                            return dayjs(date).format("DD MMM YYYY");
                          }}
                        />

                        <AntDesign
                          name="calendar"
                          size={18}
                          color={
                            styles[`type_text_${watch("type") ?? "REMINDER"}`]
                              .color
                          }
                        />
                      </View>
                    </View>
                  );
                }}
              />
              <View style={{ width: 20 }} />
              <Controller
                control={control}
                name="endDate"
                defaultValue={dayjs(defaultDate).toISOString()}
                rules={{
                  required: {
                    value: true,
                    message: "End date is required for reminders",
                  },
                  validate: {
                    // notLessThenStartDate: (value) => notLessThenStartDate(value, getValues("startDate")),
                    weeklyRecurrent: (value) => {
                      if (getValues("recursive") === RecurrentTypes["Weekly"]) {
                        let isDiffMoreThen7 =
                          dayjs(value).diff(getValues("startDate"), "days") > 6;
                        return (
                          isDiffMoreThen7 ||
                          "End date difference for Weekly recurrent from start date must be more then 6 days."
                        );
                      }
                      return true;
                    },
                    monthlyRecurrent: (value) => {
                      if (
                        getValues("recursive") === RecurrentTypes["Monthly"]
                      ) {
                        let isDiffMoreThen29 =
                          dayjs(value).diff(getValues("startDate"), "days") >
                          29;
                        return (
                          isDiffMoreThen29 ||
                          "End date difference for Monthly recurrent from start date must be more then 29 days."
                        );
                      }
                      return true;
                    },
                  },
                  deps: ["startDate", "recursive"],
                }}
                render={({ field, fieldState, formState }) => {
                  return (
                    <View style={fieldState.error && styles.errorBox}>
                      <Text style={styles.labelText}>
                        {t("reminders.end-date")}
                      </Text>
                      <View style={styles.dateInput}>
                        <DateTimePicker
                          editable={
                            watch("recursive") !== RecurrentTypes["Once"]
                          }
                          style={styles.inputText}
                          value={dayjs(field.value).toDate()}
                          minimumDate={getMinimumEndDate()}
                          defaultValue={dayjs(
                            formState.defaultValues?.endDate,
                          ).format("DD MMM YYYY")}
                          placeholder={"End Date"}
                          mode={"date"}
                          onChange={(value) => {
                            let end = dayjs(value).toISOString();
                            field.onChange(end);
                            let list = updateRecurrentList({ endDate: end });
                            setMonthList(list);
                          }}
                          dateTimeFormatter={(date, mode) => {
                            return dayjs(date).format("DD MMM YYYY");
                          }}
                        />
                        <AntDesign
                          name="calendar"
                          size={18}
                          color={
                            styles[`type_text_${watch("type") ?? "REMINDER"}`]
                              .color
                          }
                        />
                      </View>
                    </View>
                  );
                }}
              />
            </View>
          ) : (
            <View style={styles.dateContainer}>
              <Controller
                control={control}
                name="date"
                defaultValue={defaultDate}
                rules={{
                  required: {
                    value: true,
                    message: "Start date is required for reminders",
                  },
                  validate: {
                    // notGraterThenEndDate: (value) => {
                    //   let isGraterThenEnd = dayjs(value).isAfter(dayjs(getValues("endDate"), "date"));
                    //   return !isGraterThenEnd || "Start Date can't be grater then end date";
                    // },
                  },
                }}
                render={({ field, fieldState, formState }) => {
                  return (
                    <View style={fieldState.error && styles.errorBox}>
                      <Text style={styles.labelText}>
                        {t("reminders.reminder-date")}
                      </Text>
                      <View style={styles.dateInput}>
                        <DateTimePicker
                          style={styles.inputText}
                          minimumDate={dayjs().toDate()}
                          defaultValue={defaultDate}
                          value={dayjs(field.value).toDate()}
                          placeholder={"Start Date"}
                          mode={"date"}
                          onChange={(value) => {
                            let time = getValues("time");
                            let date = dayjs(value)
                              .set("hours", dayjs(time).get("hours"))
                              .set("minutes", dayjs(time).get("minutes"))
                              .toISOString();
                            field.onChange(date);
                          }}
                          dateTimeFormatter={(date, mode) => {
                            return dayjs(date).format("DD MMM YYYY");
                          }}
                        />
                        <AntDesign
                          name="calendar"
                          size={18}
                          color={
                            styles[`type_text_${watch("type") ?? "REMINDER"}`]
                              .color
                          }
                        />
                      </View>
                    </View>
                  );
                }}
              />
              <View style={{ width: 150 }}></View>
            </View>
          )}
          <View style={styles.dateContainer}>
            <Controller
              control={control}
              name="time"
              defaultValue={defaultDate}
              rules={{
                required: {
                  value: true,
                  message: "Time is required for reminder",
                },
                validate: {
                  forOnceMustBeGreaterThenCurrent: (value) => {
                    let startDate = getValues("startDate");
                    let recurrent = getValues("recursive");
                    let isToday = dayjs(startDate).isToday();
                    if (
                      recurrent === RecurrentTypes["Once"] &&
                      isToday &&
                      !getValues("isAllDay")
                    ) {
                      const selectedDateTime = dayjs(startDate)
                        .set("hours", dayjs(value).get("hours"))
                        .set("minutes", dayjs(value).get("minutes"))
                        .set("seconds", 0)
                        .set("milliseconds", 0);
                      const isAfterNow = selectedDateTime.isAfter(dayjs());
                      return isAfterNow || "Start time must be in the future";
                    } else {
                      return true;
                    }
                  },
                },
              }}
              render={({ field, fieldState, formState }) => {
                return (
                  <View style={fieldState.error && styles.errorBox}>
                    <Text style={styles.labelText}>
                      {t("reminders.start-time")}
                    </Text>
                    <View style={styles.dateInput}>
                      <DateTimePicker
                        editable={!watch("isAllDay")}
                        style={styles.inputText}
                        value={dayjs(field.value).toDate()}
                        defaultValue={dayjs(
                          formState.defaultValues?.time,
                        ).format("HH:mm")}
                        placeholder={"Select Time"}
                        mode={"time"}
                        onChange={(value) => {
                          let selectedTime = dayjs(value);
                          const startDate = getValues("startDate");
                          const recurrent = getValues("recursive");
                          const isOnceToday =
                            recurrent === RecurrentTypes["Once"] &&
                            dayjs(startDate).isToday() &&
                            !getValues("isAllDay");

                          if (isOnceToday) {
                            const pickedDateTime = dayjs(startDate)
                              .set("hours", selectedTime.get("hours"))
                              .set("minutes", selectedTime.get("minutes"))
                              .set("seconds", 0)
                              .set("milliseconds", 0);
                            const minimumAllowed = dayjs()
                              .add(1, "minute")
                              .set("seconds", 0)
                              .set("milliseconds", 0);

                            if (pickedDateTime.isBefore(minimumAllowed)) {
                              selectedTime = minimumAllowed;
                              ToastMessage("Start time must be in the future");
                            }
                          }

                          field.onChange(selectedTime.toISOString());
                          if (watch("type") !== EventType["Appointment"]) {
                            setValue("endTime", selectedTime.toISOString());
                          }

                          let start = dayjs(getValues("startDate"))
                            .set("hours", selectedTime.get("hours"))
                            .set("minutes", selectedTime.get("minutes"))
                            .toISOString();
                          let end = dayjs(getValues("endDate"))
                            .set("hours", selectedTime.get("hours"))
                            .set("minutes", selectedTime.get("minutes"))
                            .toISOString();
                          let list = updateRecurrentList({
                            startDate: start,
                            endDate: end,
                          });
                          setValue("startDate", start);
                          setValue("endDate", end);
                          setMonthList(list);
                        }}
                        dateTimeFormatter={(date, mode) => {
                          return dayjs(date).format("HH:mm");
                        }}
                      />
                      <AntDesign
                        name="clockcircleo"
                        size={18}
                        color={
                          styles[`type_text_${watch("type") ?? "REMINDER"}`]
                            .color
                        }
                      />
                    </View>
                  </View>
                );
              }}
            />
            <View style={{ width: 20 }} />

            <Controller
              control={control}
              name="endTime"
              defaultValue={defaultDate}
              rules={{
                validate: {
                  greaterThen: (value) => {
                    let isGreater = dayjs(value).isSameOrAfter(
                      getValues("time"),
                      "minutes",
                    );
                    return isGreater || "End Time must be less then start time";
                  },
                },
              }}
              render={({ field, fieldState, formState }) => {
                return (
                  <View style={[fieldState.error && styles.errorBox]}>
                    <Text style={styles.labelText}>
                      {t("reminders.end-time")}
                    </Text>
                    <View style={styles.dateInput}>
                      <DateTimePicker
                        editable={
                          watch("type") === EventType["Appointment"] &&
                          !watch("isAllDay")
                        }
                        style={styles.inputText}
                        value={dayjs(field.value).toDate()}
                        defaultValue={dayjs(
                          formState.defaultValues?.time,
                        ).format("HH:mm")}
                        placeholder={"Select Time"}
                        mode={"time"}
                        onChange={field.onChange}
                        dateTimeFormatter={(date, mode) => {
                          return dayjs(date).format("HH:mm");
                        }}
                      />
                      <AntDesign
                        name="clockcircleo"
                        size={18}
                        color={
                          styles[`type_text_${watch("type") ?? "REMINDER"}`]
                            .color
                        }
                      />
                    </View>
                  </View>
                );
              }}
            />
          </View>
          <View style={styles.separator} />

          {!route.params.reminder && (
            <View>
              <View style={{ paddingVertical: 15 }}>
                <Controller
                  control={control}
                  name="recursive"
                  defaultValue={RecurrentTypes["Once"]}
                  render={({ field, fieldState, formState }) => {
                    let value =
                      getValues("recursive") ?? RecurrentTypes["Once"];
                    return (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          justifyContent: "flex-start",
                          paddingHorizontal: 20,
                        }}
                      >
                        <Feather
                          name="repeat"
                          size={18}
                          color="black"
                          style={styles.iconStyle}
                        />
                        <Picker
                          defaultValue={
                            formState.defaultValues?.recursive ??
                            RecurrentTypes["Once"]
                          }
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
                                updateRecurrentList({
                                  type: value,
                                  endDate: start,
                                  startDate: newStart,
                                });
                              }
                              updateRecurrentList({
                                type: value,
                                endDate: start,
                                startDate: newStart,
                              });
                            }

                            if (value === RecurrentTypes["Daily"]) {
                              if (diff < 1) {
                                let val = dayjs(start)
                                  .add(1, "days")
                                  .toISOString();

                                setValue("endDate", val);
                                setValue("isAllDay", false);
                                if (
                                  dayjs(startTime).hour() == 0 &&
                                  dayjs(startTime).minute() == 0
                                ) {
                                  setValue("time", dayjs().toISOString());
                                  setValue("endTime", dayjs().toISOString());
                                  updateRecurrentList({
                                    type: value,
                                    endDate: val,
                                    startDate: dayjs(start)
                                      .set("hours", dayjs().get("hours"))
                                      .set("minutes", dayjs().get("minutes"))
                                      .toISOString(),
                                  });
                                } else {
                                  updateRecurrentList({
                                    type: value,
                                    endDate: val,
                                    startDate: newStart,
                                  });
                                }
                              } else {
                                updateRecurrentList({
                                  type: value,
                                  endDate: end,
                                  startDate: newStart,
                                });
                              }
                            }

                            if (value === RecurrentTypes["Weekly"]) {
                              if (diff < 30) {
                                let val = dayjs(start)
                                  .add(30, "days")
                                  .toISOString();
                                setValue("endDate", val);
                                setValue("isAllDay", false);
                                if (
                                  dayjs(startTime).hour() == 0 &&
                                  dayjs(startTime).minute() == 0
                                ) {
                                  setValue("time", dayjs().toISOString());
                                  setValue("endTime", dayjs().toISOString());
                                  updateRecurrentList({
                                    type: value,
                                    endDate: val,
                                    startDate: dayjs(start)
                                      .set("hours", dayjs().get("hours"))
                                      .set("minutes", dayjs().get("minutes"))
                                      .toISOString(),
                                  });
                                } else {
                                  updateRecurrentList({
                                    type: value,
                                    endDate: val,
                                    startDate: newStart,
                                  });
                                }
                              } else {
                                updateRecurrentList({
                                  type: value,
                                  endDate: end,
                                  startDate: newStart,
                                });
                              }
                            }

                            if (value === RecurrentTypes["Monthly"]) {
                              if (diff < 35) {
                                let val = dayjs(start)
                                  .add(1, "years")
                                  .toISOString();

                                setValue("endDate", val);
                                setValue("isAllDay", false);
                                if (
                                  dayjs(startTime).hour() == 0 &&
                                  dayjs(startTime).minute() == 0
                                ) {
                                  setValue("time", dayjs().toISOString());
                                  setValue("endTime", dayjs().toISOString());
                                  let list = updateRecurrentList({
                                    type: value,
                                    endDate: val,
                                    startDate: dayjs(start)
                                      .set("hours", dayjs().get("hours"))
                                      .set("minutes", dayjs().get("minutes"))
                                      .toISOString(),
                                    isMonthDay: isMonthDay == "day",
                                  });

                                  setMonthList(list);
                                  setValue("monthlyParams.twicePerMonth", true);
                                } else {
                                  let list = updateRecurrentList({
                                    type: value,
                                    endDate: val,
                                    startDate: newStart,
                                    isMonthDay: isMonthDay == "day",
                                  });

                                  setMonthList(list);
                                  setValue("monthlyParams.twicePerMonth", true);
                                }
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
                            return (
                              <Picker.Item
                                key={options.value}
                                value={options.value}
                                label={options.label}
                              />
                            );
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
                            if (
                              getValues("recursive") == RecurrentTypes["Weekly"]
                            ) {
                              return (
                                value.length > 0 ||
                                "Week day can't be empty for weekly reminders."
                              );
                            }
                            return true;
                          },
                        },
                      }}
                      name="daylyParams.dayOfWeeks"
                      render={({ field, fieldState, formState }) => {
                        return (
                          <View style={{ marginBottom: 15 }}>
                            <Text
                              style={[
                                styles.labelText,
                                { marginBottom: 8, color: "gray" },
                              ]}
                            >
                              {t("reminders.select-days")}
                            </Text>
                            <FlatList
                              style={fieldState.error && styles.errorBox}
                              data={daysData}
                              keyExtractor={(_, index) => index.toString()}
                              horizontal={true}
                              showsHorizontalScrollIndicator={false}
                              renderItem={({ item, index }) => {
                                let isSelected = field.value.find(
                                  (v) => v === item.day,
                                );
                                return (
                                  <Pressable
                                    key={index}
                                    onPress={() => {
                                      if (isSelected) {
                                        let removed = shortWeek(
                                          field.value.filter(
                                            (v) => v !== item.day,
                                          ),
                                        );
                                        field.onChange(removed);
                                        updateRecurrentList({
                                          daysOfWeek: removed,
                                        });
                                      } else {
                                        let added = shortWeek([
                                          ...field.value,
                                          item.day,
                                        ]);

                                        field.onChange(added);

                                        updateRecurrentList({
                                          daysOfWeek: added,
                                        });
                                      }
                                    }}
                                    style={{
                                      backgroundColor: isSelected
                                        ? styles[
                                            `type_text_${
                                              watch("type") ?? "REMINDER"
                                            }`
                                          ].color
                                        : "white",
                                      borderRadius: 50,
                                      paddingHorizontal: 8,
                                      paddingVertical: 10,
                                      marginHorizontal: 3,
                                    }}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 11,
                                        fontWeight: "500",
                                        color: isSelected ? "white" : "black",
                                      }}
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
                            <Text style={[styles.labelText, { color: "gray" }]}>
                              {t("reminders.repeat-for-every")}
                            </Text>

                            <RadioGroup
                              style={{ marginTop: 15, marginLeft: 10 }}
                              initialValue={field.value}
                              onValueChange={(value: number) => {
                                field.onChange(value);
                                updateRecurrentList({
                                  weekRepeatNumber: value,
                                });
                              }}
                            >
                              <RadioButton
                                value={1}
                                label={t("reminders.every-week")}
                                color={
                                  styles[
                                    `type_text_${watch("type") ?? "REMINDER"}`
                                  ].color
                                }
                                containerStyle={{ marginBottom: 5 }}
                              />
                              <RadioButton
                                value={2}
                                label={t("reminders.every-2nd-week")}
                                color={
                                  styles[
                                    `type_text_${watch("type") ?? "REMINDER"}`
                                  ].color
                                }
                                containerStyle={{ marginBottom: 5 }}
                              />
                              <RadioButton
                                value={3}
                                label={t("reminders.every-3rd-week")}
                                color={
                                  styles[
                                    `type_text_${watch("type") ?? "REMINDER"}`
                                  ].color
                                }
                                containerStyle={{ marginBottom: 5 }}
                              />
                              <RadioButton
                                value={4}
                                label={t("reminders.every-4th-week")}
                                color={
                                  styles[
                                    `type_text_${watch("type") ?? "REMINDER"}`
                                  ].color
                                }
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
                  <View
                    style={{ marginLeft: 40, marginBottom: 10, marginTop: 20 }}
                  >
                    <Controller
                      control={control}
                      name="monthlyParams.months"
                      defaultValue={[]}
                      rules={{
                        validate: {
                          mustHaveMinimumOneMonth: (value) => {
                            let isRepeat = getValues(
                              "monthlyParams.twicePerMonth",
                            );
                            if (!isRepeat) {
                              return (
                                value.length > 0 ||
                                "Minimum 1 month selection is must."
                              );
                            }
                            return true;
                          },
                        },
                      }}
                      render={({ field, fieldState, formState }) => {
                        return (
                          <View style={{}}>
                            <Text
                              style={[
                                styles.labelText,
                                { marginBottom: 10, color: "gray" },
                              ]}
                            >
                              {t("reminders.select-months")}
                            </Text>
                            <FlatList
                              data={availableMonths}
                              style={fieldState.error && styles.errorBox}
                              keyExtractor={(_, index) => index.toString()}
                              showsVerticalScrollIndicator={false}
                              numColumns={6}
                              renderItem={({ item, index }) => {
                                let isSelected = field.value.find(
                                  (v) => v === item.name,
                                );

                                return (
                                  <Pressable
                                    key={index}
                                    disabled={!item.isSelectable}
                                    onPress={() => {
                                      let isAllMonth = getValues(
                                        "monthlyParams.twicePerMonth",
                                      );
                                      if (isAllMonth) {
                                        return;
                                      }
                                      if (isSelected) {
                                        let removed = field.value.filter(
                                          (v) => v !== item.name,
                                        );
                                        field.onChange(removed);
                                      } else {
                                        let added = [
                                          ...field.value,
                                          item.name,
                                        ].sort((a, b) => {
                                          let f = availableMonths.find(
                                            (v) => v.name == a,
                                          );
                                          let l = availableMonths.find(
                                            (v) => v.name == b,
                                          );
                                          return (
                                            dayjs(f?.occurrenceDate).toDate() >
                                            dayjs(l?.occurrenceDate).toDate()
                                          );
                                        });

                                        field.onChange(added);
                                      }
                                      updateRecurrentList({});
                                    }}
                                    style={{
                                      backgroundColor: isSelected
                                        ? styles[
                                            `type_text_${
                                              watch("type") ?? "REMINDER"
                                            }`
                                          ].color
                                        : "white",
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
                                        fontSize: 12,
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
                              color={
                                styles[
                                  `type_text_${watch("type") ?? "REMINDER"}`
                                ].color
                              }
                              style={{
                                borderRadius: 5,
                                height: 20,
                                width: 20,
                                marginLeft: 5,
                              }}
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
                      <Text
                        style={[
                          styles.labelText,
                          { marginBottom: 10, color: "gray" },
                        ]}
                      >
                        {t("reminders.repeat")}
                      </Text>
                      <RadioGroup
                        style={{ marginLeft: 5, flexDirection: "row" }}
                        initialValue={isMonthDay}
                        onValueChange={(value) => {
                          setIsMonthDay(value);
                          if (value == "day") {
                            setValue("monthlyParams.onDay", 1);
                          } else {
                            setValue("monthlyParams.onWeek.dayOfWeeks", [
                              DaysOfWeek["Mon"],
                            ]);
                            setValue("monthlyParams.onWeek.everyWeek", 1);
                          }
                          let isRepeat = getValues(
                            "monthlyParams.twicePerMonth",
                          );
                          if (!isRepeat) {
                            setValue("monthlyParams.months", []);
                          }
                          let list = updateRecurrentList({
                            isMonthDay: value == "day",
                          });
                          isRepeat && setMonthList(list);
                        }}
                      >
                        <RadioButton
                          value={"day"}
                          label={t("reminders.on-day")}
                          size={20}
                          color={
                            styles[`type_text_${watch("type") ?? "REMINDER"}`]
                              .color
                          }
                        />
                        <View style={{ width: 15 }} />

                        <RadioButton
                          style={{}}
                          value={"week"}
                          label={t("reminders.on-the")}
                          color={
                            styles[`type_text_${watch("type") ?? "REMINDER"}`]
                              .color
                          }
                          size={20}
                        />
                      </RadioGroup>
                    </View>

                    {isMonthDay == "week" && (
                      <View
                        style={[
                          {
                            marginLeft: 35,
                            marginTop: 10,
                            flexDirection: "row",
                          },
                        ]}
                      >
                        <Controller
                          control={control}
                          defaultValue={1}
                          name="monthlyParams.onWeek.everyWeek"
                          render={({ field, fieldState, formState }) => {
                            return (
                              <View
                                style={{
                                  borderWidth: 1,
                                  borderRadius: 5,
                                  borderColor: "gray",
                                  paddingHorizontal: 10,
                                }}
                              >
                                <Picker
                                  value={field.value ?? 1}
                                  onChange={(value) => {
                                    field.onChange(value);
                                    let isRepeat = getValues(
                                      "monthlyParams.twicePerMonth",
                                    );
                                    if (!isRepeat) {
                                      setValue("monthlyParams.months", []);
                                    }
                                    let list = updateRecurrentList({
                                      isMonthDay: false,
                                      weekNumber: value as number,
                                    });
                                    isRepeat && setMonthList(list);
                                  }}
                                  placeholder={"Select Week"}
                                  useDialog
                                  style={styles.picker}
                                >
                                  {_.map(weekNumbers, (options, index) => {
                                    return (
                                      <Picker.Item
                                        key={options.value}
                                        value={options.value}
                                        label={options.label}
                                      />
                                    );
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
                              <View
                                style={{
                                  borderWidth: 1,
                                  borderRadius: 5,
                                  borderColor: "gray",
                                  paddingHorizontal: 20,
                                }}
                              >
                                <Picker
                                  value={field.value[0] ?? DaysOfWeek["Mon"]}
                                  placeholder={"Placeholder"}
                                  onChange={(value) => {
                                    field.onChange([value]);
                                    let isRepeat = getValues(
                                      "monthlyParams.twicePerMonth",
                                    );
                                    if (!isRepeat) {
                                      setValue("monthlyParams.months", []);
                                    }
                                    let list = updateRecurrentList({
                                      isMonthDay: false,
                                      dayOfWeek: value as number,
                                    });
                                    isRepeat && setMonthList(list);
                                  }}
                                  useDialog
                                >
                                  {_.map(weekDays, (options, index) => {
                                    return (
                                      <Picker.Item
                                        key={options.value}
                                        value={options.value}
                                        label={options.label}
                                      />
                                    );
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
                                  let isRepeat = getValues(
                                    "monthlyParams.twicePerMonth",
                                  );
                                  if (!isRepeat) {
                                    setValue("monthlyParams.months", []);
                                  }
                                  let list = updateRecurrentList({
                                    day: value,
                                  });
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
                                rightButtonBackgroundColor={
                                  styles[
                                    `type_text_${watch("type") ?? "REMINDER"}`
                                  ].color
                                }
                                leftButtonBackgroundColor={
                                  styles[
                                    `type_text_${watch("type") ?? "REMINDER"}`
                                  ].color
                                }
                              />
                            );
                          }}
                        />
                      </View>
                    )}
                  </View>
                )}
              </View>

              <InfoText
                style={{ marginLeft: 55, marginRight: 20, marginVertical: 5 }}
                recursiveList={createInfoList()}
                text={""}
              />

              <View style={styles.separator} />
            </View>
          )}

          <Controller
            control={control}
            defaultValue={[]}
            name="approvalReminderTime"
            render={({ field, fieldState, formState }) => {
              return (
                <View style={styles.peopleContainer}>
                  <Ionicons
                    name="notifications-outline"
                    size={24}
                    color="black"
                    style={styles.iconStyle}
                  />
                  <View style={{ width: windowWidth - 100 }}>
                    <FlatList
                      data={field.value}
                      ListFooterComponent={
                        field.value && field.value.length < 5 ? (
                          <Pressable onPress={() => setPreNotification(true)}>
                            <Text style={{ color: "gray", fontSize: 15 }}>
                              {t("reminders.add-notification")}
                            </Text>
                          </Pressable>
                        ) : (
                          <></>
                        )
                      }
                      renderItem={({ item, index }) => {
                        return (
                          <View
                            key={index}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text style={{ fontSize: 15, marginBottom: 8 }}>{`${
                              item.Count
                            } ${t(
                              `reminders.${item.Unit?.toLowerCase()}s`,
                            )} ${t("reminders.before")}`}</Text>
                            <AntDesign
                              onPress={() => {
                                if (field.value) {
                                  let found = field.value.filter(
                                    (v) =>
                                      `${v.Count}-${v.Unit}` !==
                                      `${item.Count}-${item.Unit}`,
                                  );

                                  field.onChange(found);
                                }
                              }}
                              name="close"
                              size={18}
                              color="black"
                              style={{ marginLeft: 10 }}
                            />
                          </View>
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
                        const newValue = {
                          Count: value.count,
                          Unit: value.unit,
                        };
                        const uniqueValues = _.uniqBy(
                          [...currentValues, newValue],
                          (item) => `${item.Count}-${item.Unit}`,
                        );
                        setValue("approvalReminderTime", uniqueValues);
                      }
                    }}
                  />
                </View>
              );
            }}
          />
          <View style={styles.separator} />

          <Controller
            control={control}
            defaultValue={[]}
            name="participants"
            rules={{
              validate: {
                callreminder: (value) => {
                  let isCall = getValues("type") === EventType["Callreminder"];
                  if (isCall) {
                    return value.length > 0 || "For Call Participant is needed";
                  } else {
                    return true;
                  }
                },
              },
            }}
            render={({ field, fieldState, formState }) => {
              return (
                <View
                  style={[
                    styles.peopleContainer,
                    fieldState.error && styles.errorBox,
                  ]}
                >
                  <Ionicons
                    name="people"
                    size={22}
                    color="black"
                    style={styles.iconStyle}
                  />
                  <FlatList
                    data={field.value.filter((v) => v._id !== MyProfile?._id)}
                    style={{ width: windowWidth - 100 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => {
                      return (
                        <Pressable
                          key={index}
                          style={{
                            marginRight: 8,
                            marginVertical: 3,
                            alignSelf: "flex-start",
                          }}
                        >
                          <Chip
                            label={item.name}
                            onPress={() => {
                              if (route.params.roomType !== "individual") {
                                !fromPhoneBook && setParticipantSelection(true);
                              }
                            }}
                            borderRadius={20}
                            leftElement={
                              <View>
                                <FastImage
                                  source={{
                                    uri:
                                      item?.profile_img &&
                                      item?.profile_img.length != 0
                                        ? `${DefaultImageUrl}${item.profile_img}`
                                        : `${DefaultImageUrl}${ImageUrl}`,
                                  }}
                                  style={{
                                    height: 30,
                                    width: 30,
                                    borderRadius: 50,
                                  }}
                                />
                              </View>
                            }
                          />
                        </Pressable>
                      );
                    }}
                    ListFooterComponent={
                      route.params.roomType !== "individual" ? (
                        <Pressable
                          onPress={async () => {
                            if (!fromPhoneBook) {
                              setParticipantSelection(true);
                            } else {
                              pickContact().then((res) => {
                                if (res) {
                                  let phone = res.phoneNumbers[0].number;
                                  field.onChange([
                                    {
                                      _id: uniqueId(),
                                      name: `${res.fullName}`,
                                      role: ReminderParticipantRole["User"],
                                      accepted:
                                        ParticipantAcceptStatus["Accept"],
                                      firstName: res.fullName,
                                      lastName: "",
                                      phone: phone,
                                    },
                                  ]);
                                }
                              });
                            }
                          }}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            marginTop: field.value.length > 0 ? 10 : 0,
                          }}
                        >
                          <Text style={{ fontSize: 15, color: "gray" }}>
                            {fromPhoneBook
                              ? t("reminders.from-phonebook")
                              : t("reminders.search-select-participants")}
                          </Text>
                        </Pressable>
                      ) : (
                        <></>
                      )
                    }
                  />
                  <Modal
                    style={{ backgroundColor: "white", margin: 0 }}
                    isVisible={participantSelection}
                    onBackButtonPress={() => setParticipantSelection(false)}
                  >
                    <ParticipantSelection
                      onChange={field.onChange}
                      selectedParticipants={field.value}
                      participants={otherParticipants.filter(
                        (v) => v.user_id !== MyProfile?._id,
                      )}
                      onBackPress={() => setParticipantSelection(false)}
                    />
                  </Modal>
                </View>
              );
            }}
          />

          {watch("type") === EventType["Callreminder"] &&
            !route.params.roomId && (
              <View style={{ marginLeft: 60, marginVertical: 5 }}>
                <Checkbox
                  color={Colors.light.PrimaryColor}
                  label={t("reminders.from-phonebook")}
                  value={fromPhoneBook}
                  onValueChange={(value) => {
                    setFromPhoneBook(value);
                    setValue("participants", []);
                    if (value) {
                      setValue("isConfirmationNeeded", null);
                    }
                  }}
                  style={{ height: 18, width: 18, borderRadius: 5 }}
                  containerStyle={{}}
                />
              </View>
            )}

          {!fromPhoneBook &&
            watch("participants")?.length > 0 &&
            !route.params.reminder && (
              <Controller
                control={control}
                name="isConfirmationNeeded"
                render={({ field, fieldState, formState }) => {
                  return (
                    <View
                      style={{ marginLeft: 60, marginBottom: 8, marginTop: 5 }}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Checkbox
                          value={field.value == null ? false : true}
                          onValueChange={(value) => {
                            field.onChange(value ? value : null);
                          }}
                          style={{ height: 18, width: 18, borderRadius: 5 }}
                          color={
                            styles[`type_text_${watch("type") ?? "REMINDER"}`]
                              .color
                          }
                          label={t("reminders.notify-participants")}
                        />
                      </View>
                      {field.value != null && (
                        <RadioGroup
                          style={{ marginTop: 15, marginLeft: 25 }}
                          initialValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <RadioButton
                            color={
                              styles[`type_text_${watch("type") ?? "REMINDER"}`]
                                .color
                            }
                            value={true}
                            label={t("reminders.with-confirmation")}
                          />
                          <View style={{ marginTop: 10 }} />
                          <RadioButton
                            color={
                              styles[`type_text_${watch("type") ?? "REMINDER"}`]
                                .color
                            }
                            value={false}
                            label={t("reminders.without-confirmation")}
                          />
                        </RadioGroup>
                      )}

                      {field.value != null && (
                        <View style={{ marginTop: 10, marginRight: 20 }}>
                          <InfoText
                            text={
                              field.value == false
                                ? t("reminders.without-confirmation-text")
                                : t("reminders.with-confirmation-text")
                            }
                          />
                        </View>
                      )}
                    </View>
                  );
                }}
              />
            )}

          <View style={styles.separator} />

          {watch("type") == EventType["Appointment"] && (
            <Controller
              control={control}
              name="attachment"
              defaultValue={[]}
              render={({ field, fieldState, formState }) => {
                return (
                  <View style={[styles.peopleContainer]}>
                    <Entypo
                      name="attachment"
                      size={22}
                      color="black"
                      style={styles.iconStyle}
                    />
                    <View>
                      <FlatList
                        numColumns={1}
                        data={field.value}
                        style={{ width: 300 }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => {
                          return (
                            <View key={index}>
                              <ReminderAttachment
                                attachment={item}
                                onDelete={() => {
                                  let attachment = getValues("attachment");
                                  if (attachment) {
                                    let removed = attachment.filter(
                                      (_, ind) => ind !== index,
                                    );
                                    setValue("attachment", removed);
                                  }
                                }}
                              />
                            </View>
                          );
                        }}
                      />
                      <FlatList
                        data={toBeUploadFiles}
                        numColumns={1}
                        style={{ width: 300 }}
                        showsVerticalScrollIndicator={false}
                        renderItem={(files) => {
                          return (
                            <View key={files.index}>
                              <UploadAttachmentView
                                item={files.item}
                                onUploadDone={(uploaded) => {
                                  let attachment = getValues("attachment");
                                  if (attachment) {
                                    let { _id, ...rest } = uploaded;
                                    setValue("attachment", [
                                      ...attachment,
                                      rest,
                                    ]);
                                  }
                                  setToBeUploadFiles([]);
                                }}
                                onCancel={() => {
                                  setToBeUploadFiles([]);
                                }}
                                onError={(item) => {
                                  setToBeUploadFiles([]);
                                }}
                              />
                            </View>
                          );
                        }}
                        ListFooterComponent={
                          field.value &&
                          field.value?.length < 5 &&
                          toBeUploadFiles.length == 0 ? (
                            <Pressable
                              // disabled={uploading}
                              onPress={() => {
                                setAttachmentModel(true);
                              }}
                              style={{
                                width: 295,
                                marginTop: field.value?.length > 0 ? 10 : 0,
                                justifyContent: "center",
                              }}
                            >
                              <Text style={{ color: "gray", fontSize: 15 }}>
                                {t("reminders.add-attachments")}
                              </Text>
                            </Pressable>
                          ) : (
                            <></>
                          )
                        }
                      />
                    </View>

                    <ActionSheet
                      visible={attachmentModel}
                      useNativeIOS
                      onDismiss={() => {
                        setAttachmentModel(false);
                      }}
                      optionsStyle={{ width: "100%", paddingHorizontal: 20 }}
                      cancelButtonIndex={5}
                      destructiveButtonIndex={4}
                      options={[
                        {
                          label: t("Utils.Image"),
                          onPress: () =>
                            SelectAttachment(
                              DocumentPicker.types.images,
                              MediaType["Photo"],
                            ),
                        },
                        {
                          label: t("Utils.Video"),
                          onPress: () =>
                            SelectAttachment(
                              DocumentPicker.types.video,
                              MediaType["Video"],
                            ),
                        },
                        {
                          label: t("Utils.Document"),
                          onPress: () =>
                            SelectAttachment(
                              DocumentPicker.types.allFiles,
                              MediaType["Document"],
                            ),
                        },
                        {
                          label: t("Utils.Audio"),
                          onPress: () =>
                            SelectAttachment(
                              DocumentPicker.types.audio,
                              MediaType["Audio"],
                            ),
                        },
                        {
                          label: `${t("btn.cancel")}`,
                          onPress: () => setAttachmentModel(false),
                        },
                      ]}
                    />
                  </View>
                );
              }}
            />
          )}

          {watch("type") == EventType["Appointment"] && (
            <View style={styles.separator} />
          )}

          {watch("type") == EventType["Appointment"] && (
            <Controller
              control={control}
              name="location"
              render={({ field, fieldState, formState }) => {
                return (
                  <View style={[styles.peopleContainer]}>
                    <Ionicons
                      name="location-sharp"
                      size={22}
                      color="black"
                      style={styles.iconStyle}
                    />
                    <Pressable
                      style={{
                        width: windowWidth - 100,
                        justifyContent: "center",
                      }}
                      onPress={() => {
                        setLocationSelection(true);
                      }}
                    >
                      <Text style={{ color: "gray", fontSize: 15 }}>
                        {field.value
                          ? field.value.address
                          : t("reminders.add-location")}
                      </Text>
                    </Pressable>
                    <LocationSelection
                      isVisible={locationSelection}
                      onClose={() => setLocationSelection(false)}
                      defaultText={field.value?.address ?? ""}
                      onSelect={(data, details = null) => {
                        if (details) {
                          field.onChange({
                            address: details?.formatted_address,
                            latitude: `${details?.geometry.location.lat}`,
                            longitude: `${details?.geometry.location.lng}`,
                            countryOffset: details.utc_offset
                              ? details.utc_offset.toString()
                              : null,
                            mapUrl: details?.url ?? null,
                          });
                          setLocationSelection(false);
                        }
                      }}
                    />
                  </View>
                );
              }}
            />
          )}

          {watch("type") == EventType["Appointment"] && (
            <View style={styles.separator} />
          )}

          <Controller
            control={control}
            name="description"
            defaultValue={""}
            render={({ field, fieldState, formState }) => {
              return (
                <View style={{ marginVertical: 30, marginHorizontal: 20 }}>
                  <Text style={[styles.labelText, { marginBottom: 10 }]}>
                    {t("reminders.description")}
                  </Text>
                  <View
                    style={{
                      backgroundColor: "rgba(243,243,243,1)",
                      paddingHorizontal: 15,
                      paddingVertical: 3,
                      borderRadius: 5,
                    }}
                  >
                    <TextField
                      defaultValue={formState.defaultValues?.description ?? ""}
                      value={field.value}
                      placeholder={t("reminders.add-description")}
                      onChangeText={field.onChange}
                      maxLength={500}
                      multiline={true}
                      numberOfLines={10}
                      showCharCounter
                      style={{
                        width: windowWidth - 80,
                        marginTop: 10,
                        minHeight: 45,
                        textAlignVertical: "top",
                      }}
                    />
                  </View>
                </View>
              );
            }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Pressable
              style={[styles.actionButton, { backgroundColor: "#E0E0E0" }]}
              onPress={navigation.goBack}
            >
              <Text style={[styles.actionButtonText, { color: "black" }]}>
                {t("btn.cancel")}
              </Text>
            </Pressable>
            <View style={{ width: 20 }} />
            <Pressable
              style={[
                styles.actionButton,
                styles[`type_box_${watch("type") ?? "REMINDER"}`],
              ]}
              disabled={
                createReminderResponse.loading ||
                createAppointmentResponse.loading ||
                updateReminderResponse.loading
              }
              onPress={handleSubmit(SaveEvent)}
            >
              {createReminderResponse.loading ||
              createAppointmentResponse.loading ||
              updateReminderResponse.loading ? (
                <ActivityIndicator color={"white"} />
              ) : (
                <Text style={[styles.actionButtonText, { color: "white" }]}>
                  {t("btn.save")}
                </Text>
              )}
            </Pressable>
          </View>

          <View style={{ height: 100 }} />
        </KeyboardAwareScrollView>
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

  function SelectAttachment(type: string, docType: MediaType) {
    DocumentPicker.pickSingle({
      type: type,
      copyTo: "cachesDirectory",
    }).then(async (res) => {
      if (res.size && res.size / 1024 / 1024 < 10) {
        setToBeUploadFiles([...toBeUploadFiles, { ...res, docType }]);
      } else {
        ToastMessage(t("label.attachment-size-limit"));
      }
    });
  }

  function cleanApprovalReminderTime(
    list?: { Count?: number; Unit?: string | null }[] | null,
  ) {
    if (!list) return [];

    return list.map((item) => ({
      Count: item.Count,
      Unit: item.Unit,
    }));
  }

  function SaveEvent(value: ReminderInput | AppointmentInput) {
    let totalParticipant = [
      {
        _id: MyProfile?._id,
        accepted: ParticipantAcceptStatus["Accept"],
        role: "ADMIN",
        firstName: MyProfile?.firstName,
        lastName: MyProfile?.lastName,
        phone: MyProfile?.phone,
      },
      ...value.participants.map((v) => {
        let status =
          value.isConfirmationNeeded == null ||
          value.isConfirmationNeeded == false
            ? ParticipantAcceptStatus["Accept"]
            : ParticipantAcceptStatus["Pending"];

        return {
          _id: v._id,
          accepted: status,
          role: v.role,
          firstName: v.firstName,
          lastName: v.lastName,
          phone: v.phone,
        };
      }),
    ];
    let Participant = totalParticipant.map((v) => {
      let isUpdate = route.params.reminder?.participants;
      if (isUpdate) {
        let status =
          value.isConfirmationNeeded == null ||
          value.isConfirmationNeeded == false
            ? ParticipantAcceptStatus["Accept"]
            : ParticipantAcceptStatus["Pending"];
        let find = isUpdate.find((b) => v._id == b._id);
        if (find) {
          return {
            _id: find._id,
            accepted:
              find.accepted === ParticipantAcceptStatus["Pending"]
                ? status
                : find.accepted,
            role: find.role,
          };
        } else {
          return { _id: v._id, accepted: v.accepted, role: v.role };
        }
      } else {
        return { _id: v._id, accepted: v.accepted, role: v.role };
      }
    });

    let startDate = dayjs(value.startDate)
      .set("hours", dayjs(value.time).get("hours"))
      .set("minutes", dayjs(value.time).get("minutes"))
      .toISOString();
    let endDate = dayjs(value.endDate)
      .set("hours", dayjs(value.time).get("hours"))
      .set("minutes", dayjs(value.time).get("minutes"))
      .toISOString();

    let date = dayjs(value.date)
      .set("hours", dayjs(value.time).get("hours"))
      .set("minutes", dayjs(value.time).get("minutes"))
      .toISOString();

    let part = fromPhoneBook
      ? totalParticipant
      : _.uniqBy(Participant, (v) => v._id);

    //MARK:- Save to remote
    let form = {
      title: value.title.trim(),
      description: value.description?.trim(),
      time: dayjs(value.time).toISOString(),
      recursive: value.recursive,
      startDate,
      endDate,
      date,
      isAllDay: value.isAllDay ?? false,
      endTime: value.endTime ?? null,
      type: value.type,
      participants: part,
      startTimeInMs: dayjs(value.startDate).unix(),
      // approvalReminderTime: value.approvalReminderTime ?? [],
      approvalReminderTime: cleanApprovalReminderTime(
        value.approvalReminderTime,
      ),

      isConfirmationNeeded:
        part.length == 1 ? null : value.isConfirmationNeeded,
    };
    console.log("Sending:", form.approvalReminderTime);

    if (value.recursive === RecurrentTypes["Weekly"]) {
      form["daylyParams"] = {
        dayOfWeeks: value.daylyParams?.dayOfWeeks ?? [],
        everyWeek: value.daylyParams?.everyWeek ?? 1,
      };
    }

    if (value.recursive === RecurrentTypes["Monthly"]) {
      form["monthlyParams"] = {
        months: value.monthlyParams?.months ?? [],
        twicePerMonth: value.monthlyParams?.twicePerMonth ?? true,
        onWeek: isMonthDay === "week" ? value.monthlyParams?.onWeek : undefined,
        onDay: isMonthDay === "day" ? value.monthlyParams?.onDay : undefined,
      };
    }

    if (route.params.roomId) {
      form["roomId"] = route.params.roomId;
      form["roomType"] = route.params.roomType;
    }

    if (value.type == EventType["Appointment"]) {
      form["attachment"] = value.attachment;
      form["location"] = value.location ?? null;
    }

    if (value.type == EventType["Reminder"]) {
      form["attachment"] = [];
      form["location"] = null;
    }

    if (value.type == EventType["Callreminder"]) {
      form["hasComon"] = !fromPhoneBook;
    }

    // console.log(form);

    if (route.params.reminder) {
      form["_id"] = route.params.reminder._id;

      const isSameDate = dayjs(route.params.reminder.date?.slice(0, 10)).isSame(
        value.date.slice(0, 10),
      );
      const isOnce = value.recursive === RecurrentTypes["Once"];

      if (isSameDate && isOnce) {
        updateReminderRequest({
          variables: {
            input: {
              ...form,
              date,
              thisOccurrence: true,
              allOccurrence: false,
            },
          },
        })
          .then((res) => {
            if (res.data?.updateReminder) {
              // console.log(res.data?.updateReminder);
              navigation.goBack();
              ToastMessage(t("reminders.reminder-updated"));
            }
          })
          .catch((res) => {
            console.log(res);
          });
      } else {
        setUpdateAllRequest({
          ...form,
          parent_id: route.params.reminder.parent_id,
        });
      }
    } else {
      if (
        value.type == EventType["Reminder"] ||
        value.type == EventType["Callreminder"]
      ) {
        console.log(form);
        createReminderRequest({
          variables: { input: form },
        })
          .then((res) => {
            if (res.data?.createReminder) {
              // console.log(res.data?.createReminder);
              navigation.goBack();
              ToastMessage(t("reminders.reminder-created"));
            }
          })
          .catch((res) => {
            console.log(res);
          });
      }

      if (value.type == EventType["Appointment"]) {
        createAppointmentRequest({
          variables: { input: form },
        })
          .then((res) => {
            if (res.data?.createAppointment) {
              // console.log(res.data?.createAppointment);
              navigation.goBack();
              ToastMessage(t("reminders.appointment-created"));
            }
          })
          .catch((res) => {
            console.log(JSON.stringify(res.networkError.result));
          });
      }
    }
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

      daysOfWeek:
        config.daysOfWeek ?? getValues("daylyParams.dayOfWeeks") ?? [],
      weekRepeatNumber:
        config.weekRepeatNumber ?? getValues("daylyParams.everyWeek") ?? 1,

      isMonthDay: config.isMonthDay ?? isMonthDay == "day" ? true : false,
      day: config.day ?? getValues("monthlyParams.onDay") ?? 1,
      dayOfWeek:
        config.dayOfWeek ?? getValues("monthlyParams.onWeek.dayOfWeeks")
          ? DaysNum[getValues("monthlyParams.onWeek.dayOfWeeks")[0]]
          : 1,
      weekNumber:
        config.weekNumber ?? getValues("monthlyParams.onWeek.everyWeek") ?? 1,
    });
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
