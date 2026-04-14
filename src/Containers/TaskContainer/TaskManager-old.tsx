import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Colors, fonts } from "@/Constants";
import CustomTextInput from "@/Components/TextInput/CustomTextInput";
import {
  EXPRESSION_OPTIONS,
  ExpressionType,
  FormValues,
  LOGIC_OPTIONS,
  ModalDetail,
  MultiNodeType,
  TASK_TYPES,
  TaskManagerProps,
  TaskSubTypes,
  TaskType,
  TaskTypes,
} from "./TaskUtils";
import MultiSelectDropdown from "./TaskUtils/MultiSelectDropdown";
import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import {
  EdgeTypes,
  useAddTaskMutation,
  useUpdateEdgeMutation,
} from "@/graphql/generated/task.generated";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/Store";
import { createNewTask } from "@/redux/Reducer/TaskReducer";
import { useGetAllOrgContactsLazyQuery } from "@/graphql/generated/contact.generated";
import CheckBox from "./TaskUtils/CheckBox";
import SingleSelectDropdown from "./TaskUtils/SingleSelectDropdown";
import { useTranslation } from "react-i18next";
import DynamicModal from "@/Components/Modal/DynamicModal";
const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;

const TaskManager: React.FC<Partial<TaskManagerProps>> = ({
  route: {
    params: { id: SelectedNode, label: ScreenName, multiType = false } = {},
  } = {},
  navigation,
}) => {
  const currentOrg = useSelector(
    (state: RootState) => state.Organisation.currentOrganization
  );
  const {
    currentScenarioID,
    tasks: previousTaskSaved,
    currentTaskType,
  } = useSelector((state: RootState) => state.Task.scenarios[0]);
  const { t } = useTranslation();
  const labelTypes = ["Like", "Dislike", "Yes", "No"];

  // Task type options for dropdown
  const taskTypeOptions = [
    { label: t("labels.like-dislike"), value: "like_dislike" },
    { label: t("labels.yes-no"), value: "yes_no" },
    { label: t("labels.free-text"), value: "free_text" },
    { label: t("labels.numeric-field"), value: "numeric" },
    { label: t("labels.multiple-options"), value: "multiple_options" },
    { label: t("labels.media-upload"), value: "MEDIA_UPLOAD" },
    { label: "Min/Max Range", value: "min_max" },
  ];
  const [alertModal, setAlertModal] = useState<boolean>(false);
  const [modalValue, setModalValue] = useState<ModalDetail>({
    header: "",
    description: "",
    button: [],
  });
  const [createTask] = useAddTaskMutation();
  const [updateEdgeMutation] = useUpdateEdgeMutation();
  const dispatch = useDispatch();
  const [getAllOrgContactsRequest, getAllOrgContactsResponse] =
    useGetAllOrgContactsLazyQuery({
      fetchPolicy: "no-cache",
    });
  const [contacts, setContacts] = useState<
    { label: string; value: string | null | undefined }[]
  >([]);
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      rows: [
        {
          title: "",
          description: "",
          type: multiType ? "free_text" : SelectedNode, // Default to free_text in multi-type mode
          anonymousUsers: [],
          members: [],
          saved: false,
          multiOptions: { value: "", options: [] },
          minMax: { min: undefined, max: undefined, expressions: [] },
          signature: false,
          media: { mediaQuality: "MEDIUM", mediaType: "PHOTO" },
        },
      ],
    },
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalRowId, setModalRowId] = useState<number | null>(null);
  const [anonymousUserSelected, setAnonymousUserSelected] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Collapse state management for step-by-step interface
  const [collapsedRows, setCollapsedRows] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState<number>(0);
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "rows",
  });

  // Helper functions for collapse management
  const toggleRowCollapse = (index: number) => {
    const newCollapsedRows = new Set(collapsedRows);
    if (newCollapsedRows.has(index)) {
      newCollapsedRows.delete(index);
      setActiveStep(index);
    } else {
      newCollapsedRows.add(index);
    }
    setCollapsedRows(newCollapsedRows);
  };

  const collapseRow = (index: number) => {
    setCollapsedRows((prev) => new Set(prev).add(index));
  };

  const isRowCollapsed = (index: number) => {
    return collapsedRows.has(index);
  };
  const [dropdownModal, setDropdownModal] = useState<{
    visible: boolean;
    rowId: number | null;
    exprIdx: number | null;
    field: "option" | "logic" | null;
  }>({ visible: false, rowId: null, exprIdx: null, field: null });

  useEffect(() => {
    // Only validate SelectedNode in single-type mode
    if (
      !multiType &&
      (!SelectedNode || !TASK_TYPES.includes(SelectedNode as TaskType))
    ) {
      setModalValue({
        header: t("taskManager.invalid-task-type"),
        description: t("taskManager.select-valid-task-type"),
        button: [
          {
            label: t("taskManager.ok"),
            onPress: () => {
              navigation?.goBack();
              setAlertModal(false);
            },
          },
        ],
      });
      setAlertModal(true);
    }
  }, [navigation, SelectedNode, multiType]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (currentOrg?._id) {
        const id = currentOrg?._id.trim();
        try {
          await getAllOrgContactsRequest({
            variables: {
              input: {
                orgId: id,
              },
            },
          });
        } catch (err) {
          console.log("GraphQL error:", err);
        }
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    const formattedContacts =
      getAllOrgContactsResponse?.data?.getAllOrgContacts?.map((item) => ({
        label: `${item.firstName} ${item.lastName}`.trim(),
        value: item.memberId,
      }));
    setContacts(formattedContacts ?? []);
  }, [getAllOrgContactsResponse?.data?.getAllOrgContacts]);

  // Handler for expression field change
  const handleExpressionChange = (
    rowIndex: number,
    exprIndex: number,
    field: keyof ExpressionType,
    value: string
  ) => {
    const formValues = getValues(`rows.${rowIndex}.minMax`);
    const expressions = formValues?.expressions || [];

    const updatedExpressions = expressions.map((expr, i) =>
      i === exprIndex
        ? {
            ...expr,
            [field]: field === "number" ? value.replace(/[^0-9]/g, "") : value,
          }
        : expr
    );

    setValue(`rows.${rowIndex}.minMax.expressions`, updatedExpressions);
  };

  // Handle text changes
  const handleChange = (
    index: number,
    field: keyof FormValues["rows"][0],
    value: any
  ) => {
    const currentRow = getValues(`rows.${index}`);
    update(index, {
      ...currentRow,
      [field]: value,
      saved: false, // mark as not saved on change
    });
  };

  // Add new row
  const addRow = () => {
    append({
      title: "",
      description: "",
      type: multiType ? "free_text" : SelectedNode, // Default to free_text in multi-type mode
      anonymousUsers: [],
      members: [],
      saved: false,
      multiOptions: { value: "", options: [] },
      minMax: { min: undefined, max: undefined, expressions: [] },
      signature: false,
      media: { mediaQuality: "MEDIUM", mediaType: "PHOTO" },
    });
  };

  // Remove row
  const removeRow = (index: number) => {
    remove(index);
  };

  // Save row
  const saveRow = (index: number) => {
    clearErrors();
    const rowData = getValues(`rows.${index}`);
    // console.log("Saving row:", JSON.stringify(rowData, null, 2));
    const title = getValues(`rows.${index}.title`);
    const users = getValues(`rows.${index}.members`);
    if (!title.trim() || users.length < 1) {
      !title.trim()
        ? setError(`rows.${index}.title`, {
            type: "required",
            message: t("taskManager.goal-title-required"),
          })
        : setError(`rows.${index}.members`, {
            type: "required",
            message: t("taskManager.goal-members-required"),
          });
      return;
    }
    update(index, { ...rowData, saved: true });
    console.log("Row saved:", rowData);

    // Auto-collapse the saved task
    setTimeout(() => {
      collapseRow(index);

      // If this is not the last task, set next step as active
      if (index < fields.length - 1) {
        setActiveStep(index + 1);
      }
      // Don't auto-create new tasks - user will use Add Task button instead
    }, 500); // Small delay for better UX

    setModalValue({
      header: t("taskManager.step-completed"),
      description: t("taskManager.step-collapsed-continue"),
      button: [
        {
          label: t("taskManager.ok"),
          onPress: () => {
            setAlertModal(false);
            setModalValue({ header: "", description: "", button: [] });
          },
        },
      ],
    });
    setAlertModal(true);
  };

  // Open modal for anonymous user selection
  const openModal = (index: number, selected: string[]) => {
    setModalRowId(index);
    setAnonymousUserSelected(selected);
    setModalVisible(true);
  };

  // Save anonymous users from modal
  const saveAnonymousUsers = (values: string[]) => {
    if (modalRowId !== null) {
      handleChange(modalRowId, "anonymousUsers", values);
    }
    setModalVisible(false);
  };

  // Handler to add option
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

  // Handler to remove option
  const handleRemoveOption = (index: number, options: any, opt: string) => {
    const updated = options.filter((o: string) => o !== opt);
    setValue(`rows.${index}.multiOptions.options`, updated, {
      shouldDirty: true,
    });
    const row = getValues(`rows.${index}`);
    update(index, { ...row, saved: false });
  };

  // Create Node for connection
  const nodeCreation = (data: FormValues | any, taskType: string = "") => {
    const nodes: any[] = [];
    const actualTaskType = taskType || data.type;

    if (taskType) {
      // multiple_options: "CHECKBOX"
      const optionNodes: any[] = [];
      if (actualTaskType == "multiple_options") {
        for (let i = 0; i < data.multiOptions?.options.length; i++) {
          optionNodes.push({
            label: data.multiOptions?.options[i],
            location: false,
            signature: data.signature,
            media: null,
            notifyTo: [],
          });
        }
        nodes.push({
          label: data.multiOptions?.value,
          type: "DEFAULT",
          order: 1,
          targetTaskID: "",
          options: optionNodes,
          location: false,
          signature: data.signature,
          media: null,
          notifyTo: [],
        });
      } else {
        var startIndex = actualTaskType == "like_dislike" ? 0 : 2;
        for (let i = 0; i < 2; i++) {
          nodes.push({
            label: labelTypes[startIndex],
            type: "DEFAULT",
            order: i + 1,
            targetTaskID: "",
            options: [],
            location: false,
            signature: data.signature,
            media: null,
            notifyTo: [],
          });
          startIndex += 1;
        }
      }
    } else {
      const isMultiNode = Object.keys(MultiNodeType).includes(actualTaskType);
      if (isMultiNode) {
        return nodeCreation(data, actualTaskType); // recursive call with actual task type
      }
      nodes.push({
        // label: data.title,
        label: "Next",
        type: "DEFAULT",
        order: 1,
        targetTaskID: "",
        options: [],
        location: false,
        signature: data.signature,
        media: null,
      });
    }
    return nodes;
  };

  const updatePreviousEdges = async (
    edgeIDs: string[],
    newTaskID: string,
    subType: { ids: string[]; type: string[]; order: number[]; options: any[] },
    signature: boolean
  ) => {
    for (let i = 0; i < edgeIDs.length; i++) {
      var label = labelTypes.find((val) => val == subType.type[i]) || "Next";
      // Cleaning the options array from __typename object as it is not required in updateEdge mutation
      const cleanedOptions = (subType.options || [])
        .flat()
        .map(({ __typename, ...rest }) => rest);
      const payload = {
        variables: {
          input: {
            label: label,
            location: false,
            media: null,
            notifyTo: [],
            options: cleanedOptions,
            order: subType.order[i],
            signature: signature,
            targetTaskID: newTaskID,
            type: EdgeTypes.Default,
            _id: edgeIDs[i],
          },
        },
      };
      const response = await updateEdgeMutation(payload);
      if (response?.data) {
        console.log(`🔗 Edge ${edgeIDs[i]} updated to point to ${newTaskID}`);
      }
      if (response?.errors) {
        console.log(
          "❌ Error updating edge:",
          JSON.stringify(response.errors, null, 2)
        );
      }
    }
  };

  // Submit Task
  const onSubmit = async (data: FormValues) => {
    const validRows = data.rows.filter((row) => row.saved);
    if (validRows.length === 0) {
      setModalValue({
        header: t("taskManager.please-save-one-row"),
        button: [
          {
            label: t("taskManager.ok"),
            onPress: () => {
              setAlertModal(false);
              setModalValue({ header: "", description: "", button: [] });
            },
          },
        ],
      });
      setAlertModal(true);

      return;
    }

    setLoading(true);

    let previousEdges = {
      ids: previousTaskSaved.TaskEdgeID || [],
      type: previousTaskSaved.EdgeLabel.label || [],
      order: previousTaskSaved.EdgeLabel.order || [],
      options: previousTaskSaved.EdgeLabel.option || [],
    };

    try {
      for (let i = 0; i < validRows.length; i++) {
        const currValue = validRows[i];
        const edgeNode = nodeCreation(currValue);
        var media: any = null;
        if (currValue.type == "MEDIA_UPLOAD") {
          media = {
            mediaQuality: currValue.media.mediaQuality,
            mediaType: currValue.media.mediaType,
          };
        }
        const taskNumber = previousTaskSaved.TaskNumber || 1;
        const position = {
          x: taskNumber * 170,
          y: taskNumber * 170,
        };
        // Step 1: Create Task
        const taskPayload = {
          variables: {
            input: {
              label: currValue.title,
              content: currValue.description,
              orgId: currentOrg?._id,
              type: TaskTypes[currValue.type],
              subType: TaskSubTypes[currValue.type] ?? "",
              scenarioId: currentScenarioID,
              signature: currValue.signature,
              edges: edgeNode,
              assignTo: currValue.members,
              ...media,
              position: position,
            },
          },
        };
        const taskResponse = await createTask(taskPayload);
        const newTask = taskResponse?.data?.addTask;

        if (newTask?._id) {
          const { _id: newTaskID, subType, signature } = newTask;
          console.log(`✅ Task ${i + 1} created: ${JSON.stringify(newTask)}`);

          // Step 2: Update previous edges
          if (previousEdges.ids.length > 0) {
            await updatePreviousEdges(
              previousEdges.ids,
              newTaskID,
              previousEdges,
              signature
            );
          }

          // Step 3: Store current task’s edges for next iteration
          previousEdges = {
            ids: newTask.edges?.map((e: any) => e._id) || [],
            type: newTask.edges?.map((e: any) => e?.label),
            order: newTask.edges?.map((e: any) => e?.order),
            options: newTask.edges?.map((e: any) => e?.options),
          };

          // Step 4: Dispatch task
          dispatch(createNewTask(newTask));
        }
      }
      navigation.navigate("TaskList", {});
    } catch (error) {
      console.error(
        "❌ Error creating/updating task:",
        JSON.stringify(error, null, 2)
      );
    } finally {
      setLoading(false);
    }
  };

  // Task Summary Card Component for collapsed view
  const TaskSummaryCard = ({ index, row }: { index: number; row: any }) => {
    const currentRowType = useWatch({ name: `rows.${index}.type`, control });
    const taskTypeLabel =
      taskTypeOptions.find((option) => option.value === currentRowType)
        ?.label || currentRowType;
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

      toggleRowCollapse(index);
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.summaryCard}
          onPress={handlePress}
          activeOpacity={0.7}
        >
          <View style={styles.summaryHeader}>
            <View style={styles.stepIndicator}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              {row.saved && (
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color={Colors.light.White}
                  style={styles.checkIcon}
                />
              )}
            </View>
            <View style={styles.summaryContent}>
              <Text style={styles.summaryTitle} numberOfLines={1}>
                {row.title || t("taskManager.untitled-task")}
              </Text>
              <View style={styles.summaryDetails}>
                <Text style={styles.summaryTaskType}>{taskTypeLabel}</Text>
                <Text style={styles.summaryMembers}>
                  {memberCount}{" "}
                  {memberCount === 1
                    ? t("taskManager.member")
                    : t("taskManager.members")}
                </Text>
              </View>
            </View>
            <View style={styles.summaryActions}>
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
                style={styles.expandIcon}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Empty state component
  const EmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <MaterialCommunityIcons
          name="clipboard-list-outline"
          size={80}
          color={Colors.light.grayText}
          style={styles.emptyIcon}
        />
        <Text style={styles.emptyTitle}>{t("taskManager.no-tasks-yet")}</Text>
        <Text style={styles.emptyDescription}>
          {t("taskManager.create-first-task-description")}
        </Text>
      </View>
    );
  };

  const GoalQuestion = () => {
    // Show empty state if no tasks exist
    if (fields.length === 0) {
      return <EmptyState />;
    }

    return fields.map((row, index) => {
      // Check if this row should be collapsed
      if (isRowCollapsed(index) && row.saved) {
        return (
          <View key={row.id} style={styles.stepWrapper}>
            <TaskSummaryCard index={index} row={row} />
          </View>
        );
      }

      // Render expanded view
      return (
        <View key={row.id} style={[styles.cardRow, styles.stepWrapper]}>
          {/* Step Header */}
          <View style={styles.stepHeader}>
            <View style={styles.stepIndicatorExpanded}>
              <Text style={styles.stepNumberExpanded}>{index + 1}</Text>
            </View>
            <Text style={styles.stepTitle}>
              {t("taskManager.step")} {index + 1}
            </Text>
            {row.saved && (
              <TouchableOpacity
                style={styles.collapseButton}
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

          <View style={styles.cardContent}>
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
                  inputStyle={styles.input}
                  errorMessage={errors?.rows?.[index]?.title?.message}
                />
              )}
            />
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
                  inputStyle={styles.textArea}
                />
              )}
            />
            {/* Task Type Selector - Only show in multi-type mode */}
            {multiType && (
              <Controller
                control={control}
                name={`rows.${index}.type`}
                render={({ field }) => (
                  <SingleSelectDropdown
                    data={taskTypeOptions}
                    label={t("taskManager.task-type")}
                    value={field.value}
                    onChange={(val) => {
                      field.onChange(val);
                      // Reset task-specific fields when type changes
                      setValue(`rows.${index}.multiOptions`, {
                        value: "",
                        options: [],
                      });
                      setValue(`rows.${index}.minMax`, {
                        min: undefined,
                        max: undefined,
                        expressions: [],
                      });
                      setValue(`rows.${index}.media`, {
                        mediaQuality: "MEDIUM",
                        mediaType: "PHOTO",
                      });
                      // Mark as not saved when type changes
                      const row = getValues(`rows.${index}`);
                      update(index, { ...row, saved: false, type: val });
                    }}
                    placeholder={t("taskManager.select-task-type")}
                  />
                )}
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
                    <MediaGoalQuestion index={index} />
                  )}
                  {/* Min Max Range UI */}
                  {currentRowType === "min_max" && (
                    <MinMaxGoalQuestion index={index} />
                  )}
                  {/* Multiple Option UI (additional for Multiple Option type) */}
                  {currentRowType === "multiple_options" && (
                    <MultipleOptions index={index} />
                  )}
                </>
              );
            })()}

            {/* { Anonymous User Selection } */}
            {/* <TouchableOpacity
              style={styles.anonBtn}
              onPress={() => openModal(index, row.anonymousUsers)}
            >
              <Text style={styles.anonBtnText}>+ Add Anonymous User</Text>
            </TouchableOpacity> */}

            {/* Chips for selected anonymous users */}
            <DisplayAnonymousUsers index={index} />
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
                    data={contacts}
                  />
                  {errors?.rows?.[index]?.members?.message && (
                    <Text style={{ color: "red", fontSize: 14, marginTop: 4 }}>
                      {errors.rows[index].members?.message}
                    </Text>
                  )}
                </View>
              )}
            />
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
            <View style={styles.rowBtnsBottom}>
              {/* Only show delete button for saved tasks or when there are multiple tasks */}
              {(row.saved || fields.length > 1) && (
                <TouchableOpacity
                  onPress={() => removeRow(index)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeText}>
                    {t("taskManager.delete")}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => saveRow(index)}
                style={[
                  styles.saveButton,
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
                <Text style={styles.saveText}>
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

  const MultipleOptions = ({ index }: { index: number }) => {
    const options =
      useWatch({
        name: `rows.${index}.multiOptions.options`,
        control,
      }) || [];
    var status = options.length > 5 ? true : false;
    return (
      <View style={{ marginTop: 12 }}>
        <Text style={styles.sectionHeader}>{t("taskManager.options")}</Text>

        <Controller
          control={control}
          name={`rows.${index}.multiOptions.value`}
          render={({ field }) => (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <CustomTextInput
                label={t("taskManager.add-option")}
                value={field.value}
                onChangeText={field.onChange}
                placeholder={t("taskManager.enter-option")}
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity
                style={!status ? styles.addButtonOption : styles.disableButton}
                onPress={() => {
                  handleAddOption(field, options, index);
                }}
                disabled={status}
              >
                <Text style={!status ? styles.addText : styles.addTextDisabled}>
                  + {t("taskManager.add")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Chips */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
          {options.map((opt: string, i: number) => (
            <View key={i} style={styles.chip}>
              <Text style={styles.chipText}>{opt}</Text>
              <TouchableOpacity
                onPress={() => {
                  handleRemoveOption(index, options, opt);
                }}
              >
                <Text style={styles.chipCloseText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const MediaGoalQuestion = ({ index }: { index: number }) => {
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

  const MinMaxGoalQuestion = ({ index }: { index: number }) => {
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
                style={[styles.input, { flex: 1 }]}
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
                style={[styles.input, { flex: 1 }]}
              />
            )}
          />
        </View>

        {/* Expression List */}
        {expressions.map((expr, idx) => (
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
                  style={styles.input}
                />
              )}
            />

            {/* Option Dropdown */}
            <TouchableOpacity
              style={styles.dropdown}
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
                {EXPRESSION_OPTIONS.find((o) => o.value === expr.option)
                  ?.label || t("taskManager.select-option")}
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
                  style={styles.input}
                />
              )}
            />

            {/* Logic Dropdown */}
            <TouchableOpacity
              style={styles.dropdown}
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
          style={styles.addButtonLast}
          onPress={() =>
            expressionsFieldArray.append({
              prompt: "",
              option: "",
              number: undefined,
              logic: "",
            })
          }
        >
          <Text style={styles.addText}>
            + {t("taskManager.add-expression")}
          </Text>
        </TouchableOpacity>
      </>
    );
  };
  const DisplayAnonymousUsers = ({ index }: { index: number }) => {
    {
      const row = getValues(`rows.${index}.anonymousUsers`);
      //   console.log("Anonymous Users Row:", row);
      return (
        row.length > 0 && (
          <View style={styles.chipContainer}>
            {row.map((userVal: string) => {
              const user = contacts.find((u) => u.value === userVal);
              return (
                <View key={userVal} style={styles.chip}>
                  <Text style={styles.chipText}>
                    {user ? user.label : userVal}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      const updated = row.filter((v: any) => v !== userVal);
                      handleChange(index, "anonymousUsers", updated);
                    }}
                    style={styles.chipCloseBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.chipCloseText}>×</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )
      );
    }
  };

  const AddTaskButton = () => {
    const hasUnsavedTasks = fields.some((row) => !row.saved);

    return (
      <View style={styles.addTaskContainer}>
        {hasUnsavedTasks && (
          <Text style={styles.addTaskHint}>
            {t("taskManager.save-current-task-first")}
          </Text>
        )}
        <TouchableOpacity
          onPress={addRow}
          style={[
            styles.addTaskButton,
            hasUnsavedTasks && styles.addTaskButtonDisabled,
          ]}
          disabled={hasUnsavedTasks}
        >
          <MaterialCommunityIcons
            name="plus-circle"
            size={24}
            color={hasUnsavedTasks ? Colors.light.grayText : Colors.light.White}
            style={styles.addTaskIcon}
          />
          <Text
            style={[
              styles.addTaskText,
              hasUnsavedTasks && styles.addTaskTextDisabled,
            ]}
          >
            {t("taskManager.add-new-task")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const SubmitButton = () => {
    return (
      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        style={styles.submitButton}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={Colors.light.White} size={20} />
        ) : (
          <Text style={styles.submitText}>{t("taskManager.submit-task")}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const AnonymousUsersList = ({ visible }: { visible: boolean }) => {
    const [tempArr, setTempArr] = useState<any[]>([...anonymousUserSelected]);
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        />
        <View style={styles.modalContent}>
          <FlatList
            data={contacts}
            keyExtractor={(item: any) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  tempArr.includes(item?.value ?? "") && styles.selectedOption,
                ]}
                onPress={() => {
                  if (tempArr.includes(item.value ?? ""))
                    setTempArr(tempArr.filter((v) => v !== item.value));
                  else setTempArr([...tempArr, item.value]);
                  //   setAnonymousUserSelected(tempArr);
                }}
              >
                <Text
                  style={{
                    color: tempArr.includes(item.value)
                      ? Colors.light.PrimaryColor
                      : "#222",
                    fontSize: 18,
                    padding: 5,
                    paddingHorizontal: 10,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
          <View
            style={{ flexDirection: "row", justifyContent: "space-around" }}
          >
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setAnonymousUserSelected([...tempArr]);
                saveAnonymousUsers([...tempArr]);
              }}
            >
              <Text
                style={{
                  color: Colors.light.PrimaryColor,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                {t("taskManager.save")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Text
                style={{
                  color: Colors.light.red,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                {t("taskManager.close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const ExpressionModal = () => {
    return (
      <Modal visible={dropdownModal.visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() =>
            setDropdownModal({
              visible: false,
              rowId: null,
              exprIdx: null,
              field: null,
            })
          }
        />
        <View style={styles.modalContent}>
          <FlatList
            data={
              dropdownModal.field === "option"
                ? EXPRESSION_OPTIONS
                : LOGIC_OPTIONS
            }
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  if (
                    dropdownModal.rowId !== null &&
                    dropdownModal.exprIdx !== null &&
                    dropdownModal.field
                  ) {
                    handleExpressionChange(
                      dropdownModal.rowId,
                      dropdownModal.exprIdx,
                      dropdownModal.field,
                      item.value
                    );
                  }
                  setDropdownModal({
                    visible: false,
                    rowId: null,
                    exprIdx: null,
                    field: null,
                  });
                }}
              >
                <Text
                  style={{
                    color: Colors.light.PrimaryColor,
                    fontWeight: "600",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() =>
              setDropdownModal({
                visible: false,
                rowId: null,
                exprIdx: null,
                field: null,
              })
            }
          >
            <Text
              style={{ color: Colors.light.PrimaryColor, fontWeight: "600" }}
            >
              {t("taskManager.close")}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  // Progress indicator component
  const ProgressIndicator = () => {
    const totalSteps = fields.length;
    const completedSteps = fields.filter((row) => row.saved).length;
    const progressPercentage =
      totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            {t("taskManager.progress")}: {completedSteps} / {totalSteps}
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
      </View>
    );
  };

  const Header = () => {
    const validRows = fields.filter((row) => row.saved);
    const canSubmit = validRows.length > 0;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          {navigation && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                setModalValue({
                  header: t("submitPrompt"),
                  description: t("warning"),
                  button: [
                    {
                      label: t("taskManager.ok"),
                      onPress: () => {
                        setAlertModal(false);
                      },
                    },
                    {
                      label: t("goBack"),
                      onPress: () => {
                        setAlertModal(false);
                        navigation?.goBack();
                      },
                      color: Colors.light.red,
                    },
                  ],
                });
                setAlertModal(true);
              }}
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
              onPress={handleSubmit(onSubmit)}
              style={styles.headerSubmitBtn}
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
                    style={styles.submitIcon}
                  />
                  <Text style={styles.headerSubmitText}>
                    {t("taskManager.submit")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
        {multiType && fields.length > 0 && <ProgressIndicator />}
      </View>
    );
  };

  const renderModal = () => (
    <DynamicModal
      visible={alertModal}
      data={modalValue.header}
      description={modalValue.description}
      buttons={modalValue.button}
    />
  );
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={{ backgroundColor: Colors.light.White }}
    >
      <Header />
      <GoalQuestion />
      <AddTaskButton />
      {/* Render Modal for Alert */}
      {renderModal()}
      {/* Modal for Anonymous User Selection */}
      <AnonymousUsersList visible={modalVisible} />
      {/* Dropdown Modal for Expression Option/Logic */}
      <ExpressionModal />
    </ScrollView>
  );
};

export default TaskManager;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    paddingBottom: 40,
    backgroundColor: "white",
    minHeight: "100%",
  },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.black,
  },
  cardRow: {
    width: "100%",
    marginBottom: 24,
    backgroundColor: Colors.light.White,
    borderRadius: 16,
    padding: 18,
  },
  cardContent: {
    width: "100%",
    paddingRight: 0,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.PrimaryColor,
    marginBottom: 0,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  rowBtnsBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    gap: 12,
  },
  removeButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginLeft: 6, // match saveButton
    borderWidth: 1.5,
    borderColor: Colors.light.red,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginLeft: 6,
  },
  removeText: {
    color: Colors.light.red, // match border color
    fontWeight: "bold",
    fontSize: 16,
  },
  saveText: {
    color: Colors.light.White,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  addButton: {
    backgroundColor: Colors.light.PrimaryColor,
    paddingVertical: 15,
    paddingHorizontal: 8,
    marginHorizontal: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 0,
  },
  addButtonOption: {
    backgroundColor: Colors.light.PrimaryColor,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 2,
    marginTop: 32,
  },
  disableButton: {
    backgroundColor: Colors.light.backgroundGray,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
    shadowColor: Colors.light.backgroundGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  addText: {
    color: Colors.light.White,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  addTextDisabled: {
    color: Colors.light.grayText,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  addButtonLast: {
    backgroundColor: Colors.light.alertSuccess,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  addTextLast: {
    color: Colors.light.White,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  submitButton: {
    backgroundColor: Colors.light.PrimaryColor,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 15,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  input: {
    flex: 1,
  },
  textArea: {
    flex: 1,
    height: 100,
    textAlignVertical: "top",
  },
  anonBtn: {
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 14,
    alignItems: "center",
    paddingBottom: 15,
  },
  anonBtnText: {
    color: Colors.light.White,
    fontWeight: "700",
    fontSize: 15,
  },
  dropdown: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 15,
    minWidth: 120,
    minHeight: 44,
    justifyContent: "center",
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalOverlayFull: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalContentBetter: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: Colors.light.PrimaryColor,
    marginBottom: 12,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: 300,
    alignSelf: "center",
  },
  selectedOption: {
    backgroundColor: "#e6f0ff",
  },
  closeBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
  },
  closeBtnModal: {
    marginTop: 8,
    alignSelf: "center",
  },
  saveAnonBtn: {
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 14,
    marginBottom: 4,
  },
  selectedUsersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    gap: 8,
  },
  userChip: {
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  userChipText: {
    color: Colors.light.White,
    fontWeight: "600",
    fontSize: 14,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // allow wrapping to next line
    marginTop: 8,
    gap: 8,
    maxWidth: "100%",
  },
  chip: {
    borderColor: Colors.light.PrimaryColor,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 18, // much wider
    paddingVertical: 8, // slightly taller
    marginRight: 10,
    marginBottom: 6,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80, // ensure minimum width
    justifyContent: "center",
    textAlignVertical: "center",
  },
  chipText: {
    color: Colors.light.PrimaryColor,
    fontWeight: "600",
    fontSize: 15,
  },
  chipCloseBtn: {
    marginLeft: "auto",
    marginRight: -8,
    paddingLeft: 12,
    paddingRight: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  chipCloseText: {
    justifyContent: "center",
    color: Colors.light.PrimaryColor,
    fontWeight: "bold",
    fontSize: 24,
    paddingLeft: 4,
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 60,
    position: "relative",
    marginTop: -10,
    marginVertical: 12,
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.grayText,
    fontWeight: "500",
  },
  progressPercentage: {
    fontSize: 14,
    color: Colors.light.PrimaryColor,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 3,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    zIndex: 1,
    marginTop: 1,
  },
  // Step-based styles
  stepWrapper: {
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  stepIndicatorExpanded: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.PrimaryColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberExpanded: {
    color: Colors.light.White,
    fontSize: 16,
    fontWeight: "bold",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.PrimaryColor,
    flex: 1,
  },
  collapseButton: {
    padding: 8,
  },
  // Summary card styles
  summaryCard: {
    backgroundColor: Colors.light.White,
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.PrimaryColor,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.PrimaryColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  stepNumber: {
    color: Colors.light.White,
    fontSize: 14,
    fontWeight: "bold",
  },
  checkIcon: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: Colors.light.alertSuccess,
    borderRadius: 8,
    width: 16,
    height: 16,
  },
  summaryContent: {
    flex: 1,
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.black,
    marginBottom: 4,
  },
  summaryDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryTaskType: {
    fontSize: 14,
    color: Colors.light.PrimaryColor,
    fontWeight: "500",
    marginRight: 12,
  },
  summaryMembers: {
    fontSize: 14,
    color: Colors.light.grayText,
  },
  summaryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandIcon: {
    marginLeft: 8,
  },
  // Header submit button styles
  headerSubmitBtn: {
    backgroundColor: Colors.light.PrimaryColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    right: 20,
  },
  submitIcon: {
    marginRight: 4,
  },
  headerSubmitText: {
    color: Colors.light.White,
    fontSize: 14,
    fontWeight: "600",
  },
  // Add task button styles
  addTaskContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: "center",
  },
  addTaskHint: {
    fontSize: 14,
    color: Colors.light.grayText,
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
  },
  addTaskButton: {
    backgroundColor: Colors.light.PrimaryColor,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 200,
  },
  addTaskButtonDisabled: {
    backgroundColor: Colors.light.backgroundGray,
    elevation: 0,
    shadowOpacity: 0,
  },
  addTaskIcon: {
    marginRight: 8,
  },
  addTaskText: {
    color: Colors.light.White,
    fontSize: 16,
    fontWeight: "600",
  },
  addTaskTextDisabled: {
    color: Colors.light.grayText,
  },
  // Empty state styles
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.light.black,
    textAlign: "center",
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.light.grayText,
    textAlign: "center",
    lineHeight: 24,
  },
});
