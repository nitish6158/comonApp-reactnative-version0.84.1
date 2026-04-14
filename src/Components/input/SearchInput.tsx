/* eslint-disable @typescript-eslint/member-ordering */
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicatorProps, Dimensions, TextInput, Pressable, View } from "react-native";
import { SearchBar, SearchBarProps } from "react-native-elements";
import { IconNode } from "react-native-elements/dist/icons/Icon";
import AntDesign from "react-native-vector-icons/AntDesign";

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
}

const { width, height } = Dimensions.get("window");

const SearchInput = ({
  onChangeText,
  platform = "default",
  lightTheme = true,
  // setSearch,
  round = true,
  ...props
}: SearchInputProps) => {
  const { t } = useTranslation();
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
      <AntDesign name="search1" size={22} color="black" />

      <TextInput
        style={{ marginLeft: 10, flexGrow: 1, maxWidth: width - 100, height: 40 }}
        value={props.value}
        placeholder={t("form.label.search")}
        onChangeText={onChangeText as any}
        platform={platform}
        autoFocus={false}
        lightTheme={lightTheme}
        round={round}
        {...(props as any)}
      />
      {props.value && (
        <AntDesign
          name="close"
          size={22}
          color="gray"
          onPress={() => {
            // setSearch("");
            onChangeText("");
            // alert('fd')
          }}
        />
      )}
    </View>
  );
};

export default SearchInput;
