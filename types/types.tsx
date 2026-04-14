/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ContactDetailsDto, Scalars } from "@/graphql/generated/types";
import { AssignmentProps, ReportProps } from "@/navigation/screenPropsTypes";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends RootStackParamList {}
  }
}
export interface ReduxChat {
  Chat: {
    GetAllRoomsData?: [];
    UsersList?: [];
    formatedUserList: [];
    MyProfile?: {};
    GetAllChatsById: [];
    OnlineOfflineStatus?: [];
    FolderDataList?: [];
    GetOtherChats?: [];
    RoomMediaData?: [];
    GetFavoriteChat?: [];
    GetChatsInCommonList?: [];
    GroupMessagePermissoinData?: [];
    PinChat?: [];
    ListOfParticipantsInGroup?: [];
    ActiveRoomData?: [];
    ContactInUserDevice?: [];
  };
}
export interface CommonUserList {
  _id: string;
  bio: string;
  firstName: string;
  lastName: string;
  username?: string;
  lastSeen: string;
  phone: string;
  profile_img: string;
  status: string;
}
[];
export interface AllroomsDataType {
  // [index: number]: {
  type?: string;
  _id?: string;
  access?: [{ permit: string; type: string }];
  archivedBy?: [];
  bio?: { status: string; time: null | string };
  cameraRollOffBy?: [];
  fixedBy?: string;
  key?: string;
  last_msg?: [{ created_at: string | number; message: string }];
  mutedBy?: [];
  name?: string;
  unreadBy?: [];
  profile_img?: string;
  participants?: [
    {
      added_at?: number | string;
      firstName?: string;
      lastName?: string;
      left_at?: null | string;
      phone?: string;
      profile_img?: string;
      sound?: string;
      user_id?: string;
      user_type?: string;
      wallpaper?: null | string;
    }
  ];
  // };
}
export interface MyProfileInterface {
  _id: string;
  blockedRooms: [{ room_Id: string; time: string }];
  firstName: string;
  folders: [
    { key: number; name: string; roomId: []; lastName: string; lastSeen: string; phone: string; profile_img: string }
  ];
}
export interface GroupSettingPermission {
  EditInfoPermission: { permit: UserType; type: string };
  PinPermission: { permit: string; type: string };
  SendMessagePermission: { permit: string; type: string };
}
export interface ReduxCommon {
  Common: {
    OnlineOfflineStatus?: [];
    lastMessage?: "";
  };
}
export enum UserType {
  admin = "admin",
  common = "common",
}

export enum LastMessageType {
  createdRoom = "createdRoom",
  changedName = "changedName",
  changedPicture = "changedPicture",
  // leftRoom = "leftRoom",
  changedDescription = "changedDescription",
  chatDisappear = "chatDisappear",
  // invited="invited",
  // declined = "declined",
  // taskAssigned = "taskAssigned"

  // contact = "contact",
}

export enum SingleUserAction {
  createdRoom = "createdRoom",
  changedName = "changedName",
  changedPicture = "changedPicture",
  leftRoom = "leftRoom",
  changedDescription = "changedDescription",
  chatDisappear = "chatDisappear",
  audioCall = "audioCall",
  videoCall = "videoCall",
  taskAssigned = "taskAssigned",

