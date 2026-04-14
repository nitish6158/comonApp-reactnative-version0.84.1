import { TaskType, ModalDetail } from "../TaskUtils";

export interface TaskManagerProps {
  route: {
    params: {
      id: TaskType | string;
      label: string;
      multiType?: boolean;
    };
  };
  navigation?: any;
}

export interface TaskRowData {
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
  media: {
    mediaQuality: "LOW" | "MEDIUM" | "HIGH";
    mediaType: "PHOTO" | "VIDEO" | "AUDIO" | "DOCUMENT";
  };
}

export interface ExpressionType {
  prompt: string;
  option: string; // eq, gt, lt, gte, lte
  number: number | undefined;
  logic: string; // or, and
}

export interface DropdownModalState {
  visible: boolean;
  rowId: number | null;
  exprIdx: number | null;
  field: "option" | "logic" | null;
}

export interface TaskManagerState {
  alertModal: boolean;
  modalValue: ModalDetail;
  modalVisible: boolean;
  modalRowId: number | null;
  anonymousUserSelected: string[];
  loading: boolean;
  contacts: { label: string; value: string | null | undefined }[];
  collapsedRows: Set<number>;
  activeStep: number;
  dropdownModal: DropdownModalState;
}

export interface TaskTypeOption {
  label: string;
  value: string;
}

export interface TaskFormComponentProps {
  index: number;
  control: any;
  getValues?: any;
  setValue?: any;
  update?: any;
  setDropdownModal?: (modal: DropdownModalState) => void;
}

export interface StepHeaderProps {
  index: number;
  isCollapsed: boolean;
  onCollapse: (index: number) => void;
}