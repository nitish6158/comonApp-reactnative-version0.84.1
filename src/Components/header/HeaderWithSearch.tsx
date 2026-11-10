import React, { useState } from "react";
import { KeyboardTypeOptions, Pressable, Text, View } from "react-native";
import { TextField } from "react-native-ui-lib";

import { AppIcon } from "@/Components/icons";

type headerWithSearchProps = {
  onBackPressed: () => void;
  onSearchTextChanged: (text: string) => void;
  title: string;
  placeholder: string;
  dualKeyboard?: boolean;
};

export default function HeaderWithSearch({
  onBackPressed,
  onSearchTextChanged,
  title,
  placeholder,
  dualKeyboard,
}: Readonly<headerWithSearchProps>) {
  const [isSearchEnabled, setIsSearchEnabled] = useState<boolean>(false);
  const [keyboardType, setKeyboardType] = useState<KeyboardTypeOptions>("default");

  if (isSearchEnabled) {
    return (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginHorizontal: 15,
          marginVertical: 10,
          backgroundColor: "rgba(245,245,245,1)",
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderRadius: 30,
        }}
      >
        <View style={{flexDirection:'row',alignItems:'center'}}>
          <Pressable onPress={disableSearch} style={{ paddingRight: 10 }}>
            <AppIcon name="back" size={25} color="black" />
          </Pressable>

          <TextField
            keyboardType={keyboardType}
            placeholder={placeholder}
            onChangeText={onSearchTextChanged}
            style={{ fontSize: 16, width: 280 }}
          />

        </View>

        {dualKeyboard && (
          <Pressable
            style={{ paddingHorizontal: 10 }}
            onPress={keyboardType == "default" ? enableDialPad : enableDefaultPad}
          >
            <AppIcon
              name={keyboardType == "default" ? "dialpad" : "keyboard"}
              size={22}
              color="black"
            />
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: 15,
        marginVertical: 10,
        paddingVertical: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0, marginRight: 8 }}>
        <Pressable onPress={onBackPressed} style={{ paddingRight: 10 }}>
          <AppIcon name="back" size={25} color="black" />
        </Pressable>
        <Text style={{ fontSize: 16, flexShrink: 1 }} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>
      <Pressable
        style={{ paddingHorizontal: 10, paddingVertical: 4 }}
        onPress={() => {
          setIsSearchEnabled(true);
        }}
      >
        <AppIcon name="search" size={22} color="black" />
      </Pressable>
    </View>
  );

  function disableSearch() {
    setIsSearchEnabled(false);
    onSearchTextChanged("")
  }

  function enableDialPad() {
    setKeyboardType("phone-pad");
  }

  function enableDefaultPad() {
    setKeyboardType("default");
  }
}
