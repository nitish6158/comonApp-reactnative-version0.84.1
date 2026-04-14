import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  FlatList,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors } from "@/Constants";
import { taskManagerStyles } from "../styles/TaskManagerStyles";

const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;

const { height: screenHeight } = Dimensions.get("window");

interface TaskTypeOption {
  label: string;
  value: string;
  icon?: string;
}

interface TaskTypeBottomSheetProps {
  visible: boolean;
  data: TaskTypeOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

// Map task types to icons
const taskTypeIcons: { [key: string]: string } = {
  like_dislike: "thumbs-up-down",
  yes_no: "check-circle-outline",
  free_text: "form-textbox",
  numeric: "numeric",
  multiple_options: "format-list-bulleted",
  MEDIA_UPLOAD: "file-upload-outline",
};

export const TaskTypeBottomSheet: React.FC<TaskTypeBottomSheetProps> = ({
  visible,
  data,
  selectedValue,
  onSelect,
  onClose,
}) => {
  const { t } = useTranslation();
  const [slideAnim] = React.useState(new Animated.Value(screenHeight));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleSelectType = (value: string) => {
    onSelect(value);
    onClose();
  };

  const renderTaskTypeItem = ({ item }: { item: TaskTypeOption }) => {
    const isSelected = selectedValue === item.value;
    const icon = taskTypeIcons[item.value] || "help-circle-outline";

    return (
      <TouchableOpacity
        style={[
          taskManagerStyles.bottomSheetItem,
          isSelected && taskManagerStyles.bottomSheetItemSelected,
        ]}
        onPress={() => handleSelectType(item.value)}
        activeOpacity={0.7}
      >
        <View style={taskManagerStyles.bottomSheetItemContent}>
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={isSelected ? Colors.light.PrimaryColor : Colors.light.grayText}
            style={taskManagerStyles.bottomSheetItemIcon}
          />
          <Text
            style={[
              taskManagerStyles.bottomSheetItemText,
              isSelected && taskManagerStyles.bottomSheetItemTextSelected,
            ]}
          >
            {item.label}
          </Text>
        </View>
        {isSelected && (
          <MaterialCommunityIcons
            name="check-circle"
            size={20}
            color={Colors.light.PrimaryColor}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={taskManagerStyles.bottomSheetOverlay}
        onPress={onClose}
        activeOpacity={1}
      />
      <Animated.View
        style={[
          taskManagerStyles.bottomSheetContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={taskManagerStyles.bottomSheetHandle} />
        
        <View style={taskManagerStyles.bottomSheetHeader}>
          <Text style={taskManagerStyles.bottomSheetTitle}>
            {t("taskManager.select-task-type")}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={taskManagerStyles.bottomSheetCloseButton}
          >
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={Colors.light.grayText}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={data}
          renderItem={renderTaskTypeItem}
          keyExtractor={(item) => item.value}
          style={taskManagerStyles.bottomSheetList}
          showsVerticalScrollIndicator={false}
        />
      </Animated.View>
    </Modal>
  );
};