import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { CreateRecordScreenProps } from "@/navigation/screenPropsTypes";
import { HeaderWithScreenName } from "@/Components/header";
import {
  ActionSheet,
  Button,
  Checkbox,
  Chip,
  DateTimePicker,
  Picker,
  TextField,
} from "react-native-ui-lib";
import {
  useCreateUserRecordMutation,
  useGetRecordByIdMutation,
  useUpdateUserRecordMutation,
} from "@/graphql/generated/database.generated";
import ToastMessage from "@/utils/ToastMesage";
import { MyProfile } from "../../../../redux/constants";
import { useAppSelector } from "@/redux/Store";
import { Controller, useForm } from "react-hook-form";
import { Colors } from "@/Constants";
import Modal from "react-native-modal";
import { windowHeight } from "@/utils/ResponsiveView";
import _, { capitalize } from "lodash";
import dayjs from "dayjs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import AntDesign from "react-native-vector-icons/AntDesign";
import { CustomNotification } from "../ReminderContainer/CreateReminderScreen/components/CustomNotification";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import DocumentPicker, {
  DocumentPickerResponse,
} from "react-native-document-picker";

import { AttachmentType, MediaType } from "@/graphql/generated/types";
import UploadAttachmentView, {
  uploadResultType,
} from "../ReminderContainer/CreateReminderScreen/components/UploadAttachmentView";
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from "react-native-popup-menu";
import FastImage from "@d11/react-native-fast-image";
import docIcon from "@Assets/images/docs";
import FileViewer from "react-native-file-viewer";
import GetExtension from "@/utils/getExtensionfromUrl";
import useFileSystem from "@/hooks/useFileSystem";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Vibration } from "react-native";
import { universalEmail } from "@/utils/regExp";
import { DefaultImageUrl } from "@/graphql/provider/endpoints";
import ReminderAttachment from "../ReminderContainer/CreateReminderScreen/components/ReminderAttachment";

export type customFieldType = {
  type: "text" | "number" | "attachment" | "date";
  label: string;
  value: string;
  remind_at: null | { Count: number; Unit: string };
  attachments: Array<uploadResultType>;
  on_calender: boolean;
};

type recordFormType = {
  firstName: string;
  title: string;
  lastName: string;
  landLine: string;
  company: string;
  address: string;
  mobile: string;
  email: string;
  customFields: Array<customFieldType>;
  comment: string;
};

function getLandlineDigitCount(value: string) {
  return (value || "").replace(/\D/g, "").length;
}

