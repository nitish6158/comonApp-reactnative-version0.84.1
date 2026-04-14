import * as Types from "./types";

import { gql } from "@apollo/client";
import { AssignmentDetailsFragmentDoc } from "./fragments.generated";
import { ScenarioDetailsFragmentDoc } from "./scenario.generated";
import { PaginatedAssignmentDetailsFragmentDoc } from "./fragments.generated";
import * as Apollo from "@apollo/client";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  Upload: any;
};

export type ActionDto = {
  action: Scalars["Boolean"];
};

export type Activity = {
  __typename?: "Activity";
  _id: Scalars["ID"];
  lastSeen: Scalars["Float"];
  roomId: Scalars["String"];
  user_id: Scalars["String"];
};

export type AddMembersInputDto = {
  assignType: Scalars["String"];
  assignmentId?: InputMaybe<Scalars["String"]>;
  masterOrg: Scalars["String"];
  members: Array<MembersDetailInput>;
  organizationId: Scalars["String"];
  scenarioId: Scalars["String"];
  scenarioName: Scalars["String"];
};

export type AddMsgToTopicInputDto = {
  chatId: Scalars["String"];
  roomId: Scalars["String"];
  topicId: Scalars["String"];
};

export type AddParticipantsDto = {
  callId: Scalars["String"];
  participants: Array<Scalars["String"]>;
};

export type AddTaskDto = {
  address?: InputMaybe<Scalars["String"]>;
  assignTo?: InputMaybe<Array<Scalars["String"]>>;
  attachment?: InputMaybe<AttachementDto>;
  content?: InputMaybe<Scalars["String"]>;
  edges?: InputMaybe<Array<CreateEdgeDto>>;
  isPostponeApproval?: Scalars["Boolean"];
  isPostponeRequestApproved?: Scalars["Boolean"];
  isPostponeRequestRejected?: Scalars["Boolean"];
  isPostponeRequestSent?: Scalars["Boolean"];
  isTaskPostponed?: Scalars["Boolean"];
  label: Scalars["String"];
  lat?: InputMaybe<Scalars["Float"]>;
  long?: InputMaybe<Scalars["Float"]>;
  measurement?: InputMaybe<MeasurementDto>;
  mediaDuration?: InputMaybe<Scalars["Float"]>;
  mediaQuality?: InputMaybe<MediaQuality>;
  mediaType?: InputMaybe<MediaType>;
  member?: InputMaybe<Scalars["String"]>;
  nextPrompt?: InputMaybe<NextPromptDto>;
  notifyTo?: InputMaybe<Array<NotifyToInputDto>>;
  numberType?: InputMaybe<NumberTypeDto>;
  orgId: Scalars["String"];
  position?: InputMaybe<PositionDto>;
  postponeTime?: InputMaybe<Scalars["String"]>;
  radius?: InputMaybe<Scalars["String"]>;
  rangeExpression?: InputMaybe<RangeExpressionDto>;
  remindEvery?: InputMaybe<Scalars["Float"]>;
  saveUserLocation?: InputMaybe<Scalars["Boolean"]>;
  scenarioId: Scalars["String"];
  signature: Scalars["Boolean"];
  subType?: InputMaybe<Scalars["String"]>;
  timeout?: InputMaybe<Scalars["Float"]>;
  type: Scalars["String"];
  width?: InputMaybe<Scalars["Float"]>;
};

export type AddTaskResultDto = {
  attachmentId?: InputMaybe<Scalars["String"]>;
  content: Scalars["String"];
  edgeId: Scalars["String"];
  label: Scalars["String"];
  lat?: InputMaybe<Scalars["String"]>;
  long?: InputMaybe<Scalars["String"]>;
  orgId: Scalars["String"];
  reportId: Scalars["String"];
  result: Scalars["String"];
  resultAttachment?: InputMaybe<Scalars["String"]>;
  signatureAttachment?: InputMaybe<Scalars["String"]>;
  targetTaskId?: InputMaybe<Scalars["String"]>;
  taskId?: InputMaybe<Scalars["String"]>;
  type: TaskTypes;
};

export type AppointmentInput = {
  From?: InputMaybe<Scalars["String"]>;
  To?: InputMaybe<Scalars["String"]>;
  allOccurrence?: InputMaybe<Scalars["Boolean"]>;
  approvalReminderTime?: InputMaybe<Array<AprovalReminderTimeInput>>;
  attachment?: InputMaybe<Array<AgendaAttachmentInput>>;
  date?: InputMaybe<Scalars["String"]>;
  daylyParams?: InputMaybe<DaylyParamsInput>;
  description?: InputMaybe<Scalars["String"]>;
  endDate?: InputMaybe<Scalars["String"]>;
  endTime?: InputMaybe<Scalars["String"]>;
  hasComon?: InputMaybe<Scalars["Boolean"]>;
  isAllDay?: InputMaybe<Scalars["Boolean"]>;
  isConfirmationNeeded?: InputMaybe<Scalars["Boolean"]>;
  location?: InputMaybe<LocationTypes>;
  monthlyParams?: InputMaybe<MonthlyParamsInputForReminder>;
  parent_id?: InputMaybe<Scalars["String"]>;
  participants?: InputMaybe<Array<ParticipantInput>>;
  recursive?: InputMaybe<RecurrentTypes>;
  roomId?: InputMaybe<Scalars["String"]>;
  roomType?: InputMaybe<Scalars["String"]>;
  startDate?: InputMaybe<Scalars["String"]>;
  startTimeInMs?: InputMaybe<Scalars["Float"]>;
  thisOccurrence?: InputMaybe<Scalars["Boolean"]>;
  time?: InputMaybe<Scalars["String"]>;
  title?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<EventType>;
};

export type ApproveTaskDto = {
  orgId: Scalars["String"];
  reportId: Scalars["String"];
  taskId: Scalars["String"];
};

export type AprovalReminderTimeInput = {
  Count: Scalars["Float"];
  Unit?: InputMaybe<AprovalReminderTimeTypes>;
  _id?: InputMaybe<Scalars["String"]>;
};

export type AprovalReminderTimeSchema = {
  __typename?: "AprovalReminderTimeSchema";
  Count: Scalars["Float"];
  Unit?: Maybe<AprovalReminderTimeTypes>;
  _id?: Maybe<Scalars["String"]>;
};

/** Aproval Reminder Time Type. */
export enum AprovalReminderTimeTypes {
  /** DAY */
  Day = "DAY",
  /** HOUR */
  Hour = "HOUR",
  /** MINUTE */
  Minute = "MINUTE",
  /** WEEK */
  Week = "WEEK",
}

export type ArchiveTaskInputDto = {
  _id: Scalars["String"];
  archiveType: ArchiveType;
  orgId: Scalars["String"];
};

export type ArchivedBy = {
  __typename?: "ArchivedBy";
  archived_at: Scalars["Float"];
  user_id: Scalars["String"];
};

/** Assignment type */
export enum AssignType {
  /** GROUP */
  Group = "GROUP",
  /** INDIVIDUAL */
  Individual = "INDIVIDUAL",
}

export type Assignment = {
  __typename?: "Assignment";
  _id: Scalars["ID"];
  activeReportId?: Maybe<Scalars["String"]>;
  assignBy?: Maybe<User>;
  assignType?: Maybe<AssignType>;
  completeTime?: Maybe<Scalars["Float"]>;
  dateTimeInput?: Maybe<Array<DateTimeSchema>>;
  daylyParams?: Maybe<DaylyParams>;
  end?: Maybe<Scalars["Float"]>;
  fromUser?: Maybe<User>;
  members: Array<MembersDetail>;
  montlyParams?: Maybe<MonthlyParams>;
  organizationId?: Maybe<Scalars["String"]>;
  periodical?: Maybe<Scalars["Float"]>;
  recurrent?: Maybe<RecurrentTypes>;
  reportsCount: Scalars["Float"];
  scenario?: Maybe<Scenario>;
  start?: Maybe<Scalars["Float"]>;
  startTimeInMs?: Maybe<Scalars["Float"]>;
  toUser?: Maybe<User>;
  type: AssignmentType;
};

/** Assignment Type */
export enum AssignmentType {
  /** Draft assignment */
  Draft = "DRAFT",
  /** Master assignment */
  Master = "MASTER",
  /** Published assignment */
  Published = "PUBLISHED",
}

export type AssignmentsInputDto = {
  category?: InputMaybe<Scalars["String"]>;
  language?: InputMaybe<Scalars["String"]>;
  limit: Scalars["Float"];
  organizationId: Scalars["String"];
  search?: InputMaybe<Scalars["String"]>;
  skip: Scalars["Float"];
  sort?: InputMaybe<Scalars["String"]>;
};

export type AttachementDto = {
  attachment: Scalars["String"];
  type: AttachmentType;
};

export type Attachment = {
  __typename?: "Attachment";
  attachment?: Maybe<StorageItem>;
  type?: Maybe<AttachmentType>;
};

/** Attachement type. */
export enum AttachmentType {
  /** AUDIO */
  Audio = "AUDIO",
  /** DOCUMENT */
  Document = "DOCUMENT",
  /** Photo */
  Photo = "PHOTO",
  /** RECORD */
  Record = "RECORD",
  /** Video */
  Video = "VIDEO",
}

export type BackupFile = {
  __typename?: "BackupFile";
  db?: Maybe<FileDetails>;
  shm?: Maybe<FileDetails>;
  wal?: Maybe<FileDetails>;
};

export type BasicResponce = {
  __typename?: "BasicResponce";
  message?: Maybe<Scalars["String"]>;
  success: Scalars["Boolean"];
};

export type BasicResponceSurvey = {
  __typename?: "BasicResponceSurvey";
  message?: Maybe<Scalars["String"]>;
  success: Scalars["Boolean"];
  surveyId?: Maybe<Scalars["String"]>;
};

export type Bio = {
  __typename?: "Bio";
  status?: Maybe<Scalars["String"]>;
  time?: Maybe<Scalars["Float"]>;
};

export type BioDto = {
  __typename?: "BioDto";
  status?: Maybe<Scalars["String"]>;
  time?: Maybe<Scalars["Float"]>;
};

export type BioDtoForUpdate = {
  status?: InputMaybe<Scalars["String"]>;
  time?: InputMaybe<Scalars["Float"]>;
};

export type BlockedContact = {
  __typename?: "BlockedContact";
  _id: Scalars["ID"];
  pid: Scalars["String"];
  userId: Scalars["String"];
};

export type BlockedRoom = {
  __typename?: "BlockedRoom";
  blocked_at: Scalars["Float"];
  pid: Scalars["String"];
  reason?: Maybe<Scalars["String"]>;
  room_Id: Scalars["String"];
};

export type Call = {
  __typename?: "Call";
  Screen_status?: Maybe<Scalars["String"]>;
  _id: Scalars["ID"];
  callEndedAt?: Maybe<Scalars["String"]>;
  callStartedAt: Scalars["String"];
  callStatus: Scalars["String"];
  categoryId: Scalars["String"];
  channelName: Scalars["String"];
  duration: Scalars["Float"];
  origin: User;
  participants: Array<User>;
  roomId?: Maybe<ChatRoom>;
  roomType: Scalars["String"];
  sharer_uid?: Maybe<Scalars["String"]>;
  type: Scalars["String"];
};

export type CallByChannelName = {
  channelName: Scalars["String"];
};

export type CallCalled = {
  __typename?: "CallCalled";
  Screen_status?: Maybe<Scalars["String"]>;
  _id: Scalars["ID"];
  _v: Scalars["String"];
  callEndedAt?: Maybe<Scalars["String"]>;
  callParticipants: Array<ParticipantType>;
  callStartedAt: Scalars["String"];
  callStatus: Scalars["String"];
  categoryId: Scalars["String"];
  channelName: Scalars["String"];
  duration: Scalars["Float"];
  origin: User;
  participants: Array<User>;
  roomId?: Maybe<ChatRoom>;
  roomType: Scalars["String"];
  sharer_uid?: Maybe<Scalars["String"]>;
  type: Scalars["String"];
};

export type CallHistories = {
  __typename?: "CallHistories";
  callEndedAt?: Maybe<Scalars["Float"]>;
  callJoinedAt?: Maybe<Scalars["Float"]>;
};

export type CallHistory = {
  __typename?: "CallHistory";
  callEndedAt?: Maybe<Scalars["String"]>;
  callJoinedAt: Scalars["String"];
};

export type CallListWithAParticipantDto = {
  categoryId: Scalars["String"];
  skip: Scalars["Float"];
  take: Scalars["Float"];
};

export type CallLists = {
  __typename?: "CallLists";
  _v: Scalars["Float"];
  callEndedAt?: Maybe<Scalars["Float"]>;
  callParticipants: Array<ParticipantType>;
  callStartedAt: Scalars["Float"];
  callStatus?: Maybe<Scalars["String"]>;
  categoryId?: Maybe<Scalars["String"]>;
  channelName: Scalars["String"];
  origin: User;
  roomId?: Maybe<ChatRoomDetails>;
  roomType?: Maybe<Scalars["String"]>;
  type: Scalars["String"];
};

export type CallStatusChangeDto = {
  callId: Scalars["String"];
  device?: Scalars["String"];
  status: Scalars["String"];
  userId?: InputMaybe<Scalars["String"]>;
};

export type CallWithParticipant = {
  __typename?: "CallWithParticipant";
  _id: Scalars["ID"];
  callEndedAt?: Maybe<Scalars["Float"]>;
  callParticipants: Array<ParticipantTypes>;
  callStartedAt: Scalars["Float"];
  categoryId: Scalars["String"];
  channelName: Scalars["String"];
  duration: Scalars["Float"];
  origin: User;
  participants: Array<User>;
  roomId?: Maybe<Scalars["String"]>;
  roomType: Scalars["String"];
  type: Scalars["String"];
};

export type CallWithToken = {
  __typename?: "CallWithToken";
  call: CallCalled;
  token: Scalars["String"];
};

export type CameraRollOffBy = {
  __typename?: "CameraRollOffBy";
  created_at: Scalars["Float"];
  user_id: Scalars["String"];
};

export type ChannelStatusInput = {
  callId: Scalars["String"];
  channelName: Scalars["String"];
};

export type ChatFileData = {
  __typename?: "ChatFileData";
  filename: Scalars["String"];
  type: Scalars["String"];
};

export type ChatFileUploadResponse = {
  __typename?: "ChatFileUploadResponse";
  data: ChatFileData;
  thumbnail?: Maybe<ChatFileData>;
};

export type ChatRoom = {
  __typename?: "ChatRoom";
  _id: Scalars["ID"];
  access: Array<RoomAccess>;
  archivedBy: Array<ArchivedBy>;
  bio: RoomBio;
  blocked?: Maybe<Scalars["Boolean"]>;
  cameraRollOffBy: Array<CameraRollOffBy>;
  created_at: Scalars["Float"];
  deletedBy: Array<RoomDeletedBy>;
  disappearedOnBy: Array<DisappearedOnBy>;
  fixedBy: Array<FixedBy>;
  last_msg: Array<Last_Msg>;
  log?: Maybe<Logs>;
  mutedBy: Array<MutedBy>;
  name: Scalars["String"];
  organization?: Maybe<Scalars["String"]>;
  participantIds: Scalars["String"];
  participants: Array<Participants>;
  pin_count: Scalars["Float"];
  profile_img: Scalars["String"];
  receipts: Array<ReadReceipts>;
  ringtone: Array<Ringtone>;
  type: Scalars["String"];
  unreadBy: Array<UnreadBy>;
};

export type ChatRoomDetails = {
  __typename?: "ChatRoomDetails";
  _id?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  profile_img?: Maybe<Scalars["String"]>;
  type?: Maybe<Scalars["String"]>;
};

export type Chats = {
  __typename?: "Chats";
  chatId: Scalars["String"];
  message: Message;
  roomId: PartialRoom;
  sender: PartialUser;
  toUser?: Maybe<PartialUser>;
};

export type CheckOrgLinkInput = {
  link: Scalars["String"];
};

export type CheckValidDateResponse = {
  __typename?: "CheckValidDateResponse";
  isCorrectTime: Scalars["Boolean"];
};

export type Client = {
  __typename?: "Client";
  _id: Scalars["ID"];
  address: Scalars["String"];
  comments?: Maybe<Scalars["String"]>;
  email: Scalars["String"];
  lat: Scalars["String"];
  long: Scalars["String"];
  name: Scalars["String"];
  organizationId: Scalars["String"];
  phone: Scalars["String"];
};

export type ClientInput = {
  limit: Scalars["Float"];
  organizationId: Scalars["String"];
  search?: InputMaybe<Scalars["String"]>;
  skip: Scalars["Float"];
  sort?: InputMaybe<Scalars["String"]>;
};

export type CloneTemplateDto = {
  _id: Scalars["String"];
  assignmentId?: InputMaybe<Scalars["String"]>;
  description: Scalars["String"];
  name: Scalars["String"];
  orgId?: InputMaybe<Scalars["String"]>;
  ownerMemberId?: InputMaybe<Scalars["String"]>;
  toUser?: InputMaybe<Scalars["String"]>;
};

export type CommonRoom = {
  __typename?: "CommonRoom";
  _id: Scalars["String"];
  bio: BioDto;
  created_at: Scalars["Float"];
  last_msg: Array<LastMsg>;
  name: Scalars["String"];
  participants: Array<Participants>;
  profile_img: Scalars["String"];
  type: Scalars["String"];
};

export type CompleteReportsInputDto = {
  _id: Scalars["String"];
  orgId: Scalars["String"];
  signature?: InputMaybe<Scalars["String"]>;
};

export type ConfirmAccountDeleteInput = {
  code: Scalars["String"];
};

export type ConfirmEmailInput = {
  confirmToken: Scalars["String"];
};

export type ConfirmPhoneInput = {
  code: Scalars["String"];
};

export type Contact = {
  firstName: Scalars["String"];
  id: Scalars["String"];
  lastName: Scalars["String"];
  numbers: Scalars["String"];
};

export type ContactDetailsDto = {
  __typename?: "ContactDetailsDto";
  additional?: Maybe<Scalars["String"]>;
  address?: Maybe<Scalars["String"]>;
  blocked?: Maybe<Scalars["Boolean"]>;
  city?: Maybe<Scalars["String"]>;
  country?: Maybe<Scalars["String"]>;
  dob?: Maybe<Scalars["DateTime"]>;
  email?: Maybe<Scalars["String"]>;
  firstName?: Maybe<Scalars["String"]>;
  gender?: Maybe<Scalars["String"]>;
  hasComon?: Maybe<Scalars["Boolean"]>;
  hasInvited?: Maybe<Scalars["Boolean"]>;
  invitedAt?: Maybe<Scalars["Float"]>;
  lastName?: Maybe<Scalars["String"]>;
  lastSeen?: Maybe<Scalars["Float"]>;
  localId: Scalars["String"];
  originalPhone: Scalars["String"];
  phone: Scalars["String"];
  prefix?: Maybe<Scalars["String"]>;
  region?: Maybe<Scalars["String"]>;
  status?: Maybe<Scalars["String"]>;
  street?: Maybe<Scalars["String"]>;
  suffix?: Maybe<Scalars["String"]>;
  userId?: Maybe<UserDetailsDto>;
  website?: Maybe<Scalars["String"]>;
};

export type ContactList = {
  __typename?: "ContactList";
  _id: Scalars["ID"];
  contacts: Array<Contacts>;
  device: Scalars["String"];
  userId: User;
};

export type ContactResponse = {
  __typename?: "ContactResponse";
  contacts?: Maybe<Array<ContactDetailsDto>>;
};

export type Contacts = {
  __typename?: "Contacts";
  additional: Scalars["String"];
  address: Scalars["String"];
  blocked?: Maybe<Scalars["Boolean"]>;
  city: Scalars["String"];
  country: Scalars["String"];
  dob: Scalars["DateTime"];
  email: Scalars["String"];
  firstName?: Maybe<Scalars["String"]>;
  gender: Scalars["String"];
  hasComon?: Maybe<Scalars["Boolean"]>;
  hasInvited?: Maybe<Scalars["Boolean"]>;
  invitedAt?: Maybe<Scalars["Float"]>;
  lastName?: Maybe<Scalars["String"]>;
  lastSeen: Scalars["Float"];
  localId: Scalars["String"];
  memberId?: Maybe<Scalars["String"]>;
  originalPhone?: Maybe<Scalars["String"]>;
  phone?: Maybe<Scalars["String"]>;
  prefix: Scalars["String"];
  region: Scalars["String"];
  status: Scalars["String"];
  street: Scalars["String"];
  suffix: Scalars["String"];
  userId?: Maybe<Scalars["String"]>;
  website: Scalars["String"];
};

export type Conversation = {
  __typename?: "Conversation";
  PinBy: Array<PinBy>;
  _id: Scalars["ID"];
  created_at: Scalars["Float"];
  deleted: Array<DeletedBy>;
  deliveredToIds: Scalars["String"];
  delivered_to: Array<DeliveredTo>;
  downloadBy: Array<DownloadBy>;
  duration?: Maybe<Scalars["Float"]>;
  favourite_by: Array<FavouriteBy>;
  fileURL: Scalars["String"];
  fontStyle: Scalars["String"];
  id_local?: Maybe<Scalars["String"]>;
  inviteStatus?: Maybe<Status>;
  isForwarded: Scalars["Boolean"];
  isSent: Scalars["Boolean"];
  message: Scalars["String"];
  readByIds: Scalars["String"];
  read_by: Array<ReadBy>;
  receipts: Scalars["Boolean"];
  refId?: Maybe<Scalars["String"]>;
  reply_msg?: Maybe<ReplyMessage>;
  roomId: Scalars["String"];
  sender: Scalars["String"];
  thumbnail: Scalars["String"];
  type: Scalars["String"];
  updated_at: Scalars["Float"];
};

