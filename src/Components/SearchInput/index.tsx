import { Dimensions, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import React, { Component, useState } from "react";

import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Constants/Colors";
import Search from "@Images/search.svg";
import { isEmpty } from "lodash";

const { width, height } = Dimensions.get("window");
interface SearchInputProps {
  SearchValue?: string;
  SetSearchValue?: (e: any) => void;
  ShowSearchIcon?: boolean | undefined;
  placeHolder?: string;
}
const SearchInput = ({ SearchValue, SetSearchValue, placeHolder, ShowSearchIcon }: SearchInputProps) => {
  const [isFildFocused, setIsFildFocused] = useState(false);
  return (
    <View style={styles.inputContainer}>
      <TextInput
        value={SearchValue}
        onChangeText={(e) => SetSearchValue(e)}
        placeholder={placeHolder}
        placeholderTextColor="gray"
        style={[styles.SearchInput, { borderColor: isFildFocused ? Colors.light.PrimaryColor : Colors.light.gray }]}
        onFocus={() => {
          setIsFildFocused(true);
        }}
        onBlur={() => {
          setIsFildFocused(false);
        }}
      />
      {!isEmpty(SearchValue) ? (
        // <View >
        <Pressable
          style={styles.flotIcon}
          onPress={() => {
            SetSearchValue("");
            // alert('fd')
          }}
        >
          <AntDesign name="close" size={18} color="gray" />
        </Pressable>
      ) : (
        // </View>
        ShowSearchIcon && (
          <View style={styles.flotIcon}>
            <Pressable>
              <Search />
            </Pressable>
          </View>
        )
      )}
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  SearchInput: {
    fontSize: 15,
    height: 45,
    marginRight: 5,
    width: "95%",
    // width: width - 100,
  },
  inputContainer: {
    alignItems: "center",
    borderColor: "gray",
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    // flexGrow: 1,
    alignSelf: "center",

    height: 45,
    justifyContent: "space-between",
    width: width - 50,
    marginTop: 15,
    paddingHorizontal: 15,
  },
});

//make this component available to the app
export default SearchInput;
