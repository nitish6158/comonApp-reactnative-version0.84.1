import * as React from "react";

import { Alert, View } from "react-native";
import { PhoneInput, PhoneInputRef } from "@Components/input/PhoneInput";
import { useEffect, useState } from "react";
import {
  useRequestPasswordResetSmsLazyQuery,
  useValidatePasswordResetSmsLazyQuery,
} from "@Service/generated/auth.generated";

import { CodeInput } from "@Components/input/CodeInput";
import { DeadlineStorageKeys } from "@Util/storage";
import { ElementButton } from "@Components/Button/Button";
import ForgotPasswordImage from "@Images/forgot-password.svg";
import { ForgotPasswordScreenProps } from "@/navigation/screenPropsTypes";
import HeaderWithBack from "@Components/header/HeaderWithBack";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LabelInput } from "@Components/input/Input";
import { Layout } from "@Components/layout";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { forgotPasswordScreenStyles } from "./ForgotPasswordScreenStyles";
import { mainStyles } from "../../../styles/main";
import { navigate } from "@Navigation/utility";
import { usePhoneContext } from "@Hooks/usePhoneContext";
import { useStorageDedline } from "@Hooks/useStorageDedline";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordScreen({}: ForgotPasswordScreenProps) {
  const { t } = useTranslation();
  const { phone, setPhone } = usePhoneContext();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const phoneInput = React.useRef<PhoneInputRef>(null);

  const [requestPasswordResetLoading, setrequestPasswordResetLoading] =
    useState(false);
  const [called, setcalled] = useState(false);

  const [startTimer, setStartTimer] = useState(undefined);
  const { onResend, isCanResend, dedline, setIsCanResend } = useStorageDedline({
    storageKey: startTimer,
  });
  const [validate, validateResponse] = useValidatePasswordResetSmsLazyQuery();
  const [requestPasswordResetSms, { loading: any }] =
    useRequestPasswordResetSmsLazyQuery();
  const validatePhone = () => {
    const phoneNumber =
      phoneInput.current?.getNumberAfterPossiblyEliminatingZero();
    const isPhoneValid = phoneInput.current?.isValidNumber(
      `${phoneNumber?.formattedNumber.replace(/\s+/g, "")}`,
    );

    if (isPhoneValid) {
      setError("");
      return true;
    }

    setError(t("errors.phone"));
    return false;
  };

  const onReset = async () => {
    const phoneNumber =
      phoneInput.current?.getNumberAfterPossiblyEliminatingZero();
    const isPhoneValid = validatePhone();

    if (isPhoneValid) {
      if (phoneNumber?.formattedNumber !== phone) {
        setPhone(phoneNumber);
      }
      setStartTimer(DeadlineStorageKeys.TIME_TO_RESEND_RESET_PASSWORD);
      setrequestPasswordResetLoading(true);
      requestPasswordResetSms({
        variables: {
          input: {
            phone: phoneNumber?.formattedNumber.replace(/\s+/g, ""),
          },
        },
      })
        .then((res) => {
          setrequestPasswordResetLoading(false);
          if (res.error) {
            Alert.alert(
              `${t("toastmessage.invalid-phone-number")}`,
              `${t("toastmessage.please-check-number")}`,
            );
            return;
          }
          setcalled(true);
          setCode("");
          onResend(DeadlineStorageKeys.TIME_TO_RESEND_RESET_PASSWORD);
        })
        .catch((err) => {
          console.log("Error in requestPasswordResetSms", err);
        });
    }
  };

  useEffect(() => {
    if (validateResponse.error != null) {
      console.log("Validate response", validateResponse.error);
      ToastMessage(`${t("toastmessage.invalid-otp-message")}`);
    }
    if (validateResponse.data != null) {
      setcalled(false);
      navigate("ResetPassword", {
        token: validateResponse.data?.validatePasswordResetSms.token!,
      });
    }
  }, [validateResponse.data, validateResponse.error]);

  const onSubmit = () => {
    const phoneNumber =
      phoneInput.current?.getNumberAfterPossiblyEliminatingZero();
    const isPhoneValid = validatePhone();

    if (isPhoneValid) {
      validate({
        variables: {
          input: {
            phone: phoneNumber?.formattedNumber.replace(/\s+/g, ""),
            code,
          },
        },
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <HeaderWithBack />
      <Layout withPadding={false}>
        <KeyboardAwareScrollView
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          extraScrollHeight={50}
        >
          <Layout>
            <View style={mainStyles.center}>
              <ForgotPasswordImage
                style={mainStyles.offsetBottomMd}
                width="100%"
                height={200}
              />
            </View>
            <Text
              size="xxl"
              style={[
                forgotPasswordScreenStyles.center,
                forgotPasswordScreenStyles.title,
              ]}
            >
              {t("forgot-password.title")}
            </Text>
            <Text
              size="sm"
              lineNumber={3}
              style={[
                forgotPasswordScreenStyles.center,
                forgotPasswordScreenStyles.text,
                { maxWidth: "80%", textAlign: "center", alignSelf: "center" },
              ]}
            >
              {t("forgot-password.description")}
            </Text>
            <LabelInput
              required
              label={t("form.label.phone")}
              value={phone?.number}
              caretHidden={false}
              placeholder={t("form.label.phone")}
            >
              <PhoneInput
                ref={phoneInput}
                required
                error={!!error}
                errorMessage={error}
              />
            </LabelInput>
            {called && (
              <View style={{ paddingBottom: 24 }}>
                <CodeInput onChangeText={setCode} />
              </View>
            )}
            <ElementButton
              title={
                isCanResend
                  ? called
                    ? t("btn.resend")
                    : t("forgot-password.submit")
                  : t("confirm.countdown", { sec: dedline })
              }
              disabled={!isCanResend || requestPasswordResetLoading}
              loading={requestPasswordResetLoading}
              onPress={onReset}
              buttonStyle={{ height: 45, borderRadius: 10 }}
            />
            {called ? (
              <ElementButton
                title={t("btn.verify")}
                disabled={code.length < 4}
                onPress={onSubmit}
                loading={validateResponse.loading}
                buttonStyle={{ height: 45, borderRadius: 10, marginTop: 10 }}
              />
            ) : null}
          </Layout>
        </KeyboardAwareScrollView>
      </Layout>
    </View>
  );
}
