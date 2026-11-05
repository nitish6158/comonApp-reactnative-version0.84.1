/* eslint-disable react-native/no-inline-styles */
import * as React from "react";

import { $space_md, $space_xs } from "@/Constants/Spaces";
import { Input, InputProps } from "react-native-elements";
import { TextInput, View, useWindowDimensions } from "react-native";
import { forwardRef, useRef, useState } from "react";

import { InputStyle } from "./InputStyle";
import Text from "../Text";
import { typographyStyles } from "../../styles/main";
import { useTranslation } from "react-i18next";

interface InputWithFocusType extends InputProps {
  error?: boolean;
}

export const InputWithFocus: React.FC<InputWithFocusType> = forwardRef(
  (
    { error, value, placeholder, onChangeText, onSubmitEditing, renderErrorMessage = false, rightIcon, ...rest },
    ref
  ) => {
    const [inputFocusStyle, setInputFocusStyle] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const onFocusInputs = () => {
      setInputFocusStyle(true);
    };

    const onBlurInputs = () => {
      setInputFocusStyle(false);
    };

    const onPressFocus = () => {
      if (!ref) {
        inputRef?.current?.focus();
      }
    };

    const style = InputStyle.inputContainerStyle;
    const inputWithErrorStyle = error ? InputStyle.error : style;

    return (
      <Input
        ref={inputRef}
        value={value}
        inputStyle={InputStyle.input}
        containerStyle={InputStyle.containerStyleInputEl}
        inputContainerStyle={[inputWithErrorStyle, { paddingRight: rightIcon ? $space_md - $space_xs : $space_md }]}
        rightIconContainerStyle={InputStyle.rightIconContainerStyle}
        placeholder={placeholder}
        onFocus={onFocusInputs}
        onBlur={onBlurInputs}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onPressIn={onPressFocus} // fix bug in tabs component, input not focused on android phone
        renderErrorMessage={renderErrorMessage}
        rightIcon={rightIcon}
        // importantForAutofill="no"
        {...rest}
      />
    );
  }
);

interface LabelInputProps extends InputWithFocusType {
  label?: string;
  required?: boolean;
  children?: React.ReactNode;
}

export const LabelInput: React.FC<LabelInputProps> = forwardRef(
  ({ label, required, children, onChangeText, error, errorMessage, value, ...props }, ref) => {
    const { t } = useTranslation();
    const [text, setText] = useState("");
    const [isSubmited, setIsSubmited] = useState(false);
    const { fontScale } = useWindowDimensions();
    const styles = typographyStyles(fontScale);

    const handleChange = (text: string) => {
      if (onChangeText) {
        onChangeText(text);
      }
      if (isSubmited) {
        setIsSubmited(false);
      }
      setText(text);
    };

    const handleSubmit = () => {
      setIsSubmited(true);
    };

    React.useEffect(() => {
      if (value) {
        setText(value);
      }
    }, []);

    const isError = isSubmited && required && !text;

    return (
      <View>
        {required || label ? (
          <View style={InputStyle.labelContainer}>
            {required ? (
              <Text size="sm" style={InputStyle.labelIcon}>
                *
              </Text>
            ) : null}
            {label ? (
              <Text size="sm" style={InputStyle.label}>
                {label}
              </Text>
            ) : null}
          </View>
        ) : null}
        {children || (
          <InputWithFocus
            onChangeText={handleChange}
            onEndEditing={handleSubmit}
            value={value}
            blurOnSubmit={true}
            ref={ref}
            style={styles.ls}
            error={isError || error}
            errorMessage={isError ? t("errors.required") : errorMessage}
            {...props}
          />
        )}
      </View>
    );
  }
);
