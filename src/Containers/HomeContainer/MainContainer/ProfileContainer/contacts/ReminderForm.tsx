import { View, Text, StyleSheet } from "react-native";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAppSelector } from "@/redux/Store";
import { Button, Picker, TextField } from "react-native-ui-lib";
import { UserContactInput } from "@/graphql/generated/types";
import { Colors } from "@/Constants";
import { useTranslation } from "react-i18next";

type props = {
  contact: UserContactInput;
  mode: "create" | "update";
  onSubmit: (data: formType) => void;
};

type formType = {
  CustomMessage: string;
  frequency: string;
};
export default function ReminderForm({ mode, onSubmit, contact }: props) {
  const { control, handleSubmit, setValue } = useForm<formType>();
  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);
  const { t } = useTranslation();

  useEffect(() => {
    if (mode == "update") {
      let user = MyProfile?.contact_reminder.find((v) => v._id == contact._id);
      if (user) {
        setValue("frequency", user.frequency);
        setValue("CustomMessage", user.CustomMessage);
      }
    } else {
      setValue("frequency", "ONCE");
      setValue("CustomMessage", `${contact.firstName ?? ""} ${contact.lastName ?? ""} ${t("onlineStatus.is-online")}`);
    }
  }, []);

  return (
    <View style={{ paddingHorizontal: 20, paddingVertical: 20 }}>
      <Text style={{ textAlign: "center", marginBottom: 30, fontWeight: "500", fontSize: 18 }}>
        {t("onlineStatus.set-reminder-for")} {contact.firstName} {contact.lastName}
      </Text>
      <Controller
        control={control}
        name="CustomMessage"
        render={({ field }) => {
          return (
            <View>
              <Text style={{ marginBottom: 10, color: "black", fontSize: 14, fontWeight: "500" }}>
                {t("onlineStatus.customMessage")}
              </Text>
              <Text style={{ marginBottom: 10, color: "gray", fontSize: 12 }}>{t("onlineStatus.custom-des")}</Text>
              <View style={styles.textBox}>
                <TextField
                  value={field.value}
                  style={{ height: 45 }}
                  placeholder={`${t("onlineStatus.custom-message-input")}`}
                  onChangeText={field.onChange}
                  maxLength={100}
                  multiline={true}
                />
              </View>
            </View>
          );
        }}
      />
      <Controller
        control={control}
        name="frequency"
        render={({ field }) => {
          return (
            <View style={{ marginTop: 15 }}>
              <Text style={{ marginBottom: 10, color: "black", fontSize: 14, fontWeight: "500" }}>
                {t("onlineStatus.choose-frequency")}
              </Text>
              <Text style={{ marginBottom: 10, color: "gray", fontSize: 12 }}>{t("onlineStatus.frequency-des")}</Text>
              <View style={styles.selectionBox}>
                <Picker
                  value={field.value}
                  placeholder={"Frequency"}
                  useDialog
                  style={{ color: "black", width: 300, height: 40 }}
                  onChange={field.onChange}
                  items={[
                    { value: "ONCE", label: t("onlineStatus.once") },
                    { value: "REPEAT", label: t("onlineStatus.repeat") },
                  ]}
                />
              </View>
            </View>
          );
        }}
      />
      <Button
        onPress={handleSubmit(onSubmit)}
        label={t("btn.save")}
        size={Button.sizes.medium}
        backgroundColor={Colors.light.PrimaryColor}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  textBox: {
    borderColor: "black",
    borderWidth: 1,
    minHeight: 45,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  selectionBox: {
    borderColor: "black",
    borderWidth: 1,
    minHeight: 45,
    borderRadius: 5,
    paddingHorizontal: 10,
    // paddingVertical: ,
  },
});
