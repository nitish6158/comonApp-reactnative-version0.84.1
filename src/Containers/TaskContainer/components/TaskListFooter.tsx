import { Colors } from "@/Constants";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;

const TaskListFooter = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.headerCard}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="help-circle-outline"
          size={24}
          color={Colors.light.PrimaryColor}
          style={styles.headerIcon}
        />
        <Text style={styles.headerText}>{t("task-list-footer.usage-guide-title")}</Text>
        <MaterialCommunityIcons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={24}
          color={Colors.light.grayText}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.contentCard}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={Colors.light.PrimaryColor}
            style={styles.contentIcon}
          />
          <Text style={styles.guideText}>
            {t("task-list-footer.usage-guide-content")}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerCard: {
    backgroundColor: Colors.light.backgroundGray,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  headerIcon: {
    marginRight: 12,
  },
  headerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  contentCard: {
    backgroundColor: Colors.light.HighLighter,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  contentIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  guideText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
});

export default TaskListFooter;
