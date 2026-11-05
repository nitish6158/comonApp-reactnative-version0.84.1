import CustomTextInput from "@/Components/TextInput/CustomTextInput";
import { Colors } from "@/Constants";
import {
  useScenarioLazyQuery,
  useUpdateScenarioMutation,
} from "@/graphql/generated/scenario.generated";
import {
  useAddTaskMutation,
  useUpdateEdgeMutation,
} from "@/graphql/generated/task.generated";
import { EdgeTypes } from "@/graphql/generated/types";
import { navigate, navigateAndReplace } from "@/navigation/utility";
import { RootState } from "@/redux/Reducer";
import { updateTaskType } from "@/redux/Reducer/TaskReducer";
import { cloneDeep } from "lodash";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { TaskComponent } from "./TaskUtils";
import TaskListFooter from "./components/TaskListFooter";
const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;

type FormValues = {
  title: string;
  description?: string;
};
const TaskList = ({ navigation }: { navigation?: any }) => {
  const taskDetails =
    useSelector((state: RootState) => state.Task.scenarios) ?? [];
  const totalTask: number = taskDetails?.reduce(
    (accumulator, currScenario) =>
      accumulator + currScenario.tasks?.TaskNumber || 0,
    0,
  );
  const currentOrg = useSelector(
    (state: RootState) => state.Organisation.currentOrganization,
  );

  const currentScenario = taskDetails[0] ?? {};
  const currentScenarioID = currentScenario.currentScenarioID;
  const previousTaskSaved = currentScenario.tasks ?? {};
  const currentTaskType = currentScenario.currentTaskType;

  const [createTask] = useAddTaskMutation();
  const [updateEdgeMutation] = useUpdateEdgeMutation();

  const [taskCreatedModal, setTaskCreatedModal] = useState(false);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const { t } = useTranslation();
  const taskList = [
    {
      id: "like-dislike",
      label: t("labels.like-dislike"),
      screen: "like_dislike",
      icon: "thumbs-up-down",
    },
    {
      id: "yes-no",
      label: t("labels.yes-no"),
      screen: "yes_no",
      icon: "check-circle-outline",
    },
    {
      id: "free-text",
      label: t("labels.free-text"),
      screen: "free_text",
      icon: "form-textbox",
    },
    {
      id: "numeric",
      label: t("labels.numeric-field"),
      screen: "numeric",
      icon: "numeric",
    },
    {
      id: "multiple-options",
      label: t("labels.multiple-options"),
      screen: "multiple_options",
      icon: "format-list-bulleted",
    },
    {
      id: "media-upload",
      label: t("labels.media-upload"),
      screen: "MEDIA_UPLOAD",
      icon: "file-upload-outline",
    },
  ];
  const {
    control,
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const handlePress = (item: TaskComponent) => {
    if (navigation) {
      dispatch(updateTaskType(item.screen));
      navigate("TaskManager", { id: item.screen, label: item.label });
    }
  };

  const updatePreviousEdges = async (
    edgeIDs: string[],
    newTaskID: string,
    subType: string,
  ) => {
    const labelTypes = ["Like", "Dislike", "Yes", "No"];
    let startIndex =
      currentTaskType === "like_dislike"
        ? 0
        : currentTaskType === "yes_no"
        ? 2
        : -1;
    var status = true;
    for (let i = 0; i < edgeIDs.length; i++) {
      const label = startIndex >= 0 ? labelTypes[startIndex + i] : "Next";
      const payload = {
        variables: {
          input: {
            label,
            location: false,
            media: null,
            notifyTo: [],
            options: [],
            order: i + 1,
            signature: false,
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
        console.error(
          "❌ Error updating edge:",
          JSON.stringify(response.errors, null, 2),
        );
        status = false;
      }
    }
    return status;
  };

  const onSubmit = async (data: FormValues) => {
    const title = getValues("title");
    if (!title.trim()) {
      setError(`title`, {
        type: "required",
        message: t("taskList.goal-title-required"),
      });
      return;
    }
    setLoader(true);
    const EndTaskPayload = {
      variables: {
        input: {
          label: title,
          orgId: currentOrg?._id,
          type: "OUTPUT",
          scenarioId: currentScenarioID,
          signature: false,
          edges: [],
        },
      },
    };
    const taskResponse = await createTask(EndTaskPayload);
    const newTask = taskResponse?.data?.addTask;
    let previousEdgeIds: string[] = previousTaskSaved.TaskEdgeID || [];
    if (newTask?._id) {
      const { _id: newTaskID, subType } = newTask;
      console.log(`✅ Task created: ${newTaskID}`);
      var status: boolean = true;
      // Step 2: Update edges of previous task
      if (previousEdgeIds.length > 0) {
        status = await updatePreviousEdges(previousEdgeIds, newTaskID, "");
      }
      if (status) {
        // const commonScenarioPayload = {
        //   variables: {
        //     input: {
        //       orgId: currentOrg?._id,
        //       _id: currentScenarioID,
        //     },
        //   },
        // };

        // // For updateScenario, extend the input with isValid
        // const updateScenarioPayload = {
        //   variables: {
        //     input: {
        //       ...commonScenarioPayload.variables.input,
        //       isValid: true,
        //     },
        //   },
        // };
        // await updateScenario(updateScenarioPayload);
        // await getScenarioRequest(commonScenarioPayload);
        // console.log("UPDATED ASSIGNMENT : ",JSON.stringify(getScenarioResponse,null,2))
        // Step 3: Dispatch clear values
        setTaskCreatedModal(true);
        setVisible(false);
        // navigateAndReplace("Main", {});
      }
    }
  };

  const renderItem = ({ item }: { item: TaskComponent }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <MaterialCommunityIcons
          name={item.icon}
          size={28}
          color={Colors.light.PrimaryColor}
          style={styles.icon}
        />
        <Text style={styles.taskLabel}>{item.label}</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={28}
          color="#bbb"
          style={styles.arrow}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.light.text}
          />
        </TouchableOpacity>
        <Text style={styles.header}>{t("taskList.task-components")}</Text>
      </View>

      <FlatList
        data={taskList}
        renderItem={renderItem}
        keyExtractor={(item: TaskComponent) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {t("taskList.no-components-found")}
          </Text>
        }
        contentContainerStyle={
          taskList.length === 0
            ? { flex: 1, justifyContent: "center", paddingHorizontal: 20 }
            : { paddingHorizontal: 20 }
        }
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.multiTypeCard}
            onPress={() => {
              if (navigation) {
                dispatch(updateTaskType("multi_type"));
                navigate("TaskManager", {
                  id: "multi_type",
                  label: t("taskList.create-multiple-tasks"),
                  multiType: true,
                });
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.row}>
              <MaterialCommunityIcons
                name="view-list"
                size={28}
                color={Colors.light.alertSuccess}
                style={styles.icon}
              />
              <Text
                style={[styles.taskLabel, { color: Colors.light.alertSuccess }]}
              >
                {t("taskList.create-multiple-tasks")}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={28}
                color="#bbb"
                style={styles.arrow}
              />
            </View>
          </TouchableOpacity>
        }
      />
      <TaskListFooter />
      <Modal
        transparent
        animationType="fade"
        visible={taskCreatedModal}
        onRequestClose={() => {
          setTaskCreatedModal(false);
          navigateAndReplace("Main", {});
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <MaterialCommunityIcons
              name="book-check"
              size={90}
              color={Colors.light.PrimaryColor}
              style={{ alignSelf: "center", marginBottom: 20 }}
            />
            <Text
              style={{
                fontSize: 24,
                padding: 10,
                textAlign: "center",
                color: Colors.light.text,
              }}
            >
              {t("taskList.task-successfully-created")}
            </Text>
            <Text
              style={{
                fontSize: 20,
                padding: 10,
                textAlign: "center",
                color: Colors.light.grayText,
              }}
            >
              {t("taskList.please-login-task-panel")}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: Colors.light.PrimaryColor,
                padding: 15,
                borderRadius: 8,
                marginTop: 20,
              }}
              onPress={() => {
                setTaskCreatedModal(false);
                navigateAndReplace("Main", {});
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: Colors.light.White,
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                {t("taskList.close")}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            <Text
              style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}
            >
              {t("taskList.finish-task-flow")}
            </Text>
            <Controller
              control={control}
              name={"title"}
              render={({ field }) => (
                <CustomTextInput
                  label={t("taskList.goals-title")}
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  placeholder={t("taskList.enter-goal-title")}
                  inputStyle={styles.input}
                  required
                  errorMessage={errors?.title?.message}
                />
              )}
            />

            <Controller
              control={control}
              name={"description"}
              render={({ field }) => (
                <CustomTextInput
                  label={t("taskList.goals-description")}
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  placeholder={t("taskList.enter-goals-description")}
                  inputStyle={[styles.textArea, styles.input]}
                  multiline
                  errorMessage={errors?.description?.message}
                />
              )}
            />

            <View style={[styles.buttonRow]}>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => setVisible(false)}
                disabled={loader}
              >
                <Text style={styles.buttonText}>{t("taskList.close")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.submitButton]}
                onPress={handleSubmit(onSubmit)}
                disabled={loader}
              >
                {loader ? (
                  <ActivityIndicator color={Colors.light.White} />
                ) : (
                  <Text style={styles.buttonText}>{t("taskList.publish")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {totalTask > 1 && (
        <TouchableOpacity
          style={styles.endButton}
          onPress={() => setVisible(true)}
        >
          <Text style={styles.endButtonText}>{t("taskList.publish-task")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    marginTop: 10,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  backBtnText: {
    color: Colors.light.text,
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 6,
  },
  card: {
    backgroundColor: Colors.light.White,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  multiTypeCard: {
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.light.alertSuccess,
  },
  endButton: {
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  endButtonText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    color: Colors.light.White,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 16,
  },
  taskLabel: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  arrow: {
    marginLeft: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    fontSize: 16,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 12,
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
  submitButton: {
    backgroundColor: "#27ae60",
  },
  openButton: {
    backgroundColor: "#4a90e2",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default TaskList;
