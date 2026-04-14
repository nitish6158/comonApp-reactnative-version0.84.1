import React, { useState } from "react";
import { KeyboardTypeOptions, Pressable, Text, View } from "react-native";
import { TextField } from "react-native-ui-lib";
import AntDesign from "react-native-vector-icons/AntDesign";
import Octicons from "react-native-vector-icons/Octicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Feather from 'react-native-vector-icons/Feather';

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
            <Feather name="arrow-left" size={25} color="black" />
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
            <MaterialCommunityIcons
              name={keyboardType == "default" ? "dialpad" : "keyboard-outline"}
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
          <AntDesign name="arrowleft" size={25} color="black" />
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
        <Octicons name="search" size={22} color="black" />
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
