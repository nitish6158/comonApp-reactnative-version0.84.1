import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { HeaderWithScreenNameProps } from "@Components/header/HeaderWithScreenName";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import {
  Assignment,
  ContactDetailsDto,
  DaylyParamsInput,
  Maybe,
  MonthlyParamsInputForReminder,
  RecurrentTypes,
} from "@Service/generated/types";
import { StackScreenProps } from "@react-navigation/stack";
import { RoomData, RoomParticipantData } from "@/redux/Models/ChatModel";
import { ContactInfo } from "@Types/types";
import { reminder, reminder_attachment } from "@/schemas/schema";
import { questionType } from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatPolls/CreateChatPollScreen";

export type AssignmentProps = {
  assignmentId: string;
  activeReportId: Maybe<string> | undefined;
  SenerioId: string;
} & HeaderWithScreenNameProps;
export type ReportProps = { reportId: string } & HeaderWithScreenNameProps;

export type SeniorNavigatorParamList = {
  SeniorChatSelectionScreen: {};
  SeniorChatMessageScreen: {
    roomId: string;
  };
  SeniorChatScreen: {};
  SeniorProfileScreen: {};
  EditProfileImageScreen: {};
  ViewContactScreen: {};
  UserManualScreen:{}
  ViewChatResultScreen:{
    chatId?: string;
    questions:questionType[]
  },
};

export type SeniorChatSelectionScreenProps = StackScreenProps<SeniorNavigatorParamList, "SeniorChatSelectionScreen">;
export type SeniorChatMessageScreenProps = StackScreenProps<SeniorNavigatorParamList, "SeniorChatMessageScreen">;
export type SeniorChatScreenProps = StackScreenProps<SeniorNavigatorParamList, "SeniorChatScreen">;
export type SeniorProfileScreenProps = StackScreenProps<SeniorNavigatorParamList, "SeniorProfileScreen">;

export type AuthNavigatorParamList = {
  Login: {
    showModal: boolean;
  };
  Registration: {
    phoneNumber: string;
    region: string;
  };
  Verification: undefined;
  Terms: {
    phone: string;
  };
  ResetPassword: {
    token: string;
  };
  ForgotPassword: undefined;
  NotFound: undefined;
};

export type LoginScreenProps = StackScreenProps<AuthNavigatorParamList, "Login">;
export type RegistrationScreenProps = StackScreenProps<AuthNavigatorParamList, "Registration">;
export type VerificationScreenProps = StackScreenProps<AuthNavigatorParamList, "Verification">;
export type ResetPasswordScreenProps = StackScreenProps<AuthNavigatorParamList, "ResetPassword">;
export type ForgotPasswordScreenProps = StackScreenProps<AuthNavigatorParamList, "ForgotPassword">;
export type NotFoundScreenProps = StackScreenProps<AuthNavigatorParamList, "NotFound">;

