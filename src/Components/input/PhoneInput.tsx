import PhoneInputComponent, { PhoneInputProps as PhoneInputComponentProps } from "react-native-phone-number-input";
import React, { LegacyRef, forwardRef, useEffect, useState } from "react";

import Text from "../Text";
import { Image, Platform, Text as RNText, View } from "react-native";
import styles from "./PhoneInputStyles";
import { usePhoneContext } from "@Hooks/usePhoneContext";

export type PhoneInputRef = PhoneInputComponent;

const dropDown =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAi0lEQVRYR+3WuQ6AIBRE0eHL1T83FBqU5S1szdiY2NyTKcCAzU/Y3AcBXIALcIF0gRPAsehgugDEXnYQrUC88RIgfpuJ+MRrgFmILN4CjEYU4xJgFKIa1wB6Ec24FuBFiHELwIpQxa0ALUId9wAkhCnuBdQQ5ngP4I9wxXsBDyJ9m+8y/g9wAS7ABW4giBshQZji3AAAAABJRU5ErkJggg==";

const getFlagEmoji = (countryCode?: string) => {
  const code = countryCode?.toUpperCase();

  if (!code || !/^[A-Z]{2}$/.test(code)) {
    return "🇮🇳";
  }

  return code
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
};

const getFlagImageUrl = (countryCode?: string) => {
  const code = countryCode?.toLowerCase();

  if (!code || !/^[a-z]{2}$/.test(code)) {
    return "https://flagcdn.com/w40/in.png";
  }

  return `https://flagcdn.com/w40/${code}.png`;
};

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
    const [selectedCountryCode, setSelectedCountryCode] = useState(defaultCountryCode || "IN");
    const { phone, setCode } = usePhoneContext();

    const handleChangeText = (nextText: string) => {
      if (onChangeText) {
        onChangeText(nextText);
      }
      setText(nextText);
    };

    useEffect(() => {
      if ((defaultValue || phone) && !skipDefaultValue) {
        setText(defaultValue || phone?.number);
      }
    }, [defaultValue, defaultCountryCode, phone, skipDefaultValue]);

    useEffect(() => {
      if (typeof defaultCountryCode === "string" && /^[A-Z]{2}$/.test(defaultCountryCode)) {
        setSelectedCountryCode(defaultCountryCode);
      }
    }, [defaultCountryCode]);

    const handleSubmit = () => {
      setIsSubmited(true);
    };

    const isError = isSubmited && required && !text;
    const countryCode =
      typeof selectedCountryCode === "string" && /^[A-Z]{2}$/.test(selectedCountryCode)
        ? selectedCountryCode
        : "IN";
    const renderFlagAccessory = (
      <View pointerEvents="none" style={styles.countryPickerAccessory}>
        {Platform.OS === "android" ? (
          <Image
            source={{ uri: getFlagImageUrl(countryCode) }}
            resizeMode="contain"
            style={styles.flagImage}
          />
        ) : (
          <RNText allowFontScaling={false} style={styles.flagEmoji}>
            {getFlagEmoji(countryCode)}
          </RNText>
        )}
        <Image source={{ uri: dropDown }} resizeMode="contain" style={styles.dropDownImage} />
      </View>
    );

    return (
      <View style={styles.container}>
        <PhoneInputComponent
          ref={ref}
          defaultValue={skipDefaultValue ? undefined : defaultValue ? defaultValue : phone?.number}
          defaultCode={countryCode as any}
          layout="first"
          flagButtonStyle={styles.flagButtonStyle}
          countryPickerButtonStyle={styles.countryPickerButtonStyle}
          textContainerStyle={styles.textContainerStyle}
          textInputStyle={styles.textInputStyle}
          codeTextStyle={styles.codeTextStyle}
          renderDropdownImage={renderFlagAccessory}
          textInputProps={{
            onEndEditing: handleSubmit,
          }}
          containerStyle={[styles.containerStyle, isError || error ? styles.containerError : undefined]}
          onChangeText={handleChangeText}
          {...props}
          onChangeCountry={(code) => {
            setSelectedCountryCode(code.cca2);
            setCode(code.cca2);
            props.onChangeCountry?.(code);
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