export type ConversationWithIndex = {
  __typename?: "ConversationWithIndex";
  PinBy: Array<PinBy>;
  _id: Scalars["ID"];
  created_at: Scalars["Float"];
  deleted: Array<DeletedBy>;
  deliveredToIds: Scalars["String"];
  delivered_to: Array<DeliveredTo>;
  downloadBy: Array<DownloadBy>;
  duration?: Maybe<Scalars["Float"]>;
  favourite_by: Array<FavouriteBy>;
  fileURL: Scalars["String"];
  fontStyle: Scalars["String"];
  id_local?: Maybe<Scalars["String"]>;
  index: Scalars["Float"];
  inviteStatus?: Maybe<Status>;
  isForwarded: Scalars["Boolean"];
  isSent: Scalars["Boolean"];
  message: Scalars["String"];
  readByIds: Scalars["String"];
  read_by: Array<ReadBy>;
  receipts: Scalars["Boolean"];
  refId?: Maybe<Scalars["String"]>;
  reply_msg?: Maybe<ReplyMessage>;
  roomId: Scalars["String"];
  sender: Scalars["String"];
  thumbnail: Scalars["String"];
  type: Scalars["String"];
  updated_at: Scalars["Float"];
};

export type CreateAssignmentDto = {
  assignType?: InputMaybe<AssignType>;
  dateTimeInput?: InputMaybe<Array<DateTimeInput>>;
  daylyParams?: InputMaybe<DaylyParamsInput>;
  end?: InputMaybe<Scalars["Float"]>;
  members: Array<Members>;
  montlyParams?: InputMaybe<MonthlyParamsInput>;
  organizationId: Scalars["String"];
  periodical?: InputMaybe<Scalars["Float"]>;
  recurrent?: InputMaybe<RecurrentTypes>;
  scenarioId: Scalars["String"];
  start: Scalars["Float"];
  startTimeInMs: Scalars["Float"];
};

export type CreateCallDto = {
  channelName: Scalars["String"];
  origin: Scalars["String"];
  participants?: InputMaybe<Array<Scalars["String"]>>;
  roomId?: InputMaybe<Scalars["String"]>;
  roomType: Scalars["String"];
  type: Scalars["String"];
};

export type CreateClientInput = {
  address: Scalars["String"];
  comments?: InputMaybe<Scalars["String"]>;
  email: Scalars["String"];
  lat: Scalars["String"];
  long: Scalars["String"];
  name: Scalars["String"];
  organizationId: Scalars["String"];
  phone: Scalars["String"];
};

export type CreateEdgeDto = {
  label?: InputMaybe<Scalars["String"]>;
  location?: InputMaybe<Scalars["Boolean"]>;
  media?: InputMaybe<MediaType>;
  nextPrompt?: InputMaybe<NextPromptDto>;
  notifyTo?: InputMaybe<Array<NotifyToInputDto>>;
  options?: InputMaybe<Array<OptionEdgeDto>>;
  order?: InputMaybe<Scalars["Float"]>;
  signature: Scalars["Boolean"];
  targetTaskID?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<EdgeTypes>;
};

export type CreateEdgeDtoSurvey = {
  label?: InputMaybe<Scalars["String"]>;
  location?: InputMaybe<Scalars["Boolean"]>;
  media?: InputMaybe<MediaType>;
  nextPrompt?: InputMaybe<NextPromptDto>;
  notifyTo?: InputMaybe<Array<NotifyToInputDto>>;
  options?: InputMaybe<Array<OptionEdgeDto>>;
  order?: InputMaybe<Scalars["Float"]>;
  signature?: InputMaybe<Scalars["Boolean"]>;
  targetTaskID?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<EdgeTypes>;
};

export type CreateOrgInput = {
  description?: InputMaybe<Scalars["String"]>;
  link: Scalars["String"];
  masterOrg?: InputMaybe<Scalars["String"]>;
  name: Scalars["String"];
  parent?: InputMaybe<Scalars["String"]>;
};

export type CreateRecordInput = {
  _id?: InputMaybe<Scalars["String"]>;
  address?: InputMaybe<Scalars["String"]>;
  attachment?: InputMaybe<Array<Scalars["String"]>>;
  comment?: InputMaybe<Scalars["String"]>;
  company?: InputMaybe<Scalars["String"]>;
  customFields?: InputMaybe<Scalars["String"]>;
  email?: InputMaybe<Scalars["String"]>;
  firstName?: InputMaybe<Scalars["String"]>;
  isReminder?: InputMaybe<Scalars["Boolean"]>;
  landLine?: InputMaybe<Scalars["String"]>;
  lastName?: InputMaybe<Scalars["String"]>;
  mobile?: InputMaybe<Scalars["String"]>;
  parent?: InputMaybe<Scalars["String"]>;
  title: Scalars["String"];
  userId?: InputMaybe<Scalars["String"]>;
};

export type CreateRtmTokenDto = {
  channelName: Scalars["String"];
  type: Scalars["String"];
  uid: Scalars["Float"];
  userId?: InputMaybe<Scalars["String"]>;
};

export type CreateScenarioDto = {
  category?: InputMaybe<Scalars["String"]>;
  description?: InputMaybe<Scalars["String"]>;
  language?: InputMaybe<Scalars["String"]>;
  name: Scalars["String"];
  organizationId: Scalars["String"];
  type: ScenarioType;
};

export type CreateSmsInvite = {
  phone: Scalars["String"];
  region: Scalars["String"];
};

export type CreateSurveyEdgeDto = {
  label?: InputMaybe<Scalars["String"]>;
  location?: InputMaybe<Scalars["Boolean"]>;
  media?: InputMaybe<MediaType>;
  nextPrompt?: InputMaybe<NextPromptDto>;
  notifyTo?: InputMaybe<Array<SurveyNotifyToInputDto>>;
  options?: InputMaybe<Array<SurveyOptionEdgeDto>>;
  order?: InputMaybe<Scalars["Float"]>;
  signature?: InputMaybe<Scalars["Boolean"]>;
  targetTaskID?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<EdgeTypes>;
};

export type CustomExpression = {
  __typename?: "CustomExpression";
  id?: Maybe<Scalars["String"]>;
  location: Scalars["Boolean"];
  media?: Maybe<MediaType>;
  message?: Maybe<Scalars["String"]>;
  notifyTo?: Maybe<Array<NotifyTo>>;
  signature: Scalars["Boolean"];
  value?: Maybe<Scalars["String"]>;
};

export type CustomExpressionInput = {
  id?: InputMaybe<Scalars["String"]>;
  location: Scalars["Boolean"];
  media?: InputMaybe<MediaType>;
  message: Scalars["String"];
  notifyTo?: InputMaybe<Array<NotifyToInputDto>>;
  signature: Scalars["Boolean"];
  value: Scalars["String"];
};

export type DateTimeInput = {
  date?: InputMaybe<Scalars["String"]>;
  time?: InputMaybe<Scalars["String"]>;
};

export type DateTimeSchema = {
  __typename?: "DateTimeSchema";
  date?: Maybe<Scalars["String"]>;
  time?: Maybe<Scalars["String"]>;
};

export type DaylyParams = {
  __typename?: "DaylyParams";
  dayOfWeeks: Array<DaysOfWeek>;
  everyWeek?: Maybe<Scalars["Float"]>;
};

export type DaylyParamsInput = {
  dayOfWeeks: Array<DaysOfWeek>;
  everyWeek?: InputMaybe<Scalars["Float"]>;
};

/** Days of week. */
export enum DaysOfWeek {
  /** Friday */
  Fri = "FRI",
  /** Monday */
  Mon = "MON",
  /** Saturday */
  Sat = "SAT",
  /** Sunday */
  Sun = "SUN",
  /** Thursday */
  Thu = "THU",
  /** Tuesday */
  Tue = "TUE",
  /** Wednesday */
  Wed = "WED",
}

export type DeleteAssignmentMember = {
  assignmentId?: InputMaybe<Scalars["String"]>;
  members: Array<Scalars["String"]>;
  orgId: Scalars["String"];
};

export type DeleteMemberInput = {
  masterOrg: Scalars["String"];
  organizationId: Scalars["String"];
  userId: Scalars["String"];
};

export type DeletedBy = {
  __typename?: "DeletedBy";
  cause: Scalars["String"];
  deleted_at: Scalars["Float"];
  type: Scalars["String"];
  user_id: Scalars["String"];
};

export type DeliveredTo = {
  __typename?: "DeliveredTo";
  delivered_at: Scalars["Float"];
  user_id: Scalars["String"];
};

export type DeliveredToType = {
  __typename?: "DeliveredToType";
  delivered_at: Scalars["Float"];
  messageId: Scalars["String"];
  user_id: Scalars["String"];
};



export type DisappearedOnBy = {
  __typename?: "DisappearedOnBy";
  created_at: Scalars["Float"];
  user_id: Scalars["String"];
};

export type DownloadBy = {
  __typename?: "DownloadBy";
  device_unique: Scalars["String"];
  user_id: Scalars["String"];
};

export type DuplicateScenarioDto = {
  _id: Scalars["String"];
  category?: InputMaybe<Scalars["String"]>;
  description?: InputMaybe<Scalars["String"]>;
  isMemberSpecific?: InputMaybe<Scalars["Boolean"]>;
  language?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  organizationId: Scalars["String"];
  type?: InputMaybe<Scalars["String"]>;
};

export type Edge = {
  __typename?: "Edge";
  _id: Scalars["ID"];
  label?: Maybe<Scalars["String"]>;
  location: Scalars["Boolean"];
  media?: Maybe<MediaType>;
  nextPrompt?: Maybe<NextPrompts>;
  notifyTo?: Maybe<Array<NotifyUsers>>;
  options?: Maybe<Array<EdgeOption>>;
  order?: Maybe<Scalars["Float"]>;
  signature: Scalars["Boolean"];
  targetTaskID?: Maybe<Scalars["String"]>;
  type: EdgeTypes;
};

export type EdgeOption = {
  __typename?: "EdgeOption";
  label?: Maybe<Scalars["String"]>;
  location?: Maybe<Scalars["Boolean"]>;
  media?: Maybe<MediaType>;
  nextPrompt?: Maybe<NextPrompts>;
  notifyTo?: Maybe<Array<NotifyUsers>>;
  signature: Scalars["Boolean"];
};

/** Edge types. */
export enum EdgeTypes {
  /** Regular edge */
  Default = "DEFAULT",
  /** Timeout edge */
  Timeout = "TIMEOUT",
}

export type EndCallInputDto = {
  callId: Scalars["String"];
  userId?: InputMaybe<Scalars["String"]>;
};

/** EventType Type. */
export enum EventType {
  AdminSurvey = "ADMIN_SURVEY",
  /** APPOINTMENT */
  Appointment = "APPOINTMENT",
  /** CALLREMINDER */
  Callreminder = "CALLREMINDER",
  /** REMINDER */
  Reminder = "REMINDER",
  /** Record_Reminder */
  RecordReminder = "Record_Reminder",
  /** SCHEDULE */
  Schedule = "SCHEDULE",
}

export type FavouriteBy = {
  __typename?: "FavouriteBy";
  favourite_at: Scalars["Float"];
  user_id: Scalars["String"];
};

export type FileDetails = {
  __typename?: "FileDetails";
  name: Scalars["String"];
  type: Scalars["String"];
  uri: Scalars["String"];
};

/** File types. */
export enum FileTypes {
  /** APPLICATION File */
  Application = "APPLICATION",
  /** AUDIO File */
  Audio = "AUDIO",
  /** DOC File */
  Doc = "DOC",
  /** DOCX File */
  Docx = "DOCX",
  /** Photo File */
  Image = "IMAGE",
  /** PDF File */
  Pdf = "PDF",
  /** PPT File */
  Ppt = "PPT",
  /** PPTX File */
  Pptx = "PPTX",
  /** TEXT File */
  Text = "TEXT",
  /** Video File */
  Video = "VIDEO",
  /** XLS File */
  Xls = "XLS",
  /** XLSX File */
  Xlsx = "XLSX",
  Zip = "ZIP",
}

export type FixedBy = {
  __typename?: "FixedBy";
  fixed_at: Scalars["Float"];
  user_id: Scalars["String"];
};

export type GetCallListDto = {
  callStatus: Scalars["String"];
  skip: Scalars["Float"];
  take: Scalars["Float"];
  userId: Scalars["String"];
};

export type GetDeliveredAndReadResponse = {
  __typename?: "GetDeliveredAndReadResponse";
  delivered_to?: Maybe<Array<DeliveredToType>>;
  read_by?: Maybe<Array<ReadByType>>;
};

export type GetDeliveredReadInput = {
  messageIds: Array<Scalars["String"]>;
  roomId: Scalars["String"];
};

export type GetMediaByRoomIdResponse = {
  __typename?: "GetMediaByRoomIdResponse";
  data?: Maybe<Array<GroupMedia>>;
  total?: Maybe<Scalars["Float"]>;
};

export type GetMyCallListDto = {
  callStatus: Scalars["String"];
  limit: Scalars["Float"];
  skip: Scalars["Float"];
};

export type GetMyRole = {
  organizationId: Scalars["String"];
};

export type GetPostponeApprovalListDto = {
  assignmentId: Scalars["String"];
  limit: Scalars["Float"];
  page?: Scalars["Float"];
};

export type GetRoomDetailsResponse = {
  __typename?: "GetRoomDetailsResponse";
  message?: Maybe<Scalars["String"]>;
  room: ChatRoom;
  success: Scalars["Boolean"];
};

export type GetSignedUrlInput = {
  contentType: Scalars["String"];
  path: Scalars["String"];
};

export type GetUsersDto = {
  __typename?: "GetUsersDto";
  _id: Scalars["String"];
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  lastSeen?: Maybe<Scalars["Float"]>;
  phone: Scalars["String"];
  profile_img: Scalars["String"];
  status: Scalars["String"];
};

/** global frequency Time Type. */
export enum GlobalFrequencyUnit {
  /** DAY */
  Day = "DAY",
  /** HOUR */
  Hour = "HOUR",
  /** MINUTE */
  Minute = "MINUTE",
  /** WEEK */
  Week = "WEEK",
}

export type GlobalFrequencyUnitInput = {
  Count?: Scalars["Float"];
  Unit?: GlobalFrequencyUnit;
};

export type GlobalFrequencyUnitSchema = {
  __typename?: "GlobalFrequencyUnitSchema";
  Count: Scalars["Float"];
  Unit: GlobalFrequencyUnit;
  _id?: Maybe<Scalars["String"]>;
};

export type GroupMedia = {
  __typename?: "GroupMedia";
  _id?: Maybe<YearMonth>;
  messages?: Maybe<Array<Conversation>>;
};

export type HasComonInput = {
  contacts: Array<Contact>;
  region: Scalars["String"];
};

export type IdAndActionDto = {
  _id: Scalars["String"];
  action: Scalars["Boolean"];
};

export type IdDto = {
  _id: Scalars["String"];
};

export type Invite = {
  __typename?: "Invite";
  _id: Scalars["ID"];
  email?: Maybe<Scalars["String"]>;
  invitedUser?: Maybe<UserDetailsDto>;
  masterOrg?: Maybe<Organization>;
  member?: Maybe<Member>;
  msgId?: Maybe<Scalars["String"]>;
  organization: Array<Scalars["String"]>;
  phone?: Maybe<Scalars["String"]>;
  role: UserRoles;
  status: InviteStatus;
  user?: Maybe<UserDetailsDto>;
};

export type InviteDto = {
  email?: InputMaybe<Scalars["String"]>;
  phone?: InputMaybe<Scalars["String"]>;
  role: Scalars["String"];
};

/** Organization invite state */
export enum InviteStatus {
  /** Invite accepted */
  Accepted = "ACCEPTED",
  /** Invite declined */
  Declined = "DECLINED",
  /** Invite send */
  Pending = "PENDING",
}

export type InvitesByOrgInput = {
  organizationId: Scalars["String"];
};

export type LastMsg = {
  __typename?: "LastMsg";
  clear: Scalars["Boolean"];
  created_at: Scalars["Float"];
  fontStyle: Scalars["String"];
  message: Scalars["String"];
  sender: Scalars["String"];
  type: Scalars["String"];
};

export type LastSynced = {
  __typename?: "LastSynced";
  contactList: Scalars["DateTime"];
};

export type Last_Msg = {
  __typename?: "Last_msg";
  created_at: Scalars["Float"];
  deletedBy: Array<DeletedBy>;
  id: Scalars["String"];
  message: Scalars["String"];
  sender: Scalars["String"];
  type: Scalars["String"];
};

export type LocationType = {
  __typename?: "LocationType";
  _id?: Maybe<Scalars["String"]>;
  address: Scalars["String"];
  countryOffset?: Maybe<Scalars["String"]>;
  latitude: Scalars["String"];
  longitude: Scalars["String"];
  mapUrl?: Maybe<Scalars["String"]>;
};

export type LocationTypes = {
  _id?: InputMaybe<Scalars["String"]>;
  address: Scalars["String"];
  countryOffset?: InputMaybe<Scalars["String"]>;
  latitude: Scalars["String"];
  longitude: Scalars["String"];
  mapUrl?: InputMaybe<Scalars["String"]>;
};

export type Logs = {
  __typename?: "Logs";
  created_at: Scalars["Float"];
  type: Scalars["String"];
};

export type MasterAdmin = {
  __typename?: "MasterAdmin";
  _id: Scalars["ID"];
  user: User;
};

export type Measurement = {
  __typename?: "Measurement";
  max?: Maybe<Scalars["Float"]>;
  min?: Maybe<Scalars["Float"]>;
  subfields?: Maybe<Array<MeasurementSubfield>>;
};

export type MeasurementDto = {
  max?: InputMaybe<Scalars["Float"]>;
  min?: InputMaybe<Scalars["Float"]>;
  subfields?: InputMaybe<Array<MeasurementSubfieldDto>>;
};

export type MeasurementSubfield = {
  __typename?: "MeasurementSubfield";
  label?: Maybe<Scalars["String"]>;
  value?: Maybe<Scalars["Float"]>;
};

export type MeasurementSubfieldDto = {
  label?: InputMaybe<Scalars["String"]>;
  value?: InputMaybe<Scalars["Float"]>;
};

/** Media quality. */
export enum MediaQuality {
  /** HIGH */
  High = "HIGH",
  /** LOW */
  Low = "LOW",
  /** MEDIUM */
  Medium = "MEDIUM",
}

/** Media type. */
export enum MediaType {
  /** AUDIO */
  Audio = "AUDIO",
  /** DOCUMENT */
  Document = "DOCUMENT",
  /** Photo */
  Photo = "PHOTO",
  /** RECORD */
  Record = "RECORD",
  /** Video */
  Video = "VIDEO",
}

export type Member = {
  __typename?: "Member";
  _id: Scalars["ID"];
  acceptedAt?: Maybe<Scalars["DateTime"]>;
  createdAt?: Maybe<Scalars["DateTime"]>;
  masterOrg?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  organizationId: Array<Scalars["String"]>;
  role: UserRoles;
  scenarioId?: Maybe<Scalars["String"]>;
  status: InviteStatus;
  type?: Maybe<MemberType>;
  user?: Maybe<User>;
};

/** The supported members roles. */
export enum MemberRoles {
  /** Active member */
  Active = "ACTIVE",
  /** Passive member */
  Passive = "PASSIVE",
}

/** Member Type. */
export enum MemberType {
  /** ANONYMOUS */
  Anonymous = "ANONYMOUS",
  /** MEMBER */
  Member = "MEMBER",
}

export type Members = {
  id: Scalars["String"];
  memberRole: MemberRoles;
};

export type Message = {
  __typename?: "Message";
  created_at: Scalars["Float"];
  duration?: Maybe<Scalars["Float"]>;
  fileURL: Scalars["String"];
  fontStyle: Scalars["String"];
  index: Scalars["Float"];
  isForwarded: Scalars["Boolean"];
  isSent: Scalars["Boolean"];
  message: Scalars["String"];
  thumbnail: Scalars["String"];
  type: Scalars["String"];
  updated_at: Scalars["Float"];
};

export type MetaData = {
  __typename?: "MetaData";
  backupTimestamp: Scalars["DateTime"];
  deviceInfo: DeviceInfo;
  isLatest: Scalars["Boolean"];
  schemaVersion: Scalars["Float"];
};

export type MonthlyParams = {
  __typename?: "MonthlyParams";
  months?: Maybe<Array<Months>>;
  twicePerMonth?: Maybe<Scalars["Boolean"]>;
};

export type MonthlyParamsForReminder = {
  __typename?: "MonthlyParamsForReminder";
  months?: Maybe<Array<Months>>;
  onDay?: Maybe<Scalars["Float"]>;
  onWeek?: Maybe<DaylyParams>;
  twicePerMonth?: Maybe<Scalars["Boolean"]>;
};

export type MonthlyParamsInput = {
  months: Array<Months>;
  twicePerMonth: Scalars["Boolean"];
};

export type MonthlyParamsInputForReminder = {
  months: Array<Months>;
  onDay?: InputMaybe<Scalars["Float"]>;
  onWeek?: InputMaybe<DaylyParamsInput>;
  twicePerMonth: Scalars["Boolean"];
};

/** Months */
export enum Months {
  /** April */
  Apr = "APR",
  /** August */
  Aug = "AUG",
  /** December */
  Dec = "DEC",
  /** February */
  Feb = "FEB",
  /** January */
  Jan = "JAN",
  /** July */
  Jul = "JUL",
  /** June */
  Jun = "JUN",
  /** March */
  Mar = "MAR",
  /** May */
  May = "MAY",
  /** November */
  Nov = "NOV",
  /** October */
  Oct = "OCT",
  /** September */
  Sep = "SEP",
}