export type MainNavigatorParamList = {
  askCreation: undefined;
  TaskList: undefined;
  CreateTask: undefined;
  OrganizationListing: undefined;
  CreateOrganization: undefined;
  TaskManager: undefined;
  UserProfileScreen: undefined;
  BottomTabScreen: undefined;
  ProfileScreen: undefined;
  ContactListScreen: undefined;
  AboutContainer: undefined;
  PasswordChangeContainer: undefined;
  BlockedContactsContainers: undefined;

  CallParticipantSelectionScreen: undefined;

  CallHistoryScreen: undefined;
  EditProfileImageScreen: undefined;
  SelectChatRoomScreen: {
    sourceRoomId?: string;
    goBackDepth?: number;
  };
  ChatMessageScreen: {
    RoomId: string;
  };
  SelectContactScreen: {
    currentRoomID: string;
  };
  FolderListScreen: undefined;
  CreateFolderScreen: {
    isEdit: boolean;
    FolderItem: {
      key: number;
      name: string;
      roomId: Array<string>;
    };
  };

  ForwardMessageScreen: {
    Cidlist: string[];
  };
  ArchiveChatListScreen: undefined;
  ChatProfileScreen: undefined;
  CreateGroupScreen: {
    mode: "update" | "add";
    updateData?: {
      roomId: string;
      oldImage: string;
    };
  };
  ChatGlobalSearchScreen: undefined;
  ChatMediaScreen: undefined;
  ChatMessageInfoScreen: undefined;
  FavoriteChatMessageScreen: undefined;
  CommonChatListScreen: undefined;
  ChatWallPaperAndSoundScreen: undefined;
  ChatSoundSelectionScreen: undefined;
  ChatDisappearSettingScreen: undefined;
  ChatContactDetailsScreen: {
    user: RoomParticipantData;
  };
  GroupChatSettingScreen: undefined;
  ChatDescriptionScreen: {
    RoomId: string;
    OldStatus: string;
  };
  AddChatAdminScreen: undefined;
  ChatRoomSettingScreen: undefined;
  EditChatParticipantScreen: undefined;
  AssignmentChatScreen: undefined;
  ReportScreen: undefined;
  OrganisationInvites: undefined;
  AssignmentNotificationScreen: undefined;
  TimezoneMismatch: undefined;
  Broadcast: undefined;
  BroadcastParticipant: {
    name: string;
    image: any;
  };
  AddMessageTopicsScreen: {
    mode: "update" | "add";
    text: string;
  };
  ShowMessageTopicsScreen: {};
  ShowTopicMessagesScreen: {
    topic: string;
  };
  Calendar: undefined;
  PhoneSound: undefined;
  Privacy: {
    chatRoomId?: string;
    status?: boolean;
  };
  ViewContactScreen: {
    data: ContactInfo;
  };
  SendContactScreen: {
    contactList: ContactDetailsDto[];
    RoomId: string;
  };
  CreateReminderScreen: {
    roomId?: string;
    roomType?: string;
    participants: RoomParticipantData[];
    reminder?: reminder;
  };
  CreateScheduleMessage: {
    mode: "create" | "update";
    type: string;
    roomId: string;
    date: string;
    parent_id: string;
    roomType: string;
    startDate: string;
    daylyParams: DaylyParamsInput | null;
    monthlyParams: MonthlyParamsInputForReminder | null;
    endDate: string;
    recursive: RecurrentTypes;
    time: string;
    approvalReminderTime: Array<{ Count: number; Unit: string }>;
    isApprovalNeeded: boolean;
    _id?: string;
    message: Array<{
      message: string;
      isUploaded?: boolean;
      roomId: string;
      type: string;
      fileURL: string;
      isForwarded: boolean;
      fontStyle: string;
      mimeType?: string;
      thumbnail: string;
      duration: number;
    }>;
  };
  ViewReminderScreen: {
    roomId: string;
    roomType: string;
  };
  AttachmentViewScreen: {
    attachment: reminder_attachment;
  };
  ViewScheduleAttachment: {
    type: "audio" | "video" | "image";
    url: string;
    caption: string;
  };
  ViewScheduleMessage: {
    roomId?: string;
  };
  CalenderNotifications: {
    tabIndex?: number;
  };
  ViewTopicsScreen: {
    title: string;
    parentId: string;
    chatData: Array<{
      title: string;
      parentId: string;
    }>;
  };
  CreateTopicsScreen: {};
  SubTopicScreen: {};
  CreateChatRooms: {};
  UserPrivacySettings: {};
  SelectParticipantForGroup: {
    roomName: string;
    roomImage: string;
  };
  ViewDatabaseScreen: {
    title: string;
    parentId: string | null;
  };
  ViewRecordScreen: {
    recordId: string;
  };
  CreateRecordScreen: {
    mode: "create" | "update";
    parentId:string
    recordId?:string | null
  };
  CreateCategoryScreen: {
    mode: "create" | "update";
    parentId:string
    categoryId?:string | null
    text?:string
  };
  CreateChatPollScreen:{

  }
  ViewChatResultScreen:{
    chatId?: string;
    questions:questionType[]
  },
  UserManualScreen:{},
  ContactRemindersScreen:{}
  SurveyContainer:{
    surveyId:string
  }
};

export type SurveyContainerScreenProps = StackScreenProps<MainNavigatorParamList, "SurveyContainer">;

export type ContactRemindersScreenProps = StackScreenProps<MainNavigatorParamList, "ContactRemindersScreen">;

export type UserManualScreenProps = StackScreenProps<MainNavigatorParamList, "UserManualScreen">;

export type CreateChatPollScreenProps = StackScreenProps<MainNavigatorParamList, "CreateChatPollScreen">;

