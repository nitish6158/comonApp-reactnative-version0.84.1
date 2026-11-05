import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  KeyboardTypeOptions,
} from "react-native";

type CustomTextInputProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  regex?: RegExp;
  errorMessage?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: object;
  inputStyle?: object;
  onFocus?: () => void;
};

const CustomTextInput = ({
  label,
  value,
  onChangeText,
  placeholder = "",
  keyboardType = "default",
  secureTextEntry = false,
  required = false,
  minLength,
  maxLength,
  regex,
  errorMessage,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  style = {},
  inputStyle = {},
  onFocus,
}: CustomTextInputProps) => {
  const [touched, setTouched] = useState(false);
  const { t } = useTranslation();
  const validate = () => {
    if (required && value.trim() === "") return t("input-text.field-required");
    // if (minLength && value.length < minLength)
    //   return `Minimum ${minLength} characters required`;
    // if (maxLength && value.length > maxLength)
    //   return `Maximum ${maxLength} characters allowed`;
    if (regex && !regex.test(value))
      return errorMessage || t("input-text.invalid-input");
    return "";
  };

  const internalError = touched ? validate() : "";
  const error = errorMessage || internalError;
  const showError = !!error;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <TextInput
        style={[
          styles.input,
          inputStyle,
          showError ? styles.inputError : undefined,
          disabled && styles.disabled,
          multiline && styles.multiline,
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        // onBlur={() => setTouched(true)}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        editable={!disabled}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        onFocus={onFocus}
      />

      {showError && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 18,
    marginBottom: 4,
    color: "#333",
    padding: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    marginTop: 4,
    color: "red",
    fontSize: 12,
  },
  required: {
    color: "red",
    fontSize: 18,
  },
  disabled: {
    backgroundColor: "#f2f2f2",
  },
  multiline: {
    textAlignVertical: "top",
  },
});

export default CustomTextInput;
