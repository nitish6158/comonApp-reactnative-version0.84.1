import PhoneInputComponent, { PhoneInputProps as PhoneInputComponentProps } from "react-native-phone-number-input";
import React, { LegacyRef, forwardRef, useEffect, useState } from "react";

import Text from "../Text";
import { View } from "react-native";
import styles from "./PhoneInputStyles";
import { usePhoneContext } from "@Hooks/usePhoneContext";

export type PhoneInputRef = PhoneInputComponent;

interface PhoneInputProps extends PhoneInputComponentProps {
  required?: boolean;
  skipDefaultValue?: boolean;
  errorMessage?: string;
  error?: boolean;
  disabled: boolean;
  disableCountryCode: boolean;
  defaultCountryCode: string;
}

export const PhoneInput = forwardRef(
  (
    {
      onChangeText,
      defaultValue,
      defaultCountryCode,
      skipDefaultValue,
      error,
      errorMessage,
      required,
      disabled,
      disableCountryCode,
      ...props
    }: PhoneInputProps,
    ref: LegacyRef<PhoneInputComponent>
  ) => {
    const [isSubmited, setIsSubmited] = useState(false);
    const [text, setText] = useState<string>();
    const { phone, setCode } = usePhoneContext();

    const handleChangeText = (text: string) => {
      if (onChangeText) {
        onChangeText(text);
      }
      setText(text);
    };

    useEffect(() => {
      if ((defaultValue || phone) && !skipDefaultValue) {
        setText(defaultValue || phone?.number);
      }
    }, [defaultValue, defaultCountryCode]);

    const handleSubmit = () => {
      setIsSubmited(true);
    };

    const isError = isSubmited && required && !text;

    return (
      <View style={styles.container}>
        <PhoneInputComponent
          ref={ref}
          defaultValue={skipDefaultValue ? undefined : defaultValue ? defaultValue : phone?.number}
          defaultCode={defaultCountryCode}
          layout="first"
          textContainerStyle={styles.textContainerStyle}
          textInputProps={{
            onEndEditing: handleSubmit,
          }}
          containerStyle={[styles.containerStyle, isError || error ? styles.containerError : undefined]}
          onChangeText={handleChangeText}
          {...props}
          onChangeCountry={(code) => {
            setCode(code.cca2);
          }}
          disabled={disabled ? true : false}
          disableCountryCode={disableCountryCode}
        />
        {isError || error ? (
          <View style={styles.errorContainer}>
            <Text size="xxs" style={styles.error}>
              {isError ? "This field is required!" : errorMessage}
            </Text>
          </View>
        ) : undefined}
      </View>
    );
  }
);
