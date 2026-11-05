import React, { useRef, useState } from "react";
import NumericInput from "react-native-numeric-input";
import Modal from "react-native-modal";
import { Pressable, Text, View } from "react-native";
import { CustomNotificationProps, MaxCustom } from "../reminder.types";
import { Colors } from "@/Constants";
import { RadioButton, RadioGroup } from "react-native-ui-lib";
import { windowWidth } from "@Util/ResponsiveView";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

export function CustomNotification({
  onClose,
  isVisible,
  onValueChange,
  selectedDateTime,
}: CustomNotificationProps) {
  const [count, setCount] = useState<number>(1);
  const [unit, setUnit] = useState<string>("MINUTE");
  const [errorMessage, setErrorMessage] = useState("");
  const counterRef = useRef<NumericInput>(null);
  const { t } = useTranslation();

  function getReminderMinutes(selectedCount: number, selectedUnit: string) {
    switch (selectedUnit) {
      case "MINUTE":
        return selectedCount;
      case "HOUR":
        return selectedCount * 60;
      case "DAY":
        return selectedCount * 24 * 60;
      case "WEEK":
        return selectedCount * 7 * 24 * 60;
      default:
        return 0;
    }
  }

  return (
    <Modal
      style={{ margin: 0 }}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      isVisible={isVisible}
    >
      {/* <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,.3)", justifyContent: "center", alignItems: "center" }}>
      </View> */}
      <View
        style={{
          backgroundColor: "white",
          paddingVertical: 20,
          paddingHorizontal: 30,
          borderRadius: 20,
          width: windowWidth - 100,
          height: errorMessage ? 370 : 320,
          alignSelf: "center",
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 16,
            fontWeight: "500",
            marginBottom: 20,
          }}
        >
          {t("reminders.custom-notification")}
        </Text>

        <View style={{ alignItems: "center", width: "100%", marginBottom: 20 }}>
          <NumericInput
            ref={counterRef}
            value={count}
            onChange={(value) => {
              setCount(value);
              if (errorMessage) {
                setErrorMessage("");
              }
            }}
            maxValue={MaxCustom[unit]}
            minValue={1}
            totalWidth={200}
            totalHeight={40}
            iconSize={25}
            step={1}
            valueType="real"
            rounded
            textColor="black"
            iconStyle={{ color: "white" }}
            rightButtonBackgroundColor={Colors.light.PrimaryColor}
            leftButtonBackgroundColor={Colors.light.PrimaryColor}
          />
        </View>

        <RadioGroup
          initialValue={"MINUTE"}
          onValueChange={(value) => {
            setUnit(value);
            if (errorMessage) {
              setErrorMessage("");
            }
            if (count > MaxCustom[value]) {
              setCount(MaxCustom[value]);
              counterRef.current?.setState({
                value: MaxCustom[value],
                stringValue: `${MaxCustom[value]}`,
              });
            }
          }}
        >
          <RadioButton
            color={Colors.light.PrimaryColor}
            style={{ marginVertical: 5 }}
            value={"MINUTE"}
            label={`${t("reminders.minutes")}`}
          />
          <RadioButton
            color={Colors.light.PrimaryColor}
            style={{ marginVertical: 5 }}
            value={"HOUR"}
            label={`${t("reminders.hours")}`}
          />
          <RadioButton
            color={Colors.light.PrimaryColor}
            style={{ marginVertical: 5 }}
            value={"DAY"}
            label={`${t("reminders.days")}`}
          />
          <RadioButton
            color={Colors.light.PrimaryColor}
            style={{ marginVertical: 5 }}
            value={"WEEK"}
            label={`${t("reminders.weeks")}`}
          />
        </RadioGroup>
        {errorMessage ? (
          <Text
            style={{
              color: "red",
              fontSize: 12,
              marginTop: 8,
            }}
          >
            {errorMessage}
          </Text>
        ) : null}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-around",
            marginVertical: 20,
            paddingHorizontal: 20,
          }}
        >
          <Pressable onPress={onClose}>
            <Text>{t("education-business.close")}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              const availableMinutes = selectedDateTime
                ? dayjs(selectedDateTime).diff(dayjs(), "minute", true)
                : 0;
              const selectedReminderMinutes = getReminderMinutes(count, unit);

              if (
                selectedDateTime &&
                (availableMinutes <= 0 ||
                  selectedReminderMinutes > availableMinutes)
              ) {
                setErrorMessage(
                  t("userDatabase.error-msg-date-time-validation"),
                );
                return;
              }

              setErrorMessage("");
              onClose();
              onValueChange({ count, unit });
            }}
          >
            <Text>{t("others.Add")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
