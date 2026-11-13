import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { Text } from "react-native-elements";
import { useTranslation } from "react-i18next";

import Colors from "@/Constants/Colors";
import { $space_lg, $space_xl } from "@/Constants";
import { TermsView } from "@/Components/TermsView";

type TermsScreenProps = {
  onDecline: () => void;
  onAgree: () => void;
};

export default function TermsScreen({ onDecline, onAgree }: TermsScreenProps) {
  const { t } = useTranslation("terms");

  return (
    <SafeAreaView style={styles.container}>
      <TermsView
        boxStyle={styles.box}
        buttonContainerStyle={styles.buttonContainer}
        footerMarginBottom={50}
        showsVerticalScrollIndicator={false}
        onDecline={onDecline}
        onAgree={onAgree}
        titleSlot={<Text style={styles.headerTitle}>{t("terms.title")}</Text>}
      />
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 20,
  },
  headerTitle: {
    marginBottom: 20,
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  box: {
    backgroundColor: Colors.light.backgroundGray,
    borderRadius: $space_lg,
    flex: 6,
    marginBottom: $space_xl,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  button: {
    borderRadius: 20,
    height: 36,
    maxHeight: 36,
    maxWidth: 100,
    minHeight: 36,
    minWidth: 20,
  },
  buttonContainer: {
    flex: 0,
  },
  title: {
    color: Colors.light.grayText,
    fontWeight: "bold",
    textAlign: "center",
  },
});
