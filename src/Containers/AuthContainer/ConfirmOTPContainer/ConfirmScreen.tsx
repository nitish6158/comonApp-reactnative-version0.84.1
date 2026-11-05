import { Alert, Image, Platform } from "react-native";

import React, { useEffect, useState } from "react";
import {
  usePhoneConfirmMutation,
  useRequestPhoneConfirmLazyQuery,
} from "@Service/generated/auth.generated";

import { ChangePhone } from "./ChangePhone";
import { DeadlineStorageKeys } from "@Util/storage";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { VerificationScreenProps } from "@/navigation/screenPropsTypes";
import { getTermsPolicy } from "@Util/session";
import { navigate } from "@Navigation/utility";
import source from "@Images/icons/confirm.png";
import styles from "./styles";
import { usePhoneContext } from "@Hooks/usePhoneContext";
import { useStorageDedline } from "@Hooks/useStorageDedline";
import { useTranslation } from "react-i18next";
import { Layout } from "@Components/layout";
import { CodeInput } from "@/Components/input";
import { ElementButton } from "@/Components/Button";

export default function ConfirmScreen({
  route,
  navigation,
}: VerificationScreenProps) {
  const [visible, setVisible] = useState(false);

  const { phone } = usePhoneContext();
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const { onResend, isCanResend, dedline } = useStorageDedline({
    storageKey: DeadlineStorageKeys.TIME_TO_RESEND_RESET_SMS,
  });

  const [requestPhoneConfirm, { loading }] = useRequestPhoneConfirmLazyQuery({
    onCompleted: onResend,
  });

  const [confirmByPhone, { loading: loadingConfirmByPhone }] =
    usePhoneConfirmMutation();

  const onSubmit = () => {
    confirmByPhone({
      variables: {
        input: {
          code: value,
        },
      },
    })
      .then((res) => {
        getTermsPolicy(phone?.formattedNumber).then((value) => {
          if (!value) {
            navigate("Terms", { phone: phone?.formattedNumber });
          } else {
            ToastMessage(t("label.registration-successful"));
            navigate("Login", {});
          }
        });
      })
      .catch((e) => {
        Alert.alert(e.message);
      });
  };

  const handleResend = () => {
    requestPhoneConfirm();
  };

  const toggleDialog = () => {
    setVisible(!visible);
  };

  const onChangePhone = () => {
    handleResend();
    toggleDialog();
  };

  return (
    <Layout withPadding={false}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={20}
      >
        <Layout>
          <Text style={styles.title}>{t("confirm.title")}</Text>
          <Image style={styles.icon} source={source} />
          {visible ? (
            <ChangePhone onSubmit={onChangePhone} toggleDialog={toggleDialog} />
          ) : (
            <>
              <Text style={styles.subTitle}>
                {t("confirm.description", { phone: phone?.formattedNumber })}
              </Text>
              <CodeInput onChangeText={setValue} />
              <ElementButton
                loading={loadingConfirmByPhone || loading}
                title={t("btn.verify")}
                buttonStyle={styles.nextButton}
                onPress={onSubmit}
              />
              <ElementButton
                title={t("btn.change-phone")}
                buttonStyle={styles.changeButton}
                onPress={toggleDialog}
                disabled={!isCanResend}
              />
              <ElementButton
                title={
                  isCanResend
                    ? t("confirm.resend")
                    : t("confirm.countdown", { sec: dedline })
                }
                disabled={!isCanResend}
                loading={loadingConfirmByPhone || loading}
                buttonStyle={styles.resendButton}
                onPress={handleResend}
              />
            </>
          )}
        </Layout>
      </KeyboardAwareScrollView>
    </Layout>
  );
}
