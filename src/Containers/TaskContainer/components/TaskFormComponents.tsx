import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Controller, useFieldArray, useWatch } from "react-hook-form";
import CustomTextInput from "@/Components/TextInput/CustomTextInput";
import SingleSelectDropdown from "../TaskUtils/SingleSelectDropdown";
import { Colors } from "@/Constants";
import { EXPRESSION_OPTIONS, LOGIC_OPTIONS } from "../TaskUtils";
import { taskFormStyles } from "../styles/TaskFormStyles";

const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;

interface EmptyStateProps {
  // Empty state component
}

export const EmptyState: React.FC<EmptyStateProps> = () => {
  const { t } = useTranslation();
  
  return (
    <View style={taskFormStyles.emptyState}>
      <MaterialCommunityIcons
        name="clipboard-list-outline"
        size={80}
        color={Colors.light.grayText}
        style={taskFormStyles.emptyIcon}
      />
      <Text style={taskFormStyles.emptyTitle}>
        {t("taskManager.no-tasks-yet")}
      </Text>
      <Text style={taskFormStyles.emptyDescription}>
        {t("taskManager.create-first-task-description")}
      </Text>
    </View>
  );
};

interface AddTaskButtonProps {
  fields: any[];
  onAddTask: () => void;
}

export const AddTaskButton: React.FC<AddTaskButtonProps> = ({
  fields,
  onAddTask,
}) => {
  const { t } = useTranslation();
  const hasUnsavedTasks = fields.some((row) => !row.saved);

  return (
    <View style={taskFormStyles.addTaskContainer}>
      {hasUnsavedTasks && (
        <Text style={taskFormStyles.addTaskHint}>
          {t("taskManager.save-current-task-first")}
        </Text>
      )}
      <TouchableOpacity
        onPress={onAddTask}
        style={[
          taskFormStyles.addTaskButton,
          hasUnsavedTasks && taskFormStyles.addTaskButtonDisabled,
        ]}
        disabled={hasUnsavedTasks}
      >
        <MaterialCommunityIcons
          name="plus-circle"
          size={24}
          color={hasUnsavedTasks ? Colors.light.grayText : Colors.light.White}
          style={taskFormStyles.addTaskIcon}
        />
        <Text
          style={[
            taskFormStyles.addTaskText,
            hasUnsavedTasks && taskFormStyles.addTaskTextDisabled,
          ]}
        >
          {t("taskManager.add-new-task")}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

interface MediaGoalQuestionProps {
  index: number;
  control: any;
}

export const MediaGoalQuestion: React.FC<MediaGoalQuestionProps> = ({
  index,
  control,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {/* Media Upload fields */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 10 }}>
        <Controller
          control={control}
          name={`rows.${index}.media.mediaQuality`}
          render={({ field }) => (
            <SingleSelectDropdown
              data={[
                { label: t("taskManager.lowercase.low"), value: "LOW" },
                { label: t("taskManager.lowercase.medium"), value: "MEDIUM" },
                { label: t("taskManager.lowercase.high"), value: "HIGH" },
              ]}
              label={t("taskManager.media-quality")}
              value={field.value}
              onChange={(val) => field.onChange(val)}
              placeholder={t("taskManager.choose-option")}
            />
          )}
        />
      </View>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 10 }}>
        <Controller
          control={control}
          name={`rows.${index}.media.mediaType`}
          render={({ field }) => (
            <SingleSelectDropdown
              data={[
                { label: t("taskManager.lowercase.photo"), value: "PHOTO" },
                { label: t("taskManager.lowercase.video"), value: "VIDEO" },
                { label: t("taskManager.lowercase.audio"), value: "AUDIO" },
                {
                  label: t("taskManager.lowercase.document"),
                  value: "DOCUMENT",
                },
              ]}
              label={t("taskManager.media-type")}
              value={field.value}
              onChange={(val) => field.onChange(val)}
              placeholder={t("taskManager.choose-option")}
            />
          )}
        />
      </View>
    </>
  );
};

interface MinMaxGoalQuestionProps {
  index: number;
  control: any;
  setDropdownModal: (modal: {
    visible: boolean;
    rowId: number | null;
    exprIdx: number | null;
    field: "option" | "logic" | null;
  }) => void;
}

