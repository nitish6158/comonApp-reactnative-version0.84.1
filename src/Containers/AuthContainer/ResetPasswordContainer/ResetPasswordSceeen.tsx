import * as React from "react";

import { Image, View } from "react-native";
import { useEffect, useState } from "react";

import { ElementButton } from "@Components/Button/Button";
import HeaderWithBack from "@Components/header/HeaderWithBack";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LabelInput } from "@Components/input/Input";
import { Layout } from "@Components/layout";
import Logo from "@Images/logo.png";
import { ResetPasswordScreenProps } from "@/navigation/screenPropsTypes";
import { RootTabScreenProps } from "@Types/types";
import { SwitchIcon } from "@Components/SwitchIcon";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { mainStyles } from "../../../styles/main";
import { navigate } from "@Navigation/utility";
import { setSession } from "@Util/session";
import styles from "./styles";
import { usePasswordResetMutation } from "@Service/generated/auth.generated";
import { useTranslation } from "react-i18next";

type FormValues = {
  password?: string;
  confirmPassword?: string;
};

export const ResetPasswordScreen = ({ route }: ResetPasswordScreenProps) => {
  const token = route?.params?.token;
  const { t } = useTranslation();
  const [errors, setErrors] = useState<FormValues | null>();
  const [form, setForm] = useState<FormValues | null>();
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const onChange = (key: keyof FormValues) => (text: string) => {
    setForm({ ...form, [key]: text });
    setErrors({
      [key]: false,
    });
  };

  const onSwitchSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const [resetPassword, resetPasswordResponse] = usePasswordResetMutation();

  useEffect(() => {
    if (resetPasswordResponse.data != null) {
      ToastMessage(t("label.password-reset"));
      navigate("Login", {});
    }
  }, [resetPasswordResponse.data, resetPasswordResponse.error]);

  const onSubmit = () => {
    const isPasswordValid = form?.password === form?.confirmPassword;

    if (isPasswordValid) {
      resetPassword({
        variables: {
          input: {
            password: form?.password!,
          },
        },
        context: {
          headers: {
            token,
          },
        },
      })
        .then(({ data }) => {
          setSession(data?.passwordReset!);
        })
        .catch((err) => {
          console.log(err, "reset password err");
        });
    } else {
      ToastMessage(t("label.password-do-not-match"));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <HeaderWithBack />
      <Layout withPadding={false}>
        <Image style={styles.icon} source={Logo} />
        <KeyboardAwareScrollView
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          extraScrollHeight={20}
        >
          <Layout>
            <View style={[mainStyles.center, styles.title]}>
              <Text h4>{t("reset-password.title")}</Text>
            </View>
            <View>
              <LabelInput
                required
                label={t("form.label.password")}
                value={form?.password}
                placeholder={t("form.label.password")}
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
              loading={resetPasswordResponse.loading}
              title={t("btn.reset")}
              onPress={onSubmit}
              buttonStyle={{ borderRadius: 10, height: 45, marginBottom: 80 }}
            />
          </Layout>
        </KeyboardAwareScrollView>
      </Layout>
    </View>
  );
};
