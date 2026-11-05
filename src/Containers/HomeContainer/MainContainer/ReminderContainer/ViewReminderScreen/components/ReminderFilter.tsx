import { View, Text, Pressable } from "react-native";
import React, { useState } from "react";
import Modal from "react-native-modal";
import CalendarPicker from "react-native-calendar-picker";
import { ActionSheet } from "react-native-ui-lib";
import dayjs from "dayjs";
import { Colors } from "@/Constants";
import { today } from "../viewReminder.types";
import { useTranslation } from "react-i18next";

type ReminderFilterProps = {
  onSelected: ({ from, to }: { from: string; to: string }) => void;
};
export default function ReminderFilter({ onSelected }: ReminderFilterProps) {
  const [presetPicker, setPresetPicker] = useState<boolean>(false);
  const [customPicker, setCustomPicker] = useState<boolean>(false);
  const [range, setRange] = useState<{ start: string; end: string }>({ start: today, end: today });
  const {t} = useTranslation()
  const [label, setLabel] = useState<string>(t("others.Today"));

  return (
    <View>
      <Pressable
        style={{
          paddingHorizontal: 20,
          paddingVertical: 5,
          borderRadius: 10,
          backgroundColor: Colors.light.LightBlue,
        }}
        onPress={enablePresetPicker}
      >
        <Text>{label}</Text>
      </Pressable>
      <Modal
        isVisible={customPicker}
        onBackdropPress={disableCustomPicker}
        onBackButtonPress={disableCustomPicker}
        style={{ margin: 0 }}
      >
        <View
          style={{
            backgroundColor: "white",
            paddingHorizontal: 20,
            borderRadius: 20,
            paddingTop: 50,
            paddingBottom: 30,
          }}
        >
          <CalendarPicker
            startFromMonday={true}
            allowRangeSelection={true}
            todayBackgroundColor={Colors.light.PrimaryColor}
            selectedDayColor={Colors.light.PrimaryColor}
            selectedDayTextColor="#FFFFFF"
            onDateChange={onDateChange}
          />
          <Pressable
            onPress={() => {
              if (range.start && range.end) {
                onSelected({ from: range.start, to: range.end });
                disableCustomPicker();
              }
            }}
            style={{
              alignSelf: "flex-end",
              // marginHorizontal: 20,
              marginVertical: 20,
              paddingHorizontal: 20,
              paddingVertical: 5,
              borderRadius: 10,
              backgroundColor: Colors.light.PrimaryColor,
            }}
          >
            <Text style={{ color: "white" }}>{t("reminders.apply")}</Text>
          </Pressable>
        </View>
      </Modal>

      <ActionSheet
        visible={presetPicker}
        onDismiss={() => setPresetPicker(false)}
        options={[
          {
            label: t("others.Today"),
            onPress: () => {
              onPresetSelected("Today");
              setLabel("Today");
            },
          },
          {
            label: t("reminders.this-week"),
            onPress: () => {
              onPresetSelected("Week");
              setLabel("This Week");
            },
          },
          {
            label: t("reminders.this-month"),
            onPress: () => {
              onPresetSelected("Month");
              setLabel("This Month");
            },
          },
          {
            label: t("custom"),
            onPress: () => {
              setLabel("Custom filter");
              disablePresetPicker();
              setTimeout(() => {
                enableCustomPicker();
              }, 1000);
            },
          },
          { label: t("btn.cancel"), onPress: disablePresetPicker },
        ]}
      />
    </View>
  );

  function onDateChange(date, type) {
    console.log(date);
    if (type === "END_DATE") {
      setRange({ ...range, end: dayjs(date).toISOString() });
    } else {
      setRange({ ...range, start: dayjs(date).toISOString() });
    }
  }

  function onPresetSelected(type: string) {
    switch (type) {
      case "Today":
        onSelected({ from: today, to: today });
        break;
      case "Week":
        onSelected({ from: today, to: dayjs(today).add(7, "days").toISOString() });
        break;

      case "Month":
        onSelected({ from: today, to: dayjs(today).add(30, "days").toISOString() });
        break;

      default:
        break;
    }
    disablePresetPicker();
  }

  function enablePresetPicker() {
    setPresetPicker(true);
  }

  function disablePresetPicker() {
    setPresetPicker(false);
  }

  function enableCustomPicker() {
    setCustomPicker(true);
  }

  function disableCustomPicker() {
    setCustomPicker(false);
  }
}
