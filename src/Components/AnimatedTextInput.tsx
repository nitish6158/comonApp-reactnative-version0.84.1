import { Animated, Platform, Pressable, StyleSheet, TextInput, View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useRef, useState, useTransition } from "react";

import Pencil from "@Images/Profile/Pencil.svg";
import fonts from "@/Constants/fonts";
import { Colors } from "@/Constants";
import { useTranslation } from "react-i18next";

const TextField = (props) => {
  const [email, setEmail] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [hidePass, setHidePass] = useState(true);
  const { t } = useTranslation();

  const _animatedIsFocused = useRef(new Animated.Value(props.value === "" ? 1 : 0)).current;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  useEffect(() => {
    Animated.timing(_animatedIsFocused, {
      toValue: isFocused || props.value !== "" ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  });

  const labelStyle = {
    position: "absolute",
    left: 0,
    top: _animatedIsFocused?.interpolate({
      inputRange: [0, 1],
      outputRange: [-10, -20],
    }),

    fontSize: _animatedIsFocused?.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 14],
    }),
    color: "#757E99",
    fontWeight: "600",
    fontFamily: fonts.Lato,
  };

  return (
    <View style={styles.textInputContainer}>
      <Animated.Text style={labelStyle}>{props.text}</Animated.Text>
      <TextInput
        maxLength={25}
        {...props}
        style={styles.input}
        onFocus={handleFocus}
        onBlur={handleBlur}
        //   secureTextEntry={props.password && hidePass ? true : false}
        value={props.value}
      />
      {props.Edit && (
        <TouchableOpacity onPress={() => props.UpdateName()} style={styles.passwordIcon}>
          {/* <Pencil style={{ marginBottom: 10 }} color="blue" /> */}
          <Text style={{ color: Colors.light.PrimaryColor, fontSize: 14, fontWeight: "700" }}>{t("btn.save")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // eslint-disable-next-line react-native/no-color-literals
  input: {
    borderBottomColor: "#F0F0F0",
    borderBottomWidth: 1,
    color: "#272755",
    fontFamily: fonts.Lato,
    fontSize: 16,
    paddingBottom: Platform.OS === "ios" ? 15 : 0,
    // fontFamily: 'Inter',
  },
  passwordIcon: {
    // height: "100%",
    justifyContent: "center",
    position: "absolute",
    right: 5,
    // width: 40,
  },
  textInput: {
    marginHorizontal: 18,
  },
  textInputContainer: { marginHorizontal: 18, marginVertical: 18 },
});

export default TextField;
