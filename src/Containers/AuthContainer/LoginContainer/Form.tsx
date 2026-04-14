import * as React from "react";

import { PhoneInput, PhoneInputRef } from "@Components/input/PhoneInput";
import { Pressable, Text, View } from "react-native";

import { Button } from "react-native-elements";
import Colors from "@/Constants/Colors";
import { LabelInput } from "@Components/input/Input";
import { PhoneType } from "@Context/PhoneProvider";
import { SwitchIcon } from "@Components/SwitchIcon";
import { navigate } from "@Navigation/utility";
import { setGlobalPhoneCode } from "@Util/session";
import { usePhoneContext } from "@Hooks/usePhoneContext";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DefaultStorageKeys, setStorage } from "@Util/storage";

interface FormProps {
  onSubmit: ({
    phone,
    password,
  }: {
    phone: PhoneType;
    password: string;
  }) => void;
  loading?: boolean;
}

export const Form = ({ onSubmit, loading }: FormProps) => {
  const [phoneValue, setPhoneValue] = useState("");
  const { phone, setPhone, code } = usePhoneContext();
  const [phoneCode, setPhoneCode] = useState("+1");
  const phoneInput = React.useRef<PhoneInputRef>(null);
  const [errors, setErrors] = useState<
    { phone?: string; password?: string } | undefined
  >();
  const [values, setValues] = useState({ password: undefined });

  const { t } = useTranslation();
  const [secureTextVisibility, setSecureTextVisibility] = useState(true);

  const handleChange = (fieldName: string) => (text: string) => {
    if (fieldName === "phone") {
      const isPhoneValid = phoneInput.current?.isValidNumber(text);
      if (isPhoneValid) {
        setPhone({
          ...phone!,
          number: text,
        });
      }
    }
    setValues({ ...values, [fieldName]: text });
  };

  const onSwitchSecureText = () => {
    setSecureTextVisibility(!secureTextVisibility);
  };

  const handleSubmit = () => {
    const phoneNumber =
      phoneInput.current?.getNumberAfterPossiblyEliminatingZero();
    // const isPhoneValid = phoneInput.current?.isValidNumber(`${phoneNumber?.formattedNumber}`);
    const isPhoneValid = true;
    if (!isPhoneValid || !values.password) {
      setErrors({
        phone: isPhoneValid ? undefined : t("errors.phone"),
        password: values.password ? undefined : t("errors.required"),
      });
    } else if (!!values.password) {
      setErrors(undefined);
      onSubmit({
        phone: phoneNumber!,
        password: values.password!,
      });
    }
  };

  const onChangeFormattedText = (text: string) => {
    const countryCode = `+${phoneInput?.current?.state?.code}`;

    setPhoneCode(countryCode);

    setStorage(
      DefaultStorageKeys.COUNTRY_CODE,
      phoneInput?.current?.state?.countryCode,
    );
    setGlobalPhoneCode({
      PhoneCode: `+${phoneInput?.current?.state?.code}`,
      Country: phoneInput?.current?.state.countryCode,
    });

    const isPhoneValid = phoneInput.current?.isValidNumber(text);
    if (isPhoneValid) {
      setPhoneValue(text);
    }
  };

  React.useEffect(() => {
    if (phoneValue) {
      const phoneNumber =
        phoneInput.current?.getNumberAfterPossiblyEliminatingZero();

      const isPhoneValid = phoneInput.current?.isValidNumber(
        `${phoneNumber?.formattedNumber}`,
      );
      if (isPhoneValid) {
        setPhone(phoneNumber);
      }
    }
  }, [phoneValue, phoneCode]);

  return (
    <View>
      <LabelInput
        required
        label={t("form.label.phone")}
        value={phone?.number}
        caretHidden={false}
        placeholder={t("form.label.phone")}
      >
        <PhoneInput
          ref={phoneInput}
          onChangeText={handleChange("phone")}
          onChangeFormattedText={onChangeFormattedText}
          required
          error={!!errors?.phone}
          errorMessage={errors?.phone}
          defaultCountryCode={code}
          disableCountryCode={false}
          disabled={false}
        />
      </LabelInput>
      <LabelInput
        required
        secureTextEntry={secureTextVisibility}
        value={values.password}
        label={t("form.label.password")}
        rightIcon={
          <SwitchIcon
            active={secureTextVisibility}
            icon="eye"
            activeIcon="eye-off"
            onPress={onSwitchSecureText}
          />
        }
        placeholder={t("form.placeholder.password")}
        onChangeText={handleChange("password")}
        error={!!errors?.password}
        errorMessage={errors?.password}
      />
      {/* <Pressable
        onPress={() => navigate("ForgotPassword", {})}
        style={{ alignSelf: "flex-end", marginTop: -15, marginBottom: 10 }}
      >
        <Text style={{ fontSize: 14, color: Colors.light.PrimaryColor }}>{t("sign-in.actions.forgot")}</Text>
      </Pressable> */}

      <Button
        disabled={loading}
        loading={loading}
        title={t("sign-in.submit")}
        onPress={handleSubmit}
        buttonStyle={{ borderRadius: 10, height: 45, marginBottom: 10 }}
      />

      <Button
        title={t("sign-in.actions.forgot")}
        onPress={() => navigate("ForgotPassword", {})}
        buttonStyle={{ borderRadius: 10, height: 45, marginBottom: 10 }}
      />
    </View>
  );
};
