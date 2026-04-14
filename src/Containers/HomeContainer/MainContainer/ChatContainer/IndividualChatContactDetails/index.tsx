import {
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";

import Colors from "@/Constants/Colors";
import React, { useMemo, useEffect, useState } from "react";
import Text from "@Components/Text";
import { useTranslation } from "react-i18next";
import { windowHeight } from "@Util/ResponsiveView";
import { ChatContactDetailsScreenProps } from "@/navigation/screenPropsTypes";
import AntDesign from "react-native-vector-icons/AntDesign";
import Icon from "@Assets/images/Icon";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { navigateBack } from "@/navigation/utility";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl, profileImage } from "@Service/provider/endpoints";
import dayjs from "dayjs";
import useTimeHook from "@/hooks/useTimeHook";
import { checkCallPermissions } from "@Util/permission";
import ToastMessage from "@Util/ToastMesage";
import { Alert } from "react-native";
import { useAtom, useAtomValue } from "jotai";
import { InternetAtom, callAtom, singleRoom } from "@/Atoms";
import Entypo from "react-native-vector-icons/Entypo";
import { Linking } from "react-native";
import Contacts from "react-native-contacts";
import {
  useAddMyContactMutation,
  useDeleteMyContactMutation,
  useGetMyComonContactLazyQuery,
  useGetUserPhoneBookLazyQuery,
  useUpdateContactProfileMutation,
} from "@/graphql/generated/contact.generated";
import { removeDuplicateNumber, usePhoneContext } from "@/hooks";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/Reducer";
import { useForm, Controller } from "react-hook-form";
import { ContactDetailsDto } from "@/graphql/generated/version.generated";
import { DateTimePicker, Picker } from "react-native-ui-lib";
import _ from "lodash";
import { PhoneNumberUtil } from "google-libphonenumber";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
// import RealmContext from "@/schemas";
import { useAppSelector } from "@/redux/Store";
import { deviceUniqueID } from "@/navigation/Application";
import {
  updateComonContact,
  updateContact,
  updateContactProfile,
} from "@/redux/Reducer/ContactReducer";

const emailPattern = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g);

type ContactForm = {
  familyName: string;
  givenName: string;
  alias: string;
  salutation: string;
  emailAddresses: string;
  street: string;
  city: string;
  region: string;
  country: string;
  dob: string;
  gender: string;
  address: string;
  website: string;
  additional: string;
};

const genders = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

type customFieldType = {
  label: string;
  value: string;
};

// const { useRealm } = RealmContext;