export type ViewChatResultScreenProps = StackScreenProps<MainNavigatorParamList, "ViewChatResultScreen">;

export type CreateCategoryScreenProps = StackScreenProps<MainNavigatorParamList, "CreateCategoryScreen">;

export type CreateRecordScreenProps = StackScreenProps<MainNavigatorParamList, "CreateRecordScreen">;

export type ViewRecordScreenProps = StackScreenProps<MainNavigatorParamList, "ViewRecordScreen">;

export type ViewDatabaseScreenProps = StackScreenProps<MainNavigatorParamList, "ViewDatabaseScreen">;

export type SelectParticipantForGroupProps = StackScreenProps<MainNavigatorParamList, "SelectParticipantForGroup">;

export type UserPrivacySettingsProps = StackScreenProps<MainNavigatorParamList, "UserPrivacySettings">;

export type CreateChatRoomsProps = StackScreenProps<MainNavigatorParamList, "CreateChatRooms">;

export type SubTopicsScreenProps = StackScreenProps<MainNavigatorParamList, "SubTopicScreen">;

export type ViewTopicsScreenProps = StackScreenProps<MainNavigatorParamList, "ViewTopicsScreen">;

export type CreateTopicsScreenProps = StackScreenProps<MainNavigatorParamList, "CreateTopicsScreen">;

export type CalenderNotificationsProps = StackScreenProps<MainNavigatorParamList, "CalenderNotifications">;

export type ViewScheduleMessageProps = StackScreenProps<MainNavigatorParamList, "ViewScheduleMessage">;

export type ViewScheduleAttachmentProps = StackScreenProps<MainNavigatorParamList, "ViewScheduleAttachment">;

export type AttachmentViewScreenProps = StackScreenProps<MainNavigatorParamList, "AttachmentViewScreen">;

export type ViewReminderScreenProps = StackScreenProps<MainNavigatorParamList, "ViewReminderScreen">;

export type CreateReminderScreenProps = StackScreenProps<MainNavigatorParamList, "CreateReminderScreen">;

export type CreateScheduleMessageProps = StackScreenProps<MainNavigatorParamList, "CreateScheduleMessage">;

export type SendContactScreenProps = StackScreenProps<MainNavigatorParamList, "SendContactScreen">;

export type ViewContactScreenProps = StackScreenProps<MainNavigatorParamList, "ViewContactScreen">;

export type ShowTopicMessagesScreenProps = StackScreenProps<MainNavigatorParamList, "ShowTopicMessagesScreen">;
export type ShowMessageTopicsScreenProps = StackScreenProps<MainNavigatorParamList, "ShowMessageTopicsScreen">;
export type AddMessageTopicsScreenProps = StackScreenProps<MainNavigatorParamList, "AddMessageTopicsScreen">;
export type BottomTabBarScreenProps = StackScreenProps<MainNavigatorParamList, "BottomTabScreen">;
export type ProfileScreenProps = StackScreenProps<MainNavigatorParamList, "ProfileScreen">;
export type ContactListScreenProps = StackScreenProps<MainNavigatorParamList, "ContactListScreen">;
export type CallParticipantSelectionScreenProps = StackScreenProps<
  MainNavigatorParamList,
  "CallParticipantSelectionScreen"
>;
export type CallHistoryScreenProps = StackScreenProps<MainNavigatorParamList, "CallHistoryScreen">;
export type EditProfileImageScreenProps = StackScreenProps<MainNavigatorParamList, "EditProfileImageScreen">;
export type SelectChatRoomScreenProps = StackScreenProps<MainNavigatorParamList, "SelectChatRoomScreen">;
export type ChatMessageScreenProps = StackScreenProps<MainNavigatorParamList, "ChatMessageScreen">;
export type SelectContactScreenProps = StackScreenProps<MainNavigatorParamList, "SelectContactScreen">;
export type FolderListScreenProps = StackScreenProps<MainNavigatorParamList, "FolderListScreen">;
export type CreateFolderScreenProps = StackScreenProps<MainNavigatorParamList, "CreateFolderScreen">;

