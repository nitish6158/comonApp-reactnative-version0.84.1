import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useWatch } from "react-hook-form";
import { Colors } from "@/Constants";
import { taskSummaryCardStyles } from "../styles/TaskSummaryCardStyles";

const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;

interface TaskSummaryCardProps {
  index: number;
  row: any;
  control: any;
  taskTypeOptions: { label: string; value: string }[];
  onToggleCollapse: (index: number) => void;
}

export const TaskSummaryCard: React.FC<TaskSummaryCardProps> = ({
  index,
  row,
  control,
  taskTypeOptions,
  onToggleCollapse,
}) => {
  const { t } = useTranslation();
  const currentRowType = useWatch({ name: `rows.${index}.type`, control });
  const taskTypeLabel =
    taskTypeOptions.find((option) => option.value === currentRowType)?.label ||
    currentRowType;
  const memberCount = row.members?.length || 0;
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePress = () => {
    // Scale animation on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onToggleCollapse(index);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={taskSummaryCardStyles.summaryCard}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={taskSummaryCardStyles.summaryHeader}>
          <View style={taskSummaryCardStyles.stepIndicator}>
            <Text style={taskSummaryCardStyles.stepNumber}>{index + 1}</Text>
          </View>
          <View style={taskSummaryCardStyles.summaryContent}>
            <Text style={taskSummaryCardStyles.summaryTitle} numberOfLines={1}>
              {row.title || t("taskManager.untitled-task")}
            </Text>
            <View style={taskSummaryCardStyles.summaryDetails}>
              <Text style={taskSummaryCardStyles.summaryTaskType}>
                {taskTypeLabel}
              </Text>
              <Text style={taskSummaryCardStyles.summaryMembers}>
                {memberCount}{" "}
                {memberCount === 1
                  ? t("taskManager.member")
                  : t("taskManager.members")}
              </Text>
            </View>
          </View>
          <View style={taskSummaryCardStyles.summaryActions}>
            <MaterialCommunityIcons
              name={row.saved ? "check-circle" : "circle-outline"}
              size={24}
              color={
                row.saved ? Colors.light.alertSuccess : Colors.light.grayText
              }
            />
            <MaterialCommunityIcons
              name="chevron-down"
              size={24}
              color={Colors.light.grayText}
              style={taskSummaryCardStyles.expandIcon}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};