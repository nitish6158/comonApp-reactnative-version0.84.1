import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { CodeInput } from "@Components/input/CodeInput";
import { ElementButton } from "@Components/Button/Button";
import ToastMessage from "@Util/ToastMesage";
import HeaderWithBack from "@Components/header/HeaderWithBack";
import Text from "@Components/Text";
import { navigate } from "@Navigation/utility";
import {
  RESEND_OTP,
  VERIFY_OTP,
  useValidatePasswordResetSmsLazyQuery,
} from "@Service/generated/auth.generated";
import { useTranslation } from "react-i18next";
import Logo from "@Images/logo.png";
import styles2 from "./styles";
import { useStorageDedline } from "@Hooks/useStorageDedline";
import { gql, useQuery, useMutation } from "@apollo/client";

interface OtpVerifyScreenProps {
  route: {
    params: {
      phone: string;
      email?: string;
    };
  };
}

const OtpVerifyScreen: React.FC<OtpVerifyScreenProps> = ({ route }) => {
  const { phone, email } = route.params;
  const { t } = useTranslation();

  const [code, setCode] = useState("");

  const [validate, validateResponse] = useValidatePasswordResetSmsLazyQuery();

  const [timer, setTimer] = useState(120); // 120 sec = 2 minutes
  const [canResend, setCanResend] = useState(false);

  const [verifyOtp, { loading: verifying, data: verifyData }] =
    useMutation(VERIFY_OTP);
  const [resendOtp, { loading: resending, data: resendData }] =
    useMutation(RESEND_OTP);

  const onSubmit = () => {
    if (code.length < 4) {
      ToastMessage(t("toastmessage.invalid-otp-message"));
      return;
    }

    navigate("Login", {});

    // validate({
    //   variables: {
    //     input: {
    //       phone: phone.replace(/\s+/g, ""),
    //       code,
    //     },
    //   },
    // });
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    if (timer === 0) {
      setCanResend(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, canResend]);

  const onResend = () => {
    // Call your resend API here
    console.log("Resend OTP triggered");

    // restart timer
    setTimer(120);
    setCanResend(false);

    resendOtp({
      variables: { email },
    });
  };

  useEffect(() => {
    if (validateResponse.error) {
      ToastMessage(t("toastmessage.invalid-otp-message"));
    }

    if (validateResponse.data?.validatePasswordResetSms?.token) {
      navigate("Login", {});
    }
  }, [validateResponse.data, validateResponse.error]);

  return (
    <View style={styles.container}>
      <HeaderWithBack />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inner}
      >
        <Image style={styles2.icon} source={Logo} />
        <Text size="lg" style={styles.title} lineNumber={3}>
          {t("forgot-password.enter-otp")}
        </Text>

        <Text size="sm" style={styles.subtitle}>
          {t("forgot-password.otp-sent-to")}: {email}
        </Text>

        <CodeInput onChangeText={setCode} />

        <View style={{ paddingBottom: 30 }}></View>

        {canResend ? (
          <ElementButton
            title={t("sign-up.resend-otp")}
            onPress={onResend}
            buttonStyle={{ height: 45, borderRadius: 10 }}
          />
        ) : (
          <Text style={{ textAlign: "center", color: "#777" }}>
            {t("sign-up.resend-in")} {Math.floor(timer / 60)}:
            {String(timer % 60).padStart(2, "0")}
          </Text>
        )}

        <ElementButton
          title={t("btn.verify") + " & " + t("btn.sign-up")}
          disabled={code.length < 4}
          loading={validateResponse.loading}
          onPress={onSubmit}
          buttonStyle={styles.button}
        />

        {/* Optional Resend Row */}
        {/* You can re-activate your resend flow here */}
      </KeyboardAvoidingView>
    </View>
  );
};

export default OtpVerifyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    color: "#777",
  },
  button: {
    height: 48,
    borderRadius: 10,
    marginTop: 20,
  },
});
