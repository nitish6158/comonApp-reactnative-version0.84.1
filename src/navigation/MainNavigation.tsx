import React, { useEffect, useCallback } from "react";
import { initialRouteAtom } from "./Application";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import AccountSettingsScreen from "@/Containers/HomeContainer/MainContainer/ProfileContainer/accountSettings/AccountSettingsScreen";
import AddAdmin from "@/Containers/HomeContainer/MainContainer/ChatContainer/GroupChatSettings/AddAdmin";
import AddToRooms from "@/Containers/HomeContainer/MainContainer/ChatContainer/AddorRemoveParticipants/addToRoom";
import AddorRemoveParticipants from "@/Containers/HomeContainer/MainContainer/ChatContainer/AddorRemoveParticipants";

import ArchiveScreen from "@/Containers/HomeContainer/MainContainer/ChatContainer/ArchiveScreen";
import AssignmentChatScreen from "@/Containers/HomeContainer/MainContainer/TaskContainer/AssignmentsContainer/AssignmentChatScreen";

import BottomTabScreen, {
  initialBottomTabScreenAtom,
} from "./BottomTabNavigator";
import CallHistoryDetails from "@/Containers/HomeContainer/MainContainer/CallContainer/CallHistoryContainer";

import ChatMessageInfo from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessageInfo";
import ChatMessages from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages";

import ContactDetails from "@/Containers/HomeContainer/MainContainer/ChatContainer/IndividualChatContactDetails";
import SelectContactScreen from "@/Containers/HomeContainer/MainContainer/ProfileContainer/contacts/SelectContactScreen";
import ContactsScreen from "@/Containers/HomeContainer/MainContainer/ProfileContainer/contacts/ContactsScreen";
import CreateGroupProfile from "@/Containers/HomeContainer/MainContainer/ChatContainer/GroupsChats/CreateGroupProfile";

import Disappear from "@/Containers/HomeContainer/MainContainer/ChatContainer/DisappearChat";
import EditProfileScreen from "@/Containers/HomeContainer/MainContainer/ProfileContainer/editProfileScreen";
import Favorite from "@/Containers/HomeContainer/MainContainer/ChatContainer/FavoriteChats";
import Folders from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatFolderContainer/Folders";
import ForwardChatMessage from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/ForwardChatMessages";
import GlobalSearch from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatGlobalSearch";
import GroupChatSetting from "@/Containers/HomeContainer/MainContainer/ChatContainer/GroupChatSettings";
import GroupDescription from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatGroupDescription";
import GroupsInCommon from "@/Containers/HomeContainer/MainContainer/ChatContainer/CommonChatGroups";
import { HeaderWithScreenName } from "@Components/header/HeaderWithScreenName";
import { MainNavigatorParamList } from "./screenPropsTypes";
import MediaLinkAndDocs from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMediaLinkAndDocs";
import Menu from "@/Containers/HomeContainer/MainContainer/ProfileContainer/UserProfile";
import NewCallScreen from "@/Containers/HomeContainer/MainContainer/CallContainer/NewCallScreen";
import CreateFolderScreen from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatFolderContainer/CreateFolderScreen";
import OrganisationInvites from "@/Containers/HomeContainer/MainContainer/ProfileContainer/OrganisationInvites";
import ProfileInfo from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatProfileInfoScreen";

import { ReportScreen } from "@/Containers/HomeContainer/MainContainer/TaskContainer/ReportsContainer/ReportScreen";

import SelectChatRoomScreen from "@/Containers/HomeContainer/MainContainer/ProfileContainer/contacts/SelectChatRoomScreen";
import Sound from "@/Containers/HomeContainer/MainContainer/ChatContainer/WallpaperAndSound/Sound";
import AssignmentNotificationScreen from "@/Containers/HomeContainer/MainContainer/TaskContainer/AssignmentsContainer/AssignmentNotificationScreen";
import TimezoneMismatch from "@/Containers/HomeContainer/MainContainer/TaskContainer/TimezoneMismatch";

import WallpaperAndSound from "@/Containers/HomeContainer/MainContainer/ChatContainer/WallpaperAndSound";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useTranslation } from "react-i18next";

import SelectParticipantForGroup from "@/Containers/HomeContainer/MainContainer/ChatContainer/GroupsChats/SelectParticipantForGroup";
import AboutContainer from "@/Containers/HomeContainer/MainContainer/ProfileContainer/aboutScreen";
import PasswordChangeContainer from "@/Containers/HomeContainer/MainContainer/ProfileContainer/accountSettings/PasswordChange";
import BlockedContactsContainers from "@/Containers/HomeContainer/MainContainer/ProfileContainer/accountSettings/BlockedContacts";