  // contact = "contact",
}
export enum DoubleUserAction {
  addedUser = "addedUser",
  removedUser = "removedUser",
  invited = "invited",
  declined = "declined",
  taskAssigned = "taskAssigned",
  // videoCall = "videoCall"
}
export type TaskDocumentPickerTypes = {
  /**
   * URI to the local image or video file (usable as the source of an `Image` element, in the case of
   * an image) and `width` and `height` specify the dimensions of the media.
   */
  uri: string;
  /**
   * The unique ID that represents the picked image or video, if picked from the library. It can be used
   * by [expo-media-library](./media-library) to manage the picked asset.
   *
   * > This might be `null` when the ID is unavailable or the user gave limited permission to access the media library.
   * > On Android, the ID is unavailable when the user selects a photo by directly browsing file system.
   *
   * @platform ios
   * @platform android
   */
  assetId?: string | null;
  /**
   * Width of the image or video.
   */
  width: number;
  /**
   * Height of the image or video.
   */
  height: number;
  /**
   * The type of the asset.
   */
  type?:
    | "image"
    | "video"
    | "application/pdf"
    | "application/msword"
    | "application/msword"
    | "com.microsoft.excel.xls";

  name?: string | null;

  fileSize?: number;

  exif?: Record<string, any> | null;

  base64?: string | null;

  duration?: number | null;
};
export interface RangeExpressionsCustomExpTypes {
  operator: string;
  value: string;
  gate: string;
}
export interface approvedType {
  organizationId: string;
  reportId: String;
  taskId: string;
}
export enum DocsTypes {
  pptx = "pptx",
  ppt = "ppt",
  pdf = "pdf",
  docx = "docx",
  csv = "csv",
  xls = "xls",
  doc = "doc",
  pages = "pages",
  numbers = "numbers",
  key = "key",
  txt = "txt",
}
export enum BlockExtention {
  dmg = "dmg",
  exe = "exe",
  sh = "sh",
  app = "app",
  msi = "msi",
  bat = "bat",
  com = "com",
  jar = "jar",
  py = "py",
  rb = "rb",
  pl = "pl",
  r = "r",
  csh = "csh",
  js = "js",
  vbs = "vbs",
  wsf = "wsf",
}
export enum PlayerType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
}
export enum Hidemessage {
  clear = "clear",
  me = "me",
  disappear = "disappear",
}
export enum ImagePhoto {
  IMAGE = "IMAGE",
  PHOTO = "PHOTO",
}
export enum MediaLinkDocsType {
  IMAGE = "IMAGE",
  Link = "Link",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  PDF = "PDF",
  APPLICATION = "APPLICATION",
}

export type CreateCallDto = {
  channelName: Scalars["String"];
  origin: Scalars["String"];
  participants: Array<Scalars["String"]>;
  type: Scalars["String"];
};
export enum ScreensList {
  OrganisationInvites = "Organisation-Invites",
  ProfileSetting = "profile-setting",
  CallHistoryDetails = "call-history_details",
  Root = "root",
  SignIn = "sign-in",
  SignUp = "sign-up",
  Confirm = "confirm",
  ResetPassword = "reset-password",
  ForgotPassword = "forgot-password",
  Modal = "modal",
  NotFound = "not-found",
  Organizations = "organizations",
  Terms = "terms",
  Assigned = "assigned",
  AssignedTask = "assigned-task",
  MyReports = "my-reports",
  Report = "report",
  Goals = "Goals",
  Tasks = "Tasks",
  Chats = "Chats",
  Calls = "Calls",
  Account = "account",
  AccountSettings = "account-settings",
  Contacts = "contacts",
  Folders = "Folder",
  NewFolder = "NewFolder",
  SelectGroups = "SelectGroups",
  GlobalSearch = "Global-Search",
  ChatMessage = "Chat-Message",
  ForwardMessage = "Forward-Message",
  ArchiveMessage = "Archive-Message",
  ProfileInfo = "ProfileInfo",
  CreateGroupProfile = "CreateGroupProfile",
  MediaLinkAndDocs = "Media-Link-and-Docs",
  ChatMessageInfo = "ChatMessageInfo",
  FavoriteChats = "FavoriteChats",
  GroupsInCommon = "GroupsInCommon",
  Disappear = "Disappear",
  ContactDetails = "ContactDetails",
  GroupChatSetting = "GroupChatSetting",
  AddAdmin = "AddAdmin",
  AddorRemoveParticipants = "AddorRemoveParticipants",
  AddToRooms = "AddToRooms",
  GroupDescription = "GroupDescription",
  WallpaperAndSound = "WallpaperAndSound",
  ALL = "ALL",
  MISSED = "MISSED",
  NewCall = "newCall",
  GroupCall = "groupCall",
  Call = "call",
  CallParticipants = "callParticipants",
  Sound = "Sound",
  ChatsScreen = "ChatsScreen",
}
export type ContactInfo = {
  _id: string | number;
  firstName: string;
  lastName: string;
  profile_img: string;
  hasComon:boolean
  phone:string
  groupedContact?:ContactDetailsDto[]
};

