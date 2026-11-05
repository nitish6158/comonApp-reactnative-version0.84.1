import * as React from "react";

import ArrowDownIcon from "@Images/icons/arrowDown.svg";
import { Pressable } from "react-native";
import { arrowDownStyles } from "./ArrowDownStyle";

export const ArrowDown = ({ onPress, scrollDirection }: { onPress: () => void; scrollDirection: boolean }) => (
  <Pressable style={[arrowDownStyles.box, scrollDirection ? arrowDownStyles.boxRotate : undefined]} onPress={onPress}>
    <ArrowDownIcon />
  </Pressable>
);
