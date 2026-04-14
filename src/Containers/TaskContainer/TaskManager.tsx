import React from "react";
import {
  View,
  ScrollView,
  Modal,
  FlatList,
  TouchableOpacity,
  Text,
} from "react-native";
import { Controller, useWatch } from "react-hook-form";
import CustomTextInput from "@/Components/TextInput/CustomTextInput";
import MultiSelectDropdown from "./TaskUtils/MultiSelectDropdown";
import CheckBox from "./TaskUtils/CheckBox";
import SingleSelectDropdown from "./TaskUtils/SingleSelectDropdown";
import DynamicModal from "@/Components/Modal/DynamicModal";
import { Colors } from "@/Constants";

// Extracted components
import { TaskSummaryCard } from "./components/TaskSummaryCard";
import { TaskManagerHeader } from "./components/TaskManagerHeader";
import { PublishModal } from "./components/PublishModal";
import { TaskTypeBottomSheet } from "./components/TaskTypeBottomSheet";
import {
  EmptyState,
  AddTaskButton,
  MediaGoalQuestion,
  MultipleOptions,
} from "./components/TaskFormComponents";

// Hooks and types
import { useTaskManager } from "./hooks/useTaskManager";
import { TaskManagerProps } from "./types/TaskManagerTypes";
import { taskManagerStyles } from "./styles/TaskManagerStyles";

// Business logic utilities
import { useTaskLogic } from "./utils/taskLogic";
import { useTaskModals } from "./utils/taskModals";

const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;

