import * as React from "react";

import { Alert, Image, Platform, Text, View } from "react-native";
import { PhoneInput, PhoneInputRef } from "@/Components/input/PhoneInput";
import { setGlobalPhoneCode, setSession } from "@Util/session";
import { useCallback, useEffect, useState } from "react";

import { $space_xxl } from "@/Constants/Spaces";
import AntDesign from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";
import { ElementButton } from "@/Components/Button/Button";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LabelInput } from "@/Components/input/Input";
import { Layout } from "@Components/layout";
import Logo from "@Images/logo.png";
import { RegistrationScreenProps } from "../../../navigation/screenPropsTypes";
import { SwitchIcon } from "@Components/SwitchIcon";
import { TFunction } from "i18next";
import ToastMessage from "@Util/ToastMesage";
import { TooltipInfo } from "@/Components/TooltIpInfo";
import { asyncStorageKeys } from "@/Constants/asyncStorageKeys";
import { mainStyles } from "../../../styles/main";
import { getFirebaseMessagingToken } from "@/utils/firebaseMessaging";
import moment from "moment-timezone";
import { navigate } from "@Navigation/utility";
import { strongPasswordRegExp, universalEmail } from "@Util/regExp";
import styles from "./styles";
import { useAtom, useAtomValue } from "jotai";
import { useNavigation } from "@react-navigation/core";
import { usePhoneContext } from "@Hooks/usePhoneContext";
import {
  useSignUpMutation,
  useRequestEmailConfirmLazyQuery,
} from "@Service/generated/auth.generated";
import { useTranslation } from "react-i18next";
import { validateEmail } from "@Util/validateEmail";
import { windowWidth } from "@Util/ResponsiveView";
import { DefaultStorageKeys, setStorage } from "@Util/storage";
import { branchAtom } from "@/navigation/AuthNavigator";
import HeaderWithBack from "@Components/header/HeaderWithBack";
import EmailConfirmationModal from "./EmailConfirmationModal";

