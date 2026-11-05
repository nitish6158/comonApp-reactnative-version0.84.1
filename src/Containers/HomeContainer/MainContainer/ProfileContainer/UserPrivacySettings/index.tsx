import { View, Text, StyleSheet, Pressable } from "react-native";
import React, { useState } from "react";
import { HeaderWithScreenName } from "@/Components/header";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/redux/Store";
import { Colors, fonts } from "@/Constants";
import { Picker, Switch } from "react-native-ui-lib";
import { useUpdateGlobalReadReceiptsMutation } from "@/graphql/generated/room.generated";
import ToastMessage from "@/utils/ToastMesage";
import { UserPrivacySettingsProps } from "@/navigation/screenPropsTypes";
import { useUpdateGlobalReminderMutation, useUpdateUserAvailabilityMutation } from "@/graphql/generated/user.generated";
import { GlobalFrequencyUnit, UserAvailability } from "@/graphql/generated/types";
import { useDispatch } from "react-redux";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";
import { useMeLazyQuery } from "@/graphql/generated/auth.generated";
import { useUpdateUserIsSurveyMutation } from "@/graphql/generated/survey.generated";

export default function UserPrivacySettings({ navigation }: UserPrivacySettingsProps) {
  const { t } = useTranslation();
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const [readReceiptStatus, setReadReceiptsStatus] = useState<boolean>(MyProfile?.receipts ?? true);
  const [updateGlobalReadReceipts] = useUpdateGlobalReadReceiptsMutation();
  const [updateUserStatus] = useUpdateUserAvailabilityMutation();
  const [updateGlobalReminder] = useUpdateGlobalReminderMutation();
  const dispatch = useDispatch();
  const [changeSurveyPreferenceRequest] = useUpdateUserIsSurveyMutation();

  return (
    <View style={styles.main}>
      <HeaderWithScreenName title={t("privacy")} />
      <View style={styles.container}>
        <Pressable onPress={() => navigation.navigate("BlockedContactsContainers")} style={styles.settingContainer}>
          <Text style={styles.headingTextStyle}>{t("navigation.BlockedContacts")}</Text>
          <Text style={styles.descriptionTextStyle}>
            {MyProfile?.blockedRooms ? MyProfile?.blockedRooms.length : 0}
          </Text>
        </Pressable>
        <View style={styles.settingContainer}>
          <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
            <View style={{ width: "80%" }}>
              <Text style={[styles.textTypo, styles.headingTextStyle]}>{t("readReceipts")}</Text>
              <Text style={[styles.textTypo, styles.descriptionTextStyle]}>{t("receiptsMessage")}</Text>
            </View>
            <Switch value={readReceiptStatus} onValueChange={handlePressToggle} onColor={Colors.light.PrimaryColor} />
          </View>
        </View>
        <View style={styles.settingContainer}>
          <Text style={styles.headingTextStyle}>{t("onlineStatus.visibility-status-label")}</Text>
          <Picker
            value={MyProfile?.visibility ?? "AVAILABLE"}
            placeholder={"Status"}
            useDialog
            style={{ color: "gray" }}
            onChange={handleGlobalStatus}
            items={[
              { value: "AVAILABLE", label: t("onlineStatus.available") },
              { value: "ANONYMOUS", label: t("onlineStatus.anonymous") },
            ]}
          />
        </View>
        <View style={styles.settingContainer}>
          <Text style={styles.headingTextStyle}>{t("survey.feedback-survey")}</Text>
          <Picker
            value={MyProfile?.isSurvey ? "Enable" : "Disable"}
            placeholder={"Status"}
            useDialog
            style={{ color: "gray" }}
            onChange={handleSurveyStatus}
            items={[
              { value: "Enable", label: t("survey.enable") },
              { value: "Disable", label: t("survey.disable") },
            ]}
          />
        </View>
        {MyProfile?.globalFrequency && (
          <View style={styles.settingContainer}>
            <Text style={styles.headingTextStyle}>{t("onlineStatus.contact-frequency")}</Text>
            <Picker
              value={MyProfile?.globalFrequency.Count ?? 5}
              placeholder={"Status"}
              useDialog
              style={{ color: "gray" }}
              onChange={handleGlobalReminder}
              items={[
                { value: 2, label: `2 ${t("reminders.minutes")}` },
                { value: 5, label: `5 ${t("reminders.minutes")}` },
                { value: 10, label: `10 ${t("reminders.minutes")}` },
                { value: 15, label: `15 ${t("reminders.minutes")}` },
                { value: 20, label: `20 ${t("reminders.minutes")}` },
              ]}
            />
          </View>
        )}
        <Pressable onPress={() => navigation.navigate("ContactRemindersScreen", {})} style={styles.settingContainer}>
          <Text style={styles.headingTextStyle}>{t("onlineStatus.contact-reminders")}</Text>
          <Text style={styles.descriptionTextStyle}>
            {MyProfile?.contact_reminder ? MyProfile?.contact_reminder.length : 0}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  function handleGlobalReminder(value: number) {
    updateGlobalReminder({
      variables: {
        input: {
          Unit: GlobalFrequencyUnit.Minute,
          Count: value,
        },
      },
    }).then((res) => {
      if (res.data?.updateGlobalReminder) {
        dispatch(setMyProfile(res.data?.updateGlobalReminder));
      }
    });
  }

  function handleSurveyStatus(value: string) {
    changeSurveyPreferenceRequest({
      variables: {
        input: {
          isSurvey: value == "Enable" ? true : false,
        },
      },
    }).then((res) => {
      if (res.errors) {
        // ToastMessage("Unable to update Status");
      }
      if (res.data?.updateUserIsSurvey && MyProfile) {
        dispatch(setMyProfile({ ...MyProfile, isSurvey: value == "Enable" ? true : false }));
      }
    });
  }

  function handleGlobalStatus(value) {
    updateUserStatus({
      variables: {
        input: {
          userAvailability: value,
        },
      },
    }).then((res) => {
      if (res.errors) {
        // ToastMessage("Unable to update Status");
      }
      if (res.data?.updateUserAvailability) {
        dispatch(setMyProfile(res.data?.updateUserAvailability));
      }
    });
  }

  function handlePressToggle() {
    setReadReceiptsStatus(!readReceiptStatus);

    updateGlobalReadReceipts({
      variables: {
        input: {
          action: !readReceiptStatus,
        },
      },
    }).then((response) => {
      if (response.data?.updateGlobalReadReceipts?.success) {
        ToastMessage(t("updatedReceiptsGlobally"));
      }
    });
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  settingContainer: {
    marginBottom: 15,
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
  headingTextStyle: {
    fontSize: 16,
    lineHeight: 20,
    color: Colors.light.black,
    // fontWeight: "700",
    marginBottom: 5,
  },
  descriptionTextStyle: {
    fontSize: 15,
    lineHeight: 17,
    color: "gray",
  },
});