export type Mutation = {
  __typename?: "Mutation";
  NotificationApi: BasicResponce;
  ResendReminder: ReminderResponse;
  SuperAdminSignUp: BasicResponce;
  UploadChatFile: ChatFileUploadResponse;
  accept: Organization;
  acceptRejectVideoRequest: RequestVideoCallResponse;
  addMembers?: Maybe<Assignment>;
  addMsgToTopic: BasicResponce;
  addMyContact?: Maybe<ContactResponse>;
  addParticipants: AddParticipantsResponse;
  addTask: Task;
  addTaskResult: Report;
  approveTask: BasicResponce;
  archive: BasicResponce;
  archiveRoom: BasicResponce;
  blockRoom?: Maybe<BasicResponce>;
  callWaiting: BasicResponce;
  changeCallStatus: CallStatusChanged;
  changeNotificationSound?: Maybe<BasicResponce>;
  changeRoomWallpaper?: Maybe<BasicResponce>;
  checkIsValidDate: CheckValidDateResponse;
  cloneAssignment: Assignment;
  cloneTemplate: Scenario;
  completeReport: Report;
  confirmAccountDelete: BasicResponce;
  create: Scalars["Boolean"];
  createAdminSurvey: AdminSurvey;
  createAnonymousUser: Member;
  createAppointment: AppointmentResponse;
  createAssignments: Array<Assignment>;
  createBroadcastRoom: CreateRoomResponse;
  createCall: CallCalled;
  createCallReminder: CallReminderResponse;
  createClient: Client;
  createContactReminder: User;
  createFolder?: Maybe<BasicResponce>;
  createLanguage: Language;
  createNewCall: CallWithToken;
  createOrganization?: Maybe<Organization>;
  createReminder: ReminderResponse;
  createRevision: Scenario;
  createRoom: CreateRoomResponse;
  createRoomListSenior?: Maybe<BasicResponce>;
  createScenario: Scenario;
  createScenarioCategory: ScenarioCategory;
  createSchedule: ScheduleResponse;
  createSmsInvite: SmsInvite;
  createSurveyAnswer: BasicResponce;
  createSurveyEdge: BasicResponce;
  createSurveyQuestion: SurveyQuestions;
  createSurveyReport: SurveyReports;
  createSurveyScenario: SurveyScenario;
  createTopic: Topic;
  createUserFolder: UserFolder;
  createUserRecord: Record;
  decline: Invite;
  deleteAdminSurvey: BasicResponce;
  deleteAssignment: BasicResponce;
  deleteAssignmentMember?: Maybe<BasicResponce>;
  deleteBroadcastRoom: BasicResponce;
  deleteClient: Client;
  deleteEdge: BasicResponce;
  deleteFile: BasicResponce;
  deleteFolder?: Maybe<BasicResponce>;
  deleteInvite: BasicResponce;
  deleteMember: Organization;
  deleteMyContact?: Maybe<DeleteContactsReponse>;
  deleteOrganization: BasicResponce;
  deleteRecord: BasicResponce;
  deleteReminder: ReminderResponse;
  deleteRoom?: Maybe<BasicResponce>;
  deleteScenario: BasicResponce;
  deleteScenarioCategory: BasicResponce;
  deleteSchedule: ScheduleResponse;
  deleteSurveyEdge: BasicResponce;
  deleteSurveyQuestions: BasicResponce;
  deleteSurveyScenario: BasicResponce;
  deleteTask: BasicResponce;
  deleteTopic: BasicResponce;
  deleteUserFolder: BasicResponce;
  duplicateScenario: Scenario;
  editFolder?: Maybe<BasicResponce>;
  emailConfirm: User;
  endCall: CallEndedResponse;
  fixRoom: BasicResponce;
  getMyUserRecord: Record;
  getRecordById: Record;
  getRtmToken: RtmToken;
  joinRoom: BasicResponce;
  leftCall: CallEndedResponse;
  logoutDevices?: Maybe<BasicResponce>;
  logoutDevicesWeb?: Maybe<BasicResponce>;
  markRoomUnread?: Maybe<BasicResponce>;
  muteRoom?: Maybe<BasicResponce>;
  passwordReset: Session;
  phoneConfirm: User;
  publishRevision: Scenario;
  publishTaskTemplate?: Maybe<Assignment>;
  publishTemplate: Scenario;
  readChatByRoomId?: Maybe<BasicResponce>;
  removeContactReminder: User;
  removeMsgsFromTopic: BasicResponce;
  removeUserFromRoom: BasicResponce;
  replaceMember?: Maybe<BasicResponce>;
  requestVideoCall: RequestVideoCallResponse;
  resendInvite: Invite;
  restartAssignment: BasicResponce;
  restore: BasicResponce;
  sendBroadcastChat?: Maybe<Conversation>;
  sendChat?: Maybe<Conversation>;
  sendInvites: Array<Invite>;
  sendTask: BasicResponce;
  setBio?: Maybe<UserDetailsDto>;
  setChatDelivered?: Maybe<BasicResponce>;
  setChatReadBy?: Maybe<BasicResponce>;
  setCustomRingtone: BasicResponce;
  setNotificationSeen: BasicResponce;
  setRole: Member;
  setRoomName?: Maybe<BasicResponce>;
  signUp: SignInAndSignUpResponse;
  signin: SignInAndSignUpResponse;
  startReport: Report;
  startTask: Report;
  takeSurvey: BasicResponceSurvey;
  unApprovedTask: BasicResponce;
  unArchiveRoom: BasicResponce;
  unblockRoom?: Maybe<BasicResponce>;
  unfixRoom: BasicResponce;
  unmuteRoom?: Maybe<BasicResponce>;
  updateAdminSurvey: AdminSurvey;
  updateAdminSurveyActiveStatus: AdminSurvey;
  updateAssignmentTime: UpdateAssignmentTimeResponse;
  updateChat?: Maybe<BasicResponce>;
  updateChatroomReadReceipts?: Maybe<BasicResponce>;
  updateChildFolderName: UserFolder;
  updateClient: Client;
  updateContact?: Maybe<BasicResponce>;
  updateContactNew?: Maybe<Array<ContactResponse>>;
  updateContactProfile?: Maybe<ContactDetailsDto>;
  updateContactReminder: User;
  updateDismiss: User;
  updateDragDrop: ReminderResponse;
  updateEdge: Edge;
  updateGlobalReadReceipts?: Maybe<BasicResponce>;
  updateGlobalReminder: User;
  updateOrganization?: Maybe<Organization>;
  updatePostponeRequest: BasicResponce;
  updatePublishStatus: BasicResponce;
  updateReminder: ReminderResponse;
  updateReminderApprovalParent: ReminderResponse;
  updateReminderApprovalStatus: ReminderResponse;
  updateRoomAdmin?: Maybe<BasicResponce>;
  updateRoomListSenior?: Maybe<BasicResponce>;
  updateScenario: Scenario;
  updateScenarioCategory: ScenarioCategory;
  updateSchedule: ScheduleResponse;
  updateScheduleTime: Assignment;
  updateSuperAdminLanguage?: Maybe<SuperAdmin>;
  updateSupplierNode: BasicResponce;
  updateSurveyEdge: SurveyEdge;
  updateSurveyQuestions: SurveyQuestions;
  updateSurveyScenario: BasicResponce;
  updateTask: Task;
  updateTopic: Topic;
  updateUser?: Maybe<User>;
  updateUserAvailability?: Maybe<User>;
  updateUserIsSurvey: BasicResponce;
  updateUserLanguage?: Maybe<User>;
  updateUserMode?: Maybe<User>;
  updateUserRecord: BasicResponce;
  updateVersionDetails: BasicResponce;
  uploadFile: StorageItem;
  uploadFileRecord: StorageItem;
  uploadTask: BasicResponce;
};

export type MutationNotificationApiArgs = {
  input: NotificationAPiInput;
};

export type MutationResendReminderArgs = {
  input: IdDto;
};

export type MutationSuperAdminSignUpArgs = {
  input: SuperAdminLoginInput;
};

export type MutationUploadChatFileArgs = {
  file: Scalars["Upload"];
  input: UploadChatFileInput;
  thumbnail?: InputMaybe<Scalars["Upload"]>;
};

export type MutationAcceptArgs = {
  input: ResponseInviteDtoInput;
};

export type MutationAcceptRejectVideoRequestArgs = {
  input: CallTypeChangeDto;
};

export type MutationAddMembersArgs = {
  input: AddMembersInputDto;
};

export type MutationAddMsgToTopicArgs = {
  input: AddMsgToTopicInputDto;
};

export type MutationAddMyContactArgs = {
  input: HasComonInput;
};

export type MutationAddParticipantsArgs = {
  input: AddParticipantsDto;
};

export type MutationAddTaskArgs = {
  input: AddTaskDto;
};

export type MutationAddTaskResultArgs = {
  input: AddTaskResultDto;
};

export type MutationApproveTaskArgs = {
  input: ApproveTaskDto;
};

export type MutationArchiveArgs = {
  input: ArchiveTaskInputDto;
};

export type MutationArchiveRoomArgs = {
  input: RoomIdInput;
};

export type MutationBlockRoomArgs = {
  input: RoomIdReasonInput;
};

export type MutationCallWaitingArgs = {
  input: IdDto;
};

export type MutationChangeCallStatusArgs = {
  changeCallStatus: CallStatusChangeDto;
};

export type MutationChangeNotificationSoundArgs = {
  input: ChangeSoundInput;
};

export type MutationChangeRoomWallpaperArgs = {
  input: ChangeRoomWallpaper;
};

export type MutationCheckIsValidDateArgs = {
  input: CurrentTimeInput;
};

export type MutationCloneAssignmentArgs = {
  input: CloneTemplateDto;
};

export type MutationCloneTemplateArgs = {
  input: CloneTemplateDto;
};

export type MutationCompleteReportArgs = {
  input: CompleteReportsInputDto;
};

export type MutationConfirmAccountDeleteArgs = {
  input: ConfirmAccountDeleteInput;
};

export type MutationCreateAdminSurveyArgs = {
  input: AdminSurveyInput;
};

export type MutationCreateAnonymousUserArgs = {
  input: AnonymousUserInput;
};

export type MutationCreateAppointmentArgs = {
  input: AppointmentInput;
};

export type MutationCreateAssignmentsArgs = {
  input: CreateAssignmentDto;
};

export type MutationCreateBroadcastRoomArgs = {
  input: CreateRoomInput;
};

export type MutationCreateCallArgs = {
  input: CreateCallDto;
};

export type MutationCreateCallReminderArgs = {
  input: CallReminderInput;
};

export type MutationCreateClientArgs = {
  input: CreateClientInput;
};

export type MutationCreateContactReminderArgs = {
  input: CreateContactReminderInput;
};

export type MutationCreateFolderArgs = {
  input: CreateFolderInput;
};

export type MutationCreateLanguageArgs = {
  input: LanguageInputDto;
};

export type MutationCreateNewCallArgs = {
  input: CreateCallDto;
};

export type MutationCreateOrganizationArgs = {
  input: CreateOrgInput;
};

export type MutationCreateReminderArgs = {
  input: ReminderInput;
};

export type MutationCreateRevisionArgs = {
  input: OrgAndIdDto;
};

export type MutationCreateRoomArgs = {
  input: CreateRoomInput;
};

export type MutationCreateRoomListSeniorArgs = {
  input: SeniorModeRoomSelectionInput;
};

export type MutationCreateScenarioArgs = {
  input: CreateScenarioDto;
};

export type MutationCreateScenarioCategoryArgs = {
  input: CreateScenarioCategoryDto;
};

export type MutationCreateScheduleArgs = {
  input: ScheduleInput;
};

export type MutationCreateSmsInviteArgs = {
  input: CreateSmsInvite;
};

export type MutationCreateSurveyAnswerArgs = {
  input: SurveyAnswersInput;
};

export type MutationCreateSurveyEdgeArgs = {
  input: CreateSurveyEdgeDto;
};

export type MutationCreateSurveyQuestionArgs = {
  input: SurveyQuestionDto;
};

export type MutationCreateSurveyReportArgs = {
  input: SurveyReportDto;
};

export type MutationCreateSurveyScenarioArgs = {
  input: SurveyScenarioninput;
};

export type MutationCreateTopicArgs = {
  input: CreateTopicInputDto;
};

export type MutationCreateUserFolderArgs = {
  input: CreateuserFolderInputDto;
};

export type MutationCreateUserRecordArgs = {
  input: CreateRecordInput;
};

export type MutationDeclineArgs = {
  input: ResponseInviteDtoInput;
};

export type MutationDeleteAdminSurveyArgs = {
  input: IdDto;
};

export type MutationDeleteAssignmentArgs = {
  input: OrgAndIdDto;
};

export type MutationDeleteAssignmentMemberArgs = {
  input: DeleteAssignmentMember;
};

export type MutationDeleteBroadcastRoomArgs = {
  input: IdDto;
};

export type MutationDeleteClientArgs = {
  input: IdDto;
};

export type MutationDeleteEdgeArgs = {
  input: IdDto;
};

export type MutationDeleteFileArgs = {
  input: IdDto;
};

export type MutationDeleteFolderArgs = {
  input: IdDto;
};

export type MutationDeleteInviteArgs = {
  input: OrgAndIdDto;
};

export type MutationDeleteMemberArgs = {
  input: DeleteMemberInput;
};

export type MutationDeleteMyContactArgs = {
  input: DeleteContactInput;
};

export type MutationDeleteOrganizationArgs = {
  input: OrgIdDto;
};

export type MutationDeleteRecordArgs = {
  input: IdDto;
};

export type MutationDeleteReminderArgs = {
  input: DeleteReminderInput;
};

export type MutationDeleteRoomArgs = {
  input: RoomIdInput;
};

export type MutationDeleteScenarioArgs = {
  input: OrgAndIdDto;
};

export type MutationDeleteScenarioCategoryArgs = {
  input: OrgAndIdDto;
};

export type MutationDeleteScheduleArgs = {
  input: DeleteReminderInput;
};

export type MutationDeleteSurveyEdgeArgs = {
  input: IdDto;
};

export type MutationDeleteSurveyQuestionsArgs = {
  input: IdDto;
};

export type MutationDeleteSurveyScenarioArgs = {
  input: IdDto;
};

export type MutationDeleteTaskArgs = {
  input: IdDto;
};

export type MutationDeleteTopicArgs = {
  input: IdDto;
};

export type MutationDeleteUserFolderArgs = {
  input: IdDto;
};

export type MutationDuplicateScenarioArgs = {
  input: DuplicateScenarioDto;
};

export type MutationEditFolderArgs = {
  input: EditFolderInput;
};

export type MutationEmailConfirmArgs = {
  input: ConfirmEmailInput;
};

export type MutationEndCallArgs = {
  endCallInput: EndCallInputDto;
};

export type MutationFixRoomArgs = {
  input: RoomIdInput;
};

export type MutationGetRecordByIdArgs = {
  input: IdDto;
};

export type MutationGetRtmTokenArgs = {
  createRtmToken: CreateRtmTokenDto;
};

export type MutationJoinRoomArgs = {
  input: JoinRoomInput;
};

export type MutationLeftCallArgs = {
  input: IdDto;
};

export type MutationMarkRoomUnreadArgs = {
  input: RoomIdInput;
};

export type MutationMuteRoomArgs = {
  input: MuteRoomInput;
};

export type MutationPasswordResetArgs = {
  input: PasswordResetInput;
};

export type MutationPhoneConfirmArgs = {
  input: ConfirmPhoneInput;
};

export type MutationPublishRevisionArgs = {
  input: OrgAndIdDto;
};

export type MutationPublishTaskTemplateArgs = {
  input: PublishTaskInputDto;
};

export type MutationPublishTemplateArgs = {
  input: PublishTemplateDto;
};

export type MutationReadChatByRoomIdArgs = {
  input: RoomIdInput;
};

export type MutationRemoveContactReminderArgs = {
  input: IdDto;
};

export type MutationRemoveMsgsFromTopicArgs = {
  input: RemoveMsgsFromTopicInputDto;
};

export type MutationRemoveUserFromRoomArgs = {
  input: RoomIdPidInput;
};

export type MutationReplaceMemberArgs = {
  input: ReplaceMemberInput;
};

export type MutationRequestVideoCallArgs = {
  input: RequestVideoCallDto;
};

export type MutationResendInviteArgs = {
  input: IdDto;
};

export type MutationRestartAssignmentArgs = {
  input: IdDto;
};

export type MutationRestoreArgs = {
  input: ArchiveTaskInputDto;
};

export type MutationSendBroadcastChatArgs = {
  input: SendChatInput;
};

export type MutationSendChatArgs = {
  input: SendChatInput;
};

export type MutationSendInvitesArgs = {
  input: SendInvitesInput;
};

export type MutationSendTaskArgs = {
  input: CloneTemplateDto;
};

export type MutationSetBioArgs = {
  description: Scalars["String"];
};

export type MutationSetChatDeliveredArgs = {
  input: RoomIdCidInput;
};

export type MutationSetChatReadByArgs = {
  input: RoomIdCidsInput;
};

export type MutationSetCustomRingtoneArgs = {
  input: SetRigntoneInput;
};

export type MutationSetNotificationSeenArgs = {
  input: NotificationSeen;
};

export type MutationSetRoleArgs = {
  input: SetRoleInput;
};

export type MutationSetRoomNameArgs = {
  input: SetRoomNameInput;
};

export type MutationSignUpArgs = {
  input: SignUpInput;
};

export type MutationSigninArgs = {
  input: SignInInput;
};

export type MutationStartReportArgs = {
  input: StartReportDto;
};

export type MutationStartTaskArgs = {
  input: StartTaskDto;
};

export type MutationTakeSurveyArgs = {
  input: SurveyDateTimeInput;
};

export type MutationUnApprovedTaskArgs = {
  input: StartTaskDto;
};

export type MutationUnArchiveRoomArgs = {
  input: RoomIdInput;
};

export type MutationUnblockRoomArgs = {
  input: RoomIdInput;
};

export type MutationUnfixRoomArgs = {
  input: RoomIdInput;
};

export type MutationUnmuteRoomArgs = {
  input: RoomIdInput;
};

export type MutationUpdateAdminSurveyArgs = {
  input: AdminSurveyInput;
};

export type MutationUpdateAdminSurveyActiveStatusArgs = {
  input: AdminSurveyInput;
};

export type MutationUpdateAssignmentTimeArgs = {
  input: UpdateAssignmentTimeDto;
};

export type MutationUpdateChatArgs = {
  input: UdpateChatInput;
};

export type MutationUpdateChatroomReadReceiptsArgs = {
  input: IdAndActionDto;
};

export type MutationUpdateChildFolderNameArgs = {
  input: UpdateuserFolderInputDto;
};

export type MutationUpdateClientArgs = {
  input: UpdateClientInput;
};

export type MutationUpdateContactProfileArgs = {
  input: UpdateUserDetailsDto;
};

export type MutationUpdateContactReminderArgs = {
  input: CreateContactReminderInput;
};

export type MutationUpdateDismissArgs = {
  input: UpdateDisMissInput;
};

export type MutationUpdateDragDropArgs = {
  input: ReminderInput;
};

export type MutationUpdateEdgeArgs = {
  input: UpdateEdgeDto;
};

export type MutationUpdateGlobalReadReceiptsArgs = {
  input: ActionDto;
};

export type MutationUpdateGlobalReminderArgs = {
  input: GlobalFrequencyUnitInput;
};

export type MutationUpdateOrganizationArgs = {
  input: UpdateOrgInput;
};

export type MutationUpdatePostponeRequestArgs = {
  input: UpdatePostponeRequestDto;
};

export type MutationUpdatePublishStatusArgs = {
  input: UpdatePublishSurveyInput;
};

export type MutationUpdateReminderArgs = {
  input: ReminderInput;
};

export type MutationUpdateReminderApprovalParentArgs = {
  input: UpdateAprovalStatusInput;
};

export type MutationUpdateReminderApprovalStatusArgs = {
  input: UpdateAprovalStatusInput;
};

export type MutationUpdateRoomAdminArgs = {
  input: UpdateRoomAdminInput;
};

export type MutationUpdateRoomListSeniorArgs = {
  input: SeniorModeRoomSelectionInput;
};

export type MutationUpdateScenarioArgs = {
  input: UpdateScenarioDto;
};

export type MutationUpdateScenarioCategoryArgs = {
  input: UpdateScenarioCategoryDto;
};

export type MutationUpdateScheduleArgs = {
  input: ScheduleInput;
};

export type MutationUpdateScheduleTimeArgs = {
  input: UpdateScheduleTimeInput;
};

export type MutationUpdateSuperAdminLanguageArgs = {
  input: UpdateUserLanguageInput;
};

export type MutationUpdateSupplierNodeArgs = {
  input: UpdateSupplierNode;
};

export type MutationUpdateSurveyEdgeArgs = {
  input: SurveyUpdateEdgeDto;
};

export type MutationUpdateSurveyQuestionsArgs = {
  input: SurveyQuestionDto;
};

export type MutationUpdateSurveyScenarioArgs = {
  input: SurveyScenarioninput;
};

export type MutationUpdateTaskArgs = {
  input: UpdateTaskDto;
};

export type MutationUpdateTopicArgs = {
  input: UpdateTopicInputDto;
};

export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
};

export type MutationUpdateUserAvailabilityArgs = {
  input: UpdateUserAvailabilityInput;
};

export type MutationUpdateUserIsSurveyArgs = {
  input: IsSurveyNeed;
};

export type MutationUpdateUserLanguageArgs = {
  input: UpdateUserLanguageInput;
};

export type MutationUpdateUserModeArgs = {
  input: UpdateModeInput;
};

export type MutationUpdateUserRecordArgs = {
  input: CreateRecordInput;
};

