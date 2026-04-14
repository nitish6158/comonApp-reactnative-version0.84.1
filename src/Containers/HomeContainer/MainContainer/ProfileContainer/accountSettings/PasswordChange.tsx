import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { PhoneInput, PhoneInputRef } from "@Components/input/PhoneInput";
import React, { useEffect, useState } from "react";

import { ElementButton } from "@Components/Button/Button";
import GroupCreateHeader from "../../ChatContainer/GroupsChats/GroupCreateHeader";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { LabelInput } from "@Components/input/Input";
import { Layout } from "@Components/layout";
import { SwitchIcon } from "@Components/SwitchIcon";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { View } from "react-native";
import { checkIfFormHasChanges } from "@Types/data";

import { loginScreenStyles } from "../../../../AuthContainer/LoginContainer/LoginScreenStyles";
import { mainStyles } from "../../../../../styles/main";

import { useTranslation } from "react-i18next";
import { useUpdateUserMutation } from "@Service/generated/user.generated";
import { validateEmail } from "@Util/validateEmail";
import { useAtomValue } from "jotai";
import { currentUserIdAtom } from "@/Atoms";
import { useAppSelector } from "@/redux/Store";
import { HeaderWithScreenName } from "@/Components/header";
import { Colors } from "@/Constants";
import { getTimeZone } from "react-native-localize";
import { strongPasswordRegExp } from "@/utils/regExp";

type FormValues = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  currentPassword?: string;
  iso_code: string;
};

export default function PasswordChangeContainer({ navigation }) {
  const { t } = useTranslation();
  const me = useAppSelector((state) => state.Chat.MyProfile);

  const MyProfile = useAtomValue(currentUserIdAtom);
  const [errors, setErrors] = useState<
    (FormValues & { phone?: string }) | null
  >();
  const phoneInput = React.useRef<PhoneInputRef>(null);
  const [form, setForm] = useState<FormValues | undefined>({
    ...me,
  });

  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const [updateUser, { loading: updateLoading }] = useUpdateUserMutation();

  const onChange = (key: keyof FormValues) => (text: string) => {
    setForm({ ...form, [key]: text });
    setErrors({
      [key]: false,
    });
  };

  const onSwitchSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const parseBackendErrorMessage = (value: any) => {
    if (!value || typeof value !== "string") return null;

    try {
      const parsed = JSON.parse(value);
      if (parsed?.message && typeof parsed?.message === "string") {
        return {
          code: parsed?.code,
          message: parsed?.message,
        };
      }
    } catch {}

    return {
      code: undefined,
      message: value,
    };
  };

  const getPasswordUpdateError = (error: any) => {
    const graphQLError = error?.graphQLErrors?.[0];
    const networkError = error?.networkError?.result?.errors?.[0];
    const fallbackError = error;

    const graphQLParsed = parseBackendErrorMessage(graphQLError?.message);
    const networkParsed = parseBackendErrorMessage(
      networkError?.message || error?.networkError?.result?.message
    );
    const fallbackParsed = parseBackendErrorMessage(fallbackError?.message);

    return (
      graphQLParsed ||
      networkParsed || {
        code: graphQLError?.extensions?.code || networkError?.extensions?.code,
        message: fallbackParsed?.message || t("errors.error"),
      }
    );
  };

  const onSavePassword = () => {
    const isHasChanges =
      !!form?.password || !!form?.confirmPassword || !!form?.currentPassword;

    if (isHasChanges) {
      let errors = null;

      if (!form?.currentPassword) {
        errors = {
          currentPassword: t("errors.required"),
        };
      }

      if (!form?.password || form?.currentPassword === form?.password) {
        errors = {
          ...errors,
          password:
            form?.currentPassword === form?.password
              ? t("errors.new-password")
              : t("errors.required"),
        };
      } else if (!strongPasswordRegExp.test(form?.password || "")) {
        errors = {
          ...errors,
          password: t("errors.strong-password"),
        };
      }

      if (form?.password !== form?.confirmPassword || !form?.confirmPassword) {
        errors = {
          ...errors,
          confirmPassword: !form?.confirmPassword
            ? t("errors.required")
            : t("errors.password"),
        };
      }

      if (errors) {
        setErrors(errors);
      } else {
        updateUser({
          variables: {
            input: {
              _id: MyProfile?._id,
              currentPassword: form?.currentPassword,
              password: form?.password,
              timezone: getTimeZone(),
            },
          },
        })
          .then((data) => {
            setForm(data.data?.updateUser!);
            ToastMessage(t("label.password-updated"));
            navigation.goBack();
          })
          .catch((Err) => {
            const parsedError = getPasswordUpdateError(Err);
            const rawErrorMessage = parsedError?.message?.toLowerCase?.() || "";
            const isCurrentPasswordError =
              parsedError?.code === "incorrect-password" ||
              (rawErrorMessage.includes("current password") &&
                (rawErrorMessage.includes("wrong") ||
                  rawErrorMessage.includes("invalid") ||
                  rawErrorMessage.includes("incorrect")));

            if (isCurrentPasswordError) {
              const message = parsedError?.message || t("errors.login");
              setErrors((prev) => ({
                ...(prev || {}),
                currentPassword: message,
              }));
              ToastMessage(message);
              return;
            }

            const message = parsedError?.message || t("errors.error");
            ToastMessage(message);
            console.log("Error in updating user password", JSON.stringify(Err));
          });
      }
    }
  };

  return (
    <View style={styles.main}>
      <HeaderWithScreenName title={t("titles.change-password")} />
      <View style={styles.container}>
        <View>
          <LabelInput
            label={t("form.label.current-password")}
            value={form?.currentPassword}
            placeholder={t("form.label.current-password")}
            onChangeText={onChange("currentPassword")}
            secureTextEntry={secureTextEntry}
            error={!!errors?.currentPassword}
            errorMessage={errors?.currentPassword}
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
            label={t("form.label.new-password")}
            value={form?.password}
            placeholder={t("form.label.new-password")}
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

        <Pressable
          disabled={updateLoading}
          onPress={onSavePassword}
          style={styles.button}
        >
          {updateLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={{ color: "white" }}>{t("btn.save")}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  button: {
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
  },
});