const TaskManager: React.FC<Partial<TaskManagerProps>> = ({
  route: {
    params: { id: SelectedNode, label: ScreenName, multiType = false } = {},
  } = {},
  navigation,
}) => {
  const taskManager = useTaskManager(SelectedNode, multiType, navigation);
  const taskLogic = useTaskLogic(taskManager);
  const taskModals = useTaskModals(taskManager);

  const {
    fields,
    control,
    isRowCollapsed,
    toggleRowCollapse,
    collapseRow,
    taskTypeOptions,
    loading,
    getValues,
    setValue,
    update,
    errors,
    showPublishModal,
    setShowPublishModal,
    publishLoading,
    showTaskTypeBottomSheet,
    openTaskTypeBottomSheet,
    closeTaskTypeBottomSheet,
    selectTaskType,
    t,
  } = taskManager;

  const { handleBackPress, handleSubmit, publishTasks } = taskLogic;

  const GoalQuestion = () => {
    // Show empty state if no tasks exist
    if (fields.length === 0) {
      return <EmptyState />;
    }

    return fields.map((row, index) => {
      // Check if this row should be collapsed
      if (isRowCollapsed(index) && row.saved) {
        return (
          <View key={row.id} style={taskManagerStyles.stepWrapper}>
            <TaskSummaryCard
              index={index}
              row={row}
              control={control}
              taskTypeOptions={taskTypeOptions}
              onToggleCollapse={toggleRowCollapse}
            />
          </View>
        );
      }

      // Render expanded view
      return (
        <View
          key={row.id}
          style={[taskManagerStyles.cardRow, taskManagerStyles.stepWrapper]}
        >
          {/* Step Header */}
          <View style={taskManagerStyles.stepHeader}>
            <View style={taskManagerStyles.stepIndicatorExpanded}>
              <Text style={taskManagerStyles.stepNumberExpanded}>
                {index + 1}
              </Text>
            </View>
            <Text style={taskManagerStyles.stepTitle}>
              {t("taskManager.step")} {index + 1}
            </Text>
            {row.saved && (
              <TouchableOpacity
                style={taskManagerStyles.collapseButton}
                onPress={() => collapseRow(index)}
              >
                <MaterialCommunityIcons
                  name="chevron-up"
                  size={24}
                  color={Colors.light.grayText}
                />
              </TouchableOpacity>
            )}
          </View>

          <View style={taskManagerStyles.cardContent}>
            {/* Title Input */}
            <Controller
              control={control}
              name={`rows.${index}.title`}
              rules={{ required: t("taskManager.goal-title-required") }}
              render={({ field }) => (
                <CustomTextInput
                  label={t("taskManager.goals-title")}
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder={t("taskManager.enter-goal-title")}
                  required
                  inputStyle={taskManagerStyles.input}
                  errorMessage={errors?.rows?.[index]?.title?.message}
                />
              )}
            />

            {/* Description Input */}
            <Controller
              control={control}
              name={`rows.${index}.description`}
              render={({ field }) => (
                <CustomTextInput
                  label={t("taskManager.goals-description")}
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder={t("taskManager.enter-description")}
                  multiline
                  numberOfLines={4}
                  inputStyle={taskManagerStyles.textArea}
                />
              )}
            />

            {/* Task Type Selector - Only show in multi-type mode */}
            {multiType && (
              <Controller
                control={control}
                name={`rows.${index}.type`}
                render={({ field }) => {
                  const selectedOption = taskTypeOptions.find(
                    (option) => option.value === field.value,
                  );

                  return (
                    <View style={{ marginBottom: 16 }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "600",
                          marginBottom: 8,
                          color: Colors.light.text,
                        }}
                      >
                        {t("taskManager.task-type")}{" "}
                        <Text style={{ color: "red" }}>*</Text>
                      </Text>
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: "#E0E0E0",
                          borderRadius: 8,
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          backgroundColor: Colors.light.White,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        onPress={() => openTaskTypeBottomSheet(index)}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: selectedOption
                              ? Colors.light.text
                              : Colors.light.grayText,
                          }}
                        >
                          {selectedOption?.label ||
                            t("taskManager.select-task-type")}
                        </Text>
                        <MaterialCommunityIcons
                          name="chevron-down"
                          size={20}
                          color={Colors.light.grayText}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            )}

            {/* Task-specific UI components based on row type */}
            {(() => {
              const currentRowType = useWatch({
                name: `rows.${index}.type`,
                control,
              });
              return (
                <>
                  {/* Media Upload UI */}
                  {currentRowType === "MEDIA_UPLOAD" && (
                    <MediaGoalQuestion index={index} control={control} />
                  )}
                  {/* Multiple Option UI */}
                  {currentRowType === "multiple_options" && (
                    <MultipleOptions
                      index={index}
                      control={control}
                      getValues={getValues}
                      setValue={setValue}
                      update={update}
                    />
                  )}
                </>
              );
            })()}

            {/* Anonymous Users Display */}
            <DisplayAnonymousUsers index={index} />

            {/* Members Selection */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  marginTop: 10,
                  marginBottom: -5,
                  fontSize: 18,
                  paddingHorizontal: 5,
                }}
              >
                {t("taskManager.who-will-execute-task")}
              </Text>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={26}
                color="#bbb"
                style={{ marginTop: 13 }}
              />
            </View>
            <Controller
              control={control}
              name={`rows.${index}.members`}
              rules={{ required: t("taskManager.one-member-required") }}
              render={({ field }) => (
                <View>
                  <MultiSelectDropdown
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    placeholder={t("taskManager.select-members")}
                    data={taskManager.contacts}
                  />
                  {errors?.rows?.[index]?.members?.message && (
                    <Text style={{ color: "red", fontSize: 14, marginTop: 4 }}>
                      {errors.rows[index].members?.message}
                    </Text>
                  )}
                </View>
              )}
            />

            {/* Additional Fields */}
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  marginVertical: 16,
                  paddingHorizontal: 5,
                  borderBottomWidth: 1,
                  borderColor: Colors.light.PrimaryColor,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "500" }}>
                  {t("taskManager.additional-fields")}
                </Text>
              </View>
              <View>
                <Controller
                  control={control}
                  name={`rows.${index}.signature`}
                  render={({ field }) => (
                    <CheckBox
                      value={field.value}
                      label={t("taskManager.e-signature")}
                      onChange={field.onChange}
                    />
                  )}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={taskManagerStyles.rowBtnsBottom}>
              {/* Only show delete button for saved tasks or when there are multiple tasks */}
              {(row.saved || fields.length > 1) && (
                <TouchableOpacity
                  onPress={() => taskLogic.removeRow(index)}
                  style={taskManagerStyles.removeButton}
                >
                  <Text style={taskManagerStyles.removeText}>
                    {t("taskManager.delete")}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => taskLogic.saveRow(index)}
                style={[
                  taskManagerStyles.saveButton,
                  useWatch({ name: `rows.${index}.saved`, control }) && {
                    backgroundColor: Colors.light.alertSuccess,
                  },
                  // Full width when no delete button
                  !(row.saved || fields.length > 1) && {
                    flex: 1,
                    marginLeft: 0,
                  },
                ]}
              >
                <Text style={taskManagerStyles.saveText}>
                  {useWatch({ name: `rows.${index}.saved`, control })
                    ? t("taskManager.saved")
                    : t("taskManager.save")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    });
  };

  const DisplayAnonymousUsers = ({ index }: { index: number }) => {
    const row = getValues(`rows.${index}.anonymousUsers`);
    return (
      row.length > 0 && (
        <View style={taskManagerStyles.chipContainer}>
          {row.map((userVal: string) => {
            const user = taskManager.contacts.find((u) => u.value === userVal);
            return (
              <View key={userVal} style={taskManagerStyles.chip}>
                <Text style={taskManagerStyles.chipText}>
                  {user ? user.label : userVal}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    const updated = row.filter((v: any) => v !== userVal);
                    taskLogic.handleChange(index, "anonymousUsers", updated);
                  }}
                  style={taskManagerStyles.chipCloseBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={taskManagerStyles.chipCloseText}>×</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )
    );
  };

  return (
    <ScrollView
      contentContainerStyle={taskManagerStyles.container}
      style={{ backgroundColor: Colors.light.White }}
    >
      <TaskManagerHeader
        navigation={navigation}
        fields={fields}
        multiType={multiType}
        screenName={ScreenName}
        loading={loading}
        onSubmit={handleSubmit}
        onBackPress={handleBackPress}
      />

      <GoalQuestion />

      <AddTaskButton fields={fields} onAddTask={taskLogic.addRow} />

      {/* Publish Modal */}
      <PublishModal
        visible={showPublishModal}
        loading={publishLoading}
        completedTasksCount={fields.filter((row) => row.saved).length}
        onPublish={(endNodeData) => publishTasks(endNodeData)}
        onCancel={() => setShowPublishModal(false)}
      />

      {/* Task Type Bottom Sheet */}
      <TaskTypeBottomSheet
        visible={showTaskTypeBottomSheet}
        data={taskTypeOptions}
        selectedValue={
          taskManager.currentTaskTypeIndex !== null
            ? getValues(`rows.${taskManager.currentTaskTypeIndex}.type`)
            : undefined
        }
        onSelect={selectTaskType}
        onClose={closeTaskTypeBottomSheet}
      />

      {/* Render Other Modals */}
      {taskModals.renderAlertModal()}
      {taskModals.renderAnonymousUsersModal()}
      {taskModals.renderExpressionModal()}
    </ScrollView>
  );
};

export default TaskManager;