export type MutationUpdateVersionDetailsArgs = {
  input: VersionManagementUpdateDto;
};

export type MutationUploadFileArgs = {
  file: Scalars["Upload"];
  input: UploadFileInput;
};

export type MutationUploadFileRecordArgs = {
  file: Scalars["Upload"];
  input: UploadFileInput;
};

export type MutationUploadTaskArgs = {
  input: CloneTemplateDto;
};

export type MutedBy = {
  __typename?: "MutedBy";
  expired_at: Scalars["Float"];
  muted_at: Scalars["Float"];
  user_id: Scalars["String"];
};

export type MyAssignmentsInputDto = {
  category?: InputMaybe<Scalars["String"]>;
  language?: InputMaybe<Scalars["String"]>;
  limit: Scalars["Float"];
  organizationId: Scalars["String"];
  search?: InputMaybe<Scalars["String"]>;
  skip: Scalars["Float"];
  sort?: InputMaybe<Scalars["String"]>;
};

export type MyNotificationsInput = {
  assignmentId?: InputMaybe<Scalars["String"]>;
  limit: Scalars["Float"];
  organizationId?: InputMaybe<Scalars["String"]>;
  search?: InputMaybe<Scalars["String"]>;
  skip: Scalars["Float"];
  sort?: InputMaybe<Scalars["String"]>;
};

export type NextPrompt = {
  __typename?: "NextPrompt";
  time: Scalars["Float"];
  type?: Maybe<NextPromptType>;
};

export type NextPromptDto = {
  time: Scalars["Float"];
  type: NextPromptType;
};

/** NextPrompt type. */
export enum NextPromptType {
  /** Show Next Task After APPROVAL */
  Approval = "APPROVAL",
  /** Show Next Task After DELAY */
  Delay = "DELAY",
  /** Show Next Task IMMEDIATELY */
  Immediately = "IMMEDIATELY",
}

/** NextPrompt type. */
export enum NextPromptTypes {
  /** Show Next Task After APPROVAL */
  Approval = "APPROVAL",
  /** Show Next Task After DELAY */
  Delay = "DELAY",
  /** Show Next Task IMMEDIATELY */
  Immediately = "IMMEDIATELY",
}

export type NextPrompts = {
  __typename?: "NextPrompts";
  time: Scalars["Float"];
  type?: Maybe<NextPromptTypes>;
};

export type Notification = {
  __typename?: "Notification";
  _id: Scalars["ID"];
  assignmentId?: Maybe<Scalars["String"]>;
  body: Scalars["String"];
  date?: Maybe<Scalars["String"]>;
  isSeen: Scalars["Boolean"];
  organizationId?: Maybe<Scalars["String"]>;
  payload: Scalars["String"];
  title: Scalars["String"];
  type?: Maybe<Scalars["String"]>;
  user: User;
};

export type NotificationData = {
  __typename?: "NotificationData";
  _id: Scalars["String"];
  body: Scalars["String"];
  createdAt?: Maybe<Scalars["Float"]>;
  isSeen: Scalars["Boolean"];
  payload: Scalars["String"];
  title: Scalars["String"];
  type?: Maybe<Scalars["String"]>;
};

export type NotificationDto = {
  __typename?: "NotificationDto";
  data?: Maybe<Array<NotificationData>>;
  total?: Maybe<Scalars["Float"]>;
};

export type NotificationSeen = {
  notificationIds: Array<Scalars["String"]>;
};

export type NotifyTo = {
  __typename?: "NotifyTo";
  member?: Maybe<Member>;
  message?: Maybe<Scalars["String"]>;
};

export type NotifyToInputDto = {
  member: Scalars["String"];
  message: Scalars["String"];
};

export type NotifyUsers = {
  __typename?: "NotifyUsers";
  member?: Maybe<Member>;
  message?: Maybe<Scalars["String"]>;
};

export type NumberType = {
  __typename?: "NumberType";
  max?: Maybe<Scalars["Float"]>;
  min?: Maybe<Scalars["Float"]>;
  type?: Maybe<Scalars["String"]>;
};

export type NumberTypeDto = {
  max?: InputMaybe<Scalars["Float"]>;
  min?: InputMaybe<Scalars["Float"]>;
  type?: InputMaybe<Scalars["String"]>;
};

export type OnGoingCallResponse = {
  __typename?: "OnGoingCallResponse";
  _id: Scalars["String"];
  callParticipants: Array<ParticipantType>;
  callStartedAt: Scalars["String"];
  channelName: Scalars["String"];
  roomId?: Maybe<RoomWithNameAndImage>;
  roomType: Scalars["String"];
  type: Scalars["String"];
};

export type OptionEdgeDto = {
  label: Scalars["String"];
  location?: InputMaybe<Scalars["Boolean"]>;
  media?: InputMaybe<MediaType>;
  nextPrompt?: InputMaybe<NextPromptDto>;
  notifyTo?: InputMaybe<Array<NotifyToInputDto>>;
  signature: Scalars["Boolean"];
};

export type Organization = {
  __typename?: "Organization";
  _id: Scalars["ID"];
  child: Array<Organization>;
  createdAt?: Maybe<Scalars["Float"]>;
  deleted: Scalars["Boolean"];
  description?: Maybe<Scalars["String"]>;
  link: Scalars["String"];
  masterOrg?: Maybe<Scalars["String"]>;
  members: Array<Member>;
  name: Scalars["String"];
  parent?: Maybe<Organization>;
  updatedAt?: Maybe<Scalars["Float"]>;
};

export type PaginatedAssignment = {
  __typename?: "PaginatedAssignment";
  data?: Maybe<Array<Assignment>>;
  totalCount: Scalars["Int"];
};

export type PaginatedClient = {
  __typename?: "PaginatedClient";
  data?: Maybe<Array<Client>>;
  totalCount: Scalars["Int"];
};

export type PaginatedReport = {
  __typename?: "PaginatedReport";
  data?: Maybe<Array<Report>>;
  totalCount: Scalars["Int"];
};

export type PaginatedScenario = {
  __typename?: "PaginatedScenario";
  data?: Maybe<Array<Scenario>>;
  totalCount: Scalars["Int"];
};

export type PaginationParams = {
  limit: Scalars["Float"];
  search?: InputMaybe<Scalars["String"]>;
  skip: Scalars["Float"];
  sort?: InputMaybe<Scalars["String"]>;
};

export type Participant = {
  __typename?: "Participant";
  _id: Scalars["ID"];
  accepted: ParticipantAcceptStatus;
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  left_at: Scalars["Float"];
  phone: Scalars["String"];
  profile_img: Scalars["String"];
  role: ReminderParticipantRole;
};

export type ParticipantInput = {
  _id: Scalars["String"];
  accepted?: ParticipantAcceptStatus;
  firstName?: InputMaybe<Scalars["String"]>;
  lastName?: InputMaybe<Scalars["String"]>;
  phone?: InputMaybe<Scalars["String"]>;
  role: ReminderParticipantRole;
};

export type ParticipantStatus = {
  __typename?: "ParticipantStatus";
  _id: Scalars["String"];
  accepted: ParticipantAcceptStatus;
  firstName?: Maybe<Scalars["String"]>;
  lastName?: Maybe<Scalars["String"]>;
  left_at: Scalars["Float"];
  phone?: Maybe<Scalars["String"]>;
  profile_img?: Maybe<Scalars["String"]>;
  role: ReminderParticipantRole;
};

export type Participants = {
  __typename?: "Participants";
  added_at: Scalars["Float"];
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  lastSeen: Scalars["Float"];
  left_at: Scalars["Float"];
  phone: Scalars["Float"];
  profile_img: Scalars["String"];
  sound?: Maybe<Sound>;
  status: Scalars["String"];
  unread_cid: Array<Scalars["String"]>;
  user_id: Scalars["String"];
  user_type: Scalars["String"];
  wallpaper: Wallpaper;
};

export type ParticipantsFromContact = {
  __typename?: "ParticipantsFromContact";
  _id?: Maybe<Scalars["String"]>;
  callStatus: Scalars["String"];
  createdAt: Scalars["DateTime"];
  profile_img?: Maybe<Scalars["String"]>;
  uid?: Maybe<Scalars["String"]>;
  userName?: Maybe<Scalars["String"]>;
};

export type PasswordResetInput = {
  password: Scalars["String"];
};

export type PinBy = {
  __typename?: "PinBy";
  pin_at: Scalars["Float"];
  user_id: Scalars["String"];
};

/** Plateform Type */
export enum PlateformType {
  /** ANDROID Plateform */
  Android = "ANDROID",
  /** WEB Plateform */
  Web = "WEB",
  /** IOS Plateform */
  IOs = "iOS",
}

export type Position = {
  __typename?: "Position";
  x: Scalars["Float"];
  y: Scalars["Float"];
};

export type PositionDto = {
  x: Scalars["Float"];
  y: Scalars["Float"];
};

export type PostponeApprovalList = {
  __typename?: "PostponeApprovalList";
  _id?: Maybe<Scalars["ID"]>;
  createdAt?: Maybe<Scalars["DateTime"]>;
  isApproved?: Maybe<Scalars["Boolean"]>;
  isRejected?: Maybe<Scalars["Boolean"]>;
  postponeTime?: Maybe<Scalars["Float"]>;
  requestedBy?: Maybe<User>;
  requestedTime?: Maybe<Scalars["Float"]>;
  task?: Maybe<Task>;
};

export type PostponeApprovalListResponse = {
  __typename?: "PostponeApprovalListResponse";
  data?: Maybe<Array<PostponeApprovalList>>;
  totalPage: Scalars["Float"];
};

export type PostponeApprovalModel = {
  __typename?: "PostponeApprovalModel";
  _id: Scalars["ID"];
  assignmentId: Scalars["ID"];
  isApproved: Scalars["Boolean"];
  isRejected: Scalars["Boolean"];
  postponeTime: Scalars["Float"];
  requestedTime: Scalars["Float"];
  taskId: Scalars["ID"];
  userId: Scalars["ID"];
};

export type PublishTemplateDto = {
  description?: InputMaybe<Scalars["String"]>;
  name: Scalars["String"];
  orgId: Scalars["String"];
  templateId: Scalars["String"];
};

export type Query = {
  __typename?: "Query";
  assignment: Assignment;
  assignmentsByOrg: PaginatedAssignment;
  callDetails: CallCalled;
  callList: Array<CallLists>;
  callParticipants: CallParticipants;
  checkIfOrganizationLinkAvailable: BasicResponce;
  clients: PaginatedClient;
  conductSurvey: AdminSurveyResponse;
  findAllScenario: PaginatedScenario;
  getAdminSurvey: AdminSurveyResponsePage;
  getAdminSurveyById: AdminSurveyResponse;
  getAdminSurveyDashBoard: Array<AdminSurveyAnalyticResponse>;
  getAdminSurveySearch: AdminSurveyResponsePage;
  getAllComonContacts?: Maybe<Array<Contacts>>;
  getAllMembers?: Maybe<Array<Member>>;
  getAllOrgContacts?: Maybe<Array<Contacts>>;
  getAllVersionDetails: Array<VersionManagement>;
  getAppointment: Array<AppointmentResponse>;
  getAppointmentByParentId: Array<ScheduleResponse>;
  getAppointmentByRoomId: Array<AppointmentResponse>;
  getAppointmentForCalendar: Array<AppointmentResponse>;
  getAppointmentForFuture: Array<AppointmentResponse>;
  getAppointmentForPresent: Array<AppointmentResponse>;
  getAssignmentForCalendar: Array<Assignment>;
  getBackgroundMessages?: Maybe<Array<ConversationWithIndex>>;
  getByIds?: Maybe<Array<GetUsersDto>>;
  getCallByChannelName?: Maybe<CallCalled>;
  getCallListWithAParticipant: Array<CallWithParticipant>;
  getChannelStatus?: Maybe<GetChannelStatusDto>;
  getChatsByIndex?: Maybe<Array<ConversationWithIndex>>;
  getChatsByRoomId?: Maybe<Array<ConversationWithIndex>>;
  getChildTopics: Array<Topic>;
  getContactReminders: Array<UserContact>;
  getDeliveredReadDataByMessageId?: Maybe<GetDeliveredAndReadResponse>;
  getFavouriteChats?: Maybe<Array<FavouriteChat>>;
  getFrequentRooms?: Maybe<Array<Scalars["String"]>>;
  getInvitesByOrg: Array<Invite>;
  getJoinedOnGoingCalls?: Maybe<Array<OnGoingCallResponse>>;
  getLanguageList: Array<Language>;
  getMyCallList?: Maybe<Array<MyCallListReponse>>;
  getMyComonContact?: Maybe<ContactResponse>;
  getMyContacts?: Maybe<ContactResponse>;
  getMyFolders: UserFolder;
  getMyId: MasterAdmin;
  getMyInvites: Array<Invite>;
  getMyNotifications?: Maybe<NotificationDto>;
  getMyRole: Member;
  getMySmsInvites: Array<SmsInvite>;
  getMyTopics: Array<Topic>;
  getNotificationById?: Maybe<Notification>;
  getOnGoingCalls?: Maybe<Array<OnGoingCallResponse>>;
  getOnlineUsersForWeb: Array<UsersStatusWeb>;
  getParticipantStatus?: Maybe<Array<UsersStatus>>;
  getParticipantsFromContact?: Maybe<Array<ParticipantsFromContact>>;
  getPendingReminder: Array<ReminderResponse>;
  getPostponeApprovalsByOrg: PostponeApprovalListResponse;
  getRecentlyActivity: Array<AdminSurveyRecentActivity>;
  getReminder: Array<ReminderResponse>;
  getReminderRange: Array<ReminderRangeResponse>;
  getReportAnalytic: ReportAnalyticResponse;
  getReportOfSurvey: SurveyAnswerResponsePage;
  getRoomDetailsByRoomId?: Maybe<GetRoomDetailsResponse>;
  getRoomInComon?: Maybe<Array<CommonRoom>>;
  getScenarioCategories: Array<ScenarioCategory>;
  getScheduleByRoomID: Array<ReminderRangeResponse>;
  getTopicById: Topic;
  getUnApprovedReports: PaginatedReport;
  getUploadSignedUrl: SignedUrlResponse;
  getUserMediaByRoomId?: Maybe<GetMediaByRoomIdResponse>;
  getUserPhoneBook?: Maybe<ContactResponse>;
  getUsersByIds: Array<Scalars["String"]>;
  getVersionDetails: VersionManagement;
  getiOSSoundList?: Maybe<Array<SoundDetails>>;
  login: Session;
  logout?: Maybe<BasicResponce>;
  masterTemplates: PaginatedScenario;
  me?: Maybe<User>;
  myAssignments: PaginatedAssignment;
  myParentOrganizationsWithChild?: Maybe<Array<Organization>>;
  myReports: PaginatedReport;
  organization?: Maybe<Organization>;
  organizations?: Maybe<Array<Organization>>;
  organizationsByMasterOrg?: Maybe<Array<Organization>>;
  parentChildOrganizations?: Maybe<Array<Organization>>;
  refreshSession: Session;
  report: Report;
  reports: PaginatedReport;
  requestAccountDelete: BasicResponce;
  requestEmailConfirm: BasicResponce;
  requestPasswordResetEmail: BasicResponce;
  requestPasswordResetSms: BasicResponce;
  requestPhoneConfirm: BasicResponce;
  scenario: ScenarioResponseDto;
  scenarios: PaginatedScenario;
  storageItem: StorageItem;
  subscribeToTopic: BasicResponce;
  superAdminLogin: Session;
  superAdminLogout: BasicResponce;
  templates: PaginatedScenario;
  unsubscribeFromTopic: BasicResponce;
  updateContactSchema?: Maybe<BasicResponce>;
  validatePasswordResetSms: SessionToken;
  validateScenarioName: BasicResponce;
};

export type QueryAssignmentArgs = {
  input: IdDto;
};

export type QueryAssignmentsByOrgArgs = {
  input: AssignmentsInputDto;
};

export type QueryCallDetailsArgs = {
  input: IdDto;
};

export type QueryCallListArgs = {
  callList: GetCallListDto;
};

export type QueryCallParticipantsArgs = {
  input: IdDto;
};

export type QueryCheckIfOrganizationLinkAvailableArgs = {
  input: CheckOrgLinkInput;
};

export type QueryClientsArgs = {
  input: ClientInput;
};

export type QueryConductSurveyArgs = {
  input: IdDto;
};

export type QueryFindAllScenarioArgs = {
  input: PaginationParams;
};

export type QueryGetAdminSurveyArgs = {
  input: AdminSurveyGetInput;
};

export type QueryGetAdminSurveyByIdArgs = {
  input: IdDto;
};

export type QueryGetAdminSurveySearchArgs = {
  input: AdminSurveyGetSearchInput;
};

export type QueryGetAllMembersArgs = {
  input: GetMyRole;
};

export type QueryGetAllOrgContactsArgs = {
  input: OrgIdDto;
};

export type QueryGetAppointmentByParentIdArgs = {
  input: ChildReminderInput;
};

export type QueryGetAppointmentByRoomIdArgs = {
  input: IdDto;
};

export type QueryGetAppointmentForFutureArgs = {
  date: Scalars["String"];
};

export type QueryGetAppointmentForPresentArgs = {
  input: MyRemindersInput;
};

export type QueryGetBackgroundMessagesArgs = {
  input: GetBackgroundMessagesInput;
};

export type QueryGetByIdsArgs = {
  input: UserIdsInputDto;
};

export type QueryGetCallByChannelNameArgs = {
  input: CallByChannelName;
};

export type QueryGetCallListWithAParticipantArgs = {
  input: CallListWithAParticipantDto;
};

export type QueryGetChannelStatusArgs = {
  input: ChannelStatusInput;
};

export type QueryGetChatsByIndexArgs = {
  input: GetChatsByIndexInput;
};

export type QueryGetChatsByRoomIdArgs = {
  input: GetConversationInput;
};

export type QueryGetChildTopicsArgs = {
  input: IdDto;
};

export type QueryGetDeliveredReadDataByMessageIdArgs = {
  input: GetDeliveredReadInput;
};

export type QueryGetFavouriteChatsArgs = {
  input: RoomIdInput;
};

export type QueryGetInvitesByOrgArgs = {
  input: InvitesByOrgInput;
};

export type QueryGetMyCallListArgs = {
  input: GetMyCallListDto;
};

export type QueryGetMyFoldersArgs = {
  input: GetFolderInput;
};

export type QueryGetMyNotificationsArgs = {
  input: MyNotificationsInput;
};

export type QueryGetMyRoleArgs = {
  input: GetMyRole;
};

export type QueryGetNotificationByIdArgs = {
  input: IdDto;
};

export type QueryGetParticipantStatusArgs = {
  input: UserIdsInput;
};

export type QueryGetParticipantsFromContactArgs = {
  input: IdDto;
};

export type QueryGetPostponeApprovalsByOrgArgs = {
  input: GetPostponeApprovalListDto;
};

export type QueryGetReminderRangeArgs = {
  input: ChildReminderInput;
};

export type QueryGetReportAnalyticArgs = {
  input: ReportAnalyticDateInput;
};

export type QueryGetReportOfSurveyArgs = {
  input: GetSurveyReportInput;
};

export type QueryGetRoomDetailsByRoomIdArgs = {
  input: IdDto;
};

export type QueryGetRoomInComonArgs = {
  input: IdDto;
};

export type QueryGetScenarioCategoriesArgs = {
  input: OrgIdDto;
};

export type QueryGetScheduleByRoomIdArgs = {
  input: ChildReminderInput;
};

export type QueryGetTopicByIdArgs = {
  input: IdDto;
};

export type QueryGetUnApprovedReportsArgs = {
  input: UnApprovedReportsInputDto;
};

export type QueryGetUploadSignedUrlArgs = {
  input: GetSignedUrlInput;
};

export type QueryGetUserMediaByRoomIdArgs = {
  input: GetMediaByRoomIdInput;
};

export type QueryGetVersionDetailsArgs = {
  input: VersionManagementInputDto;
};

export type QueryLoginArgs = {
  input: SignInInput;
};

export type QueryLogoutArgs = {
  input: WebDeviceDto;
};

export type QueryMasterTemplatesArgs = {
  input: TemplateInputDto;
};

export type QueryMyAssignmentsArgs = {
  input: MyAssignmentsInputDto;
};

export type QueryMyReportsArgs = {
  input: ReportsInputDto;
};

export type QueryOrganizationArgs = {
  input: IdDto;
};

export type QueryOrganizationsByMasterOrgArgs = {
  input: OrgIdDto;
};

export type QueryParentChildOrganizationsArgs = {
  input: OrgIdDto;
};

export type QueryRefreshSessionArgs = {
  input: RefreshTokenInput;
};

export type QueryReportArgs = {
  input: IdDto;
};

export type QueryReportsArgs = {
  input: ReportsInputDto;
};

export type QueryRequestPasswordResetEmailArgs = {
  input: RequestPasswordResetEmailInput;
};

export type QueryRequestPasswordResetSmsArgs = {
  input: RequestPasswordResetSmsInput;
};

export type QueryScenarioArgs = {
  input: OrgAndIdDto;
};

export type QueryScenariosArgs = {
  input: ScenariosInputDto;
};

export type QueryStorageItemArgs = {
  input: IdDto;
};

export type QuerySubscribeToTopicArgs = {
  token: Scalars["String"];
};

export type QuerySuperAdminLoginArgs = {
  input: SuperAdminSignInInput;
};

export type QuerySuperAdminLogoutArgs = {
  input: WebDeviceDto;
};

export type QueryTemplatesArgs = {
  input: TemplateInputDto;
};

export type QueryUnsubscribeFromTopicArgs = {
  token: Scalars["String"];
};

