export type TaskType =
  | "free_text"
  | "like_dislike"
  | "yes_no"
  | "numeric"
  | "multiple_options"
  | "MEDIA_UPLOAD"
  | "min_max";

export interface TaskManagerProps {
  route: any;
  taskType: TaskType;
  navigation?: any;
}

export interface MediaUpload {
  mediaQuality: "LOW" | "MEDIUM" | "HIGH";
  mediaType: "PHOTO" | "VIDEO" | "AUDIO" | "DOCUMENT";
}

export const TASK_TYPES: TaskType[] = [
  "like_dislike",
  "yes_no",
  "free_text",
  "numeric",
  "multiple_options",
  "min_max",
  "MEDIA_UPLOAD",
];

export const MULTI_EDGES = ["like-dislike", "yes-no"];
export type FormValues = {
  rows: {
    title: string;
    description: string;
    type: TaskType | string;
    anonymousUsers: string[];
    members: string[];
    saved: boolean;
    signature: boolean;
    multiOptions?: {
      value: string;
      options: string[];
    };
    minMax?: {
      min: number | undefined;
      max: number | undefined;
      expressions: ExpressionType[];
    };
    media: MediaUpload;
  }[];
};
export const INITIAL_FORM_VALUES: FormValues = {
  rows: [
    {
      title: "",
      description: "",
      type: "",
      anonymousUsers: [],
      members: [],
      saved: false,
      multiOptions: {value: "", options: []},
      signature: false,
      minMax: {
        min: 0,
        max: 100,
        expressions: [
          {
            prompt: "",
            option: "eq",
            number: 0,
            logic: "or",
          },
        ],
      },
      media: {mediaQuality: "MEDIUM", mediaType: "PHOTO"},
    },
  ],
};
export const EXPRESSION_OPTIONS = [
  {label: "Equal To", value: "eq"},
  {label: "Greater than", value: "gt"},
  {label: "Less than", value: "lt"},
  {label: "Greater than & equal", value: "gte"},
  {label: "Less than & equal", value: "lte"},
];
export const LOGIC_OPTIONS = [
  {label: "OR", value: "or"},
  {label: "AND", value: "and"},
];

export type ExpressionType = {
  prompt: string;
  option: string; // eq, gt, lt, gte, lte
  number: number | undefined;
  logic: string; // or, and
};

export type TaskComponent = {
  id: string;
  label: string;
  screen: string;
  icon: string;
};

export const TaskTypes: any = {
  like_dislike: "SELECT_ONE", // subType: "like_dislike",
  yes_no: "SELECT_ONE", // subType: "yes_no",
  free_text: "TEXT_INPUT",
  numeric: "NUMBER_INPUT", // type = NUMBER_INPUT
  multiple_options: "CHECKBOX", // subType = Checkbox
  min_max: "RANGE",
  MEDIA_UPLOAD: "MEDIA_UPLOAD", // subType = MEDIA_UPLOAD
};
export const TaskSubTypes: any = {
  like_dislike: "like_dislike",
  yes_no: "yes_no",
  multiple_options: "Checkbox",
};
export const MultiNodeType = {
  like_dislike: "SELECT_ONE",
  yes_no: "SELECT_ONE",
  multiple_options: "CHECKBOX",
};

type ModalButton = {
  label: string;
  onPress: () => void;
  color?: string;
};

export type ModalDetail = {
  header: string;
  description?: string;
  button: ModalButton[];
};