export type RootStackParamList = {
  [ScreensList.Root]: NavigatorScreenParams<RootTabParamList> | undefined;
  [ScreensList.CallHistoryDetails]: { userDetails: {}; categoryId?: string };
  [ScreensList.SignIn]: { showModal: boolean } | undefined;
  [ScreensList.SignUp]: undefined;
  [ScreensList.Confirm]: undefined;
  [ScreensList.ResetPassword]: { token: string } | undefined;
  [ScreensList.ForgotPassword]: undefined;
  [ScreensList.Modal]: undefined;
  [ScreensList.NotFound]: undefined;
  [ScreensList.Organizations]: undefined;

  [ScreensList.Terms]: { phone?: string };
  [ScreensList.ProfileSetting]: undefined;
  [ScreensList.Assigned]: undefined;
  [ScreensList.AssignedTask]: AssignmentProps;
  [ScreensList.MyReports]: undefined;
  [ScreensList.Report]: ReportProps;
  [ScreensList.Goals]: undefined;
  [ScreensList.Tasks]: undefined;
  [ScreensList.Chats]: undefined;
  [ScreensList.Calls]: undefined;
  [ScreensList.Account]: undefined;
  [ScreensList.Contacts]: undefined;
  [ScreensList.Folders]: undefined;
  [ScreensList.NewFolder]: undefined;
  [ScreensList.SelectGroups]: undefined;
  [ScreensList.GlobalSearch]: undefined;
  [ScreensList.GlobalSearch]: undefined;
  [ScreensList.ChatMessage]: { RoomId?: string; Pid?: string; CreateRoom: boolean; Name: string; UserImage: string };
  [ScreensList.ForwardMessage]: undefined;
  [ScreensList.ArchiveMessage]: undefined;
  [ScreensList.CreateGroupProfile]: { CreateGroup: boolean; Name: string };
  [ScreensList.ChatMessageInfo]: undefined;
  [ScreensList.FavoriteChats]: undefined;
  [ScreensList.GroupsInCommon]: undefined;
  [ScreensList.Disappear]: undefined;
  [ScreensList.ContactDetails]: undefined;
  [ScreensList.GroupChatSetting]: undefined;
  [ScreensList.AddAdmin]: undefined;
  [ScreensList.AddorRemoveParticipants]: undefined;
  [ScreensList.AddToRooms]: undefined;
  [ScreensList.GroupDescription]: undefined;
  [ScreensList.Call]: {
    ProfileImage: String;
    callId: string;
    token: string;
    channelId: string;
    callType: string;
    uid: number;
    participantsUidData: {
      [keyName: number]: { name: string; _id: string };
    };
    ParticipantsDetails: {};
  };
  [ScreensList.CallParticipants]: {
    callId: string;
    token: string;
    channelId: string;
    callType: string;
    uid: number;
    participantsUidData: {
      [keyName: number]: { name: string; _id: string };
    };
  };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;
export interface ReduxVideo {
  Video: {
    CallParticipantsData?: {};
  };
}
export type RootTabParamList = {
  [ScreensList.Root]: undefined;
  [ScreensList.SignIn]: { showModal: boolean } | undefined;
  [ScreensList.SignUp]: undefined;
  [ScreensList.Confirm]: undefined;
  [ScreensList.ResetPassword]: { token: string } | undefined;
  [ScreensList.ForgotPassword]: undefined;
  [ScreensList.Assigned]: undefined;
  [ScreensList.Goals]: undefined;
  [ScreensList.Tasks]: undefined;
  [ScreensList.Calls]: undefined;
};

export type RootTabScreenProps = any;