export type ForwardMessageScreenProps = StackScreenProps<MainNavigatorParamList, "ForwardMessageScreen">;
export type ArchiveChatListScreenProps = StackScreenProps<MainNavigatorParamList, "ArchiveChatListScreen">;
export type ChatProfileScreenProps = StackScreenProps<MainNavigatorParamList, "ChatProfileScreen">;
export type CreateGroupScreenProps = StackScreenProps<MainNavigatorParamList, "CreateGroupScreen">;
export type ChatGlobalSearchScreenProps = StackScreenProps<MainNavigatorParamList, "ChatGlobalSearchScreen">;
export type ChatMediaScreenProps = StackScreenProps<MainNavigatorParamList, "ChatMediaScreen">;
export type ChatMessageInfoScreenProps = StackScreenProps<MainNavigatorParamList, "ChatMessageInfoScreen">;
export type FavoriteChatMessageScreenProps = StackScreenProps<MainNavigatorParamList, "FavoriteChatMessageScreen">;
export type CommonChatListScreenProps = StackScreenProps<MainNavigatorParamList, "CommonChatListScreen">;
export type ChatWallPaperAndSoundScreenProps = StackScreenProps<MainNavigatorParamList, "ChatWallPaperAndSoundScreen">;
export type ChatSoundSelectionScreenProps = StackScreenProps<MainNavigatorParamList, "ChatSoundSelectionScreen">;
export type ChatDisappearSettingScreenProps = StackScreenProps<MainNavigatorParamList, "ChatDisappearSettingScreen">;
export type ChatContactDetailsScreenProps = StackScreenProps<MainNavigatorParamList, "ChatContactDetailsScreen">;
export type GroupChatSettingScreenProps = StackScreenProps<MainNavigatorParamList, "GroupChatSettingScreen">;
export type ChatDescriptionScreenProps = StackScreenProps<MainNavigatorParamList, "ChatDescriptionScreen">;
export type AddChatAdminScreenProps = StackScreenProps<MainNavigatorParamList, "AddChatAdminScreen">;
export type ChatRoomSettingScreenProps = StackScreenProps<MainNavigatorParamList, "ChatRoomSettingScreen">;
export type EditChatParticipantScreenProps = StackScreenProps<MainNavigatorParamList, "EditChatParticipantScreen">;
export type AssignmentChatScreenProps = StackScreenProps<MainNavigatorParamList, "AssignmentChatScreen">;
export type ReportScreenProps = StackScreenProps<MainNavigatorParamList, "ReportScreen">;
export type OrganisationInvitesProps = StackScreenProps<MainNavigatorParamList, "OrganisationInvites">;
export type AssignmentNotificationScreenProps = StackScreenProps<
  MainNavigatorParamList,
  "AssignmentNotificationScreen"
>;
export type TimezoneMismatchProps = StackScreenProps<MainNavigatorParamList, "TimezoneMismatch">;
export type UserProfileScreenProps = StackScreenProps<MainNavigatorParamList, "UserProfileScreen">;

export type TaskTabNavigatorParamList = {
  AssignmentsHomeScreen: undefined;
  MyReportsScreen: undefined;
};

export type AssignmentsHomeScreenProps = MaterialTopTabBarProps;
export type MyReportsScreenProps = MaterialTopTabBarProps;

export type ChatStackParamList = {
  ChatListScreen: undefined;
};

export type ChatListScreenProps = StackScreenProps<ChatStackParamList, "ChatListScreen">;

export type CallTabStackParamsList = {
  AllCallListScreen: undefined;
  MissedCallListScreen: undefined;
};

export type AllCallListScreenProps = StackScreenProps<CallTabStackParamsList, "AllCallListScreen">;
export type MissedCallListScreenProps = StackScreenProps<CallTabStackParamsList, "MissedCallListScreen">;

export type BottomTabParamsList = {
  TaskTabScreen: undefined;
  ChatTabScreen: undefined;
  CallTabScreen: undefined;
  CalendarTabScreen: undefined;
};

export type TaskTabScreenProps = BottomTabScreenProps<BottomTabParamsList, "TaskTabScreen">;
export type ChatTabScreenProps = BottomTabScreenProps<BottomTabParamsList, "ChatTabScreen">;
export type CallTabScreenProps = BottomTabScreenProps<BottomTabParamsList, "CallTabScreen">;

export type BroadcastParticipantProps = StackScreenProps<MainNavigatorParamList, "BroadcastParticipant">;
export type PrivacyProps = StackScreenProps<MainNavigatorParamList, "Privacy">;
