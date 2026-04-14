import React from "react";

import { DrawerActions, useNavigation } from "@react-navigation/core";
import { Pressable, StyleSheet, View,Text } from "react-native";
import { LogoTitle } from "@/Components/logo";
import { Colors } from "@/Constants";
import { useTranslation } from "react-i18next";



export default function SeniorHeader() {
  const navigation = useNavigation();
  const {t} = useTranslation()

  return (
    <View style={styles.main}>
      <Pressable onPress={() => navigation.navigate("SeniorProfileScreen",{})}>
        <LogoTitle />
      </Pressable>
      <Pressable
        onPress={() => {
          navigation.navigate("SeniorChatSelectionScreen", {});
        }}
        style={{
          // height: 50,
          // width: 50,
          backgroundColor: Colors.light.PrimaryColor,
          // marginBottom: 20,
          // position: "absolute",
          // bottom: 0,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 50,
          // right: 20,
          paddingHorizontal:20,
          paddingVertical:10
        }}
      >
        <Text style={{color:'white'}}>{t("seniorMode.new-room")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  main:{
    marginBottom:10,
    flexDirection:'row',
    justifyContent:'space-between',
    marginTop:5,
  }
});
