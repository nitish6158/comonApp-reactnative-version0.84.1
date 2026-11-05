import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useForm, useFieldArray } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  useAddTaskMutation,
  useUpdateEdgeMutation,
} from "@/graphql/generated/task.generated";
import { RootState } from "@/redux/Store";
import { createNewTask } from "@/redux/Reducer/TaskReducer";
import { useGetAllOrgContactsLazyQuery } from "@/graphql/generated/contact.generated";
import { FormValues, TASK_TYPES, TaskType, ModalDetail } from "../TaskUtils";

export const useTaskManager = (
  SelectedNode: TaskType | string,
  multiType: boolean,
  navigation?: any
) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Redux selectors
  const currentOrg = useSelector(
    (state: RootState) => state.Organisation.currentOrganization
  );
  const taskScenarios = useSelector((state: RootState) => state.Task.scenarios);
  const currentScenario = taskScenarios?.[0] || {};
  const {
    currentScenarioID,
    tasks: previousTaskSaved = {},
    currentTaskType,
  } = currentScenario;

  // Local state
  const [alertModal, setAlertModal] = useState<boolean>(false);
  const [modalValue, setModalValue] = useState<ModalDetail>({
    header: "",
    description: "",
    button: [],
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalRowId, setModalRowId] = useState<number | null>(null);
  const [anonymousUserSelected, setAnonymousUserSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [contacts, setContacts] = useState<
    { label: string; value: string | null | undefined }[]
  >([]);

  // Collapse state management for step-by-step interface
  const [collapsedRows, setCollapsedRows] = useState<Set<number>>(new Set());
  const [activeStep, setActiveStep] = useState<number>(0);

  // Dropdown modal state
  const [dropdownModal, setDropdownModal] = useState<{
    visible: boolean;
    rowId: number | null;
    exprIdx: number | null;
    field: "option" | "logic" | null;
  }>({ visible: false, rowId: null, exprIdx: null, field: null });

  // Publish modal state
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [publishLoading, setPublishLoading] = useState<boolean>(false);

  // Task type bottom sheet state
  const [showTaskTypeBottomSheet, setShowTaskTypeBottomSheet] = useState<boolean>(false);
  const [currentTaskTypeIndex, setCurrentTaskTypeIndex] = useState<number | null>(null);

  // Task type options for dropdown
  const taskTypeOptions = [
    { label: t("labels.like-dislike"), value: "like_dislike" },
    { label: t("labels.yes-no"), value: "yes_no" },
    { label: t("labels.free-text"), value: "free_text" },
    { label: t("labels.numeric-field"), value: "numeric" },
    { label: t("labels.multiple-options"), value: "multiple_options" },
    { label: t("labels.media-upload"), value: "MEDIA_UPLOAD" },
  ];

  // Form management
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

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "rows",
  });

  // GraphQL mutations and queries
  const [createTask] = useAddTaskMutation();
  const [updateEdgeMutation] = useUpdateEdgeMutation();
  const [getAllOrgContactsRequest, getAllOrgContactsResponse] =
    useGetAllOrgContactsLazyQuery({
      fetchPolicy: "no-cache",
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

  // Expression change handler for min/max tasks
  const handleExpressionChange = (
    rowIndex: number,
    exprIndex: number,
    field: "option" | "logic" | "number",
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
    const row = getValues(`rows.${rowIndex}`);
    update(rowIndex, { ...row, saved: false });
  };

  // Save anonymous users
  const saveAnonymousUsers = (values: string[]) => {
    if (modalRowId !== null) {
      const row = getValues(`rows.${modalRowId}`);
      update(modalRowId, { ...row, anonymousUsers: values, saved: false });
    }
    setModalVisible(false);
  };

  // Task type bottom sheet functions
  const openTaskTypeBottomSheet = (index: number) => {
    setCurrentTaskTypeIndex(index);
    setShowTaskTypeBottomSheet(true);
  };

  const closeTaskTypeBottomSheet = () => {
    setShowTaskTypeBottomSheet(false);
    setCurrentTaskTypeIndex(null);
  };

  const selectTaskType = (value: string) => {
    if (currentTaskTypeIndex !== null) {
      setValue(`rows.${currentTaskTypeIndex}.type`, value);
      // Reset task-specific fields when type changes
      setValue(`rows.${currentTaskTypeIndex}.multiOptions`, {
        value: "",
        options: [],
      });
      setValue(`rows.${currentTaskTypeIndex}.minMax`, {
        min: undefined,
        max: undefined,
        expressions: [],
      });
      setValue(`rows.${currentTaskTypeIndex}.media`, {
        mediaQuality: "MEDIUM",
        mediaType: "PHOTO",
      });
      // Mark as not saved when type changes
      const row = getValues(`rows.${currentTaskTypeIndex}`);
      update(currentTaskTypeIndex, { ...row, saved: false, type: value });
    }
    closeTaskTypeBottomSheet();
  };

  // Validation effect
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
  }, [navigation, SelectedNode, multiType, t]);

  // Fetch contacts effect
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
  }, [currentOrg?._id, getAllOrgContactsRequest]);

  // Update contacts effect
  useEffect(() => {
    const formattedContacts =
      getAllOrgContactsResponse?.data?.getAllOrgContacts?.map((item) => ({
        label: `${item.firstName} ${item.lastName}`.trim(),
        value: item.memberId,
      }));
    setContacts(formattedContacts ?? []);
  }, [getAllOrgContactsResponse?.data?.getAllOrgContacts]);

  return {
    // State
    alertModal,
    setAlertModal,
    modalValue,
    setModalValue,
    modalVisible,
    setModalVisible,
    modalRowId,
    setModalRowId,
    anonymousUserSelected,
    setAnonymousUserSelected,
    loading,
    setLoading,
    contacts,
    collapsedRows,
    activeStep,
    setActiveStep,
    dropdownModal,
    setDropdownModal,
    showPublishModal,
    setShowPublishModal,
    publishLoading,
    setPublishLoading,
    showTaskTypeBottomSheet,
    setShowTaskTypeBottomSheet,
    currentTaskTypeIndex,
    setCurrentTaskTypeIndex,
    taskTypeOptions,

    // Form
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    errors,
    fields,
    append,
    remove,
    update,

    // Redux state
    currentOrg,
    currentScenarioID,
    previousTaskSaved,
    currentTaskType,

    // GraphQL
    createTask,
    updateEdgeMutation,

    // Collapse functions
    toggleRowCollapse,
    collapseRow,
    isRowCollapsed,

    // Task-specific functions
    handleExpressionChange,
    saveAnonymousUsers,
    openTaskTypeBottomSheet,
    closeTaskTypeBottomSheet,
    selectTaskType,

    // Utils
    dispatch,
    createNewTask,
    navigation,
    setShowPublishModal,
    setPublishLoading,
    t,
  };
};