import BroadcastProfile from "@/Containers/HomeContainer/MainContainer/BroadcastContainer/BroadcastProfile";
import BroadcastParticipant from "@/Containers/HomeContainer/MainContainer/BroadcastContainer/BroadcastParticipant";
import AddMessageTopicsScreen from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/AddMessageTopicsScreen";
import ShowMessageTopicsScreen from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/ShowMessageTopicsScreen";
import ShowTopicMessagesScreen from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatMessages/ShowTopicMessagesScreen";
import PhoneRingtone from "@/Containers/HomeContainer/MainContainer/ChatContainer/WallpaperAndSound/PhoneRingtone";
import { MenuProvider } from "react-native-popup-menu";
import Privacy from "@/Containers/HomeContainer/MainContainer/ProfileContainer/accountSettings/Privacy";
import ViewContactScreen from "@/Containers/HomeContainer/MainContainer/ProfileContainer/contacts/ViewContactScreen";
import SendContactScreen from "@/Containers/HomeContainer/MainContainer/ProfileContainer/contacts/SendContactScreen";
import ViewTopicsScreen from "@/Containers/HomeContainer/MainContainer/ChatTopicContainer/ViewTopicsScreen";
import CreateTopicsScreen from "@/Containers/HomeContainer/MainContainer/ChatTopicContainer/CreateTopicsScreen";
import SubTopicScreen from "@/Containers/HomeContainer/MainContainer/ChatTopicContainer/SubTopicScreen";

import CreateReminderScreen from "@/Containers/HomeContainer/MainContainer/ReminderContainer/CreateReminderScreen";
import ViewReminderScreen from "@/Containers/HomeContainer/MainContainer/ReminderContainer/ViewReminderScreen";
import AttachmentViewScreen from "@/Containers/HomeContainer/MainContainer/ReminderContainer/AttachmentViewScreen";
import CreateScheduleMessage from "@/Containers/HomeContainer/MainContainer/ChatContainer/ScheduleMessages/CreateScheduleMessage.tsx";
import ViewScheduleAttachment from "@/Containers/HomeContainer/MainContainer/ChatContainer/ScheduleMessages/ViewScheduleAttachment";
import ViewScheduleMessage from "@/Containers/HomeContainer/MainContainer/ChatContainer/ScheduleMessages/ViewScheduleMessage";
import CalenderNotifications from "@/Containers/HomeContainer/MainContainer/Calendar/CalenderNotifications";
import CreateChatRooms from "@/Containers/HomeContainer/MainContainer/ChatContainer/CreateChatRooms";
import UserPrivacySettings from "@/Containers/HomeContainer/MainContainer/ProfileContainer/UserPrivacySettings";
import { getCurrentRoute, navigate } from "./utility";
import ViewDatabaseScreen from "@/Containers/HomeContainer/MainContainer/UserDatabaseContainer/ViewDatabaseScreen";
import CreateCategoryScreen from "@/Containers/HomeContainer/MainContainer/UserDatabaseContainer/CreateCategoryScreen";
import CreateRecordScreen from "@/Containers/HomeContainer/MainContainer/UserDatabaseContainer/CreateRecordScreen";
import ViewRecordScreen from "@/Containers/HomeContainer/MainContainer/UserDatabaseContainer/ViewRecordScreen";
import CreateChatPollScreen from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatPolls/CreateChatPollScreen";
import ViewChatResultScreen from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatPolls/ViewChatResultScreen";
import UserManualScreen from "@/Containers/HomeContainer/MainContainer/ProfileContainer/UserManual";
import ContactReminders from "@/Containers/HomeContainer/MainContainer/ProfileContainer/ContactReminder";
import { KillStateTaskAtom } from "@/Containers/SessionContainer/PlatformForegroundService";
import useTaskNotificationHandler from "@/hooks/useTaskNotifcationHandler";
import SurveyContainer from "@/Containers/HomeContainer/MainContainer/SurveyContainer";
import CreateOrganization from "@/Containers/TaskContainer/CreateOrganization";
import OrganizationListing from "@/Containers/TaskContainer/OrganizationListing";
import CreateTask from "@/Containers/TaskContainer/CreateTask";
import TaskList from "@/Containers/TaskContainer/TaskList";
import TaskManager from "@/Containers/TaskContainer/TaskManager";

const MainStack = createNativeStackNavigator<MainNavigatorParamList>();

