// @ts-nocheck
/* eslint-disable @typescript-eslint/member-ordering */
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicatorProps, Dimensions, TextInput, Pressable, View } from "react-native";
import { SearchBar, SearchBarProps } from "react-native-elements";
import { IconNode } from "react-native-elements/dist/icons/Icon";

import { AppIcon, VectorIconCompat } from "@/Components/icons";

interface SearchInputProps
  extends Omit<
    SearchBarProps,
    | "onChangeText"
    | "platform"
    | "clearIcon"
    | "searchIcon"
    | "loadingProps"
    | "showLoading"
    | "onClear"
    | "onFocus"
    | "onBlur"
    | "onCancel"
    | "lightThee"
    | "round"
    | "cancelButtonTitle"
    | "cancelButtonProps"
    | "showCancel"
    | "lightTheme"
  > {
  platform?: "ios" | "android" | "default";
  clearIcon?: IconNode;
  searchIcon?: IconNode;
  loadingProps?: ActivityIndicatorProps;
  showLoading?: boolean;
  lightThee?: boolean;
  round?: boolean;
  cancelButtonTitle?: string;
  cancelButtonProps?: any;
  showCancel?: boolean;
  onClear?(): void;
  onFocus?(): void;
  onBlur?(): void;
  onChangeText?(text: string): void;
  onCancel?(): void;
  lightTheme?: boolean;
  // Compatibility props used across the app
  value?: string;
  SearchValue?: string;
  SetSearchValue?: (text: string) => void;
  placeHolder?: string;
  ShowSearchIcon?: boolean;
}

const { width, height } = Dimensions.get("window");

const SearchInput = ({
  onChangeText,
  SetSearchValue,
  value,
  SearchValue,
  placeHolder,
  placeholder,
  ShowSearchIcon = true,
  platform = "default",
  lightTheme = true,
  round = true,
  ...props
}: SearchInputProps) => {
  const { t } = useTranslation();
  const currentValue = value !== undefined ? value : (SearchValue ?? "");
  const onValueChange = onChangeText || SetSearchValue;
  const currentPlaceholder = placeholder || placeHolder || t("form.label.search");

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white",
        width: "100%",
        paddingHorizontal: 25,
        paddingVertical: 10,
      }}
    >
      {ShowSearchIcon && <VectorIconCompat name="search1" size={22} color="black" />}

      <TextInput
        style={{ marginLeft: 10, flexGrow: 1, maxWidth: width - 100, height: 40 }}
        value={currentValue}
        placeholder={currentPlaceholder}
        onChangeText={onValueChange as any}
        platform={platform}
        autoFocus={false}
        lightTheme={lightTheme}
        round={round}
        {...(props as any)}
      />
      {Boolean(currentValue) && (
        <Pressable testID="clear-search-button" onPress={() => onValueChange?.("")} hitSlop={8}>
          <AppIcon name="close" size={22} color="gray" />
        </Pressable>
      )}
    </View>
  );
};

export default SearchInput;
