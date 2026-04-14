import { 
  TaskTypes, 
  TaskSubTypes, 
  MultiNodeType 
} from "../TaskUtils";

export const useTaskLogic = (taskManager: any) => {
  const {
    setValue,
    getValues,
    update,
    remove,
    append,
    clearErrors,
    setError,
    fields,
    collapseRow,
    setActiveStep,
    setModalValue,
    setAlertModal,
    createTask,
    updateEdgeMutation,
    currentOrg,
    currentScenarioID,
    previousTaskSaved,
    dispatch,
    createNewTask,
    navigation,
    setLoading,
    handleSubmit,
    setShowPublishModal,
    setPublishLoading,
    t,
  } = taskManager;

  const labelTypes = ["Like", "Dislike", "Yes", "No"];

  // Handle text changes
  const handleChange = (
    index: number,
    field: string,
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
    const multiType = true; // This should come from props
    append({
      title: "",
      description: "",
      type: multiType ? "free_text" : "default_type",
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

  // Create Node for connection
  const nodeCreation = (data: any, taskType: string = "") => {
    const nodes: any[] = [];
    const actualTaskType = taskType || data.type;

    if (taskType) {
      const optionNodes: any[] = [];
      if (actualTaskType === "multiple_options") {
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
        let startIndex = actualTaskType === "like_dislike" ? 0 : 2;
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
        return nodeCreation(data, actualTaskType);
      }
      nodes.push({
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
      const label = labelTypes.find((val) => val === subType.type[i]) || "Next";
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
            type: "DEFAULT",
            _id: edgeIDs[i],
          },
        },
      };
      
      const response = await updateEdgeMutation(payload);
      if (response?.data) {
        console.log(`🔗 Edge ${edgeIDs[i]} updated to point to ${newTaskID}`);
      }
      if (response?.errors) {
        console.log("❌ Error updating edge:", JSON.stringify(response.errors, null, 2));
      }
    }
  };

  // Show publish modal when user clicks submit
  const onSubmit = async (data: any) => {
    const validRows = data.rows.filter((row: any) => row.saved);
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

    // Show publish modal instead of immediately publishing
    setShowPublishModal(true);
  };

  // Actual publish function that does the API calls
  const publishTasks = async (endNodeData: { title: string; description?: string }) => {
    const data = getValues();
    const validRows = data.rows.filter((row: any) => row.saved);
    
    setPublishLoading(true);

    let previousEdges = {
      ids: previousTaskSaved?.TaskEdgeID || [],
      type: previousTaskSaved?.EdgeLabel?.label || [],
      order: previousTaskSaved?.EdgeLabel?.order || [],
      options: previousTaskSaved?.EdgeLabel?.option || [],
    };

    try {
      for (let i = 0; i < validRows.length; i++) {
        const currValue = validRows[i];
        const edgeNode = nodeCreation(currValue);
        let media: any = null;
        
        if (currValue.type === "MEDIA_UPLOAD") {
          media = {
            mediaQuality: currValue.media.mediaQuality,
            mediaType: currValue.media.mediaType,
          };
        }
        
        const taskNumber = previousTaskSaved?.TaskNumber || 1;
        const position = {
          x: taskNumber * 170,
          y: taskNumber * 170,
        };
        
        if (!currentScenarioID) {
          console.error("❌ Error: No scenario ID found for task creation");
          setPublishLoading(false);
          return;
        }

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

          if (previousEdges.ids.length > 0) {
            await updatePreviousEdges(
              previousEdges.ids,
              newTaskID,
              previousEdges,
              signature
            );
          }

          previousEdges = {
            ids: newTask.edges?.map((e: any) => e._id) || [],
            type: newTask.edges?.map((e: any) => e?.label),
            order: newTask.edges?.map((e: any) => e?.order),
            options: newTask.edges?.map((e: any) => e?.options),
          };

          dispatch(createNewTask(newTask));
        }
      }

      // Create finish node (OUTPUT type task)
      if (!currentScenarioID) {
        console.error("❌ Error: No scenario ID found");
        setPublishLoading(false);
        return;
      }

      const finishNodePayload = {
        variables: {
          input: {
            label: endNodeData.title,
            orgId: currentOrg?._id,
            type: "OUTPUT",
            scenarioId: currentScenarioID,
            signature: false,
            edges: [],
          },
        },
      };

      const finishTaskResponse = await createTask(finishNodePayload);
      const finishTask = finishTaskResponse?.data?.addTask;

      if (finishTask?._id) {
        console.log(`✅ Finish node created: ${finishTask._id}`);
        
        // Update the last task's edges to point to the finish node
        if (previousEdges.ids.length > 0) {
          await updatePreviousEdges(
            previousEdges.ids,
            finishTask._id,
            previousEdges,
            false
          );
        }
      }

      // Close publish modal and navigate back to main screen
      setShowPublishModal(false);
      setPublishLoading(false);
      
      // Navigate back to bottom tab screen (main screen)
      navigation.navigate("BottomTabScreen", {});
    } catch (error) {
      console.error("❌ Error creating/updating task:", JSON.stringify(error, null, 2));
      setPublishLoading(false);
    }
  };

  const handleBackPress = () => {
    setModalValue({
      header: t("submitPrompt"),
      description: t("warning"),
      button: [
        {
          label: t("taskManager.ok"),
          onPress: () => {
            setAlertModal(false);
            setModalValue({ header: "", description: "", button: [] });
          },
        },
        {
          label: t("goBack"),
          onPress: () => {
            setAlertModal(false);
            setModalValue({ header: "", description: "", button: [] });
            navigation?.goBack();
          },
          color: "#dc3545",
        },
      ],
    });
    setAlertModal(true);
  };

  return {
    handleChange,
    addRow,
    removeRow,
    saveRow,
    nodeCreation,
    updatePreviousEdges,
    onSubmit,
    publishTasks,
    handleBackPress,
    handleSubmit: handleSubmit(onSubmit),
  };
};