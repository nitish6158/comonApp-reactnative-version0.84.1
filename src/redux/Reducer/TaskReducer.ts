import {createSlice, PayloadAction} from "@reduxjs/toolkit";

type Users = {
  id: string;
  label: string;
};

type Edge = {
  _id: string;
  type: string;
  label: string;
  order?: number;
  signature: boolean;
  targetTaskID: string | null;
  options?: string[];
  notifyTo?: Users[];
  location?: boolean;
  media?: any | null;
};

interface TaskComponent {
  _id: string;
  title: string;
  description?: string;
  minValue?: number;
  maxValue?: number;
  expression?: string;
  anonymousUser?: Users[];
  options?: string[];
  members?: Users[];
  saveStatus: boolean;
  deleteStatus?: boolean;
  multiOptions?: {
    value: string;
    options: string[];
  };
  edges?: Edge[];
  minMax?: {
    min: number | undefined;
    max: number | undefined;
    expressions: {
      prompt: string;
      option: string;
      number: number | undefined;
      logic: string;
    }[];
  };
}

type Details = {
  //   type: string;
  details: TaskComponent;
};

interface EdgeDetail {
  label: string[];
  order: number[];
  option?: any[];
}

interface TaskFlow {
  currentTaskID: string;
  TaskEdgeID: string[];
  TaskNumber: number;
  EdgeLabel: EdgeDetail;
  details: Details[]; // This holds the linear nodes of the task
}

interface TaskCreationInitialState {
  currentScenarioID: string;
  currentTaskType: string;
  tasks: TaskFlow;
}

interface TasksState {
  scenarios: TaskCreationInitialState[];
}

const initialState: TasksState = {
  scenarios: [],
};

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    // 1. Create a new scenario
    createScenarioForTask: (state, action: PayloadAction<string>) => {
      const scenarioID = action.payload;
      const exists = state.scenarios.some(
        (s) => s.currentScenarioID === scenarioID
      );
      if (!exists) {
        state.scenarios.push({
          currentScenarioID: scenarioID,
          currentTaskType: "",
          tasks: {
            currentTaskID: "",
            TaskEdgeID: [],
            TaskNumber: 0,
            EdgeLabel: {
              label: [],
              order: [],
            },
            details: [],
          },
        });
      }
    },
    createNewTask: (state, action: PayloadAction<any>) => {
      const {_id, edges} = action.payload;
      const edgeID = edges?.map((e: any) => e?._id) || [];
      const edgeDetail: EdgeDetail = {
        label: edges?.map((e: any) => e?.label) || [],
        order: edges?.map((e: any) => e?.order) || [],
        option: edges?.map((e:any) => e?.options) || [],
      };
      state.scenarios.forEach((scenario) => {
        scenario.tasks.currentTaskID = _id;
        scenario.tasks.TaskEdgeID = edgeID;
        scenario.tasks.TaskNumber += 1;
        scenario.tasks.EdgeLabel = edgeDetail;
        scenario.tasks.details.push(action.payload);
      });
    },
    updateTaskType: (state, action: PayloadAction<string>) => {
      state.scenarios.forEach((scenario) => {
        scenario.currentTaskType = action.payload;
      });
    },
    clearState: () => initialState,
  },
});

export const {
  createScenarioForTask,
  createNewTask,
  clearState,
  updateTaskType,
} = taskSlice.actions;

export default taskSlice.reducer;
