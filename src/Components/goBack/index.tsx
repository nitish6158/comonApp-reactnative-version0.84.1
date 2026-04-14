import * as React from "react";

import { Keyboard, Pressable } from "react-native";
import { RootStackParamList, RootTabParamList } from "@Types/types";

import Colors from "@/Constants/Colors";
import { ListItem } from "react-native-elements";
import { goBackStyles } from "./GoBackStyles";
import { mainStyles } from "../../styles/main";
import { useNavigation } from "@react-navigation/native";
import AntDesign from 'react-native-vector-icons/AntDesign';

export type navigateNested = { page: keyof RootStackParamList; screen: keyof RootTabParamList };

export const GoBackComponent = ({ navigateNested }: { navigateNested?: navigateNested }) => {
  const navigation = useNavigation();

  const onPress = () => {
    Keyboard.dismiss();
    if (navigateNested) {
      navigation.navigate(navigateNested.page, { screen: navigateNested.screen });
    } else {
      navigation.goBack();
    }
  };

  return (
    <Pressable onPress={onPress} style={[mainStyles.center, goBackStyles.container]}>
      <AntDesign name="arrowleft" size={25} color="black" />
    </Pressable>
  );
};
