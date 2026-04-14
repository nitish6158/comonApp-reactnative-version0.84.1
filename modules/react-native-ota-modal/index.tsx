import { View, Text, Pressable } from "react-native";
import React from "react";
import { OtaModalProps } from "./types";
import FastImage from "@d11/react-native-fast-image";
import Logo from "@Images/logo.png";
import { styles } from "./styles";

export default function OtaModal({ versionText, title, onExitPress, onUpdatePress }: Readonly<OtaModalProps>) {
  return (
    <View style={styles.main}>
      <View style={styles.logoContainer}>
        <FastImage source={Logo} style={styles.logoStyle} />
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.versionText}>{versionText}</Text>
        <View style={styles.actionContainer}>
          <Pressable onPress={onExitPress} style={styles.actionButton}>
            <Text style={styles.actionText}>Exit</Text>
          </Pressable>
          <Pressable onPress={onUpdatePress} style={styles.actionButton}>
            <Text style={styles.actionText}>Update</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