export function MainNavigator() {
  const { t } = useTranslation();
  const [killStateTask, setKillStateTask] = useAtom(KillStateTaskAtom);
  const { handleTaskNotificationTap } = useTaskNotificationHandler();

  useEffect(() => {
    if (killStateTask) {
      setTimeout(() => {
        handleTaskNotificationTap(killStateTask.orgId, killStateTask.assignId);
      }, 2000);
      setKillStateTask(null);
    }
  }, [killStateTask]);

  const initialRoute = useAtomValue(initialRouteAtom);
  const initialBottomRoute = useSetAtom(initialBottomTabScreenAtom);

  // Use useCallback to memoize the navigation functions
  const handleChatMessageNavigation = useCallback((payload) => {
    if (getCurrentRoute() !== "ChatMessageScreen") {
      navigate("ChatMessageScreen", payload);
    }
  }, []);

  const handleBottomTabNavigation = useCallback(
    (payload) => {
      if (payload && Object.keys(payload).length > 0) {
        initialBottomRoute(payload);
      }
    },
    [initialBottomRoute],
  );

  // This effect now uses memoized functions and has better conditionals
  useEffect(() => {
    if (!initialRoute.name) return;

    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    switch (initialRoute.name) {
      case "ChatMessageScreen":
        if (initialRoute.payload) {
          handleChatMessageNavigation(initialRoute.payload);
          retryTimer = setTimeout(() => {
            handleChatMessageNavigation(initialRoute.payload);
          }, 1200);
        }
        break;
      case "BottomTabScreen":
        if (initialRoute.payload) {
          handleBottomTabNavigation(initialRoute.payload);
        }
        break;
      default:
        break;
    }

    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [initialRoute.name, initialRoute.payload, handleBottomTabNavigation, handleChatMessageNavigation]);

  return (
    <MenuProvider>
      <MainStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={"BottomTabScreen"}
      >
        <MainStack.Screen
          name="BottomTabScreen"
          component={BottomTabScreen}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="AssignmentNotificationScreen"
          component={AssignmentNotificationScreen}
        />
        <MainStack.Screen
          name="PasswordChangeContainer"
          component={PasswordChangeContainer}
        />

        <MainStack.Screen
          name="ProfileScreen"
          component={AccountSettingsScreen}
          options={{
            header: () => (
              <HeaderWithScreenName
                title={t("titles.account-settings")}
                // navigateNested={{ page: ScreensList.Root, screen: ScreensList.Root }}
              />
            ),
          }}
        />

        <MainStack.Screen
          name="UserPrivacySettings"
          component={UserPrivacySettings}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="CreateChatPollScreen"
          component={CreateChatPollScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="SurveyContainer"
          component={SurveyContainer}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="ViewChatResultScreen"
          component={ViewChatResultScreen}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="ViewReminderScreen"
          component={ViewReminderScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="CreateReminderScreen"
          component={CreateReminderScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="CreateScheduleMessage"
          component={CreateScheduleMessage}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="AttachmentViewScreen"
          component={AttachmentViewScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="ViewContactScreen"
          component={ViewContactScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="SendContactScreen"
          component={SendContactScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* <MainStack.Screen
          name="ShowTopicMessagesScreen"
          component={ShowTopicMessagesScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="ShowMessageTopicsScreen"
          component={ShowMessageTopicsScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="AddMessageTopicsScreen"
          component={AddMessageTopicsScreen}
          options={{
            headerShown: false,
          }}
        /> */}

        <MainStack.Screen
          name="EditProfileImageScreen"
          component={EditProfileScreen}
          options={{
            headerShown: false,
            header: () => (
              <HeaderWithScreenName title={t("navigation.editProfile")} />
            ),
          }}
        />

        <MainStack.Screen
          name="ViewScheduleMessage"
          component={ViewScheduleMessage}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="ViewScheduleAttachment"
          component={ViewScheduleAttachment}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="BlockedContactsContainers"
          component={BlockedContactsContainers}
          options={{
            headerShown: false,
            header: () => (
              <HeaderWithScreenName title={t("navigation.BlockedContacts")} />
            ),
          }}
        />

        <MainStack.Screen
          name="AboutContainer"
          component={AboutContainer}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="ViewDatabaseScreen"
          component={ViewDatabaseScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="UserManualScreen"
          component={UserManualScreen}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="CreateCategoryScreen"
          component={CreateCategoryScreen}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="CreateRecordScreen"
          component={CreateRecordScreen}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="ViewRecordScreen"
          component={ViewRecordScreen}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="ContactListScreen"
          component={ContactsScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="CalenderNotifications"
          component={CalenderNotifications}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="TimezoneMismatch"
          component={TimezoneMismatch}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="ContactRemindersScreen"
          component={ContactReminders}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="ViewTopicsScreen"
          component={ViewTopicsScreen}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="CreateTopicsScreen"
          component={CreateTopicsScreen}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="SubTopicScreen"
          component={SubTopicScreen}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="CallParticipantSelectionScreen"
          component={NewCallScreen}
          options={{
            headerShown: false,
            header: () => <HeaderWithScreenName title={t("titles.newCall")} />,
          }}
        />

        <MainStack.Screen
          name="CallHistoryScreen"
          component={CallHistoryDetails}
          options={{
            headerShown: true,
            header: () => (
              <HeaderWithScreenName title={t("titles.callhistorydetails")} />
            ),
          }}
        />

        <MainStack.Screen
          name="SelectChatRoomScreen"
          component={SelectChatRoomScreen}
          options={{
            headerShown: false,
            // header: () => <HeaderWithScreenName title="titles.contacts" />,
          }}
        />
        <MainStack.Screen
          name="SelectContactScreen"
          component={SelectContactScreen}
          options={{
            headerShown: false,
            // header: () => <HeaderWithScreenName title="titles.contacts" />,
          }}
        />
        <MainStack.Screen
          name="ChatMessageScreen"
          component={ChatMessages}
          options={{
            headerShown: false,
          }}
          initialParams={initialRoute.payload}
        />
        <MainStack.Screen
          name="FolderListScreen"
          component={Folders}
          options={{
            header: () => (
              <HeaderWithScreenName title={t("titles.FolderManagement")} />
            ),
          }}
        />
        <MainStack.Screen
          name="CreateFolderScreen"
          component={CreateFolderScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="SelectParticipantForGroup"
          component={SelectParticipantForGroup}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="ForwardMessageScreen"
          component={ForwardChatMessage}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="Broadcast"
          component={BroadcastProfile}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="BroadcastParticipant"
          component={BroadcastParticipant}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="ArchiveChatListScreen"
          component={ArchiveScreen}
          options={{
            header: () => <HeaderWithScreenName title={t("others.Archive")} />,
          }}
        />
        <MainStack.Screen
          name="ChatProfileScreen"
          component={ProfileInfo}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="CreateGroupScreen"
          component={CreateGroupProfile}
          options={{
            headerShown: false,
            // presentation: "modal",
          }}
        />
        <MainStack.Screen
          name="CreateChatRooms"
          component={CreateChatRooms}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="ChatGlobalSearchScreen"
          component={GlobalSearch}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="ChatMediaScreen"
          component={MediaLinkAndDocs}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="ChatMessageInfoScreen"
          component={ChatMessageInfo}
          options={{
            header: () => <HeaderWithScreenName title={t("titles.Back")} />,
          }}
        />
        <MainStack.Screen
          name="FavoriteChatMessageScreen"
          component={Favorite}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="CommonChatListScreen"
          component={GroupsInCommon}
          options={{
            header: () => (
              <HeaderWithScreenName title={t("others.Groups in common")} />
            ),
          }}
        />
        <MainStack.Screen
          name="ChatWallPaperAndSoundScreen"
          component={WallpaperAndSound}
          options={{
            header: () => (
              <HeaderWithScreenName title={t("others.Wallpaper & Sound")} />
            ),
          }}
        />
        <MainStack.Screen
          name="ChatSoundSelectionScreen"
          component={Sound}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="ChatDisappearSettingScreen"
          component={Disappear}
          options={{
            header: () => (
              <HeaderWithScreenName title={t("chatProfile.disappearing")} />
            ),
          }}
        />
        <MainStack.Screen
          name="ChatContactDetailsScreen"
          component={ContactDetails}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="GroupChatSettingScreen"
          component={GroupChatSetting}
          options={{
            header: () => (
              <HeaderWithScreenName title={t("others.Group Info")} />
            ),
          }}
        />
        <MainStack.Screen
          name="AddChatAdminScreen"
          component={AddAdmin}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="ChatRoomSettingScreen"
          component={AddorRemoveParticipants}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="EditChatParticipantScreen"
          component={AddToRooms}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="AssignmentChatScreen"
          component={AssignmentChatScreen}
          options={{
            headerShown: false,
          }}
        />

        <MainStack.Screen
          name="ReportScreen"
          component={ReportScreen}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="OrganisationInvites"
          component={OrganisationInvites}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="ChatDescriptionScreen"
          component={GroupDescription}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="UserProfileScreen"
          component={Menu}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="PhoneSound"
          component={PhoneRingtone}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="Privacy"
          component={Privacy}
          options={{
            headerShown: false,
          }}
        />
        <MainStack.Screen
          name="CreateOrganization"
          component={CreateOrganization}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="OrganizationListing"
          component={OrganizationListing}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="CreateTask"
          component={CreateTask}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="TaskList"
          component={TaskList}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name="TaskManager"
          component={TaskManager}
          options={{ headerShown: false }}
        />
      </MainStack.Navigator>
    </MenuProvider>
  );
}