export type QueryValidatePasswordResetSmsArgs = {
  input: ValidatePasswordResetSmsInput;
};

export type QueryValidateScenarioNameArgs = {
  input: ValidateScenarioNameDto;
};

export type QuestionAnswer = {
  __typename?: "QuestionAnswer";
  QuestionDetail?: Maybe<SurveyQuestions>;
  answers?: Maybe<Array<Scalars["String"]>>;
  createdAt?: Maybe<Scalars["DateTime"]>;
  updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type QuestionAnswerInput = {
  QuestionDetail?: InputMaybe<SurveyQuestionDto>;
  answers?: InputMaybe<Array<Scalars["String"]>>;
  createdAt?: InputMaybe<Scalars["DateTime"]>;
  language?: InputMaybe<Scalars["String"]>;
  updatedAt?: InputMaybe<Scalars["DateTime"]>;
};

export type RangeExpression = {
  __typename?: "RangeExpression";
  customError?: Maybe<Scalars["String"]>;
  customExp?: Maybe<Array<CustomExpression>>;
  max?: Maybe<Scalars["Float"]>;
  min?: Maybe<Scalars["Float"]>;
  type?: Maybe<Scalars["String"]>;
};

export type RangeExpressionDto = {
  customExp?: InputMaybe<Array<CustomExpressionInput>>;
  max?: InputMaybe<Scalars["Float"]>;
  min?: InputMaybe<Scalars["Float"]>;
};

export type ReadBy = {
  __typename?: "ReadBy";
  read_at: Scalars["Float"];
  user_id: Scalars["String"];
};

export type ReadByType = {
  __typename?: "ReadByType";
  messageId: Scalars["String"];
  read_at: Scalars["Float"];
  user_id: Scalars["String"];
};

export type ReadReceipts = {
  __typename?: "ReadReceipts";
  receipt: Scalars["Boolean"];
  user_id: Scalars["String"];
};

export type Record = {
  __typename?: "Record";
  _id: Scalars["ID"];
  address?: Maybe<Scalars["String"]>;
  comment?: Maybe<Scalars["String"]>;
  company?: Maybe<Scalars["String"]>;
  createdAt?: Maybe<Scalars["DateTime"]>;
  customFields?: Maybe<Scalars["String"]>;
  email?: Maybe<Scalars["String"]>;
  firstName?: Maybe<Scalars["String"]>;
  isReminder?: Maybe<Scalars["Boolean"]>;
  landLine?: Maybe<Scalars["String"]>;
  lastName?: Maybe<Scalars["String"]>;
  mobile?: Maybe<Scalars["String"]>;
  parent?: Maybe<Scalars["String"]>;
  reminderId?: Maybe<Array<Scalars["String"]>>;
  title: Scalars["String"];
  updatedAt?: Maybe<Scalars["DateTime"]>;
  userId?: Maybe<Scalars["String"]>;
};

/** The execution type. */
export enum RecurrentTypes {
  /** ANNUALLY */
  Annually = "ANNUALLY",
  /** ANYTIME */
  Anytime = "ANYTIME",
  /** DAILY */
  Daily = "DAILY",
  /** HALFYEARLY */
  Halfyearly = "HALFYEARLY",
  /** MONTHLY */
  Monthly = "MONTHLY",
  /** ONCE */
  Once = "ONCE",
  /** PERIODICAL */
  Periodical = "PERIODICAL",
  /** QUARTERLY */
  Quarterly = "QUARTERLY",
  /** WEEKLY */
  Weekly = "WEEKLY",
}

export type RefreshTokenInput = {
  appVersion?: Scalars["String"];
  device?: InputMaybe<DeviceInfoDto>;
  orgId?: InputMaybe<Scalars["String"]>;
  plateform?: InputMaybe<PlateformType>;
  refresh: Scalars["String"];
};

export type ReminderInput = {
  From?: InputMaybe<Scalars["String"]>;
  To?: InputMaybe<Scalars["String"]>;
  _id?: InputMaybe<Scalars["String"]>;
  allOccurrence?: InputMaybe<Scalars["Boolean"]>;
  approvalReminderTime?: InputMaybe<Array<AprovalReminderTimeInput>>;
  attachment?: InputMaybe<Array<AgendaAttachmentInput>>;
  date?: InputMaybe<Scalars["String"]>;
  dateTimeInput?: InputMaybe<Array<DateTimeInput>>;
  daylyParams?: InputMaybe<DaylyParamsInput>;
  description?: InputMaybe<Scalars["String"]>;
  endDate?: InputMaybe<Scalars["String"]>;
  endTime?: InputMaybe<Scalars["String"]>;
  hasComon?: InputMaybe<Scalars["Boolean"]>;
  isAllDay?: InputMaybe<Scalars["Boolean"]>;
  isConfirmationNeeded?: InputMaybe<Scalars["Boolean"]>;
  location?: InputMaybe<LocationTypes>;
  monthlyParams?: InputMaybe<MonthlyParamsInputForReminder>;
  parent_id?: InputMaybe<Scalars["String"]>;
  participants?: InputMaybe<Array<ParticipantInput>>;
  recursive?: InputMaybe<RecurrentTypes>;
  roomId?: InputMaybe<Scalars["String"]>;
  roomType?: InputMaybe<Scalars["String"]>;
  startDate?: InputMaybe<Scalars["String"]>;
  startTimeInMs?: InputMaybe<Scalars["Float"]>;
  thisOccurrence?: InputMaybe<Scalars["Boolean"]>;
  time?: InputMaybe<Scalars["String"]>;
  title?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<EventType>;
};

/** Reminder Participant Role Type. */
export enum ReminderParticipantRole {
  /** ADMIN */
  Admin = "ADMIN",
  /** USER */
  User = "USER",
}

export type RemoveMsgsFromTopicInputDto = {
  chatIds: Array<Scalars["String"]>;
  topicId: Scalars["String"];
};

export type ReplyMessage = {
  __typename?: "ReplyMessage";
  cid?: Maybe<Scalars["String"]>;
  created_at?: Maybe<Scalars["Float"]>;
  file_URL?: Maybe<Scalars["String"]>;
  fontStyle?: Maybe<Scalars["String"]>;
  index?: Maybe<Scalars["String"]>;
  message?: Maybe<Scalars["String"]>;
  sender?: Maybe<Scalars["String"]>;
  type?: Maybe<Scalars["String"]>;
};

export type ReplyMessageInput = {
  chat_type: Scalars["String"];
  cid: Scalars["String"];
  created_at: Scalars["Float"];
  fontStyle: Scalars["String"];
  message: Scalars["String"];
  name: Scalars["String"];
  sender: Scalars["String"];
  url: Scalars["String"];
};

export type Report = {
  __typename?: "Report";
  _id: Scalars["ID"];
  assignment?: Maybe<Assignment>;
  completeTime?: Maybe<Scalars["Float"]>;
  lastActionTime?: Maybe<Scalars["Float"]>;
  member?: Maybe<Array<Member>>;
  organizationId: Scalars["String"];
  scenario?: Maybe<Scalars["String"]>;
  startTime: Scalars["Float"];
  tasksData: Array<TaskData>;
};

export type ReportAnalyticDateInput = {
  From?: InputMaybe<Scalars["String"]>;
  QuestionId?: InputMaybe<Scalars["String"]>;
  To?: InputMaybe<Scalars["String"]>;
  _id: Scalars["String"];
  indexOfQuestion?: InputMaybe<Scalars["Float"]>;
  language?: InputMaybe<Scalars["String"]>;
};

export type ReportAnalyticResponse = {
  __typename?: "ReportAnalyticResponse";
  QuestionAnswer?: Maybe<Array<QuestionAnswer>>;
  answerPercentages?: Maybe<Array<AnswerPercentages>>;
  nextQuestion?: Maybe<Scalars["String"]>;
  previousQuestion?: Maybe<Scalars["String"]>;
  totalCountOfIsSkipped?: Maybe<Scalars["Float"]>;
  totalParticipants?: Maybe<Scalars["Float"]>;
  totalQuestion?: Maybe<Scalars["Float"]>;
  uniqueParticipants?: Maybe<Array<SurveyParticipant>>;
};

export type ReportChatRoom = {
  __typename?: "ReportChatRoom";
  _id: Scalars["ID"];
  created_at: Scalars["Float"];
  reason: Scalars["String"];
  roomId: Scalars["String"];
  updated_at: Scalars["Float"];
  user_id: Scalars["String"];
};

export type ReportsInputDto = {
  assignmentId?: InputMaybe<Scalars["String"]>;
  limit: Scalars["Float"];
  masterOrg: Scalars["String"];
  search?: InputMaybe<Scalars["String"]>;
  skip: Scalars["Float"];
  sort?: InputMaybe<Scalars["String"]>;
};

export type RequestPasswordResetEmailInput = {
  email: Scalars["String"];
};

export type RequestPasswordResetSmsInput = {
  phone: Scalars["String"];
};

export type RestoreHistory = {
  __typename?: "RestoreHistory";
  deviceInfo: DeviceInfo;
  status: Scalars["String"];
  timestamp: Scalars["DateTime"];
};

export type Ringtone = {
  __typename?: "Ringtone";
  ringtone: Scalars["String"];
  userId: Scalars["String"];
};

export type RoomAccess = {
  __typename?: "RoomAccess";
  permit: Scalars["String"];
  type: Scalars["String"];
};

export type RoomBio = {
  __typename?: "RoomBio";
  status: Scalars["String"];
  time: Scalars["Float"];
};

export type RoomDeletedBy = {
  __typename?: "RoomDeletedBy";
  deleted_at: Scalars["Float"];
  user_id: Scalars["String"];
};

export type RoomWithNameAndImage = {
  __typename?: "RoomWithNameAndImage";
  _id?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
  profile_img?: Maybe<Scalars["String"]>;
};

export type RtmToken = {
  __typename?: "RtmToken";
  token: Scalars["String"];
};

export type Scenario = {
  __typename?: "Scenario";
  _id: Scalars["ID"];
  category?: Maybe<Scalars["String"]>;
  childId?: Maybe<Scalars["String"]>;
  description?: Maybe<Scalars["String"]>;
  fromUser?: Maybe<User>;
  isAssigned: Scalars["Boolean"];
  isValid: Scalars["Boolean"];
  language?: Maybe<Scalars["String"]>;
  name: Scalars["String"];
  organizationId?: Maybe<Scalars["String"]>;
  parentId?: Maybe<Scalars["String"]>;
  tasks: Array<Task>;
  toUser?: Maybe<User>;
  type: ScenarioType;
};

export type ScenarioCategory = {
  __typename?: "ScenarioCategory";
  _id: Scalars["ID"];
  name: Scalars["String"];
  organizationId: Scalars["String"];
};

export type ScenarioResponseDto = {
  __typename?: "ScenarioResponseDto";
  _id: Scalars["ID"];
  assignmentId?: Maybe<Scalars["String"]>;
  category?: Maybe<Scalars["String"]>;
  childId?: Maybe<Scalars["String"]>;
  description?: Maybe<Scalars["String"]>;
  fromUser?: Maybe<User>;
  isAssigned: Scalars["Boolean"];
  isValid: Scalars["Boolean"];
  language?: Maybe<Scalars["String"]>;
  name: Scalars["String"];
  organizationId?: Maybe<Scalars["String"]>;
  parentId?: Maybe<Scalars["String"]>;
  tasks: Array<Task>;
  toUser?: Maybe<User>;
  type: ScenarioType;
};

/** Scenario Type */
export enum ScenarioType {
  /** Draft scenario */
  Draft = "DRAFT",
  /** Master scenario */
  Master = "MASTER",
  /** Published scenario */
  Published = "PUBLISHED",
  /** Template scenario */
  Template = "TEMPLATE",
}

export type ScenariosInputDto = {
  category?: InputMaybe<Scalars["String"]>;
  isAssigned?: InputMaybe<Scalars["Boolean"]>;
  isValid?: InputMaybe<Scalars["Boolean"]>;
  language?: InputMaybe<Scalars["String"]>;
  limit: Scalars["Float"];
  orgId: Scalars["String"];
  search?: InputMaybe<Scalars["String"]>;
  skip: Scalars["Float"];
  sort?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<ScenarioType>;
};

export type SendInvitesInput = {
  invites: Array<InviteDto>;
  masterOrg: Scalars["String"];
  organizationId: Scalars["String"];
};

export type SeniorModeRoomSelectionInput = {
  _id?: InputMaybe<Scalars["String"]>;
  userIds?: InputMaybe<Array<Scalars["String"]>>;
};

export type Session = {
  __typename?: "Session";
  contacts?: Maybe<Array<ContactDetailsDto>>;
  expiredAt: Scalars["Float"];
  isMasterAdmin: Scalars["Boolean"];
  mode: Scalars["String"];
  refresh: Scalars["String"];
  token: Scalars["String"];
  user?: Maybe<User>;
};

export type SessionToken = {
  __typename?: "SessionToken";
  token: Scalars["String"];
};

export type SetRoleInput = {
  acceptedAt?: InputMaybe<Scalars["DateTime"]>;
  masterOrg: Scalars["String"];
  organizationId: Scalars["String"];
  role: UserRoles;
  status: InviteStatus;
  userId: Scalars["String"];
};

export type SignInAndSignUpResponse = {
  __typename?: "SignInAndSignUpResponse";
  contacts?: Maybe<Array<ContactDetailsDto>>;
  expiredAt: Scalars["Float"];
  isMasterAdmin: Scalars["Boolean"];
  mode: Scalars["String"];
  refresh: Scalars["String"];
  token: Scalars["String"];
  user: User;
};

export type SignInInput = {
  OSVersion?: InputMaybe<Scalars["String"]>;
  appVersion?: Scalars["String"];
  buildId?: InputMaybe<Scalars["String"]>;
  device?: InputMaybe<DeviceInfoDto>;
  email?: InputMaybe<Scalars["String"]>;
  isAgree?: Scalars["Boolean"];
  iso_code?: InputMaybe<Scalars["String"]>;
  mode?: UserModeStatus;
  panel?: InputMaybe<Scalars["String"]>;
  password: Scalars["String"];
  phone?: InputMaybe<Scalars["String"]>;
  seniorCitizenRoom?: Array<SeniorCitizenRoomInput>;
  timezone?: InputMaybe<Scalars["String"]>;
};

export type SignUpInput = {
  OSVersion?: InputMaybe<Scalars["String"]>;
  appVersion?: Scalars["String"];
  buildId?: InputMaybe<Scalars["String"]>;
  code: Scalars["String"];
  device?: InputMaybe<DeviceInfoDto>;
  email: Scalars["String"];
  firstName: Scalars["String"];
  globalFrequency?: InputMaybe<GlobalFrequencyUnitInput>;
  isAgree?: Scalars["Boolean"];
  iso_code?: InputMaybe<Scalars["String"]>;
  language?: InputMaybe<Scalars["String"]>;
  lastName: Scalars["String"];
  mode?: UserModeStatus;
  password: Scalars["String"];
  phone: Scalars["String"];
  seniorCitizenRoom?: Array<SeniorCitizenRoomInput>;
  timezone?: InputMaybe<Scalars["String"]>;
};

export type SignedUrlResponse = {
  __typename?: "SignedUrlResponse";
  expires: Scalars["Float"];
  url: Scalars["String"];
};

export type SmsInvite = {
  __typename?: "SmsInvite";
  _id: Scalars["ID"];
  createdAt?: Maybe<Scalars["Float"]>;
  phone: Scalars["String"];
  updatedAt?: Maybe<Scalars["Float"]>;
  userId: Scalars["String"];
};

export type Sound = {
  __typename?: "Sound";
  title: Scalars["String"];
  url: Scalars["String"];
};

export type SoundDetails = {
  __typename?: "SoundDetails";
  title: Scalars["String"];
  url: Scalars["String"];
};

export type SoundInput = {
  title: Scalars["String"];
  url: Scalars["String"];
};

export type StartReportDto = {
  assignmentId: Scalars["String"];
  masterOrg: Scalars["String"];
  orgId: Scalars["String"];
};

export type StartTaskDto = {
  orgId: Scalars["String"];
  reportId: Scalars["String"];
  taskId: Scalars["String"];
};

/** Status. */
export enum Status {
  /** ACCEPTED */
  Accepted = "ACCEPTED",
  /** DECLINED */
  Declined = "DECLINED",
  /** INVITED */
  Invited = "INVITED",
  /** RESTRICTED */
  Restricted = "RESTRICTED",
}

export type StorageItem = {
  __typename?: "StorageItem";
  _id: Scalars["ID"];
  filename: Scalars["String"];
  organizationId?: Maybe<Scalars["String"]>;
  type: FileTypes;
  url?: Maybe<Scalars["String"]>;
  userId: Scalars["String"];
};

export type Subscription = {
  __typename?: "Subscription";
  AddingParticipants: Call;
  callListener: Call;
};

export type SuperAdminSignInInput = {
  activeStatus?: InputMaybe<Scalars["Boolean"]>;
  device?: InputMaybe<DeviceInfoDto>;
  email?: InputMaybe<Scalars["String"]>;
  password: Scalars["String"];
  phone?: InputMaybe<Scalars["String"]>;
  role?: InputMaybe<Scalars["String"]>;
};

/** SurveyEventType. */
export enum SurveyEventType {
  /** CALENDAR */
  Calendar = "CALENDAR",
  /** CALL */
  Call = "CALL",
  /** CHAT */
  Chat = "CHAT",
  Other = "OTHER",
  /** TASK */
  Task = "TASK",
}

/** SurveyModel Type. */
export enum SurveyModelType {
  /** CALL */
  Call = "CALL",
  /** OTHER */
  Other = "OTHER",
  /** REMINDER */
  Reminder = "REMINDER",
  /** TASK */
  Task = "TASK",
}

export type SurveyParticipant = {
  __typename?: "SurveyParticipant";
  _id: Scalars["ID"];
  answers?: Maybe<Array<Scalars["String"]>>;
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  phone: Scalars["String"];
  profile_img: Scalars["String"];
};

export type Task = {
  __typename?: "Task";
  _id: Scalars["ID"];
  address?: Maybe<Scalars["String"]>;
  assignTo?: Maybe<Array<Member>>;
  attachment?: Maybe<Attachment>;
  content: Scalars["String"];
  createdAt?: Maybe<Scalars["Float"]>;
  edges: Array<Edge>;
  isPostponeApproval?: Maybe<Scalars["Boolean"]>;
  isPostponeRequestApproved?: Maybe<Scalars["Boolean"]>;
  isPostponeRequestRejected?: Maybe<Scalars["Boolean"]>;
  isPostponeRequestSent?: Maybe<Scalars["Boolean"]>;
  isTaskPostponed?: Maybe<Scalars["Boolean"]>;
  label: Scalars["String"];
  lat?: Maybe<Scalars["Float"]>;
  long?: Maybe<Scalars["Float"]>;
  measurement?: Maybe<Measurement>;
  mediaDuration?: Maybe<Scalars["Float"]>;
  mediaQuality: MediaQuality;
  mediaType: MediaType;
  member?: Maybe<Member>;
  nextPrompt?: Maybe<NextPrompt>;
  notifyTo?: Maybe<Array<NotifyTo>>;
  numberType?: Maybe<NumberType>;
  position: Position;
  postponeTime?: Maybe<Scalars["String"]>;
  radius?: Maybe<Scalars["String"]>;
  rangeExpression?: Maybe<RangeExpression>;
  remindEvery?: Maybe<Scalars["Float"]>;
  saveUserLocation: Scalars["Boolean"];
  signature: Scalars["Boolean"];
  subType?: Maybe<Scalars["String"]>;
  timeout?: Maybe<Scalars["Float"]>;
  type: TaskTypes;
  updatedAt?: Maybe<Scalars["Float"]>;
  width?: Maybe<Scalars["Float"]>;
};

export type TaskData = {
  __typename?: "TaskData";
  attachment?: Maybe<StorageItem>;
  content: Scalars["String"];
  delayTime?: Maybe<Scalars["Float"]>;
  distance?: Maybe<Scalars["Float"]>;
  distanceUnit?: Maybe<Scalars["String"]>;
  edgeId: Scalars["String"];
  isApproved?: Maybe<Scalars["Boolean"]>;
  isDelay?: Maybe<Scalars["Boolean"]>;
  label: Scalars["String"];
  lat?: Maybe<Scalars["String"]>;
  long?: Maybe<Scalars["String"]>;
  memberId?: Maybe<Member>;
  outOfLocation?: Maybe<Scalars["Boolean"]>;
  result: Scalars["String"];
  resultAttachment?: Maybe<StorageItem>;
  resultExp?: Maybe<Array<Scalars["String"]>>;
  signatureAttachment?: Maybe<Scalars["String"]>;
  targetTaskId?: Maybe<Scalars["String"]>;
  taskCompleteTime: Scalars["Float"];
  taskId?: Maybe<Scalars["String"]>;
  taskStartTime?: Maybe<Scalars["Float"]>;
  type?: Maybe<TaskTypes>;
};

/** Task types. */
export enum TaskTypes {
  /** Question with one or more possible answer */
  Checkbox = "CHECKBOX",
  /** Start Task */
  Input = "INPUT",
  Measurement = "MEASUREMENT",
  /** Reqest to upload photo or video */
  MediaUpload = "MEDIA_UPLOAD",
  /** Question with one or more possible answer */
  MultiSelect = "MULTI_SELECT",
  /** Notification node */
  Notification = "NOTIFICATION",
  /** Question number input */
  NumberInput = "NUMBER_INPUT",
  /** Finish Task */
  Output = "OUTPUT",
  /** Question with one possible answer from multiple options */
  Radio = "RADIO",
  Range = "RANGE",
  /** Question with one possible answer */
  SelectOne = "SELECT_ONE",
  /** Question with text input */
  TextInput = "TEXT_INPUT",
}

export type TemplateInputDto = {
  isValid?: InputMaybe<Scalars["Boolean"]>;
  limit: Scalars["Float"];
  orgId: Scalars["String"];
  search?: InputMaybe<Scalars["String"]>;
  skip: Scalars["Float"];
  sort?: InputMaybe<Scalars["String"]>;
};

export type Topic = {
  __typename?: "Topic";
  _id: Scalars["ID"];
  chats: Array<Chats>;
  name: Scalars["String"];
  parent?: Maybe<Scalars["String"]>;
  subTopics: Array<SubTopic>;
  userId: Scalars["String"];
};

export type UnApprovedReportsInputDto = {
  limit: Scalars["Float"];
  orgId: Scalars["String"];
  search?: InputMaybe<Scalars["String"]>;
  skip: Scalars["Float"];
  sort?: InputMaybe<Scalars["String"]>;
};

export type UnreadBy = {
  __typename?: "UnreadBy";
  user_id: Scalars["String"];
};

export type UpdateAprovalStatusInput = {
  ApprovalStatus?: ParticipantAcceptStatus;
  _id: Scalars["String"];
};

export type UpdateAssignmentTimeDto = {
  _id: Scalars["String"];
  postponeTime?: InputMaybe<Scalars["Float"]>;
  taskId: Scalars["String"];
};

export type UpdateAssignmentTimeResponse = {
  __typename?: "UpdateAssignmentTimeResponse";
  isRequestSent: Scalars["Boolean"];
  message?: Maybe<Scalars["String"]>;
  success: Scalars["Boolean"];
};

export type UpdateClientInput = {
  _id: Scalars["String"];
  address?: InputMaybe<Scalars["String"]>;
  comments?: InputMaybe<Scalars["String"]>;
  email?: InputMaybe<Scalars["String"]>;
  lat?: InputMaybe<Scalars["String"]>;
  long?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  phone?: InputMaybe<Scalars["String"]>;
};

export type UpdateEdgeDto = {
  _id: Scalars["String"];
  label?: InputMaybe<Scalars["String"]>;
  location?: InputMaybe<Scalars["Boolean"]>;
  media?: InputMaybe<MediaType>;
  nextPrompt?: InputMaybe<NextPromptDto>;
  notifyTo?: InputMaybe<Array<NotifyToInputDto>>;
  options?: InputMaybe<Array<OptionEdgeDto>>;
  order?: InputMaybe<Scalars["Float"]>;
  signature: Scalars["Boolean"];
  targetTaskID?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<EdgeTypes>;
};

export type UpdateOrCreateEdgeDto = {
  _id?: InputMaybe<Scalars["String"]>;
  label?: InputMaybe<Scalars["String"]>;
  location?: InputMaybe<Scalars["Boolean"]>;
  media?: InputMaybe<MediaType>;
  nextPrompt?: InputMaybe<NextPromptDto>;
  notifyTo?: InputMaybe<Array<NotifyToInputDto>>;
  options?: InputMaybe<Array<OptionEdgeDto>>;
  order?: InputMaybe<Scalars["Float"]>;
  signature: Scalars["Boolean"];
  targetTaskID?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<EdgeTypes>;
};

export type UpdateOrgInput = {
  _id: Scalars["String"];
  description?: InputMaybe<Scalars["String"]>;
  link?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  orgId: Scalars["String"];
};

export type UpdatePostponeRequestDto = {
  requestId: Scalars["String"];
  type: Scalars["String"];
};

export type UpdateScenarioDto = {
  _id: Scalars["String"];
  category?: InputMaybe<Scalars["String"]>;
  description?: InputMaybe<Scalars["String"]>;
  isValid?: InputMaybe<Scalars["Boolean"]>;
  language?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  orgId: Scalars["String"];
};

export type UpdateScheduleTimeInput = {
  assignmentId?: InputMaybe<Scalars["String"]>;
  dateTimeInput?: InputMaybe<Array<DateTimeInput>>;
  daylyParams?: InputMaybe<DaylyParamsInput>;
  end?: InputMaybe<Scalars["Float"]>;
  montlyParams?: InputMaybe<MonthlyParamsInput>;
  organizationId: Scalars["String"];
  periodical?: InputMaybe<Scalars["Float"]>;
  recurrent?: InputMaybe<RecurrentTypes>;
  scenario: Scalars["String"];
  start: Scalars["Float"];
  startTimeInMs: Scalars["Float"];
};

export type UpdateSupplierNode = {
  supplierNodeId: Scalars["String"];
  taskId: Scalars["String"];
  value: Scalars["Float"];
};

export type UpdateTaskDto = {
  _id: Scalars["String"];
  address?: InputMaybe<Scalars["String"]>;
  assignTo?: InputMaybe<Array<Scalars["String"]>>;
  assignmentId?: InputMaybe<Scalars["String"]>;
  attachment?: InputMaybe<AttachementDto>;
  content?: InputMaybe<Scalars["String"]>;
  edges?: InputMaybe<Array<UpdateOrCreateEdgeDto>>;
  isPostponeApproval?: Scalars["Boolean"];
  isPostponeRequestApproved?: Scalars["Boolean"];
  isPostponeRequestRejected?: Scalars["Boolean"];
  isPostponeRequestSent?: Scalars["Boolean"];
  isTaskPostponed?: Scalars["Boolean"];
  label: Scalars["String"];
  lat?: InputMaybe<Scalars["Float"]>;
  long?: InputMaybe<Scalars["Float"]>;
  measurement?: InputMaybe<MeasurementDto>;
  mediaDuration?: InputMaybe<Scalars["Float"]>;
  mediaQuality?: InputMaybe<MediaQuality>;
  mediaType?: InputMaybe<MediaType>;
  member?: InputMaybe<Scalars["String"]>;
  nextPrompt?: InputMaybe<NextPromptDto>;
  notifyTo?: InputMaybe<Array<NotifyToInputDto>>;
  numberType?: InputMaybe<NumberTypeDto>;
  position?: InputMaybe<PositionDto>;
  postponeTime?: InputMaybe<Scalars["String"]>;
  radius?: InputMaybe<Scalars["String"]>;
  rangeExpression?: InputMaybe<RangeExpressionDto>;
  remindEvery?: InputMaybe<Scalars["Float"]>;
  saveUserLocation?: InputMaybe<Scalars["Boolean"]>;
  signature: Scalars["Boolean"];
  subType?: InputMaybe<Scalars["String"]>;
  timeout?: InputMaybe<Scalars["Float"]>;
  type: Scalars["String"];
  width?: InputMaybe<Scalars["Float"]>;
};

export type UpdateUserDetailsDto = {
  additional?: InputMaybe<Scalars["String"]>;
  address?: InputMaybe<Scalars["String"]>;
  city?: InputMaybe<Scalars["String"]>;
  country?: InputMaybe<Scalars["String"]>;
  dob?: InputMaybe<Scalars["DateTime"]>;
  email?: InputMaybe<Scalars["String"]>;
  firstName?: InputMaybe<Scalars["String"]>;
  gender?: InputMaybe<Scalars["String"]>;
  lastName?: InputMaybe<Scalars["String"]>;
  phone: Scalars["String"];
  prefix?: InputMaybe<Scalars["String"]>;
  region?: InputMaybe<Scalars["String"]>;
  street?: InputMaybe<Scalars["String"]>;
  suffix?: InputMaybe<Scalars["String"]>;
  website?: InputMaybe<Scalars["String"]>;
};

export type UpdateUserInput = {
  _id: Scalars["String"];
  appVersion?: Scalars["String"];
  bio?: InputMaybe<BioDtoForUpdate>;
  currentPassword?: InputMaybe<Scalars["String"]>;
  device?: InputMaybe<DeviceInput>;
  email?: InputMaybe<Scalars["String"]>;
  expoPushToken?: InputMaybe<Scalars["String"]>;
  firstName?: InputMaybe<Scalars["String"]>;
  isAgree?: Scalars["Boolean"];
  lastName?: InputMaybe<Scalars["String"]>;
  mode?: UserModeStatus;
  password?: InputMaybe<Scalars["String"]>;
  phone?: InputMaybe<Scalars["String"]>;
  profile_img?: InputMaybe<Scalars["String"]>;
  seniorCitizenRoom?: Array<SeniorCitizenRoomInput>;
  timezone: Scalars["String"];
};

export type UploadChatFileInput = {
  _id: Scalars["String"];
  roomId: Scalars["String"];
};

export type UploadFileInput = {
  attachments: Scalars["Boolean"];
  orgId: Scalars["String"];
};

export type User = {
  __typename?: "User";
  WebDeviceId?: Maybe<Scalars["String"]>;
  _id: Scalars["ID"];
  appVersion: Scalars["String"];
  bio: Bio;
  blockedRooms: Array<BlockedRoom>;
  contact_reminder?: Maybe<Array<UserContact>>;
  createdAt?: Maybe<Scalars["Float"]>;
  device?: Maybe<DeviceInfo>;
  email: Scalars["String"];
  emailConfirmed: Scalars["Boolean"];
  favouriteChats: Array<FavouriteChat>;
  firstName: Scalars["String"];
  folders: Array<Folder>;
  globalFrequency: GlobalFrequencyUnitSchema;
  isAgree: Scalars["Boolean"];
  isSurvey?: Maybe<Scalars["Boolean"]>;
  iso_code?: Maybe<Scalars["String"]>;
  joinedRooms: Array<JoinedRooms>;
  language?: Maybe<Scalars["String"]>;
  lastDevice?: Maybe<Scalars["String"]>;
  lastName: Scalars["String"];
  lastSeen?: Maybe<Scalars["Float"]>;
  lastSynced: LastSynced;
  loggedIn?: Maybe<Scalars["String"]>;
  loggedOut?: Maybe<Scalars["String"]>;
  mode: UserModeStatus;
  onlineTime?: Maybe<Scalars["String"]>;
  orgId: Scalars["ID"];
  phone: Scalars["String"];
  phoneConfirmed: Scalars["Boolean"];
  profile_img: Scalars["String"];
  receipts: Scalars["Boolean"];
  seniorCitizenRoom: Array<SeniorCitizenRoomSchema>;
  status: Scalars["String"];
  surveyFrequency?: Maybe<Scalars["Float"]>;
  timezone: Scalars["String"];
  updatedAt?: Maybe<Scalars["Float"]>;
  visibility?: Maybe<UserAvailability>;
};

export type UserContact = {
  __typename?: "UserContact";
  CustomMessage: Scalars["String"];
  _id: Scalars["String"];
  firstName: Scalars["String"];
  frequency: OnlineStatusFrequency;
  isDismiss?: Maybe<Scalars["Boolean"]>;
  lastName: Scalars["String"];
  onlineTime?: Maybe<Scalars["String"]>;
  phone: Scalars["String"];
  profile_img: Scalars["String"];
  roomId?: Maybe<Scalars["String"]>;
};

export type UserContactInput = {
  CustomMessage?: Scalars["String"];
  _id?: InputMaybe<Scalars["String"]>;
  firstName?: InputMaybe<Scalars["String"]>;
  frequency?: OnlineStatusFrequency;
  isDismiss?: Scalars["Boolean"];
  lastName?: InputMaybe<Scalars["String"]>;
  phone?: InputMaybe<Scalars["String"]>;
  profile_img?: InputMaybe<Scalars["String"]>;
  roomId?: InputMaybe<Scalars["String"]>;
};

export type UserDetailsDto = {
  __typename?: "UserDetailsDto";
  _id: Scalars["String"];
  bio: BioDto;
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  lastSeen?: Maybe<Scalars["Float"]>;
  phone: Scalars["String"];
  profile_img: Scalars["String"];
  status: Scalars["String"];
};

export type UserIdsInputDto = {
  ids: Array<Scalars["String"]>;
};

/** The supported roles. */
export enum UserRoles {
  /** The admin of organization */
  Admin = "ADMIN",
  /** Organization member */
  Member = "MEMBER",
  /** Organization owner */
  Owner = "OWNER",
}

export type UsersStatus = {
  __typename?: "UsersStatus";
  _id: Scalars["String"];
  lastSeen: Scalars["Float"];
  status: Scalars["String"];
};

export type UsersStatusWeb = {
  __typename?: "UsersStatusWeb";
  lastSeen?: Maybe<Scalars["Float"]>;
  status: Scalars["String"];
  userId: Scalars["String"];
};

export type ValidatePasswordResetSmsInput = {
  code: Scalars["String"];
  phone: Scalars["String"];
};

export type ValidateScenarioNameDto = {
  name: Scalars["String"];
  orgId: Scalars["String"];
  type: Scalars["String"];
};

export type Wallpaper = {
  __typename?: "Wallpaper";
  fileName: Scalars["String"];
  opacity: Scalars["Float"];
};

export type YearMonth = {
  __typename?: "YearMonth";
  month?: Maybe<Scalars["Float"]>;
  year?: Maybe<Scalars["Float"]>;
};

export type AddParticipantsResponse = {
  __typename?: "addParticipantsResponse";
  call: Call;
  message: Scalars["String"];
  status: Scalars["String"];
};

export type AdminSurvey = {
  __typename?: "adminSurvey";
  Module?: Maybe<SurveyEventType>;
  _id?: Maybe<Scalars["String"]>;
  allOccurrence?: Maybe<Scalars["Boolean"]>;
  date?: Maybe<Scalars["String"]>;
  daylyParams?: Maybe<DaylyParams>;
  endDate?: Maybe<Scalars["String"]>;
  frequency?: Maybe<Scalars["Float"]>;
  monthlyParams?: Maybe<MonthlyParamsForReminder>;
  parent_id?: Maybe<Scalars["String"]>;
  publishType: SurveyScenarioType;
  recursive?: Maybe<RecurrentTypes>;
  scenario?: Maybe<Array<Scalars["String"]>>;
  startDate?: Maybe<Scalars["String"]>;
  surveyActiveStatus: Scalars["Boolean"];
  thisOccurrence?: Maybe<Scalars["Boolean"]>;
  userId?: Maybe<Scalars["String"]>;
};

export type AdminSurveyAnalyticResponse = {
  __typename?: "adminSurveyAnalyticResponse";
  SubTitle?: Maybe<Scalars["String"]>;
  count: Scalars["Float"];
  label?: Maybe<Scalars["String"]>;
};

export type AdminSurveyGetInput = {
  limit?: Scalars["Float"];
  page?: Scalars["Float"];
};

export type AdminSurveyGetSearchInput = {
  From?: InputMaybe<Scalars["String"]>;
  To?: InputMaybe<Scalars["String"]>;
  limit?: Scalars["Float"];
  name: Scalars["String"];
  page?: Scalars["Float"];
};

export type AdminSurveyInput = {
  Module?: InputMaybe<SurveyEventType>;
  _id?: InputMaybe<Scalars["String"]>;
  allOccurrence?: InputMaybe<Scalars["Boolean"]>;
  date?: InputMaybe<Scalars["String"]>;
  daylyParams?: InputMaybe<DaylyParamsInput>;
  endDate?: InputMaybe<Scalars["String"]>;
  frequency?: InputMaybe<Scalars["Float"]>;
  monthlyParams?: InputMaybe<MonthlyParamsInputForReminder>;
  parent_id?: InputMaybe<Scalars["String"]>;
  publishType?: InputMaybe<Scalars["String"]>;
  recursive?: InputMaybe<RecurrentTypes>;
  scenario?: InputMaybe<Array<Scalars["String"]>>;
  startDate?: InputMaybe<Scalars["String"]>;
  surveyActiveStatus?: InputMaybe<Scalars["Boolean"]>;
  thisOccurrence?: InputMaybe<Scalars["Boolean"]>;
  userId?: InputMaybe<Scalars["String"]>;
};

export type AdminSurveyRecentActivity = {
  __typename?: "adminSurveyRecentActivity";
  message: Scalars["String"];
  user?: Maybe<User>;
};

export type AdminSurveyResponse = {
  __typename?: "adminSurveyResponse";
  Module?: Maybe<SurveyEventType>;
  _id?: Maybe<Scalars["String"]>;
  allOccurrence?: Maybe<Scalars["Boolean"]>;
  createdAt?: Maybe<Scalars["DateTime"]>;
  date?: Maybe<Scalars["String"]>;
  daylyParams?: Maybe<DaylyParams>;
  endDate?: Maybe<Scalars["String"]>;
  frequency?: Maybe<Scalars["Float"]>;
  monthlyParams?: Maybe<MonthlyParamsForReminder>;
  parent_id?: Maybe<Scalars["String"]>;
  publishType: ScenarioType;
  recursive?: Maybe<RecurrentTypes>;
  scenario?: Maybe<Array<SurveyScenario>>;
  startDate?: Maybe<Scalars["String"]>;
  surveyActiveStatus?: Maybe<Scalars["Boolean"]>;
  thisOccurrence?: Maybe<Scalars["Boolean"]>;
  updatedAt?: Maybe<Scalars["DateTime"]>;
  userId?: Maybe<Scalars["String"]>;
};

export type AdminSurveyResponsePage = {
  __typename?: "adminSurveyResponsePage";
  data?: Maybe<Array<AdminSurveyResponse>>;
  publishedSurvey: Scalars["Float"];
  totalPage: Scalars["Float"];
};

export type AgendaAttachment = {
  __typename?: "agendaAttachment";
  duration?: Maybe<Scalars["Float"]>;
  mimeType?: Maybe<Scalars["String"]>;
  name: Scalars["String"];
  thumbnail?: Maybe<Scalars["String"]>;
  type: MediaType;
  uploadedAt?: Maybe<Scalars["String"]>;
  url?: Maybe<Scalars["String"]>;
};

export type AgendaAttachmentInput = {
  date?: InputMaybe<Scalars["String"]>;
  duration?: InputMaybe<Scalars["Float"]>;
  mimeType?: InputMaybe<Scalars["String"]>;
  name: Scalars["String"];
  thumbnail?: InputMaybe<Scalars["String"]>;
  type: Scalars["String"];
  uploadedAt?: InputMaybe<Scalars["String"]>;
  url?: InputMaybe<Scalars["String"]>;
};

export type AnonymousUserInput = {
  name?: InputMaybe<Scalars["String"]>;
  orgId: Scalars["String"];
  scenarioId: Scalars["String"];
  type: MemberType;
};

export type AnswerPercentages = {
  __typename?: "answerPercentages";
  answer?: Maybe<Scalars["String"]>;
  count?: Maybe<Scalars["Float"]>;
  percentage?: Maybe<Scalars["String"]>;
};

export type AppointmentResponse = {
  __typename?: "appointmentResponse";
  ApprovalStatus?: Maybe<Scalars["String"]>;
  From?: Maybe<Scalars["String"]>;
  To?: Maybe<Scalars["String"]>;
  _id?: Maybe<Scalars["String"]>;
  allOccurrence?: Maybe<Scalars["Boolean"]>;
  approvalReminderTime?: Maybe<Array<AprovalReminderTimeSchema>>;
  attachment?: Maybe<Array<AgendaAttachment>>;
  date?: Maybe<Scalars["String"]>;
  dateTimeInput?: Maybe<Array<DateTimeSchema>>;
  daylyParams?: Maybe<DaylyParams>;
  description?: Maybe<Scalars["String"]>;
  endDate?: Maybe<Scalars["String"]>;
  endTime?: Maybe<Scalars["String"]>;
  hasComon?: Maybe<Scalars["Boolean"]>;
  isAllDay?: Maybe<Scalars["Boolean"]>;
  isApprovalNeeded?: Maybe<Scalars["Boolean"]>;
  isConfirmationNeeded?: Maybe<Scalars["Boolean"]>;
  location?: Maybe<LocationType>;
  message?: Maybe<Array<SendChatDataSchema>>;
  monthlyParams?: Maybe<MonthlyParamsForReminder>;
  parent_id?: Maybe<Scalars["String"]>;
  participants?: Maybe<Array<ParticipantStatus>>;
  recursive?: Maybe<RecurrentTypes>;
  roomId?: Maybe<Scalars["String"]>;
  roomType?: Maybe<Scalars["String"]>;
  startDate?: Maybe<Scalars["String"]>;
  startTimeInMs?: Maybe<Scalars["Float"]>;
  thisOccurrence?: Maybe<Scalars["Boolean"]>;
  time?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
  type?: Maybe<EventType>;
};

/** Archive Type */
export enum ArchiveType {
  /** ASSIGNMENT */
  Assignment = "ASSIGNMENT",
  /** ORGANIZATION */
  Organization = "ORGANIZATION",
  /** SCENARIO */
  Scenario = "SCENARIO",
}

export type CallEndedResponse = {
  __typename?: "callEndedResponse";
  status: Scalars["String"];
  time: Scalars["Float"];
};

export type CallInfo = {
  __typename?: "callInfo";
  _id: Scalars["ID"];
  callEndedAt?: Maybe<Scalars["Float"]>;
  callParticipants: Array<ParticipantType>;
  callStartedAt?: Maybe<Scalars["Float"]>;
  callStatus?: Maybe<Scalars["String"]>;
  categoryId: Scalars["String"];
  channelName: Scalars["String"];
  duration?: Maybe<Scalars["Float"]>;
  origin: Scalars["String"];
  roomId?: Maybe<ChatRoom>;
  roomType: Scalars["String"];
  type: Scalars["String"];
};

export type CallParticipants = {
  __typename?: "callParticipants";
  participants: Array<ParticipantType>;
};

export type CallReminderInput = {
  From?: InputMaybe<Scalars["String"]>;
  To?: InputMaybe<Scalars["String"]>;
  _id?: InputMaybe<Scalars["String"]>;
  allOccurrence?: InputMaybe<Scalars["Boolean"]>;
  approvalReminderTime?: InputMaybe<Array<AprovalReminderTimeInput>>;
  attachment?: InputMaybe<Array<AgendaAttachmentInput>>;
  date?: InputMaybe<Scalars["String"]>;
  dateTimeInput?: InputMaybe<Array<DateTimeInput>>;
  daylyParams?: InputMaybe<DaylyParamsInput>;
  description?: InputMaybe<Scalars["String"]>;
  endDate?: InputMaybe<Scalars["String"]>;
  endTime?: InputMaybe<Scalars["String"]>;
  hasComon?: InputMaybe<Scalars["Boolean"]>;
  isAllDay?: InputMaybe<Scalars["Boolean"]>;
  isConfirmationNeeded?: InputMaybe<Scalars["Boolean"]>;
  location?: InputMaybe<LocationTypes>;
  monthlyParams?: InputMaybe<MonthlyParamsInputForReminder>;
  parent_id?: InputMaybe<Scalars["String"]>;
  participants?: InputMaybe<Array<ParticipantInput>>;
  recursive?: InputMaybe<RecurrentTypes>;
  roomId?: InputMaybe<Scalars["String"]>;
  roomType?: InputMaybe<Scalars["String"]>;
  startDate?: InputMaybe<Scalars["String"]>;
  startTimeInMs?: InputMaybe<Scalars["Float"]>;
  thisOccurrence?: InputMaybe<Scalars["Boolean"]>;
  time?: InputMaybe<Scalars["String"]>;
  title?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<EventType>;
};

export type CallReminderResponse = {
  __typename?: "callReminderResponse";
  From?: Maybe<Scalars["String"]>;
  To?: Maybe<Scalars["String"]>;
  _id?: Maybe<Scalars["String"]>;
  allOccurrence?: Maybe<Scalars["Boolean"]>;
  approvalReminderTime?: Maybe<Array<AprovalReminderTimeSchema>>;
  date?: Maybe<Scalars["String"]>;
  dateTimeInput?: Maybe<Array<DateTimeSchema>>;
  daylyParams?: Maybe<DaylyParams>;
  description?: Maybe<Scalars["String"]>;
  endDate?: Maybe<Scalars["String"]>;
  endTime?: Maybe<Scalars["String"]>;
  hasComon?: Maybe<Scalars["Boolean"]>;
  isAllDay?: Maybe<Scalars["Boolean"]>;
  isApprovalNeeded?: Maybe<Scalars["Boolean"]>;
  isConfirmationNeeded?: Maybe<Scalars["Boolean"]>;
  message?: Maybe<Array<SendChatDataSchema>>;
  monthlyParams?: Maybe<MonthlyParamsForReminder>;
  parent_id?: Maybe<Scalars["String"]>;
  participants?: Maybe<Array<Participant>>;
  recursive?: Maybe<RecurrentTypes>;
  roomId?: Maybe<Scalars["String"]>;
  roomType?: Maybe<Scalars["String"]>;
  startDate?: Maybe<Scalars["String"]>;
  startTimeInMs?: Maybe<Scalars["Float"]>;
  thisOccurrence?: Maybe<Scalars["Boolean"]>;
  time?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
  type?: Maybe<EventType>;
};

export type CallStatusChanged = {
  __typename?: "callStatusChanged";
  Screen_status?: Maybe<Scalars["String"]>;
  callId: Scalars["String"];
  sharer_uid?: Maybe<Scalars["String"]>;
  status: Scalars["String"];
};

export type CallTypeChangeDto = {
  callId: Scalars["String"];
  status: Scalars["String"];
  userId: Scalars["String"];
};

export type ChangeRoomWallpaper = {
  fileName: Scalars["String"];
  opacity: Scalars["Float"];
  roomId: Scalars["String"];
};

export type ChangeSoundInput = {
  roomId: Scalars["String"];
  sound: SoundInput;
};

export type ChildReminderInput = {
  From?: InputMaybe<Scalars["String"]>;
  To?: InputMaybe<Scalars["String"]>;
  _id?: InputMaybe<Scalars["String"]>;
  limit?: InputMaybe<Scalars["Float"]>;
  pageNo?: InputMaybe<Scalars["Float"]>;
  parent_id?: InputMaybe<Scalars["String"]>;
  roomId?: InputMaybe<Scalars["String"]>;
};

export type CreateContactReminderInput = {
  contact_reminder?: InputMaybe<UserContactInput>;
};

export type CreateFolderInput = {
  folderName: Scalars["String"];
  rooms: Array<Scalars["String"]>;
};

export type CreateRoomInput = {
  localId?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  profile_img?: InputMaybe<Scalars["String"]>;
  type: Scalars["String"];
  users: Array<Scalars["String"]>;
};

export type CreateRoomResponse = {
  __typename?: "createRoomResponse";
  isAlreadyExists: Scalars["Boolean"];
  localId: Scalars["String"];
  message?: Maybe<Scalars["String"]>;
  roomId: Scalars["String"];
  success: Scalars["Boolean"];
};

export type CreateScenarioCategoryDto = {
  name: Scalars["String"];
  orgId: Scalars["String"];
};

export type CreateTopicInputDto = {
  name: Scalars["String"];
  parent?: InputMaybe<Scalars["String"]>;
};

export type CreateuserFolderInputDto = {
  name?: InputMaybe<Scalars["String"]>;
  parent?: InputMaybe<Scalars["String"]>;
  records?: InputMaybe<Array<Scalars["String"]>>;
  userId?: InputMaybe<Scalars["String"]>;
};

export type CurrentTimeInput = {
  currentTime: Scalars["Float"];
  timezone: Scalars["String"];
};

export type DeleteContactInput = {
  contactIds: Array<Scalars["String"]>;
};

export type DeleteContactsReponse = {
  __typename?: "deleteContactsReponse";
  data?: Maybe<Array<Scalars["String"]>>;
  message?: Maybe<Scalars["String"]>;
  success: Scalars["Boolean"];
};

export type DeleteReminderInput = {
  _id: Scalars["String"];
  allOccurrence?: InputMaybe<Scalars["Boolean"]>;
  thisOccurrence?: InputMaybe<Scalars["Boolean"]>;
};

export type DeviceInfo = {
  __typename?: "deviceInfo";
  fcmToken?: Maybe<Scalars["String"]>;
  token: Scalars["String"];
  type: Scalars["String"];
  webToken?: Maybe<Array<Scalars["String"]>>;
};

export type DeviceInfoDto = {
  fcmToken?: InputMaybe<Scalars["String"]>;
  token?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<PlateformType>;
  webToken?: InputMaybe<Array<Scalars["String"]>>;
};

export type DeviceInput = {
  fcmToken?: InputMaybe<Scalars["String"]>;
  token: Scalars["String"];
  type: Scalars["String"];
  webToken?: InputMaybe<Array<Scalars["String"]>>;
};

export type EditFolderInput = {
  folderId: Scalars["String"];
  newName: Scalars["String"];
  rooms: Array<Scalars["String"]>;
};

export type FavouriteChat = {
  __typename?: "favouriteChat";
  cid: Scalars["String"];
  created_at: Scalars["String"];
  fileURL: Scalars["String"];
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  phone: Scalars["String"];
  reply_msg?: Maybe<Array<ReplyMessage>>;
  roomId: Scalars["String"];
  sender: Scalars["String"];
  type: Scalars["String"];
};

export type Folder = {
  __typename?: "folder";
  _id?: Maybe<Scalars["ID"]>;
  name: Scalars["String"];
  roomId: Array<Scalars["String"]>;
};

export type GetBackgroundMessagesInput = {
  roomId: Scalars["String"];
  timestamp: Scalars["Float"];
};

export type GetChannelStatusDto = {
  __typename?: "getChannelStatusDto";
  call?: Maybe<OnGoingCallResponse>;
  callId: Scalars["String"];
  channelName: Scalars["String"];
  isChannelExists: Scalars["String"];
  message?: Maybe<Scalars["String"]>;
  success: Scalars["Boolean"];
  users?: Maybe<Array<Scalars["String"]>>;
};

export type GetChatsByIndexInput = {
  index?: InputMaybe<Scalars["Float"]>;
  limit?: InputMaybe<Scalars["Float"]>;
  roomId: Scalars["String"];
  total?: InputMaybe<Scalars["Float"]>;
};

export type GetConversationInput = {
  index: Scalars["Float"];
  limit: Scalars["Float"];
  roomId: Scalars["String"];
  scrollType: Scalars["String"];
  total: Scalars["Float"];
};

export type GetFolderInput = {
  _id?: InputMaybe<Scalars["String"]>;
};

export type GetMediaByRoomIdInput = {
  limit: Scalars["Float"];
  roomId: Scalars["String"];
  search?: InputMaybe<Scalars["String"]>;
  skip: Scalars["Float"];
  sort?: InputMaybe<Scalars["String"]>;
  type: Scalars["String"];
};

export type GetSurveyReportInput = {
  From?: InputMaybe<Scalars["String"]>;
  QuestionId?: InputMaybe<Scalars["String"]>;
  To?: InputMaybe<Scalars["String"]>;
  _id: Scalars["String"];
  indexOfQuestion?: InputMaybe<Scalars["Float"]>;
  language?: InputMaybe<Scalars["String"]>;
  limit?: Scalars["Float"];
  page?: Scalars["Float"];
};

export type IsSurveyNeed = {
  isSurvey?: InputMaybe<Scalars["Boolean"]>;
};

export type JoinRoomInput = {
  roomId: Scalars["String"];
  user_type: Scalars["String"];
  users: Array<Scalars["String"]>;
};

export type JoinedRooms = {
  __typename?: "joinedRooms";
  left_at: Scalars["Float"];
  roomId: Scalars["String"];
  type: Scalars["String"];
};

export type Language = {
  __typename?: "language";
  _id?: Maybe<Scalars["ID"]>;
  code?: Maybe<Scalars["String"]>;
  icon?: Maybe<Scalars["String"]>;
  name?: Maybe<Scalars["String"]>;
};

export type LanguageInputDto = {
  _id?: InputMaybe<Scalars["ID"]>;
  code?: InputMaybe<Scalars["String"]>;
  icon?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
};

export type MembersDetail = {
  __typename?: "membersDetail";
  activeReportId?: Maybe<Scalars["String"]>;
  completeTime?: Maybe<Scalars["Float"]>;
  member?: Maybe<Member>;
  memberRole: MemberRoles;
  reportsCount: Scalars["Float"];
  roomId?: Maybe<Scalars["String"]>;
};

export type MembersDetailInput = {
  member: Scalars["String"];
  memberRole: MemberRoles;
};

export type MuteRoomInput = {
  expired_at: Scalars["String"];
  roomId: Scalars["String"];
};

export type MyCallListReponse = {
  __typename?: "myCallListReponse";
  call?: Maybe<CallInfo>;
  categoryId?: Maybe<Scalars["String"]>;
  count: Scalars["Float"];
};

export type MyRemindersInput = {
  From?: InputMaybe<Scalars["String"]>;
  To?: InputMaybe<Scalars["String"]>;
  allOccurrence?: InputMaybe<Scalars["Boolean"]>;
  date?: InputMaybe<Scalars["String"]>;
  daylyParams?: InputMaybe<DaylyParamsInput>;
  endDate: Scalars["String"];
  monthlyParams?: InputMaybe<MonthlyParamsInputForReminder>;
  parent_id?: InputMaybe<Scalars["String"]>;
  recursive?: InputMaybe<RecurrentTypes>;
  roomType?: InputMaybe<Scalars["String"]>;
  startDate: Scalars["String"];
  thisOccurrence?: InputMaybe<Scalars["Boolean"]>;
};

export type NotificationAPiInput = {
  NotificationType: Scalars["String"];
  PlatformType: Scalars["String"];
  deviceId: Scalars["String"];
  duration?: Scalars["Float"];
  name: Scalars["String"];
  userId: Scalars["String"];
};

/** onlineStatusFrequency Type. */
export enum OnlineStatusFrequency {
  /** ONCE */
  Once = "ONCE",
  /** REPEAT */
  Repeat = "REPEAT",
}

export type OrgAndIdDto = {
  _id: Scalars["String"];
  orgId: Scalars["String"];
};

export type OrgIdDto = {
  orgId: Scalars["String"];
};

export type PartialRoom = {
  __typename?: "partialRoom";
  _id: Scalars["String"];
  name: Scalars["String"];
  type: Scalars["String"];
};

export type PartialUser = {
  __typename?: "partialUser";
  _id: Scalars["String"];
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  profile_img: Scalars["String"];
};

/** Participant Accept Status Type. */
export enum ParticipantAcceptStatus {
  /** ACCEPT */
  Accept = "ACCEPT",
  /** PAUSE */
  Pause = "PAUSE",
  /** PENDING */
  Pending = "PENDING",
  /** REJECT */
  Reject = "REJECT",
}

export type ParticipantType = {
  __typename?: "participantType";
  callHistory: Array<CallHistory>;
  callStatus: Scalars["String"];
  createdAt: Scalars["DateTime"];
  uid?: Maybe<Scalars["Float"]>;
  userId: User;
};

export type ParticipantTypes = {
  __typename?: "participantTypes";
  callHistory: Array<CallHistories>;
  callStatus: Scalars["String"];
  createdAt: Scalars["DateTime"];
  uid?: Maybe<Scalars["Float"]>;
  userId: User;
};

export type PublishTaskInputDto = {
  assignmentId?: InputMaybe<Scalars["String"]>;
  masterOrg: Scalars["String"];
  orgId: Scalars["String"];
};

export type ReminderRangeResponse = {
  __typename?: "reminderRangeResponse";
  date?: Maybe<Scalars["String"]>;
  reminders?: Maybe<Array<ReminderResponse>>;
  totalPage?: Maybe<Scalars["Float"]>;
};

export type ReminderResponse = {
  __typename?: "reminderResponse";
  ApprovalStatus?: Maybe<Scalars["String"]>;
  From?: Maybe<Scalars["String"]>;
  To?: Maybe<Scalars["String"]>;
  _id?: Maybe<Scalars["String"]>;
  allOccurrence?: Maybe<Scalars["Boolean"]>;
  approvalReminderTime?: Maybe<Array<AprovalReminderTimeSchema>>;
  attachment?: Maybe<Array<AgendaAttachment>>;
  date?: Maybe<Scalars["String"]>;
  daylyParams?: Maybe<DaylyParams>;
  description?: Maybe<Scalars["String"]>;
  endDate?: Maybe<Scalars["String"]>;
  endTime?: Maybe<Scalars["String"]>;
  hasComon?: Maybe<Scalars["Boolean"]>;
  isAllDay?: Maybe<Scalars["Boolean"]>;
  isApprovalNeeded?: Maybe<Scalars["Boolean"]>;
  isConfirmationNeeded?: Maybe<Scalars["Boolean"]>;
  location?: Maybe<LocationType>;
  message?: Maybe<Array<SendChatDataSchema>>;
  monthlyParams?: Maybe<MonthlyParamsForReminder>;
  parent_id?: Maybe<Scalars["String"]>;
  participants?: Maybe<Array<Participant>>;
  recursive?: Maybe<RecurrentTypes>;
  roomId?: Maybe<Scalars["String"]>;
  roomType?: Maybe<Scalars["String"]>;
  startDate?: Maybe<Scalars["String"]>;
  startTimeInMs?: Maybe<Scalars["Float"]>;
  thisOccurrence?: Maybe<Scalars["Boolean"]>;
  time?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
  type?: Maybe<EventType>;
};

export type ReplaceMemberInput = {
  assignmentId: Scalars["String"];
  isAnonymous: Scalars["Boolean"];
  orgId: Scalars["String"];
  scenarioId: Scalars["String"];
  toBeReplacedMemberId: Scalars["String"];
  userMemberId: Scalars["String"];
};

export type RequestVideoCallDto = {
  callId: Scalars["String"];
  userId: Scalars["String"];
};

export type RequestVideoCallResponse = {
  __typename?: "requestVideoCallResponse";
  status: Scalars["String"];
};

export type ResponseInviteDtoInput = {
  _id: Scalars["String"];
  msgId: Scalars["String"];
  orgId: Scalars["String"];
};

export type RoomIdCidInput = {
  cid: Scalars["String"];
  roomId: Scalars["String"];
};

export type RoomIdCidsInput = {
  cid?: InputMaybe<Array<Scalars["String"]>>;
  roomId: Scalars["String"];
};

export type RoomIdInput = {
  roomId: Scalars["String"];
};

export type RoomIdPidInput = {
  pid: Scalars["String"];
  roomId: Scalars["String"];
};

export type RoomIdReasonInput = {
  reason: Scalars["String"];
  roomId: Scalars["String"];
};

export type ScheduleInput = {
  From?: InputMaybe<Scalars["String"]>;
  To?: InputMaybe<Scalars["String"]>;
  _id?: InputMaybe<Scalars["String"]>;
  allOccurrence?: InputMaybe<Scalars["Boolean"]>;
  approvalReminderTime?: InputMaybe<Array<AprovalReminderTimeInput>>;
  date?: InputMaybe<Scalars["String"]>;
  daylyParams?: InputMaybe<DaylyParamsInput>;
  endDate?: InputMaybe<Scalars["String"]>;
  isApprovalNeeded?: InputMaybe<Scalars["Boolean"]>;
  message?: InputMaybe<Array<SendChatDataInput>>;
  monthlyParams?: InputMaybe<MonthlyParamsInputForReminder>;
  parent_id?: InputMaybe<Scalars["String"]>;
  participants?: InputMaybe<Array<ParticipantInput>>;
  recursive?: InputMaybe<RecurrentTypes>;
  roomId?: InputMaybe<Scalars["String"]>;
  roomType?: InputMaybe<Scalars["String"]>;
  startDate?: InputMaybe<Scalars["String"]>;
  thisOccurrence?: InputMaybe<Scalars["Boolean"]>;
  time?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<EventType>;
};

export type ScheduleResponse = {
  __typename?: "scheduleResponse";
  From?: Maybe<Scalars["String"]>;
  To?: Maybe<Scalars["String"]>;
  _id: Scalars["String"];
  allOccurrence?: Maybe<Scalars["Boolean"]>;
  approvalReminderTime?: Maybe<Array<AprovalReminderTimeSchema>>;
  date?: Maybe<Scalars["String"]>;
  dateTimeInput?: Maybe<Array<DateTimeSchema>>;
  daylyParams?: Maybe<DaylyParams>;
  deliver_at?: Maybe<Scalars["String"]>;
  endDate?: Maybe<Scalars["String"]>;
  isApprovalNeeded?: Maybe<Scalars["Boolean"]>;
  message?: Maybe<Array<SendChatDataSchema>>;
  monthlyParams?: Maybe<MonthlyParamsForReminder>;
  parent_id?: Maybe<Scalars["String"]>;
  participants?: Maybe<Array<ParticipantStatus>>;
  recursive?: Maybe<RecurrentTypes>;
  roomId?: Maybe<Scalars["String"]>;
  roomType?: Maybe<Scalars["String"]>;
  startDate?: Maybe<Scalars["String"]>;
  thisOccurrence?: Maybe<Scalars["Boolean"]>;
  time?: Maybe<Scalars["String"]>;
  type?: Maybe<EventType>;
};

export type SendChatDataInput = {
  _id?: InputMaybe<Scalars["String"]>;
  duration?: InputMaybe<Scalars["Float"]>;
  fileURL?: InputMaybe<Scalars["String"]>;
  fontStyle?: InputMaybe<Scalars["String"]>;
  id_local?: InputMaybe<Scalars["String"]>;
  isForwarded?: InputMaybe<Scalars["Boolean"]>;
  message: Scalars["String"];
  roomId: Scalars["String"];
  thumbnail?: InputMaybe<Scalars["String"]>;
  type: Scalars["String"];
};

export type SendChatDataSchema = {
  __typename?: "sendChatDataSchema";
  _id?: Maybe<Scalars["String"]>;
  duration?: Maybe<Scalars["Float"]>;
  fileURL?: Maybe<Scalars["String"]>;
  fontStyle?: Maybe<Scalars["String"]>;
  isForwarded?: Maybe<Scalars["Boolean"]>;
  message: Scalars["String"];
  roomId: Scalars["String"];
  thumbnail?: Maybe<Scalars["String"]>;
  type: Scalars["String"];
};

export type SendChatInput = {
  data: SendChatDataInput;
  reply_msg?: InputMaybe<ReplyMessageInput>;
};

export type SeniorCitizenRoomInput = {
  roomId?: InputMaybe<Scalars["String"]>;
  userId?: InputMaybe<Scalars["String"]>;
};

export type SeniorCitizenRoomSchema = {
  __typename?: "seniorCitizenRoomSchema";
  roomId?: Maybe<Scalars["String"]>;
  userId?: Maybe<Scalars["String"]>;
};

export type SetRigntoneInput = {
  ringtone: Scalars["String"];
  roomId: Scalars["String"];
};

export type SetRoomNameInput = {
  newName: Scalars["String"];
  roomId: Scalars["String"];
};

export type SubRecord = {
  __typename?: "subRecord";
  _id: Scalars["ID"];
  createdAt?: Maybe<Scalars["DateTime"]>;
  title: Scalars["String"];
  updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type SubTopic = {
  __typename?: "subTopic";
  _id?: Maybe<Scalars["String"]>;
  name: Scalars["String"];
};

export type SuperAdmin = {
  __typename?: "superAdmin";
  _id: Scalars["ID"];
  activeStatus?: Maybe<Scalars["Boolean"]>;
  appVersion: Scalars["String"];
  createdAt?: Maybe<Scalars["Float"]>;
  device?: Maybe<DeviceInfo>;
  email: Scalars["String"];
  emailConfirmed: Scalars["Boolean"];
  firstName: Scalars["String"];
  isAgree: Scalars["Boolean"];
  iso_code?: Maybe<Scalars["String"]>;
  language?: Maybe<Scalars["String"]>;
  lastDevice?: Maybe<Scalars["String"]>;
  lastName: Scalars["String"];
  lastSeen?: Maybe<Scalars["Float"]>;
  phone: Scalars["String"];
  phoneConfirmed: Scalars["Boolean"];
  profile_img: Scalars["String"];
  role?: Maybe<Scalars["String"]>;
  status: Scalars["String"];
  timezone: Scalars["String"];
  updatedAt?: Maybe<Scalars["Float"]>;
};

export type SuperAdminLoginInput = {
  activeStatus?: InputMaybe<Scalars["Boolean"]>;
  appVersion?: Scalars["String"];
  code?: InputMaybe<Scalars["String"]>;
  device?: InputMaybe<DeviceInfoDto>;
  email: Scalars["String"];
  emailConfirmed?: Scalars["Boolean"];
  firstName: Scalars["String"];
  isAgree?: Scalars["Boolean"];
  iso_code?: InputMaybe<Scalars["String"]>;
  lastDevice?: InputMaybe<Scalars["String"]>;
  lastName: Scalars["String"];
  lastSeen?: InputMaybe<Scalars["Float"]>;
  password: Scalars["String"];
  phone?: Scalars["String"];
  phoneConfirmed?: Scalars["Boolean"];
  profile_img?: Scalars["String"];
  role?: InputMaybe<Scalars["String"]>;
  status?: Scalars["String"];
  timezone: Scalars["String"];
};

export type SurveyAnswer = {
  __typename?: "surveyAnswer";
  Questionanswers?: Maybe<Array<QuestionAnswer>>;
  SuperAdminId?: Maybe<Scalars["String"]>;
  _id: Scalars["ID"];
  createdAt?: Maybe<Scalars["DateTime"]>;
  isSkipped?: Maybe<Scalars["Boolean"]>;
  language?: Maybe<Scalars["String"]>;
  onFrequency?: Maybe<Scalars["String"]>;
  participants?: Maybe<SurveyParticipant>;
  surveyId?: Maybe<Scalars["String"]>;
  updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type SurveyAnswerResponsePage = {
  __typename?: "surveyAnswerResponsePage";
  data?: Maybe<Array<SurveyAnswer>>;
  languages?: Maybe<Array<Scalars["String"]>>;
  nextQuestion?: Maybe<Scalars["String"]>;
  previousQuestion?: Maybe<Scalars["String"]>;
  totalPage: Scalars["Float"];
  totalQuestion?: Maybe<Scalars["Float"]>;
};

export type SurveyAnswersInput = {
  Questionanswers?: InputMaybe<Array<QuestionAnswerInput>>;
  SuperAdminId?: InputMaybe<Scalars["String"]>;
  _id?: InputMaybe<Scalars["String"]>;
  isSkipped?: InputMaybe<Scalars["Boolean"]>;
  language?: InputMaybe<Scalars["String"]>;
  participants?: InputMaybe<SurveyParticipantInput>;
  surveyId?: InputMaybe<Scalars["String"]>;
};

export type SurveyDateTimeInput = {
  Module?: InputMaybe<SurveyEventType>;
  _id?: InputMaybe<Scalars["String"]>;
  date?: InputMaybe<Scalars["String"]>;
};

export type SurveyEdge = {
  __typename?: "surveyEdge";
  _id: Scalars["ID"];
  label?: Maybe<Scalars["String"]>;
  location: Scalars["Boolean"];
  media?: Maybe<MediaType>;
  nextPrompt?: Maybe<SurveyNextPrompts>;
  notifyTo?: Maybe<Array<SurveyNotifyUsers>>;
  options?: Maybe<Array<SurveyEdgeOption>>;
  order?: Maybe<Scalars["Float"]>;
  signature: Scalars["Boolean"];
  targetTaskID?: Maybe<Scalars["String"]>;
  type: SurveyEdgeTypes;
};

export type SurveyEdgeOption = {
  __typename?: "surveyEdgeOption";
  label?: Maybe<Scalars["String"]>;
  location?: Maybe<Scalars["Boolean"]>;
  media?: Maybe<MediaType>;
  nextPrompt?: Maybe<SurveyNextPrompts>;
  notifyTo?: Maybe<Array<SurveyNotifyUsers>>;
  signature: Scalars["Boolean"];
};

/** Edge types. */
export enum SurveyEdgeTypes {
  /** Regular edge */
  Default = "DEFAULT",
  /** Timeout edge */
  Timeout = "TIMEOUT",
}

/** NextPrompt type. */
export enum SurveyNextPromptTypes {
  /** Show Next Task After APPROVAL */
  Approval = "APPROVAL",
  /** Show Next Task After DELAY */
  Delay = "DELAY",
  /** Show Next Task IMMEDIATELY */
  Immediately = "IMMEDIATELY",
}

export type SurveyNextPrompts = {
  __typename?: "surveyNextPrompts";
  time: Scalars["Float"];
  type?: Maybe<SurveyNextPromptTypes>;
};

export type SurveyNotifyToInputDto = {
  member: Scalars["String"];
  message: Scalars["String"];
};

export type SurveyNotifyUsers = {
  __typename?: "surveyNotifyUsers";
  member?: Maybe<Member>;
  message?: Maybe<Scalars["String"]>;
};

export type SurveyOptionEdgeDto = {
  label: Scalars["String"];
  location?: InputMaybe<Scalars["Boolean"]>;
  media?: InputMaybe<MediaType>;
  nextPrompt?: InputMaybe<NextPromptDto>;
  notifyTo?: InputMaybe<Array<SurveyNotifyToInputDto>>;
  signature: Scalars["Boolean"];
};

export type SurveyOptionsDto = {
  _id?: InputMaybe<Scalars["String"]>;
  title?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<Scalars["String"]>;
};

export type SurveyOptionsS = {
  __typename?: "surveyOptionsS";
  _id?: Maybe<Scalars["ID"]>;
  title?: Maybe<Scalars["String"]>;
  type?: Maybe<Scalars["String"]>;
};

export type SurveyParticipantInput = {
  _id: Scalars["String"];
  firstName?: InputMaybe<Scalars["String"]>;
  lastName?: InputMaybe<Scalars["String"]>;
  phone?: InputMaybe<Scalars["String"]>;
  profile_img: Scalars["String"];
};

export type SurveyQuestionDto = {
  _id?: InputMaybe<Scalars["String"]>;
  address?: InputMaybe<Scalars["String"]>;
  content?: InputMaybe<Scalars["String"]>;
  edges?: InputMaybe<Array<CreateEdgeDtoSurvey>>;
  label?: InputMaybe<Scalars["String"]>;
  language?: InputMaybe<Scalars["String"]>;
  lat?: InputMaybe<Scalars["Float"]>;
  long?: InputMaybe<Scalars["Float"]>;
  options?: InputMaybe<Array<SurveyOptionsDto>>;
  position?: InputMaybe<PositionDto>;
  radius?: InputMaybe<Scalars["String"]>;
  remindEvery?: InputMaybe<Scalars["Float"]>;
  saveUserLocation?: InputMaybe<Scalars["Boolean"]>;
  scenarioId?: InputMaybe<Scalars["String"]>;
  signature?: InputMaybe<Scalars["Boolean"]>;
  subType?: InputMaybe<Scalars["String"]>;
  timeout?: InputMaybe<Scalars["Float"]>;
  type?: InputMaybe<Scalars["String"]>;
  width?: InputMaybe<Scalars["Float"]>;
};

export type SurveyQuestions = {
  __typename?: "surveyQuestions";
  _id?: Maybe<Scalars["ID"]>;
  address?: Maybe<Scalars["String"]>;
  content?: Maybe<Scalars["String"]>;
  edges?: Maybe<Array<SurveyEdge>>;
  label?: Maybe<Scalars["String"]>;
  language?: Maybe<Scalars["String"]>;
  lat?: Maybe<Scalars["Float"]>;
  long?: Maybe<Scalars["Float"]>;
  options?: Maybe<Array<SurveyOptionsS>>;
  position?: Maybe<Position>;
  radius?: Maybe<Scalars["String"]>;
  remindEvery?: Maybe<Scalars["Float"]>;
  scenarioId?: Maybe<Scalars["String"]>;
  signature?: Maybe<Scalars["Boolean"]>;
  subType?: Maybe<Scalars["String"]>;
  timeout?: Maybe<Scalars["Float"]>;
  type?: Maybe<Scalars["String"]>;
  userId?: Maybe<Scalars["String"]>;
  version?: Maybe<Scalars["Float"]>;
  width?: Maybe<Scalars["Float"]>;
};

export type SurveyReportDto = {
  Model?: InputMaybe<SurveyModelType>;
  _id?: InputMaybe<Scalars["String"]>;
  language?: InputMaybe<Scalars["String"]>;
  scenarioId?: InputMaybe<Scalars["String"]>;
  surveyId?: InputMaybe<Scalars["String"]>;
};

export type SurveyReports = {
  __typename?: "surveyReports";
  Model?: Maybe<SurveyModelType>;
  Questions?: Maybe<Array<Scalars["String"]>>;
  _id: Scalars["ID"];
  childId?: Maybe<Scalars["String"]>;
  description?: Maybe<Scalars["String"]>;
  language?: Maybe<Scalars["String"]>;
  name: Scalars["String"];
  parentId?: Maybe<Scalars["String"]>;
  type: ScenarioType;
  userId?: Maybe<Scalars["String"]>;
};

export type SurveyScenario = {
  __typename?: "surveyScenario";
  Model?: Maybe<SurveyModelType>;
  Questions?: Maybe<Array<SurveyQuestions>>;
  _id: Scalars["ID"];
  childId?: Maybe<Scalars["String"]>;
  createdAt?: Maybe<Scalars["DateTime"]>;
  description?: Maybe<Scalars["String"]>;
  language?: Maybe<Scalars["String"]>;
  name: Scalars["String"];
  parentId?: Maybe<Scalars["String"]>;
  surveyId?: Maybe<Scalars["String"]>;
  type: ScenarioType;
  updatedAt?: Maybe<Scalars["DateTime"]>;
  userId?: Maybe<Scalars["String"]>;
};

/** Survey Scenario Type */
export enum SurveyScenarioType {
  /** Draft scenario */
  Draft = "DRAFT",
  /** Master scenario */
  Master = "MASTER",
  /** PAUSE scenario */
  Pause = "PAUSE",
  /** Published scenario */
  Published = "PUBLISHED",
  /** Template scenario */
  Template = "TEMPLATE",
}

export type SurveyScenarioninput = {
  Model?: InputMaybe<SurveyModelType>;
  Questions?: InputMaybe<Array<SurveyQuestionDto>>;
  _id?: InputMaybe<Scalars["String"]>;
  childId?: InputMaybe<Scalars["String"]>;
  deleted?: InputMaybe<Scalars["Boolean"]>;
  description?: InputMaybe<Scalars["String"]>;
  language?: InputMaybe<Scalars["String"]>;
  name?: InputMaybe<Scalars["String"]>;
  parentId?: InputMaybe<Scalars["String"]>;
  surveyId?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<ScenarioType>;
  userId?: InputMaybe<Scalars["String"]>;
};

export type SurveyUpdateEdgeDto = {
  _id: Scalars["String"];
  label?: InputMaybe<Scalars["String"]>;
  location?: InputMaybe<Scalars["Boolean"]>;
  media?: InputMaybe<MediaType>;
  nextPrompt?: InputMaybe<NextPromptDto>;
  notifyTo?: InputMaybe<Array<SurveyNotifyToInputDto>>;
  options?: InputMaybe<Array<SurveyOptionEdgeDto>>;
  order?: InputMaybe<Scalars["Float"]>;
  signature?: InputMaybe<Scalars["Boolean"]>;
  targetTaskID?: InputMaybe<Scalars["String"]>;
  type?: InputMaybe<EdgeTypes>;
};

export type UdpateChatInput = {
  data: SendChatDataInput;
  isSent: Scalars["Boolean"];
  reply_msg?: InputMaybe<ReplyMessageInput>;
};

export type UpdateDisMissInput = {
  _id?: InputMaybe<Scalars["String"]>;
  isDismiss?: InputMaybe<Scalars["Boolean"]>;
};

export type UpdateModeInput = {
  mode?: UserModeStatus;
};

export type UpdatePublishSurveyInput = {
  _id: Scalars["String"];
  type?: InputMaybe<ScenarioType>;
};

export type UpdateRoomAdminInput = {
  admin: Array<Scalars["String"]>;
  common: Array<Scalars["String"]>;
  roomId: Scalars["String"];
};

export type UpdateScenarioCategoryDto = {
  _id: Scalars["String"];
  name: Scalars["String"];
  orgId: Scalars["String"];
};

export type UpdateTopicInputDto = {
  _id: Scalars["String"];
  name: Scalars["String"];
};

export type UpdateUserAvailabilityInput = {
  userAvailability?: UserAvailability;
};

export type UpdateUserLanguageInput = {
  language?: InputMaybe<Scalars["String"]>;
};

export type UpdateuserFolderInputDto = {
  _id: Scalars["String"];
  name?: InputMaybe<Scalars["String"]>;
};

/** userAvailability Type. */
export enum UserAvailability {
  /** ANONYMOUS */
  Anonymous = "ANONYMOUS",
  /** AVAILABLE */
  Available = "AVAILABLE",
}

export type UserFolder = {
  __typename?: "userFolder";
  _id: Scalars["ID"];
  createdAt?: Maybe<Scalars["DateTime"]>;
  name?: Maybe<Scalars["String"]>;
  parent?: Maybe<Scalars["String"]>;
  records?: Maybe<Array<SubRecord>>;
  subFolders?: Maybe<Array<UserSubFolder>>;
  updatedAt?: Maybe<Scalars["DateTime"]>;
  userId?: Maybe<Scalars["String"]>;
};

export type UserIdsInput = {
  Ids: Array<Scalars["String"]>;
};

/** user Status Type. */
export enum UserModeStatus {
  /** CLASSIC */
  Classic = "CLASSIC",
  /** SENIORCITIZEN */
  Seniorcitizen = "SENIORCITIZEN",
}

export type UserSubFolder = {
  __typename?: "userSubFolder";
  _id: Scalars["ID"];
  createdAt?: Maybe<Scalars["DateTime"]>;
  name?: Maybe<Scalars["String"]>;
  updatedAt?: Maybe<Scalars["DateTime"]>;
};

export type VersionManagement = {
  __typename?: "versionManagement";
  _id: Scalars["ID"];
  activeVersion: Scalars["String"];
  expiredVersion: Array<Scalars["String"]>;
  maintainer: Array<Scalars["String"]>;
  type: VersionType;
};

export type VersionManagementInputDto = {
  type: VersionType;
};

export type VersionManagementUpdateDto = {
  _id: Scalars["ID"];
  activeVersion: Scalars["String"];
  expiredVersion: Array<Scalars["String"]>;
  maintainer: Array<Scalars["String"]>;
};

/** Version Type */
export enum VersionType {
  /** Andriod version */
  Android = "ANDROID",
  /** Ios version */
  Ios = "IOS",
}

export type WebDeviceDto = {
  plateform?: InputMaybe<PlateformType>;
  token?: InputMaybe<Scalars["String"]>;
};

export type AssignmentQueryVariables = Types.Exact<{
  input: Types.IdDto;
}>;

export type AssignmentQuery = {
  __typename?: "Query";
  assignment: {
    __typename?: "Assignment";
    _id: string;
    recurrent?: Types.RecurrentTypes | null;
    organizationId?: string | null;
    start?: number | null;
    end?: number | null;
    startTimeInMs?: number | null;
    periodical?: number | null;
    completeTime?: number | null;
    scenario?: {
      __typename?: "Scenario";
      _id: string;
      name: string;
      description?: string | null;
      organizationId?: string | null;
      isValid: boolean;
      type: Types.ScenarioType;
      childId?: string | null;
      parentId?: string | null;
      isAssigned: boolean;
      tasks: Array<{
        __typename?: "Task";
        _id: string;
        label: string;
        content: string;
        type: Types.TaskTypes;
        nextPrompt?: {
          __typename?: "NextPrompt";
          type?: Types.NextPromptType | null;
          time: number;
        } | null;
        edges: Array<{
          __typename?: "Edge";
          _id: string;
          type: Types.EdgeTypes;
          label?: string | null;
          media?: Types.MediaType | null;
          location: boolean;
          order?: number | null;
          signature: boolean;
          targetTaskID?: string | null;
          options?: Array<{
            __typename?: "EdgeOption";
            label?: string | null;
            location?: boolean | null;
            media?: Types.MediaType | null;
            signature: boolean;
          }> | null;
        }>;
      }>;
    } | null;
    members: Array<{
      __typename?: "membersDetail";
      reportsCount: number;
      activeReportId?: string | null;
      roomId?: string | null;
      memberRole: Types.MemberRoles;
      completeTime?: number | null;
      member?: {
        __typename?: "Member";
        _id: string;
        organizationId: Array<string>;
        status: Types.InviteStatus;
        role: Types.UserRoles;
        user?: {
          __typename?: "User";
          _id: string;
          email: string;
          phone: string;
          firstName: string;
          lastName: string;
          profile_img: string;
        } | null;
      } | null;
    }>;
    montlyParams?: {
      __typename?: "MonthlyParams";
      months?: Array<Types.Months> | null;
      twicePerMonth?: boolean | null;
    } | null;
    daylyParams?: {
      __typename?: "DaylyParams";
      dayOfWeeks: Array<Types.DaysOfWeek>;
      everyWeek?: number | null;
    } | null;
  };
};

export type MyAssignmentsQueryVariables = Types.Exact<{
  input: Types.MyAssignmentsInputDto;
}>;

export type MyAssignmentsQuery = {
  __typename?: "Query";
  myAssignments: {
    __typename?: "PaginatedAssignment";
    totalCount: number;
    data?: Array<{
      __typename?: "Assignment";
      _id: string;
      recurrent?: Types.RecurrentTypes | null;
      organizationId?: string | null;
      start?: number | null;
      end?: number | null;
      startTimeInMs?: number | null;
      periodical?: number | null;
      completeTime?: number | null;
      scenario?: {
        __typename?: "Scenario";
        _id: string;
        name: string;
        description?: string | null;
        tasks: Array<{
          __typename?: "Task";
          _id: string;
          nextPrompt?: {
            __typename?: "NextPrompt";
            type?: Types.NextPromptType | null;
            time: number;
          } | null;
        }>;
      } | null;
      members: Array<{
        __typename?: "membersDetail";
        reportsCount: number;
        activeReportId?: string | null;
        roomId?: string | null;
        memberRole: Types.MemberRoles;
        completeTime?: number | null;
        member?: {
          __typename?: "Member";
          _id: string;
          organizationId: Array<string>;
          status: Types.InviteStatus;
          role: Types.UserRoles;
          user?: {
            __typename?: "User";
            _id: string;
            email: string;
            phone: string;
            firstName: string;
            lastName: string;
            profile_img: string;
          } | null;
        } | null;
      }>;
      montlyParams?: {
        __typename?: "MonthlyParams";
        months?: Array<Types.Months> | null;
        twicePerMonth?: boolean | null;
      } | null;
      daylyParams?: {
        __typename?: "DaylyParams";
        dayOfWeeks: Array<Types.DaysOfWeek>;
        everyWeek?: number | null;
      } | null;
    }> | null;
  };
};

export const AssignmentDocument = gql`
  query assignment($input: IdDto!) {
    assignment(input: $input) {
      ...AssignmentDetails
      scenario {
        ...ScenarioDetails
      }
    }
  }
  ${AssignmentDetailsFragmentDoc}
  ${ScenarioDetailsFragmentDoc}
`;

/**
 * __useAssignmentQuery__
 *
 * To run a query within a React component, call `useAssignmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useAssignmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAssignmentQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAssignmentQuery(
  baseOptions: Apollo.QueryHookOptions<
    AssignmentQuery,
    AssignmentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<AssignmentQuery, AssignmentQueryVariables>(
    AssignmentDocument,
    options
  );
}
export function useAssignmentLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    AssignmentQuery,
    AssignmentQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<AssignmentQuery, AssignmentQueryVariables>(
    AssignmentDocument,
    options
  );
}
export type AssignmentQueryHookResult = ReturnType<typeof useAssignmentQuery>;
export type AssignmentLazyQueryHookResult = ReturnType<
  typeof useAssignmentLazyQuery
>;
export type AssignmentQueryResult = Apollo.QueryResult<
  AssignmentQuery,
  AssignmentQueryVariables
>;
export const MyAssignmentsDocument = gql`
  query myAssignments($input: MyAssignmentsInputDto!) {
    myAssignments(input: $input) {
      ...PaginatedAssignmentDetails
    }
  }
  ${PaginatedAssignmentDetailsFragmentDoc}
`;

/**
 * __useMyAssignmentsQuery__
 *
 * To run a query within a React component, call `useMyAssignmentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyAssignmentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyAssignmentsQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMyAssignmentsQuery(
  baseOptions: Apollo.QueryHookOptions<
    MyAssignmentsQuery,
    MyAssignmentsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<MyAssignmentsQuery, MyAssignmentsQueryVariables>(
    MyAssignmentsDocument,
    options
  );
}
export function useMyAssignmentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    MyAssignmentsQuery,
    MyAssignmentsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<MyAssignmentsQuery, MyAssignmentsQueryVariables>(
    MyAssignmentsDocument,
    options
  );
}
export type MyAssignmentsQueryHookResult = ReturnType<
  typeof useMyAssignmentsQuery
>;
export type MyAssignmentsLazyQueryHookResult = ReturnType<
  typeof useMyAssignmentsLazyQuery
>;
export type MyAssignmentsQueryResult = Apollo.QueryResult<
  MyAssignmentsQuery,
  MyAssignmentsQueryVariables
>;
