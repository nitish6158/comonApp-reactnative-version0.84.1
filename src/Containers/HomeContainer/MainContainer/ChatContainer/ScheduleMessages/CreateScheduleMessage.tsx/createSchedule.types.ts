import { RecurrentTypes } from "@/graphql/generated/types";

export type ScheduleFormType = {
  date: string;
  time: string;
  recursive:RecurrentTypes
  approvalReminderTime:Array<{Count:number,Unit:string}>
  isApprovalNeeded:boolean
  message: Array<{
    message: string;
    isUploaded?: boolean;
    roomId: string;
    type: string;
    fileURL: string;
    isForwarded: boolean;
    fontStyle: string;
    mimeType?:string
    thumbnail: string;
    duration: number;
  }>;
};