export const MinMaxGoalQuestion: React.FC<MinMaxGoalQuestionProps> = ({
  index,
  control,
  setDropdownModal,
}) => {
  const { t } = useTranslation();
  const expressionsFieldArray = useFieldArray({
    control,
    name: `rows.${index}.minMax.expressions`,
  });

  const row = useWatch({ control, name: `rows.${index}` });
  const expressions = row?.minMax?.expressions || [];

  return (
    <>
      {/* Min and Max fields */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 10 }}>
        <Controller
          control={control}
          name={`rows.${index}.minMax.min`}
          rules={{ required: t("taskManager.min-required") }}
          render={({ field, fieldState }) => (
            <CustomTextInput
              label={t("taskManager.minimum-value")}
              value={field.value?.toString() || ""}
              onChangeText={field.onChange}
              placeholder={t("taskManager.min")}
              keyboardType="numeric"
              errorMessage={fieldState.error?.message}
              style={[taskFormStyles.input, { flex: 1 }]}
            />
          )}
        />
        <Controller
          control={control}
          name={`rows.${index}.minMax.max`}
          rules={{ required: t("taskManager.max-required") }}
          render={({ field, fieldState }) => (
            <CustomTextInput
              label={t("taskManager.maximum-value")}
              value={field.value?.toString() || ""}
              onChangeText={field.onChange}
              placeholder={t("taskManager.max")}
              keyboardType="numeric"
              errorMessage={fieldState.error?.message}
              style={[taskFormStyles.input, { flex: 1 }]}
            />
          )}
        />
      </View>

      {/* Expression List */}
      {expressions.map((expr: any, idx: number) => (
        <View key={idx}>
          <Controller
            control={control}
            name={`rows.${index}.minMax.expressions.${idx}.prompt`}
            render={({ field }) => (
              <CustomTextInput
                label={t("taskManager.prompt-message")}
                value={field.value}
                onChangeText={field.onChange}
                placeholder={t("taskManager.enter-prompt")}
                style={taskFormStyles.input}
              />
            )}
          />

          {/* Option Dropdown */}
          <TouchableOpacity
            style={taskFormStyles.dropdown}
            onPress={() =>
              setDropdownModal({
                visible: true,
                rowId: index,
                exprIdx: idx,
                field: "option",
              })
            }
          >
            <Text style={{ color: expr.option ? "#000" : "#888" }}>
              {EXPRESSION_OPTIONS.find((o) => o.value === expr.option)?.label ||
                t("taskManager.select-option")}
            </Text>
            <Text style={{ color: "#888", fontSize: 18 }}>▼</Text>
          </TouchableOpacity>

          {/* Number Input */}
          <Controller
            control={control}
            name={`rows.${index}.minMax.expressions.${idx}.number`}
            render={({ field }) => (
              <CustomTextInput
                label={t("taskManager.number")}
                value={field.value?.toString() || ""}
                onChangeText={field.onChange}
                keyboardType="numeric"
                style={taskFormStyles.input}
              />
            )}
          />

          {/* Logic Dropdown */}
          <TouchableOpacity
            style={taskFormStyles.dropdown}
            onPress={() =>
              setDropdownModal({
                visible: true,
                rowId: index,
                exprIdx: idx,
                field: "logic",
              })
            }
          >
            <Text style={{ color: expr.logic ? "#000" : "#888" }}>
              {LOGIC_OPTIONS.find((o) => o.value === expr.logic)?.label ||
                t("taskManager.select-logic")}
            </Text>
            <Text style={{ color: "#888", fontSize: 18 }}>▼</Text>
          </TouchableOpacity>

          {/* Remove Expression */}
          <TouchableOpacity
            onPress={() => expressionsFieldArray.remove(idx)}
            style={{
              alignSelf: "stretch",
              marginVertical: 10,
              padding: 8,
              borderWidth: 1,
              borderColor: Colors.light.red,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: Colors.light.red,
                fontWeight: "bold",
                fontSize: 16,
                textAlign: "center",
              }}
            >
              × {t("taskManager.remove")}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={taskFormStyles.addButtonLast}
        onPress={() =>
          expressionsFieldArray.append({
            prompt: "",
            option: "",
            number: undefined,
            logic: "",
          })
        }
      >
        <Text style={taskFormStyles.addText}>
          + {t("taskManager.add-expression")}
        </Text>
      </TouchableOpacity>
    </>
  );
};

interface MultipleOptionsProps {
  index: number;
  control: any;
  getValues: any;
  setValue: any;
  update: any;
}

export const MultipleOptions: React.FC<MultipleOptionsProps> = ({
  index,
  control,
  getValues,
  setValue,
  update,
}) => {
  const { t } = useTranslation();
  const options =
    useWatch({
      name: `rows.${index}.multiOptions.options`,
      control,
    }) || [];
  const status = options.length > 5;

  const handleAddOption = (field: any, options: any, index: number) => {
    const trimmed = (field.value || "").trim();
    if (trimmed && !options.includes(trimmed)) {
      setValue(`rows.${index}.multiOptions.options`, [...options, trimmed], {
        shouldDirty: true,
      });
      field.onChange(""); // Clear input
      const row = getValues(`rows.${index}`);
      update(index, { ...row, saved: false });
    }
  };

  const handleRemoveOption = (index: number, options: any, opt: string) => {
    const updated = options.filter((o: string) => o !== opt);
    setValue(`rows.${index}.multiOptions.options`, updated, {
      shouldDirty: true,
    });
    const row = getValues(`rows.${index}`);
    update(index, { ...row, saved: false });
  };

  return (
    <View style={{ marginTop: 12 }}>
      <Text style={taskFormStyles.sectionHeader}>{t("taskManager.options")}</Text>

      <Controller
        control={control}
        name={`rows.${index}.multiOptions.value`}
        render={({ field }) => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <CustomTextInput
              label={t("taskManager.add-option")}
              value={field.value}
              onChangeText={field.onChange}
              placeholder={t("taskManager.enter-option")}
              style={[taskFormStyles.input, { flex: 1 }]}
            />
            <TouchableOpacity
              style={
                !status
                  ? taskFormStyles.addButtonOption
                  : taskFormStyles.disableButton
              }
              onPress={() => {
                handleAddOption(field, options, index);
              }}
              disabled={status}
            >
              <Text
                style={
                  !status
                    ? taskFormStyles.addText
                    : taskFormStyles.addTextDisabled
                }
              >
                + {t("taskManager.add")}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Chips */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
        {options.map((opt: string, i: number) => (
          <View key={i} style={taskFormStyles.chip}>
            <Text style={taskFormStyles.chipText}>{opt}</Text>
            <TouchableOpacity
              onPress={() => {
                handleRemoveOption(index, options, opt);
              }}
            >
              <Text style={taskFormStyles.chipCloseText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};