import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { Colors } from "@/Constants";
import CustomTextInput from "@/Components/TextInput/CustomTextInput";
import { taskManagerStyles } from "../styles/TaskManagerStyles";

const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;

type EndNodeFormValues = {
  title: string;
  description?: string;
};

interface PublishModalProps {
  visible: boolean;
  loading: boolean;
  completedTasksCount: number;
  onPublish: (endNodeData: EndNodeFormValues) => void;
  onCancel: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  visible,
  loading,
  completedTasksCount,
  onPublish,
  onCancel,
}) => {
  const { t } = useTranslation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EndNodeFormValues>({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const onSubmit = (data: EndNodeFormValues) => {
    onPublish(data);
  };

  const handleCancel = () => {
    reset(); // Reset form when canceling
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={taskManagerStyles.modalOverlay}
      >
        <TouchableOpacity
          style={taskManagerStyles.modalOverlay}
          onPress={handleCancel}
          disabled={loading}
          activeOpacity={1}
        />

        <View style={taskManagerStyles.publishModalContent}>
          <ScrollView>
            <View>
              <View style={taskManagerStyles.publishModalHeader}>
                <MaterialCommunityIcons
                  name="flag-checkered"
                  size={32}
                  color={Colors.light.PrimaryColor}
                />
                <Text style={taskManagerStyles.publishModalTitle}>
                  {t("taskList.finish-task-flow")}
                </Text>
              </View>

              <View style={taskManagerStyles.publishModalBody}>
                <Text style={taskManagerStyles.publishModalDescription}>
                  {t("taskManager.ready-to-publish-description", {
                    count: completedTasksCount,
                  })}
                </Text>

                <View style={taskManagerStyles.publishModalStats}>
                  <View style={taskManagerStyles.publishModalStat}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={Colors.light.alertSuccess}
                    />
                    <Text style={taskManagerStyles.publishModalStatText}>
                      {completedTasksCount} {t("taskManager.tasks-ready")}
                    </Text>
                  </View>
                </View>

                {/* End Node Form */}
                <View style={{ marginTop: 20 }}>
                  <Controller
                    control={control}
                    name="title"
                    rules={{ required: t("taskList.goal-title-required") }}
                    render={({ field }) => (
                      <CustomTextInput
                        label={t("taskList.goals-title")}
                        value={field.value}
                        onChangeText={field.onChange}
                        placeholder={t("taskList.enter-goal-title")}
                        required
                        errorMessage={errors?.title?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <CustomTextInput
                        label={t("taskList.goals-description")}
                        value={field.value || ""}
                        onChangeText={field.onChange}
                        placeholder={t("taskList.enter-goals-description")}
                        multiline
                        numberOfLines={3}
                        inputStyle={{ height: 80, textAlignVertical: "top" }}
                      />
                    )}
                  />
                </View>
              </View>

              <View style={[taskManagerStyles.publishModalActions]}>
                <TouchableOpacity
                  style={[
                    taskManagerStyles.publishModalButton,
                    taskManagerStyles.publishModalCancelButton,
                  ]}
                  onPress={handleCancel}
                  disabled={loading}
                >
                  <Text style={taskManagerStyles.publishModalCancelText}>
                    {t("taskManager.cancel")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    taskManagerStyles.publishModalButton,
                    taskManagerStyles.publishModalConfirmButton,
                  ]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={Colors.light.White} size={20} />
                  ) : (
                    <>
                      <MaterialCommunityIcons
                        name="rocket-launch"
                        size={18}
                        color={Colors.light.White}
                      />
                      <Text style={taskManagerStyles.publishModalConfirmText}>
                        {t("taskList.publish")}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