type FormValues = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export const SignUpScreen = ({
  route,
  navigation,
}: RegistrationScreenProps) => {
  const { phoneNumber, region } = useAtomValue(branchAtom);
  const { t } = useTranslation();
  const { phone, setPhone, setCode } = usePhoneContext();
  const [errors, setErrors] = useState<
    (FormValues & { phone?: string }) | null
  >();
  const phoneInput = React.useRef<PhoneInputRef>(null);
  const [form, setForm] = useState<FormValues | undefined>();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [signUp, signUpResponse] = useSignUpMutation();

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log("phoneNumber=", phoneNumber);
    console.log("region=", region);
    setGlobalPhoneCode({
      PhoneCode: phoneNumber,
      Country: region.toUpperCase(),
    });
    phoneInput.current?.setState({
      state: {
        code: region.toUpperCase(),
        number: phoneNumber?.substring(3, phoneNumber?.length),
        countryCode: region.toUpperCase(),
        disabled: true,
        modalVisible: false,
      },
    });
  }, [phoneNumber, region]);

  useEffect(() => {
    setCode(phoneInput.current?.state.countryCode);
    if (signUpResponse.error != null) {
      console.log(JSON.stringify(signUpResponse.error));
      ToastMessage(JSON.parse(signUpResponse.error.message).message);
    }
    console.log(JSON.stringify(signUpResponse.data));
    if (signUpResponse.data != null) {
      setCode(phoneInput.current?.state.countryCode);
      setShowModal(true);
      //requestEmailConfirm();

      // navigation.navigate("OtpVerify", {
      //   phone: phoneInput.current?.state.code,
      //   email: form?.email,
      // });
      //navigation.navigate("Login", {});
    }
  }, [signUpResponse.error, signUpResponse.data]);

  const [requestEmailConfirm] = useRequestEmailConfirmLazyQuery({
    fetchPolicy: "no-cache",
    onCompleted: (data) => {
      console.log(JSON.stringify(data));
      if (data?.requestEmailConfirm?.success) {
        setShowModal(true);
      }
    },
    onError: (error) => {
      console.error("Request email confirm failed", error);
    },
  });

  const onChange = (key: keyof FormValues) => (text: string) => {
    // setForm({ ...form, [key]: text.trim() });
    // setErrors({
    //   [key]: false,
    // });

    setForm((prev) => ({
      ...prev,
      [key]: text.trim(),
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: false,
    }));
  };

  const PhoneInputMemo = useCallback(() => {
    return (
      <PhoneInput
        ref={phoneInput}
        onChangeFormattedText={onChangeFormattedText}
        onChangeText={onChange("phone")}
        required
        defaultCode={region.toUpperCase()}
        defaultValue={phoneNumber}
        error={!!errors?.phone}
        errorMessage={errors?.phone}
        disabled={phoneNumber != ""}
        disableCountryCode={false}
      />
    );
  }, [phoneNumber, region]);

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      extraScrollHeight={50}
      style={styles.screen}
    >
      <Layout withPadding>
        <EmailConfirmationModal
          visible={showModal}
          onClose={() => {
            setShowModal(false);
            navigation.goBack();
          }}
        />
        {phoneNumber == "" ? (
          <HeaderWithBack customStyle={{ paddingHorizontal: 5 }} />
        ) : null}

        <Image style={[styles.icon, { marginTop: 10 }]} source={Logo} />
        <View style={[mainStyles.center, { marginBottom: $space_xxl }]}>
          {phoneNumber != "" ? (
            <Text style={[styles.subtitleStyle, { fontSize: 12 }]}>
              {t("welcomeSignup")}
            </Text>
          ) : null}

          <Text style={[styles.subtitleStyle, { fontSize: 12 }]}>
            {"\n"}
            {t("mandatorySignupFields")}
          </Text>

          <Text style={[styles.subtitleStyle, { fontSize: 12 }]}>
            {"\n"}
            {t("goodluck")}
          </Text>
        </View>

        <View>
          <LabelInput
            required
            label={t("form.label.first-name")}
            value={form?.firstName}
            caretHidden={false}
            placeholder={t("form.label.first-name")}
            onChangeText={onChange("firstName")}
            error={!!errors?.firstName}
            errorMessage={errors?.firstName}
            autoCompleteType="off"
          />
          <LabelInput
            required
            label={t("form.label.last-name")}
            value={form?.lastName}
            caretHidden={false}
            placeholder={t("form.label.last-name")}
            onChangeText={onChange("lastName")}
            error={!!errors?.lastName}
            errorMessage={errors?.lastName}
            autoCompleteType="off"
          />
          <LabelInput
            required
            label={t("form.label.phone")}
            value={phone?.number}
            caretHidden={false}
            placeholder={t("form.label.phone")}
          >
            <PhoneInputMemo />
          </LabelInput>
          <LabelInput
            required
            label={t("form.label.email")}
            value={form?.email}
            caretHidden={false}
            placeholder={t("form.label.email")}
            onChangeText={onChange("email")}
            error={!!errors?.email}
            errorMessage={errors?.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TooltipInfo popOverText={t("errors.strong-password")}>
            <View style={{ marginLeft: windowWidth * 0.85, top: 10 }}>
              <AntDesign name="infocirlce" size={15} />
            </View>
          </TooltipInfo>

          <LabelInput
            required
            label={t("form.label.password")}
            value={form?.password}
            placeholder={t("form.placeholder.password-for-mobile")}
            onChangeText={onChange("password")}
            secureTextEntry={secureTextEntry}
            error={!!errors?.password}
            errorMessage={errors?.password}
            rightIcon={
              <SwitchIcon
                active={secureTextEntry}
                icon="eye"
                activeIcon="eye-off"
                onPress={onSwitchSecureTextEntry}
              />
            }
          />
          <Text
            style={[
              styles.subtitleStyle,
              { fontSize: 12, textAlign: "left", marginTop: -15 },
            ]}
          >
            ({t("passwordCharacterstics")})
          </Text>
          <TooltipInfo popOverText={t("errors.strong-password")}>
            <View style={{ marginLeft: windowWidth * 0.85, top: 15 }}>
              <AntDesign name="infocirlce" size={15} />
            </View>
          </TooltipInfo>

          <LabelInput
            required
            label={t("form.label.confirm-password")}
            value={form?.confirmPassword}
            placeholder={t("form.label.confirm-password")}
            onChangeText={onChange("confirmPassword")}
            secureTextEntry={secureTextEntry}
            error={!!errors?.confirmPassword}
            errorMessage={errors?.confirmPassword}
            rightIcon={
              <SwitchIcon
                active={secureTextEntry}
                icon="eye"
                activeIcon="eye-off"
                onPress={onSwitchSecureTextEntry}
              />
            }
          />
        </View>
        <ElementButton
          loading={signUpResponse.loading}
          title={t("btn.sign-up")}
          onPress={onSubmit}
          buttonStyle={{ borderRadius: 10, height: 45, marginBottom: 20 }}
        />
      </Layout>
    </KeyboardAwareScrollView>
  );

  function onSwitchSecureTextEntry() {
    setSecureTextEntry(!secureTextEntry);
  }

  async function onSubmit() {
    const phoneNumber =
      phoneInput.current?.getNumberAfterPossiblyEliminatingZero();

    const errors = generateErrors(t, form, phoneInput);
    const deviceToken = await AsyncStorage.getItem(
      asyncStorageKeys.deviceToken,
    );
    const fcmToken = await getFirebaseMessagingToken().catch(() => "");
    const uniqueId = await DeviceInfo.getUniqueId();
    const payload = {
      phone: phoneNumber?.formattedNumber!,
      firstName: form?.firstName!,
      lastName: form?.lastName!,
      password: form?.password!,
      code: `+${phoneInput.current?.state.code}`,
      timezone: moment.tz.guess(),
      device: {
        token: Platform.OS === "ios" ? deviceToken : uniqueId,
        fcmToken: fcmToken,
        type: Platform.OS === "ios" ? "iOS" : "ANDROID",
      },
    };

    if (form?.email && form?.email?.length > 0) {
      payload["email"] = form?.email;
    } else {
      payload["email"] = `${payload.phone}@gmail.com`;
    }

    console.log("payload", payload);
    if (!errors) {
      setPhone(phoneNumber);
      signUp({
        variables: {
          input: payload,
        },
      });
    } else {
      setErrors(errors);
    }
  }

  function onChangeFormattedText() {
    const countryCode = phoneInput?.current?.state?.countryCode?.toUpperCase();

    if (countryCode) {
      setStorage(DefaultStorageKeys.COUNTRY_CODE, countryCode);
      setCode(countryCode);
    }
  }
};

export const generateErrors = (
  t: TFunction,
  form?: FormValues,
  phoneInput?: React.RefObject<PhoneInputRef>,
) => {
  const isPhoneValid = true;
  const isPasswordValid = form?.password === form?.confirmPassword;
  let errors = null;

  if (!form?.firstName) {
    errors = {
      firstName: t("errors.required"),
    };
  }

  if (!form?.lastName) {
    errors = {
      ...errors,
      lastName: t("errors.required"),
    };
  }

  if (!isPhoneValid) {
    errors = {
      ...errors,
      phone: t("errors.phone"),
    };
  }

  if (form?.email) {
    let result = universalEmail.test(form.email);
    if (!result) {
      errors = {
        ...errors,
        email: t("errors.email"),
      };
    }
  }

  if (!form?.password) {
    errors = {
      ...errors,
      password: t("errors.required"),
    };
  }

  if (!strongPasswordRegExp.test(form?.password || "")) {
    errors = {
      ...errors,
      password: t("errors.strong-password"),
    };
  }

  if (!isPasswordValid || !form?.confirmPassword) {
    errors = {
      ...errors,
      confirmPassword: !form?.confirmPassword
        ? t("errors.required")
        : t("errors.password"),
    };
  }

  return errors;
};