export default function ContactDetails({
  route,
  navigation,
}: ChatContactDetailsScreenProps) {
  const display = useAtomValue(singleRoom);
  const { comonContact, contacts } = useSelector(
    (state: RootState) => state.Contact,
  );
  const [callRequest, setCallRequest] = useAtom(callAtom);
  const [internet] = useAtom(InternetAtom);
  const [addNewContactRequest, addNewContactResponse] =
    useAddMyContactMutation();
  const [deleteMyContactRequest] = useDeleteMyContactMutation();
  const [updateUserContact, updateContactProfileResponse] =
    useUpdateContactProfileMutation();
  const [getMyComonContact, { loading }] = useGetMyComonContactLazyQuery();

  const { code } = usePhoneContext();
  const dispatch = useDispatch();
  const [getServerPhonebook] = useGetUserPhoneBookLazyQuery();

  const { t } = useTranslation();
  const [customField, setCustomField] = useState<Array<customFieldType>>([]);

  useEffect(() => {
    ContactSync();
  }, []);

  const {
    control,
    handleSubmit,
    setFocus,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ContactForm>();

  const countryCode = useMemo(() => {
    const phoneUtils = PhoneNumberUtil.getInstance();
    const internationalDialingCode = phoneUtils.getCountryCodeForRegion(code);
    return `+${internationalDialingCode}`;
  }, [code]);

  const liveContact = useMemo(() => {
    const userId = route.params?.user?.user_id;
    if (!userId) return null;
    return (
      contacts.find((item) => item.userId?._id === userId) ??
      comonContact.find((item) => item.userId?._id === userId) ??
      null
    );
  }, [contacts, comonContact, route.params?.user?.user_id]);

  const resolvedUser = useMemo(() => {
    const routeUser = route.params?.user ?? {};
    return {
      ...routeUser,
      phone: liveContact?.phone ?? routeUser?.phone ?? "",
      profile_img: liveContact?.userId?.profile_img ?? routeUser?.profile_img ?? "",
      user_id: routeUser?.user_id,
      lastSeen: routeUser?.lastSeen,
    };
  }, [liveContact, route.params?.user]);

  const liveRoomName = useMemo(() => {
    if (display.roomType !== "individual") return display.roomName;
    const otherParticipant = display.participants?.find(
      (p) => p.user_id !== display.currentUserUtility?.user_id,
    );
    if (!otherParticipant) return display.roomName;

    const found = contacts.find((c) => c.userId?._id === otherParticipant.user_id);
    if (found) {
      const fullName = `${found.firstName ?? ""} ${found.lastName ?? ""}`.trim();
      if (fullName) return fullName;
    }
    const participantName = `${otherParticipant.firstName ?? ""} ${otherParticipant.lastName ?? ""}`.trim();
    return participantName || display.roomName;
  }, [display, contacts]);

  const isPhonebookContact = useMemo(() => {
    return comonContact.find(
      (item) => item.userId?._id === resolvedUser?.user_id,
    );
  }, [comonContact, resolvedUser?.user_id]);

  useEffect(() => {
    if (isPhonebookContact) {
      getContactFromPhoneBook(isPhonebookContact);
    }
  }, [isPhonebookContact]);

  return (
    <View style={styles.main}>
      <View style={styles.headerContainer}>
        <Pressable style={styles.headerLeftSection} onPress={navigateBack}>
          <AntDesign name="arrowleft" size={22} color="black" />
          <Text style={styles.headerText}>{t("titles.contact-edit")}</Text>
        </Pressable>
        <View style={styles.headerRightSection}>
          <Pressable onPress={onAudioCallPressed}>
            <Icon.AudioCall fontSize={22} />
          </Pressable>
          <View style={styles.gap} />
          <Pressable onPress={onVideoCallPressed}>
            <Icon.VideoCall fontSize={22} />
          </Pressable>
          <View style={styles.gap} />
          <Pressable onPress={onDialerPressed} style={styles.dialer}>
            <Entypo name="dial-pad" size={20} color="white" />
          </Pressable>
        </View>
      </View>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <FastImage
            source={{ uri: DefaultImageUrl + resolvedUser.profile_img }}
            style={styles.profile}
          />
          {display.roomStatus !== "blocked" && (
            <View>
              {resolvedUser?.lastSeen?.status == "online" ? (
                <View style={styles.lastseenContainer}>
                  <View style={styles.greenDot} />
                  <Text style={styles.lastseen}>Online</Text>
                </View>
              ) : (
                <View style={styles.lastseenContainer}>
                  <Text style={styles.lastseen}>
                    {t("others.Last Seen at")}{" "}
                    {resolvedUser?.lastSeen?.time}
                  </Text>
                </View>
              )}
            </View>
          )}
          <Text style={styles.phoneText}>
            {resolvedUser?.phone ?? ""}
          </Text>
          {!isPhonebookContact && (
            <TouchableOpacity
              style={styles.addtocontactContainer}
              onPress={onAddContactPressed}
            >
              {addNewContactResponse.loading ||
              loading ||
              updateContactProfileResponse.loading ? (
                <ActivityIndicator color={Colors.light.PrimaryColor} />
              ) : (
                <Text style={styles.addtocontactText}>
                  {t("titles.add-to-contact")}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        {isPhonebookContact && (
          <View style={styles.contactForm}>
            {Platform.OS == "ios" ? (
              <View>
                <Controller
                  control={control}
                  rules={{
                    required: {
                      message: "First Name is required",
                      value: true,
                    },
                    maxLength: {
                      message: "Name must be less then 20 charectors",
                      value: 20,
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.InputContainer}>
                      <Text style={styles.labelText}>
                        {t("form.label.first-name")}
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={t("form.label.first-name")}
                        placeholderTextColor={"rgba(51,51,51,.5)"}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        defaultValue={value}
                        autoComplete="username"
                      />
                      {errors?.givenName?.message && (
                        <Text style={styles.errorText}>
                          {errors?.givenName?.message ?? ""}
                        </Text>
                      )}
                    </View>
                  )}
                  name="givenName"
                />
                <Controller
                  control={control}
                  rules={{}}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.InputContainer}>
                      <Text style={styles.labelText}>
                        {t("form.label.last-name")}
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={t("form.label.last-name")}
                        placeholderTextColor={"rgba(51,51,51,.5)"}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoComplete="username"
                      />
                      {errors?.familyName?.message && (
                        <Text style={styles.errorText}>
                          {errors?.familyName?.message ?? ""}
                        </Text>
                      )}
                    </View>
                  )}
                  name="familyName"
                />
              </View>
            ) : (
              <Pressable
                onPress={handleAndroidNameUpdate}
                style={{
                  marginHorizontal: 20,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text style={styles.labelText}>{t("table.title.name")}</Text>
                  <Text style={{ height: 30 }}>
                    {isPhonebookContact.firstName ?? ""}{" "}
                    {isPhonebookContact.lastName ?? ""}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: Colors.light.PrimaryColor,
                    borderRadius: 20,
                    paddingHorizontal: 15,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ color: "white" }}>{t("btn.edit")}</Text>
                </View>
              </Pressable>
            )}

            <Controller
              control={control}
              rules={{
                required: false,
                maxLength: {
                  message: "Alias must be less then 30 characters",
                  value: 30,
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.InputContainer}>
                  <Text style={styles.labelText}>{t("form.label.alias")}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={`${t("form.label.enter")} ${t(
                      "form.label.alias",
                    )}`}
                    placeholderTextColor={"rgba(51,51,51,.5)"}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  {errors?.alias?.message && (
                    <Text style={styles.errorText}>
                      {errors?.alias?.message ?? ""}
                    </Text>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      paddingRight: 20,
                      marginVertical: 3,
                    }}
                  >
                    <AntDesign
                      name="infocirlce"
                      color="gray"
                      size={14}
                      style={{ marginRight: 4, marginTop: 2 }}
                    />
                    <Text lineNumber={2} style={[styles.labelText]}>
                      {t("form.extra.alias")}
                    </Text>
                  </View>
                </View>
              )}
              name="alias"
            />

            <Controller
              control={control}
              rules={{
                required: false,
                maxLength: {
                  message: "Salutation must be less then 30 characters",
                  value: 30,
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.InputContainer}>
                  <Text style={styles.labelText}>
                    {t("form.label.salutation")}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={`${t("form.label.enter")} ${t(
                      "form.label.salutation",
                    )}`}
                    placeholderTextColor={"rgba(51,51,51,.5)"}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  {errors?.salutation?.message && (
                    <Text style={styles.errorText}>
                      {errors?.salutation?.message ?? ""}
                    </Text>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      paddingRight: 20,
                      marginVertical: 3,
                    }}
                  >
                    <AntDesign
                      name="infocirlce"
                      color="gray"
                      size={14}
                      style={{ marginRight: 4, marginTop: 2 }}
                    />
                    <Text lineNumber={2} style={[styles.labelText]}>
                      {t("form.extra.salutation")}
                    </Text>
                  </View>
                </View>
              )}
              name="salutation"
            />

            <Controller
              control={control}
              rules={{
                required: false,
                maxLength: {
                  message: "Email must be less then 80 charectors",
                  value: 80,
                },
                // pattern: {
                //   message: "Invalid email address",
                //   value: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
                // },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.InputContainer}>
                  <Text style={styles.labelText}>{t("form.label.email")}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={t("form.placeholder.email")}
                    placeholderTextColor={"rgba(51,51,51,.5)"}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoComplete="email"
                    keyboardType="email-address"
                  />
                  {errors?.emailAddresses?.message && (
                    <Text style={styles.errorText}>
                      {errors?.emailAddresses?.message ?? ""}
                    </Text>
                  )}
                </View>
              )}
              name="emailAddresses"
            />

            <Controller
              control={control}
              rules={{
                required: false,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.InputContainer}>
                  <Text style={styles.labelText}>
                    {t("form.label.birthday")}
                  </Text>
                  <DateTimePicker
                    style={styles.textInput}
                    onChange={onChange}
                    value={value}
                    maximumDate={new Date()}
                    title={`${t("btn.select")} time`}
                    placeholder={`${t("btn.select")} ${t(
                      "form.label.birthday",
                    )}`}
                    mode={"date"}
                    themeVariant="light"
                    placeholderTextColor={"rgba(51,51,51,.5)"}
                    dateTimeFormatter={(date, mode) =>
                      dayjs(date.toISOString()).format("DD MMMM YYYY")
                    }
                  />
                  {errors?.dob?.message && (
                    <Text style={styles.errorText}>
                      {errors?.dob?.message ?? ""}
                    </Text>
                  )}
                </View>
              )}
              name="dob"
            />

            <Controller
              control={control}
              rules={{
                required: false,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.InputContainer}>
                  <Text style={styles.labelText}>{t("form.label.gender")}</Text>
                  <Picker
                    useDialog
                    style={styles.textInput}
                    value={value}
                    placeholder={`${t("btn.select")} ${t("form.label.gender")}`}
                    onChange={onChange}
                  >
                    {_.map(genders, (options) => {
                      return (
                        <Picker.Item
                          key={options.value}
                          value={options.value}
                          label={options.label}
                        />
                      );
                    })}
                  </Picker>
                  {errors?.gender?.message && (
                    <Text style={styles.errorText}>
                      {errors?.gender?.message ?? ""}
                    </Text>
                  )}
                </View>
              )}
              name="gender"
            />

            <Controller
              control={control}
              rules={{
                required: false,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.InputContainer}>
                  <Text style={styles.labelText}>
                    {t("form.label.website")}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="https://"
                    placeholderTextColor="rgba(51,51,51,.5)"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  {errors?.country?.message && (
                    <Text style={styles.errorText}>
                      {errors?.country?.message ?? ""}
                    </Text>
                  )}
                </View>
              )}
              name="website"
            />

            <Controller
              control={control}
              rules={{
                required: false,
                maxLength: {
                  message: "Country must be less then 30 charectors",
                  value: 30,
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.InputContainer}>
                  <Text style={styles.labelText}>
                    {t("form.label.country")}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={`${t("form.label.enter")} ${t(
                      "form.label.country",
                    )}`}
                    placeholderTextColor={"rgba(51,51,51,.5)"}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  {errors?.country?.message && (
                    <Text style={styles.errorText}>
                      {errors?.country?.message ?? ""}
                    </Text>
                  )}
                </View>
              )}
              name="country"
            />

            <Controller
              control={control}
              rules={{
                required: false,
                maxLength: {
                  message: "Region must be less then 30 charectors",
                  value: 30,
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.InputContainer}>
                  <Text style={styles.labelText}>{t("form.label.region")}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={`${t("form.label.enter")} ${t(
                      "form.label.region",
                    )}`}
                    placeholderTextColor="rgba(51,51,51,.5)"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoComplete="postal-address-region"
                  />
                  {errors?.region?.message && (
                    <Text style={styles.errorText}>
                      {errors?.region?.message ?? ""}
                    </Text>
                  )}
                </View>
              )}
              name="region"
            />

            <Controller
              control={control}
              rules={{
                required: false,
                maxLength: {
                  message: "City must be less then 30 charectors",
                  value: 30,
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.InputContainer}>
                  <Text style={styles.labelText}>{t("form.label.city")}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={`${t("form.label.enter")} ${t(
                      "form.label.city",
                    )}`}
                    placeholderTextColor="rgba(51,51,51,.5)"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoComplete="postal-address-locality"
                  />
                  {errors?.city?.message && (
                    <Text style={styles.errorText}>
                      {errors?.city?.message ?? ""}
                    </Text>
                  )}
                </View>
              )}
              name="city"
            />

            <Controller
              control={control}
              rules={{
                required: false,
                maxLength: {
                  message: "Street must be less then 50 charectors",
                  value: 50,
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.InputContainer}>
                  <Text style={styles.labelText}>{t("form.label.street")}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={`${t("form.label.enter")} ${t(
                      "form.label.street",
                    )}`}
                    placeholderTextColor={"rgba(51,51,51,.5)"}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoComplete="postal-address"
                  />
                  {errors?.street?.message && (
                    <Text style={styles.errorText}>
                      {errors?.street?.message ?? ""}
                    </Text>
                  )}
                </View>
              )}
              name="street"
            />

            <Controller
              control={control}
              rules={{
                required: false,
                maxLength: {
                  message: "Full address must be less then 200 charectors",
                  value: 200,
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.InputContainer}>
                  <Text style={styles.labelText}>
                    {t("form.label.full_Address")}
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={`${t("form.label.enter")} ${t(
                      "form.label.full_Address",
                    )}`}
                    placeholderTextColor={"rgba(51,51,51,.5)"}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    multiline={true}
                    numberOfLines={3}
                    autoComplete="postal-address"
                  />
                  {errors?.country?.message && (
                    <Text style={styles.errorText}>
                      {errors?.country?.message ?? ""}
                    </Text>
                  )}
                </View>
              )}
              name="address"
            />

            <View style={styles.CustomFieldContainer}>
              {customField.map((item, index) => {
                return (
                  <View style={styles.inputGroup} key={index}>
                    <View style={styles.InputContainer}>
                      <Text style={styles.labelText}>
                        Label{" "}
                        {item.label.length > 0 ? `of field ${item.label}` : ""}
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={`${t("form.label.enter")} ${
                          item.label.length > 0 ? item.label : "Label"
                        }`}
                        placeholderTextColor="rgba(51,51,51,.5)"
                        onChangeText={(value) => {
                          handleCustomInput(index, "label", value);
                        }}
                        maxLength={30}
                        value={item.label}
                        autoComplete="postal-address-locality"
                      />
                    </View>
                    <View style={styles.InputContainer}>
                      <Text style={styles.labelText}>
                        {item.label.length > 0 ? `${item.label}` : "Value"}
                      </Text>
                      <TextInput
                        style={styles.textInput}
                        placeholder={
                          item.label.length > 0
                            ? `${t("form.label.enter")} ${item.label}`
                            : `${t("form.label.enter")} Value`
                        }
                        placeholderTextColor="rgba(51,51,51,.5)"
                        onChangeText={(value) => {
                          handleCustomInput(index, "value", value);
                        }}
                        maxLength={100}
                        value={item.value}
                        autoComplete="postal-address-locality"
                      />
                    </View>
                    <Pressable
                      disabled={
                        updateContactProfileResponse.loading ||
                        updateContactProfileResponse.loading
                      }
                      style={{ alignItems: "flex-end" }}
                      onPress={() => removeCustomField(index)}
                    >
                      <Text style={styles.customFieldText}>
                        {t("form.label.remove-field")}
                      </Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <Pressable
              disabled={
                updateContactProfileResponse.loading ||
                updateContactProfileResponse.loading
              }
              onPress={addNewCustomField}
            >
              <Text style={styles.customFieldText}>
                {t("form.label.add-Custom-Field")}
              </Text>
            </Pressable>

            <Pressable
              disabled={
                updateContactProfileResponse.loading ||
                updateContactProfileResponse.loading
              }
              style={styles.saveButton}
              onPress={handleSubmit(SubmitContactForm)}
            >
              {updateContactProfileResponse.loading ||
              updateContactProfileResponse.loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {t("navigation.update")}
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );

  async function ContactSync() {
    try {
      let res = await getServerPhonebook();
      if (res.data?.getUserPhoneBook) {
        const contactsRaw = res.data?.getUserPhoneBook?.contacts ?? [];
        if (contactsRaw.length) {
          dispatch(updateContact(contactsRaw));
          return contactsRaw;
        } else {
          return [];
        }
      } else {
        console.log(error);
        return [];
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  function handleAndroidNameUpdate() {
    const originalID = isPhonebookContact?.localId.slice(0, -2);
    if (originalID) {
      Contacts.getContactById(originalID).then((contact) => {
        if (contact) {
          Contacts.openExistingContact(contact).then((data) => {
            if (data) {
              //OpenFORM:- Formate form number to local
              let numbers = removeDuplicateNumber(
                data.phoneNumbers.map((pn) => {
                  return {
                    label: pn.label,
                    number: pn.number.replace(/[\s()-]/g, ""),
                  };
                }),
              );

              //Find current Contact Number
              let findPhone = numbers.find(
                (pn) =>
                  formateNumber(pn.number) ==
                  formateNumber(isPhonebookContact?.phone ?? ""),
              );

              //If Current Contact found then check of name changes
              if (findPhone) {
                if (
                  contact.familyName !== data.familyName ||
                  contact.givenName !== data.givenName
                ) {
                  //Check for Sibling Contact changes. if sibling removed then do not update its name.
                  const isSiblingNumber = contacts
                    .filter((item) => {
                      const siblingID = item?.localId.slice(0, -2);
                      return siblingID === originalID;
                    })
                    .map((item) => {
                      return {
                        phone: `${item.phone}`,
                        firstName: data.givenName,
                        lastName: data.familyName,
                      };
                    });

                  const promises = isSiblingNumber.map((body) => {
                    updateUserContact({
                      variables: {
                        input: body,
                      },
                    }).then((res) => {
                      if (res.data?.updateContactProfile) {
                        dispatch(
                          updateContactProfile([res.data.updateContactProfile]),
                        );
                      }
                    });
                  });

                  Promise.all(promises)
                    .then((results) => {})

                    .catch((error) => {});
                } else {
                  //NO CHANGES IN NAME FOUND
                }
              }
              //Else Remove Contact from contact list and show number
              else {
                console.log("Delete Number");
                deleteMyContactRequest({
                  variables: {
                    input: {
                      contactIds: [isPhonebookContact?.localId ?? ""],
                    },
                  },
                }).then(() => {
                  ToastMessage(t("label.contact-not-found"));
                });
              }
            }
          });
        }
      });
    }
  }

  function removeCustomField(fieldIndex: number) {
    const field = customField.filter((item, index) => index !== fieldIndex);
    setCustomField(field);
  }

  function handleCustomInput(
    fieldIndex: number,
    type: "label" | "value",
    value: string,
  ) {
    const field = customField.map((item, index) => {
      if (index === fieldIndex) {
        switch (type) {
          case "label":
            return { ...item, label: value };
          case "value":
            return { ...item, value };
        }
      } else {
        return item;
      }
    });

    setCustomField(field);
  }

  function addNewCustomField() {
    setCustomField([...customField, { label: "", value: "" }]);
  }

  function SubmitContactForm(data: ContactForm) {
    const validCustomField = customField.filter(
      (item) => item.label.length > 0,
    );
    if (data.emailAddresses.length > 0) {
      const ifEmailValid =
        data.emailAddresses.endsWith(".com") &&
        data.emailAddresses.includes("@");
      if (!ifEmailValid) {
        setError("emailAddresses", {
          type: "pattern",
          message: "Invalid email address",
        });
        return;
      }
    }

    let requestBody = {
      firstName: data.givenName,
      lastName: data.familyName,
      email: data.emailAddresses,
      country: data.country,
      region: data.region,
      city: data.city,
      street: data.street,
      //Suffix will add at the start (salutaion)
      suffix: data.alias,
      //Prefix will add at the end (alias)
      prefix: data.salutation,
      gender: data.gender,
      additional: JSON.stringify(validCustomField),
      address: data.address,
      website: data.website,
    };

    if (typeof data.dob == "object") {
      requestBody["dob"] = data.dob;
    }

    //LocalID have `_${phi}` at that last of each number, so to get Phonebook RecordID need to remove last 2 chareacter
    const originalID = isPhonebookContact?.localId.slice(0, -2);
    const isSiblingNumber = contacts
      .filter((item) => {
        const siblingID = item?.localId.slice(0, -2);
        return siblingID === originalID;
      })
      .map((item) => {
        return {
          phone: `${item.phone}`,
          ...requestBody,
        };
      });

    console.log(requestBody);

    const promises = isSiblingNumber.map((body) => {
      updateUserContact({
        variables: {
          input: body,
        },
      })
        .then((res) => {
          if (res.data?.updateContactProfile) {
            dispatch(updateContactProfile([res.data?.updateContactProfile]));
          }
          if (res.errors) {
            console.log(JSON.stringify(res.errors));
          }
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
        });
    });

    Promise.all(promises).then(async (results) => {
      if (originalID && Platform.OS == "ios") {
        Contacts.getContactById(originalID).then((contact) => {
          if (contact) {
            if (
              contact.familyName !== data.familyName ||
              contact.givenName !== data.givenName
            ) {
              const updatedPhonebook = {
                ...contact,
                familyName: data.familyName,
                givenName: data.givenName,
              };

              Contacts.updateContact(updatedPhonebook).then(() => {});
            }
          }
        });
      }
      ToastMessage(t("label.contact-profile-updated"));
      navigation.navigate("ChatListScreen");
    });
  }

  function getContactFromPhoneBook(contact: ContactDetailsDto) {
    let isEmptyName = contact.phone?.includes(contact?.firstName ?? "");
    // console.log(contact);

    setValue("givenName", !isEmptyName ? contact.firstName ?? "" : "");
    setValue("familyName", contact.lastName ?? "");
    setValue("salutation", contact?.prefix ?? "");
    setValue("alias", contact?.suffix ?? "");
    setValue("dob", contact?.dob ? new Date(contact?.dob) : "");
    setValue("emailAddresses", contact?.email ?? "");
    setValue("gender", contact?.gender ?? "");
    setValue("city", contact?.city ?? "");
    setValue("country", contact?.country ?? "");
    setValue("street", contact?.street ?? "");
    setValue("region", contact?.region ?? "");
    setValue("website", contact?.website ?? "");
    setValue("address", contact?.address ?? "");
    if (contact?.additional && contact?.additional?.length > 2) {
      const additional = JSON.parse(contact.additional);
      if (additional.length > 0) {
        setCustomField(additional);
      }
    }
  }

  function onAddContactPressed() {
    const phone = `${resolvedUser?.phone ?? ""}`.slice(-10);
    const user = display.participantsNotLeft.find(
      (fd) => fd.user_id == resolvedUser?.user_id,
    );

    let newContact = {
      phoneNumbers: [
        {
          label: "mobile",
          number: `${phone ? phone.replace(/[\s()-]/g, "") : ""}`,
        },
      ],
    };

    if (Platform.OS == "ios") {
      newContact = {
        ...newContact,
        givenName: user?.comon_firstName ?? "",
        familyName: user?.comon_lastName ?? "",
      };
    }

    if (Platform.OS == "android") {
      newContact = {
        ...newContact,
        displayName: `${user?.comon_firstName ?? ""} ${
          user?.comon_lastName ?? ""
        }`,
      };
    }

    Contacts.openContactForm(newContact).then((contact) => {
      if (contact) {
        const body = {
          id: `${contact?.recordID}_0`,
          numbers: `${contact.phoneNumbers[0]?.number.replace(/[\s()-]/g, "")}`,
          firstName: contact?.givenName ?? "",
          lastName: `${contact.middleName ? `${contact.middleName} ` : ""}${
            contact.familyName ?? ""
          }`,
        };
        const data = {
          variables: {
            input: {
              region: code,
              contacts: body,
            },
          },
        };

        console.log(data);
        addNewContactRequest(data)
          .then(async () => {
            // navigation.navigate("ChatListScreen");
            let res = await getMyComonContact();
            if (res.data?.getMyComonContact?.contacts) {
              dispatch(
                updateComonContact(res.data?.getMyComonContact?.contacts),
              );
            }

            navigation.navigate("ChatListScreen", {});
            ToastMessage(t("label.contact-profile-updated"));
          })
          .catch((error) => {
            console.log(JSON.stringify(error));
          });
      }
    });
  }

  function onDialerPressed() {
    Linking.openURL(`tel:${resolvedUser.phone}`);
  }

  async function onVideoCallPressed() {
    const res = await checkCallPermissions("video");
    if (res === true) {
      if (internet) {
        if (callRequest == null) {
          setCallRequest({
            callType: "video",
            roomType: display.roomType,
            roomId: display.roomId,
            callBackground: display.roomImage,
            roomName: liveRoomName,
            participants: [],
            isReceiver: false,
          });
        } else {
          ToastMessage(`${t("toastmessage.incall-already-message")}`);
        }
      } else {
        Alert.alert(
          "",
          t(
            "others.Couldn't place call. Make sure your device have an internet connection and try again",
          ),
        );
      }
    }
  }

  async function onAudioCallPressed() {
    const res = await checkCallPermissions("audio");
    if (res === true) {
      if (internet) {
        if (callRequest == null) {
          setCallRequest({
            callType: "audio",
            roomType: display.roomType,
            roomId: display.roomId,
            callBackground: display.roomImage,
            roomName: liveRoomName,
            participants: [],
            isReceiver: false,
          });
        } else {
          ToastMessage(`${t("toastmessage.incall-already-message")}`);
        }
      } else {
        Alert.alert(
          "",
          t(
            "others.Couldn't place call. Make sure your device have an internet connection and try again",
          ),
        );
      }
    }
  }

  function formateNumber(str: string) {
    if (str.startsWith(countryCode)) {
      str = str.replace(countryCode, "");
    }
    if (str.startsWith("00")) {
      str = str.replace("00", "");
    }
    return str;
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: Colors.light.White,
    paddingVertical: 10,
  },
  headerContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: 5,
  },
  headerRightSection: {
    alignItems: "center",
    flexDirection: "row",
  },
  headerLeftSection: {
    alignItems: "center",
    flexDirection: "row",
  },
  headerText: {
    marginHorizontal: 10,
  },
  gap: {
    marginHorizontal: 5,
  },
  profileSection: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 25,
    backgroundColor: "#F3F9FC",
  },
  greenDot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: "green",
    marginHorizontal: 5,
  },
  profile: {
    height: 100,
    width: 100,
    borderRadius: 50,
  },
  lastseenContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 3,
    paddingLeft: 10,
    paddingRight: 15,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "rgba(200, 255, 255, 1)",
  },
  lastseen: {
    fontSize: 14,
  },
  phoneText: {
    fontSize: 16,
    color: "black",
  },
  contactForm: {},
  dialer: {
    borderRadius: 30,
    paddingHorizontal: 6,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
  },
  addtocontactContainer: {
    backgroundColor: "rgba(200, 255, 255, .8)",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
    marginVertical: 10,
  },
  addtocontactText: {
    fontSize: 12,
    color: "black",
  },
  saveButton: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    width: 300,
    backgroundColor: Colors.light.PrimaryColor,
    height: 45,
    borderRadius: 10,
    marginVertical: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  InputContainer: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  labelText: {
    fontSize: 12,
    color: "gray",
  },
  textInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    height: 45,
    color: "black",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    // fontWeight: "700",
  },
  customFieldText: {
    color: Colors.light.PrimaryColor,
    fontSize: 14,
    fontWeight: "500",
    marginVertical: 10,
    marginHorizontal: 20,
  },
  CustomFieldContainer: {},
  inputGroup: {},
});