export default function CreateRecordScreen({
  navigation,
  route,
}: CreateRecordScreenProps) {
  let predefinedList = {
    FirstName: false,
    LastName: false,
    Email: false,
    Mobile: false,
    Landline: false,
    Address: false,
    Company: false,
    Comment: false,
  };

  const [createRecordRequest, createRecordResponse] =
    useCreateUserRecordMutation();
  const [getRecordRequest, getRecordResponse] = useGetRecordByIdMutation();
  const [updateRecordRequest, updateRecordResponse] =
    useUpdateUserRecordMutation();
  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);
  const [showPreField, setShowPreField] = useState<boolean>(false);
  const [predefined, setPredefined] = useState(predefinedList);
  const [draftPredefined, setDraftPredefined] = useState(predefinedList);
  const [PreNotification, setPreNotification] =
    useState<customFieldType | null>(null);

  const [customNotification, setCustomNotification] =
    useState<customFieldType | null>(null);
  const [attachmentModel, setAttachmentModel] = useState<number | null>(null);
  const [toBeUploadFiles, setToBeUploadFiles] = useState<[]>([]);
  const { t } = useTranslation();
  const { checkDownloadFileFolder, saveFileToDownloads } = useFileSystem();
  const [loading, setLoading] = useState(false);
  const {
    control,
    getValues,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<recordFormType>();
  const watchedCustomFields = watch("customFields");

  let options = [
    { value: "text", label: t("userDatabase.text-field") },
    { value: "number", label: t("userDatabase.number-field") },
    { value: "attachment", label: t("userDatabase.attachment-field") },
    { value: "date", label: t("userDatabase.date-field") },
  ];

  useEffect(() => {
    if (route.params.mode == "update") {
      setLoading(true);
      getRecordRequest({
        variables: {
          input: {
            _id: route.params.recordId,
          },
        },
      })
        .then((res) => {
          if (res.data?.getRecordById) {
            console.log("update----.", res.data?.getRecordById);
            let data = res.data?.getRecordById;
            let customField = JSON.parse(data.customFields);
            setValue("title", data.title ?? "");
            setValue("address", data.address ?? "");
            setValue("company", data.company ?? "");
            setValue("comment", data.comment ?? "");
            setValue("customFields", customField ?? []);
            setValue("email", data.email ?? "");
            setValue("firstName", data.firstName ?? "");
            setValue("landLine", data.landLine ?? "");
            setValue("lastName", data.lastName ?? "");
            setValue("mobile", data.mobile ?? "");

            setPredefined({
              ...predefinedList,
              Address: data.address ? true : false,
              Company: data.company ? true : false,
              Email: data.email ? true : false,
              FirstName: data.firstName ? true : false,
              Landline: data.landLine ? true : false,
              LastName: data.lastName ? true : false,
              Mobile: data.mobile ? true : false,
              Comment: data.comment ? true : false,
            });
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [route.params]);

  if (loading) {
    return (
      <View
        style={{ height: 500, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <View>
        <HeaderWithScreenName
          title={`${
            route.params.mode == "update"
              ? t("navigation.update")
              : t("navigation.create")
          } ${t("userDatabase.new-record")}`}
        />
        <View
          style={{
            justifyContent: "space-between",
            height: windowHeight - (Platform.OS == "ios" ? 150 : 150),
          }}
        >
          <KeyboardAwareScrollView
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            extraScrollHeight={50}
          >
            <Controller
              control={control}
              name="title"
              rules={{
                validate: (value) =>
                  (value || "").trim() !== "" ||
                  t("userDatabase.title-is-request"),
              }}
              render={({ field, fieldState }) => {
                return (
                  <View style={styles.fieldContainer}>
                    <Text style={styles.labelText}>
                      {t("userDatabase.title-of-record")}
                    </Text>
                    <TextField
                      style={styles.inputBox}
                      value={field.value}
                      placeholder={`${t("userDatabase.enter-title")}`}
                      onChangeText={(text) => {
                        field.onChange(text);
                      }}
                    />
                    {errors.title && (
                      <Text style={styles.errorText}>
                        {errors.title.message}
                      </Text>
                    )}
                  </View>
                );
              }}
            />
            {predefined.FirstName && (
              <Controller
                control={control}
                name="firstName"
                rules={{
                  validate: (value) =>
                    (value || "").trim() !== "" ||
                    t("userDatabase.first-not-empty"),
                }}
                render={({ field, fieldState }) => {
                  return (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.labelText}>
                        {t("userDatabase.enter-first-name")}
                      </Text>
                      <TextField
                        style={styles.inputBox}
                        value={field.value}
                        placeholder=""
                        onChangeText={(text) => {
                          field.onChange(text);
                        }}
                        maxLength={100}
                      />
                      {errors.firstName && (
                        <Text style={styles.errorText}>
                          {errors.firstName.message}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            )}
            {predefined.LastName && (
              <Controller
                control={control}
                name="lastName"
                rules={{
                  validate: (value) =>
                    (value || "").trim() !== "" ||
                    t("userDatabase.last-name-not-empty"),
                }}
                render={({ field, fieldState }) => {
                  return (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.labelText}>
                        {t("userDatabase.enter-last-name")}
                      </Text>
                      <TextField
                        style={styles.inputBox}
                        value={field.value}
                        placeholder=""
                        maxLength={100}
                        onChangeText={(text) => {
                          field.onChange(text);
                        }}
                      />
                      {errors.lastName && (
                        <Text style={styles.errorText}>
                          {errors.lastName.message}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            )}
            {predefined.Email && (
              <Controller
                control={control}
                name="email"
                rules={{
                  validate: {
                    emptyValue: (value) => {
                      return (
                        (value || "").trim().length > 0 ||
                        t("userDatabase.email-value-not-empty")
                      );
                    },
                    email: (value, formValue) => {
                      const email = (value || "").trim();
                      return (
                        universalEmail.test(email) ||
                        `${t("userDatabase.email-is-invalid")}`
                      );
                    },
                  },
                }}
                render={({ field, fieldState }) => {
                  return (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.labelText}>
                        {t("userDatabase.enter-email-address")}
                      </Text>
                      <TextField
                        style={styles.inputBox}
                        value={field.value}
                        placeholder="@domain.com"
                        onChangeText={(text) => {
                          field.onChange(text);
                        }}
                      />
                      {errors.email && (
                        <Text style={styles.errorText}>
                          {errors.email.message}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            )}
            {predefined.Mobile && (
              <Controller
                control={control}
                name="mobile"
                rules={{
                  validate: {
                    shortPhone: (v) => {
                      const phone = (v || "").replace(/\s+/g, "");
                      return (
                        phone.length > 9 || t("userDatabase.phone-is-invalid")
                      );
                    },
                    longPhone: (v) => {
                      const phone = (v || "").replace(/\s+/g, "");
                      return (
                        phone.length < 15 || t("userDatabase.phone-is-invalid")
                      );
                    },
                    emptyValue: (value) => {
                      return (
                        (value || "").trim().length > 0 ||
                        t("userDatabase.mobile-not-empty")
                      );
                    },
                  },
                }}
                render={({ field, fieldState }) => {
                  return (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.labelText}>
                        {t("userDatabase.enter-phone-number")}
                      </Text>
                      <TextField
                        style={styles.inputBox}
                        keyboardType="decimal-pad"
                        value={field.value}
                        placeholder="+1 XXXXXXXXXX"
                        onChangeText={(text) => {
                          field.onChange(text);
                        }}
                      />
                      {errors.mobile && (
                        <Text style={styles.errorText}>
                          {errors.mobile.message}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            )}
            {predefined.Landline && (
              <Controller
                control={control}
                name="landLine"
                rules={{
                  validate: {
                    minimumLandlineDigits: (v) => {
                      const digitCount = getLandlineDigitCount(v || "");
                      return (
                        digitCount >= 6 || t("userDatabase.phone-is-invalid")
                      );
                    },
                    maximumLandlineDigits: (v) => {
                      const digitCount = getLandlineDigitCount(v || "");
                      return (
                        digitCount <= 14 || t("userDatabase.phone-is-invalid")
                      );
                    },
                    emptyValue: (value) => {
                      return (
                        (value || "").trim().length > 0 ||
                        t("userDatabase.mobile-not-empty")
                      );
                    },
                  },
                }}
                render={({ field, fieldState }) => {
                  return (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.labelText}>
                        {t("userDatabase.enter-landline-number")}
                      </Text>
                      <TextField
                        style={styles.inputBox}
                        keyboardType="decimal-pad"
                        value={field.value}
                        placeholder="Enter phone"
                        onChangeText={(text) => {
                          field.onChange(text);
                        }}
                      />
                      {errors.landLine && (
                        <Text style={styles.errorText}>
                          {errors.landLine.message}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            )}
            {predefined.Address && (
              <Controller
                control={control}
                name="address"
                rules={{
                  validate: (value) =>
                    (value || "").trim() !== "" ||
                    t("userDatabase.address-not-empty"),
                }}
                render={({ field, fieldState }) => {
                  return (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.labelText}>
                        {t("userDatabase.enter-address")}
                      </Text>
                      <TextField
                        style={styles.inputBox}
                        value={field.value}
                        placeholder=""
                        onChangeText={(text) => {
                          field.onChange(text);
                        }}
                        maxLength={300}
                      />
                      {errors.address && (
                        <Text style={styles.errorText}>
                          {errors.address.message}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            )}
            {predefined.Company && (
              <Controller
                control={control}
                name="company"
                rules={{
                  validate: (value) =>
                    (value || "").trim() !== "" ||
                    t("userDatabase.company-not-empty"),
                }}
                render={({ field, fieldState }) => {
                  return (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.labelText}>
                        {t("userDatabase.enter-company")}
                      </Text>
                      <TextField
                        style={styles.inputBox}
                        value={field.value}
                        placeholder=""
                        onChangeText={field.onChange}
                        maxLength={100}
                      />
                      {errors.company && (
                        <Text style={styles.errorText}>
                          {errors.company.message}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            )}
            {predefined.Comment && (
              <Controller
                control={control}
                name="comment"
                rules={{
                  validate: (value) =>
                    (value || "").trim() !== "" ||
                    t("userDatabase.comment-not-empty"),
                }}
                render={({ field, fieldState }) => {
                  return (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.labelText}>
                        {t("userDatabase.enter-comment")}
                      </Text>
                      <TextField
                        style={styles.inputBox}
                        value={field.value}
                        placeholder=""
                        onChangeText={field.onChange}
                        maxLength={100}
                      />
                      {errors.comment && (
                        <Text style={styles.errorText}>
                          {errors.comment.message}
                        </Text>
                      )}
                    </View>
                  );
                }}
              />
            )}
            <Controller
              defaultValue={[]}
              control={control}
              name="customFields"
              rules={{
                validate: {
                  notEmpty: (value) => {
                    let error = false;
                    value.forEach((v) => {
                      if ((v.label || "").trim().length === 0) {
                        error = true;
                      }
                    });
                    return !error || t("userDatabase.custom-field-not-empty");
                  },
                  attachmentNotEmpty: (value) => {
                    let hasEmptyAttachment = false;
                    value.forEach((v) => {
                      if (
                        v.type === "attachment" &&
                        (!Array.isArray(v.attachments) ||
                          v.attachments.length === 0)
                      ) {
                        hasEmptyAttachment = true;
                      }
                    });
                    return (
                      !hasEmptyAttachment ||
                      t("userDatabase.add-attachments", {
                        defaultValue:
                          "Please add at least one attachment for attachment field",
                      })
                    );
                  },
                },
              }}
              render={({ field, fieldState }) => {
                return (
                  <View style={{ marginHorizontal: 20 }}>
                    {field.value.map((item, index) => {
                      return (
                        <View key={index} style={{ marginBottom: 20 }}>
                          <Text style={styles.labelText}>
                            {t("userDatabase.custom-field")}
                          </Text>
                          <TextField
                            style={styles.inputBox}
                            value={item.label}
                            maxLength={100}
                            placeholder={`${t("userDatabase.enter-label")}`}
                            onChangeText={(text) => {
                              updateCustomField(index, {
                                ...item,
                                label: text,
                              });
                            }}
                          />
                          <Picker
                            style={[styles.inputBox, { marginVertical: 10 }]}
                            value={item.type}
                            useDialog
                            placeholder={"Select type"}
                            onChange={(type) => {
                              let newVal = { ...item, type };
                              if (type == "date") {
                                newVal.value = dayjs().toISOString();
                              } else {
                                newVal.value = "";
                              }
                              updateCustomField(index, newVal);
                            }}
                          >
                            {_.map(options, (options) => {
                              return (
                                <Picker.Item
                                  key={options.value}
                                  value={options.value}
                                  label={options.label}
                                />
                              );
                            })}
                          </Picker>

                          {(item.type == "text" || item.type == "number") && (
                            <TextField
                              style={styles.inputBox}
                              value={item.value}
                              placeholder={`${t("userDatabase.enter-value")}`}
                              maxLength={500}
                              onChangeText={(text) => {
                                updateCustomField(index, {
                                  ...item,
                                  value: text,
                                });
                              }}
                              keyboardType={
                                item.type == "number"
                                  ? "decimal-pad"
                                  : "default"
                              }
                            />
                          )}

                          {item.type == "date" && (
                            <View style={{}}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <DateTimePicker
                                  style={[styles.inputBox, { width: 140 }]}
                                  placeholder={"Select date"}
                                  mode={"date"}
                                  value={dayjs(item.value).toDate()}
                                  onChange={(text) => {
                                    let newValue = {
                                      ...item,
                                      value: dayjs(text).toISOString(),
                                    };
                                    let isPast = dayjs(text).isBefore(
                                      dayjs(),
                                      "dates",
                                    );
                                    if (isPast) {
                                      newValue.remind_at = null;
                                      newValue.on_calender = false;
                                    }
                                    updateCustomField(index, newValue);
                                  }}
                                  dateTimeFormatter={(text) => {
                                    return dayjs(text).format("DD MMM YYYY");
                                  }}
                                />
                                <DateTimePicker
                                  style={[
                                    styles.inputBox,
                                    { width: 140, marginLeft: 10 },
                                  ]}
                                  placeholder={"Select time"}
                                  mode={"time"}
                                  value={dayjs(item.value).toDate()}
                                  onChange={(text) => {
                                    let updatedTime = dayjs(item.value)
                                      .set("hours", dayjs(text).get("hours"))
                                      .set(
                                        "minutes",
                                        dayjs(text).get("minutes"),
                                      );
                                    let newValue = {
                                      ...item,
                                      value: updatedTime,
                                    };
                                    let isPast = dayjs(updatedTime).isBefore(
                                      dayjs(),
                                      "minutes",
                                    );
                                    if (isPast) {
                                      // newValue.remind_at = null;
                                      // newValue.on_calender = false;
                                    }
                                    updateCustomField(index, newValue);
                                  }}
                                  dateTimeFormatter={(text) => {
                                    return dayjs(text).format("HH:mm");
                                  }}
                                />
                              </View>
                              <View style={{ marginLeft: 15, marginTop: 10 }}>
                                <Checkbox
                                  label={t("userDatabase.add-on-calender")}
                                  // disabled={dayjs(item.value).isBefore(dayjs(), "minutes")}
                                  color={Colors.light.PrimaryColor}
                                  value={item.on_calender}
                                  onValueChange={(v) => {
                                    if (v == true) {
                                      updateCustomField(index, {
                                        ...item,
                                        on_calender: true,
                                      });
                                    } else {
                                      updateCustomField(index, {
                                        ...item,
                                        remind_at: null,
                                        on_calender: false,
                                      });
                                    }
                                  }}
                                />
                                {item.on_calender && (
                                  <View style={{ marginTop: 10 }}>
                                    <Checkbox
                                      label={`${t(
                                        "userDatabase.set-reminder",
                                      )}`}
                                      disabled={dayjs(item.value).isBefore(
                                        dayjs(),
                                        "minutes",
                                      )}
                                      color={Colors.light.PrimaryColor}
                                      value={item.remind_at ? true : false}
                                      onValueChange={(v) => {
                                        if (v == true) {
                                          updateCustomField(index, {
                                            ...item,
                                            remind_at: {
                                              Count: 5,
                                              Unit: "MINUTE",
                                            },
                                          });
                                        } else {
                                          updateCustomField(index, {
                                            ...item,
                                            remind_at: null,
                                          });
                                        }
                                      }}
                                    />
                                  </View>
                                )}
                              </View>

                              {item.remind_at && (
                                <View
                                  style={[
                                    styles.inputBox,
                                    {
                                      flexDirection: "row",
                                      marginTop: 10,
                                      alignItems: "center",
                                    },
                                  ]}
                                >
                                  <Ionicons
                                    name="notifications-outline"
                                    size={24}
                                    color="black"
                                    style={{}}
                                  />
                                  <View style={{ flex: 1 }}>
                                    {item.remind_at ? (
                                      <View
                                        key={index}
                                        style={{
                                          flexDirection: "row",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          flexGrow: 1,
                                          marginLeft: 10,
                                        }}
                                      >
                                        <Text style={{ fontSize: 15 }}>{`${
                                          item.remind_at.Count
                                        } ${t(
                                          `reminders.${item.remind_at.Unit?.toLowerCase()}s`,
                                        )} ${t("reminders.before")}`}</Text>
                                        <FontAwesome
                                          onPress={() => {
                                            if (item.remind_at) {
                                              setPreNotification({
                                                index,
                                                item,
                                              });
                                            }
                                          }}
                                          name="exchange"
                                          size={18}
                                          color="black"
                                          style={{ marginLeft: 10 }}
                                        />
                                      </View>
                                    ) : (
                                      <Pressable
                                        style={{ marginLeft: 10 }}
                                        onPress={() => {
                                          setPreNotification({ index, item });
                                        }}
                                      >
                                        <Text
                                          style={{
                                            color: "gray",
                                            fontSize: 15,
                                          }}
                                        >
                                          {t("reminders.add-notification")}
                                        </Text>
                                      </Pressable>
                                    )}
                                  </View>
                                </View>
                              )}
                            </View>
                          )}

                          {item.type == "attachment" && (
                            <View>
                              {item.attachments.length < 3 && (
                                <Pressable
                                  disabled={toBeUploadFiles.length == 1}
                                  onPress={() => {
                                    setAttachmentModel(index);
                                  }}
                                  style={{
                                    marginTop: 10,
                                    justifyContent: "center",
                                  }}
                                >
                                  <View style={styles.inputBox}>
                                    <Text
                                      style={{
                                        color: "gray",
                                        fontSize: 15,
                                        marginTop: 5,
                                      }}
                                    >
                                      {toBeUploadFiles.length == 0
                                        ? t("btn.select")
                                        : "uploading..."}
                                    </Text>
                                  </View>
                                </Pressable>
                              )}

                              <View style={{ marginVertical: 10 }}>
                                {item.attachments.map((v, vi) => {
                                  return (
                                    <View key={vi}>
                                      <ReminderAttachment
                                        attachment={v}
                                        onDelete={() => {
                                          updateCustomField(index, {
                                            ...item,
                                            attachments:
                                              item.attachments.filter(
                                                (_, i) => i !== vi,
                                              ),
                                          });
                                        }}
                                      />
                                    </View>
                                  );
                                })}
                              </View>

                              {toBeUploadFiles.find(
                                (v) => v.index == index,
                              ) && (
                                <UploadAttachmentView
                                  item={toBeUploadFiles.find(
                                    (v) => v.index == index,
                                  )}
                                  onUploadDone={(uploaded) => {
                                    updateCustomField(index, {
                                      ...item,
                                      attachments: [
                                        ...item.attachments,
                                        uploaded,
                                      ],
                                    });

                                    let uploadQueue = toBeUploadFiles.filter(
                                      (v) => v.index !== index,
                                    );
                                    setToBeUploadFiles(uploadQueue);
                                  }}
                                  onCancel={(value) => {
                                    setToBeUploadFiles([]);
                                  }}
                                  onError={(error) => {
                                    setToBeUploadFiles([]);
                                    // ToastMessage(error.message);
                                  }}
                                />
                              )}
                            </View>
                          )}

                          <Text
                            onPress={() => removeCustomField(index)}
                            style={{
                              alignSelf: "flex-end",
                              textAlign: "right",
                              marginTop: 20,
                              color: "red",
                            }}
                          >
                            {t("userDatabase.remove-field")}
                          </Text>
                        </View>
                      );
                    })}
                    {fieldState.error && (
                      <Text style={styles.errorText}>
                        {fieldState.error.message}
                      </Text>
                    )}
                  </View>
                );
              }}
            />
          </KeyboardAwareScrollView>
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Pressable onPress={onAddFieldPress}>
                <Text style={styles.newFieldText}>
                  {t("userDatabase.add-field")}
                </Text>
              </Pressable>
              <Pressable onPress={onAddCustomFieldPress}>
                <Text style={styles.newFieldText}>
                  {t("userDatabase.add-custom-field")}
                </Text>
              </Pressable>
            </View>
            <Button
              disabled={
                createRecordResponse.loading || updateRecordResponse.loading
              }
              label={
                route.params.mode == "update"
                  ? `${t("navigation.update")}`
                  : `${t("navigation.create")}`
              }
              onPress={() => {
                const title = getValues("title")?.trim();
                if (!title) {
                  ToastMessage(t("userDatabase.title-is-request"));
                  return;
                }
                handleSubmit(handleForm, (formErrors) => {
                  const firstError = Object.values(formErrors)[0];
                  const message =
                    typeof firstError?.message === "string"
                      ? firstError.message
                      : null;
                  if (message) {
                    ToastMessage(message);
                  }
                })();
              }}
              backgroundColor={Colors.light.PrimaryColor}
              style={{ marginHorizontal: 20 }}
            />
          </View>
        </View>
        <View>
          <ActionSheet
            visible={PreNotification != null}
            useNativeIOS
            onDismiss={() => {
              setPreNotification(null);
            }}
            optionsStyle={{ width: "100%", paddingHorizontal: 20 }}
            options={preNotificationList(
              PreNotification?.item?.value,
              (Count, Unit) => {
                updateCustomField(PreNotification?.index, {
                  ...PreNotification?.item,
                  remind_at: { Count, Unit },
                });
              },
            )}
          />

          <CustomNotification
            isVisible={customNotification != null}
            onClose={() => {
              setCustomNotification(null);
            }}
            selectedDateTime={
              typeof customNotification?.index === "number"
                ? watchedCustomFields?.[customNotification.index]?.value
                : undefined
            }
            onValueChange={(value) => {
              if (typeof customNotification?.index !== "number") {
                return;
              }

              const currentField =
                getValues("customFields")?.[customNotification.index];

              if (!currentField) {
                return;
              }

              updateCustomField(customNotification.index, {
                ...currentField,
                remind_at: { Count: value.count, Unit: value.unit },
              });
            }}
          />
          <ActionSheet
            visible={attachmentModel != null}
            useNativeIOS
            onDismiss={() => {
              setAttachmentModel(null);
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
                    attachmentModel,
                  ),
              },
              {
                label: t("Utils.Video"),
                onPress: () =>
                  SelectAttachment(
                    DocumentPicker.types.video,
                    MediaType["Video"],
                    attachmentModel,
                  ),
              },
              {
                label: t("Utils.Document"),
                onPress: () =>
                  SelectAttachment(
                    DocumentPicker.types.allFiles,
                    MediaType["Document"],
                    attachmentModel,
                  ),
              },
              {
                label: t("Utils.Audio"),
                onPress: () =>
                  SelectAttachment(
                    DocumentPicker.types.audio,
                    MediaType["Audio"],
                    attachmentModel,
                  ),
              },
              {
                label: t("btn.cancel"),
                onPress: () => setAttachmentModel(null),
              },
            ]}
          />
          <Modal
            isVisible={showPreField}
            onDismiss={() => setShowPreField(false)}
            onBackdropPress={() => setShowPreField(false)}
            onBackButtonPress={() => setShowPreField(false)}
            style={{
              marginHorizontal: -10,
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                backgroundColor: "#F3F9FC",
                height: 500,
                borderRadius: 10,
                paddingTop: 30,
                paddingHorizontal: 40,
              }}
            >
              {Object.entries(predefinedList).map(([key, _], vi) => {
                let value = draftPredefined[`${key}`];
                return (
                  <Pressable
                    key={vi}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                      borderBottomColor: "gray",
                      borderBottomWidth: 1,
                      paddingBottom: 15,
                    }}
                    onPress={() => {
                      setDraftPredefined((prev) => ({
                        ...prev,
                        [key]: !prev[`${key}`],
                      }));
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{t(`Utils.${key}`)}</Text>
                    <Checkbox
                      value={value}
                      color={Colors.light.PrimaryColor}
                      style={{ height: 25, width: 25 }}
                      onValueChange={() => {
                        setDraftPredefined((prev) => ({
                          ...prev,
                          [key]: !prev[`${key}`],
                        }));
                      }}
                    />
                  </Pressable>
                );
              })}
              <Button
                onPress={() => {
                  setPredefined(draftPredefined);
                  setShowPreField(false);
                }}
                label={`${t("btn.save")}`}
                size={Button.sizes.medium}
                backgroundColor={Colors.light.PrimaryColor}
                style={{ alignSelf: "flex-end", marginTop: 20 }}
              />
            </View>
          </Modal>
        </View>
      </View>
    </View>
  );

  function SelectAttachment(type: string, docType: MediaType, index: number) {
    DocumentPicker.pickSingle({
      type: type,
      copyTo: "documentDirectory",
    }).then(async (res) => {
      if (res.size && res.size / 1024 / 1024 < 10) {
        setToBeUploadFiles([...toBeUploadFiles, { ...res, docType, index }]);
      } else {
        ToastMessage(t("label.attachment-size-limit"));
      }
    });
  }

  function onAddFieldPress() {
    setDraftPredefined(predefined);
    setShowPreField(true);
  }

  function onAddCustomFieldPress() {
    Vibration.vibrate();
    let custom = watch("customFields");
    custom.push({
      label: "",
      type: "text",
      remind_at: null,
      on_calender: false,
      value: "",
      attachments: [],
    });
    setValue("customFields", custom);
  }

  function removeCustomField(index: number) {
    let custom = getValues("customFields");
    let updated = custom.filter((_, i) => i !== index);
    setValue("customFields", updated);
  }

  function updateCustomField(index: number, value: customFieldType) {
    let custom = getValues("customFields");
    let updated = custom.map((_, i) => {
      if (i === index) {
        return value;
      } else {
        return _;
      }
    });
    setValue("customFields", updated);
  }

  function handleForm(data: recordFormType) {
    let payload = {
      title: data.title ? data.title.trim() : "",
      firstName: data.firstName ? data.firstName.trim() : null,
      lastName: data.lastName ? data.lastName.trim() : null,
      email: data.email ? data.email.trim() : null,
      mobile: data.mobile ? data.mobile.trim() : null,
      landLine: data.landLine ? data.landLine.trim() : null,
      address: data.address ? data.address.trim() : null,
      company: data.company ? data.company.trim() : null,
      comment: data.comment ? data.comment.trim() : null,
      customFields: JSON.stringify(
        data.customFields.map((v) => ({
          ...v,
          label: typeof v.label === "string" ? v.label.trim() : v.label,
          value: typeof v.value === "string" ? v.value.trim() : v.value,
        })),
      ),
    };

    console.log(payload);

    // return

    if (route.params.mode == "create") {
      createRecordRequest({
        variables: {
          input: { ...payload, parent: route.params.parentId },
        },
      }).then((res) => {
        if (res.data?.createUserRecord) {
          ToastMessage(t("userDatabase.record-created"));
          navigation.goBack();
        }
      });
    }
    if (route.params.mode == "update" && route.params.recordId) {
      updateRecordRequest({
        variables: {
          input: {
            _id: route.params.recordId,
            parent: getRecordResponse.data?.getRecordById.parent,
            ...payload,
          },
        },
      }).then((res) => {
        if (res.data?.updateUserRecord) {
          ToastMessage(t("userDatabase.record-updated"));
          navigation.goBack();
        }
      });
    }
  }
  function preNotificationList(
    occurrencesDate: string,
    onSelected: (Count: number, Unit: string) => void,
  ) {
    let noti = [];

    if (occurrencesDate && occurrencesDate.length > 0) {
      let diff = dayjs(occurrencesDate).diff(dayjs(), "minutes");
      if (diff >= 5) {
        noti.push({
          Count: 5,
          Unit: "MINUTE",
          label: `5 ${t("reminders.minutes")} ${t("reminders.before")}`,
          onPress: () => {
            onSelected(5, "MINUTE");
          },
        });
      }
      if (diff >= 10) {
        noti.push({
          Count: 10,
          Unit: "MINUTE",
          label: `10 ${t("reminders.minutes")} ${t("reminders.before")}`,
          onPress: () => {
            onSelected(10, "MINUTE");
          },
        });
      }
      if (diff >= 15) {
        noti.push({
          Count: 15,
          Unit: "MINUTE",
          label: `15 ${t("reminders.minutes")} ${t("reminders.before")}`,
          onPress: () => {
            onSelected(15, "MINUTE");
          },
        });
      }

      if (diff >= 30) {
        noti.push({
          Count: 30,
          Unit: "MINUTE",
          label: `30 ${t("reminders.minutes")} ${t("reminders.before")}`,
          onPress: () => {
            onSelected(30, "MINUTE");
          },
        });
      }

      if (diff >= 60) {
        noti.push({
          Count: 1,
          Unit: "HOUR",
          label: `1 ${t("reminders.hours")} ${t("reminders.before")}`,
          onPress: () => {
            onSelected(60, "MINUTE");
          },
        });
      }

      if (diff >= 1440) {
        noti.push({
          Count: 1,
          Unit: "DAY",
          label: `1 ${t("reminders.days")} ${t("reminders.before")}`,
          onPress: () => {
            onSelected(1, "DAY");
          },
        });
      }
    }

    noti.push({
      label: t("custom"),
      onPress: () => {
        setCustomNotification(PreNotification);
      },
    });
    return noti;
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "space-between",
  },
  fieldContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  iconStyle: {
    marginRight: 18,
    marginLeft: 2,
  },
  labelText: {
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 6,
  },
  inputBox: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    height: 45,
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  errorText: {
    color: "red",
    marginTop: 5,
    marginRight: 10,
  },
  newFieldText: {
    fontWeight: "500",
    color: Colors.light.PrimaryColor,
    fontSize: 14,
    marginTop: 20,
    marginBottom: 20,
    marginHorizontal: 20,
  },
});
