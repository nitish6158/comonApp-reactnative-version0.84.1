import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/Constants";
import { taskManagerHeaderStyles } from "../styles/TaskManagerHeaderStyles";
import { ModalDetail } from "../TaskUtils";

const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;

interface TaskManagerHeaderProps {
  navigation?: any;
  fields: any[];
  multiType: boolean;
  screenName?: string;
  loading: boolean;
  onSubmit: () => void;
  onBackPress: () => void;
}

export const TaskManagerHeader: React.FC<TaskManagerHeaderProps> = ({
  navigation,
  fields,
  multiType,
  screenName,
  loading,
  onSubmit,
  onBackPress,
}) => {
  const { t } = useTranslation();
  const validRows = fields.filter((row) => row.saved);
  const canSubmit = validRows.length > 0;

  return (
    <View style={taskManagerHeaderStyles.headerContainer}>
      <View style={taskManagerHeaderStyles.headerRow}>
        {navigation && (
          <TouchableOpacity
            style={taskManagerHeaderStyles.backBtn}
            onPress={onBackPress}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={26}
              color="#007bff"
            />
          </TouchableOpacity>
        )}

        {/* Submit button in header */}
        {canSubmit && (
          <TouchableOpacity
            onPress={onSubmit}
            style={taskManagerHeaderStyles.headerSubmitBtn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.light.White} size={18} />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="check"
                  size={18}
                  color={Colors.light.White}
                  style={taskManagerHeaderStyles.submitIcon}
                />
                <Text style={taskManagerHeaderStyles.headerSubmitText}>
                  {t("taskManager.submit")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
