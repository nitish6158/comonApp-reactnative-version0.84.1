import { Colors } from "@/Constants";
import {
  useCreateScenarioMutation,
  useValidateScenarioNameLazyQuery,
} from "@/graphql/generated/scenario.generated";
import {
  EdgeTypes,
  useAddTaskMutation,
} from "@/graphql/generated/task.generated";
import { ScenarioType } from "@/graphql/generated/types";
import { navigateAndReplace } from "@/navigation/utility";
import { RootState } from "@/redux/Reducer";
import {
  clearState,
  createNewTask,
  createScenarioForTask,
} from "@/redux/Reducer/TaskReducer";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;

const CreateTask = ({
  navigation,
  route,
}: {
  navigation?: any;
  route?: any;
}) => {
  const currentOrg = useSelector(
    (state: RootState) => state.Organisation.currentOrganization
  );
  const initialTasks =
    route && route.params && route.params.tasks ? route.params.tasks : [];
  const [
    validateScenarioName,
    { data, loading: scenarioLoading, error: scenarioError },
  ] = useValidateScenarioNameLazyQuery({
    fetchPolicy: "no-cache",
  });
  const [createScenario] = useCreateScenarioMutation();
  const [createTask] = useAddTaskMutation();
  // const [tasks, setTasks] =
  //   useState<{title: string; description: string}[]>(initialTasks);
  // const [showForm, setShowForm] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<{
    title: string;
    description: string;
  }>({ title: "", description: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(clearState());
  }, []);

  // Handlers for new task form
  const handleNewTaskChange = (
    field: "title" | "description",
    value: string
  ) => {
    setNewTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTask = () => {
    // setShowForm(true);
    setNewTask({ title: "", description: "" });
  };

  const handleValidationScenarioName = async () => {
    try {
      const { data } = await validateScenarioName({
        variables: {
          input: {
            name: newTask.title,
            orgId: currentOrg?._id,
            type: "PUBLISHED",
          },
        },
      });
      return data?.validateScenarioName?.success ?? false;
    } catch (error) {
      setError(t("create-workflow.workflow-valid-failed"));
      return false;
    }
  };

  const handleScenarioCreation = async () => {
    try {
      const response = await createScenario({
        variables: {
          input: {
            name: newTask.title,
            description: newTask.description,
            type: ScenarioType.Draft,
            organizationId: currentOrg?._id,
          },
        },
      });

      if (response.data?.createScenario) {
        // console.log(
        //   "Scenario created successfully!",
        //   response.data.createScenario
        // );
        dispatch(createScenarioForTask(response?.data?.createScenario?._id));
        return response.data.createScenario;
      } else {
        setError(t("create-workflow.scenario-already-exist"));
        return null;
      }
    } catch (error) {
      setError(t("create-workflow.workflow-error"));
      return null;
    }
  };

  const handleCreateTask = async (scenario: any) => {
    const startNode = {
      label: "Next",
      type: "DEFAULT" as EdgeTypes,
      order: 1,
      options: [],
      location: false,
      signature: false,
      media: null,
    };
    try {
      const taskResponse = await createTask({
        variables: {
          input: {
            label: newTask.title,
            orgId: currentOrg?._id,
            type: "INPUT",
            scenarioId: scenario._id,
            signature: false,
            edges: [startNode],
          },
        },
      });

      if (taskResponse.data?.addTask) {
        dispatch(createNewTask(taskResponse.data.addTask));
        // setNewTask({title: "", description: ""});
        navigateAndReplace("TaskManager", {
          id: "multi_type",
          label: t("taskManager.create-multiple-tasks"),
          multiType: true
        });
      }
    } catch (error) {
      setError(t("create-workflow.workflow-error"));
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!newTask.title.trim()) {
      setError(t("create-workflow.workflow-title-required"));
      return;
    }

    try {
      setLoading(true);
      const isValid = await handleValidationScenarioName();
      if (!isValid) {
        setError(t("create-workflow.scenario-name-not-valid"));
        return;
      }

      const scenario = await handleScenarioCreation();
      if (!scenario) return;

      await handleCreateTask(scenario);
    } catch (err) {
      // console.error("Error in task submission:", err);
      setError(t("create-workflow.unexpected-error"));
    } finally {
      setLoading(false);
    }
  };

  const handleTaskPress = (task: { title: string; description: string }) => {
    if (navigation) {
      navigation.navigate("TaskManager", {
        id: "multi_type",
        label: t("taskManager.create-multiple-tasks"),
        multiType: true
      });
    }
  };

  // UI for task list with Add Task button
  // if (!showForm) {
  //   return (
  //     <View style={styles.container}>
  //       {navigation && (
  //         <TouchableOpacity
  //           style={styles.backBtn}
  //           onPress={() => navigation.goBack()}
  //         >
  //           <MaterialCommunityIcons
  //             name="arrow-left"
  //             size={26}
  //             color="#007bff"
  //           />
  //         </TouchableOpacity>
  //       )}
  //       <View style={styles.listHeaderRow}>
  //         <Text style={styles.header}>{t('create-workflow.Tasks')}</Text>
  //         <TouchableOpacity style={styles.addTaskBtn} onPress={handleAddTask}>
  //           <MaterialCommunityIcons
  //             name="plus-circle-outline"
  //             size={28}
  //             color="#007bff"
  //           />
  //         </TouchableOpacity>
  //       </View>
  //       {tasks.length === 0 ? (
  //         <View style={styles.centerContent}>
  //           <MaterialCommunityIcons
  //             name="clipboard-list-outline"
  //             size={64}
  //             color="#007bff"
  //             style={{marginBottom: 18}}
  //           />
  //           <Text style={styles.welcomeText}>
  //             {t('create-workflow.no-task')}
  //           </Text>
  //         </View>
  //       ) : (
  //         <ScrollView contentContainerStyle={{paddingBottom: 40}}>
  //           {tasks.map((task, idx) => (
  //             <TouchableOpacity
  //               key={idx}
  //               style={styles.card}
  //               onPress={() => handleTaskPress(task)}
  //               activeOpacity={0.8}
  //             >
  //               <View style={styles.cardHeaderRow}>
  //                 <MaterialCommunityIcons
  //                   name="file-document-edit-outline"
  //                   size={24}
  //                   color="#007bff"
  //                   style={{marginRight: 8}}
  //                 />
  //                 <Text style={styles.cardTitle}>{task.title}</Text>
  //               </View>
  //               <Text style={styles.cardDesc}>{task.description}</Text>
  //             </TouchableOpacity>
  //           ))}
  //         </ScrollView>
  //       )}
  //     </View>
  //   );
  // }

  // UI for add new task form
  return (
    <ScrollView
      contentContainerStyle={styles.formContent}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <TouchableOpacity style={styles.backBtn} onPress={navigation.goBack}>
          <MaterialCommunityIcons name="arrow-left" size={26} />
        </TouchableOpacity>
        <Text style={styles.header}>{t("create-workflow.create-new-workflow")}</Text>
      </View>

      <View style={styles.card}>
        <View>
          <Text style={styles.label}>
            {t("create-workflow.workflow-title")} <Text style={styles.error}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={newTask.title}
            onChangeText={(val) => handleNewTaskChange("title", val)}
            placeholder={t("create-workflow.enter-workflow-title")}
            maxLength={100}
            returnKeyType="done"
            onFocus={() => setError("")}
          />
          <Text style={styles.label}>{t("create-workflow.workflow-description")}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={newTask.description}
            onChangeText={(val) => handleNewTaskChange("description", val)}
            placeholder={t("create-workflow.enter-workflow-description")}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          {error && <Text style={styles.error}>{error}</Text>}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={Colors.light.White} size={20} />
          ) : (
            <Text style={styles.buttonText}>{t("create-workflow.submit")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "white",
    padding: 24,
    justifyContent: "center",
    minHeight: "100%",
  },
  formContent: {
    flexGrow: 1,
    backgroundColor: "white",
    padding: 24,
    paddingBottom: 40,
    minHeight: "100%",
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  backBtn: {
    alignSelf: "flex-start",
    marginBottom: 8,
    borderRadius: 8,
    padding: 6,
    marginTop: 4,
    marginLeft: 0,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    alignSelf: "center",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: "space-between",
    marginTop: 25,
    flex: 1,
  },
  listHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    justifyContent: "space-between",
  },
  addTaskBtn: {
    backgroundColor: "#e9ecef",
    borderRadius: 20,
    padding: 6,
    marginLeft: 10,
    marginTop: 8,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#007bff",
    flex: 1,
  },
  cardDesc: {
    fontSize: 15,
    color: "#444",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "rgba(243,243,243,1)",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: Colors.light.PrimaryColor,
    paddingVertical: 15,
    borderRadius: 10,
    paddingHorizontal: 80,
    alignItems: "center",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 20,
    color: "#333",
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  error: {
    color: "red",
  },
});

export default CreateTask;
