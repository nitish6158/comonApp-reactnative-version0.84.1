import * as React from "react";

import { StackScreenProps, createStackNavigator } from "@react-navigation/stack";

import { AuthNavigatorParamList, SeniorNavigatorParamList } from "./screenPropsTypes";
import SeniorProfileScreen from "@/Containers/HomeContainer/SeniorContainer/SeniorProfileScreen";
import SeniorChatSelectionScreen from "@/Containers/HomeContainer/SeniorContainer/SeniorChatSelectionScreen";
import SeniorChatScreen from "@/Containers/HomeContainer/SeniorContainer/SeniorChatScreen";
import SeniorChatMessageScreen from "@/Containers/HomeContainer/SeniorContainer/SeniorChatMessageScreen";
// import RealmContext from "../schemas";
import { useAppSelector } from "@/redux/Store";
import { View } from "react-native";
import { useChatRoomFormatter } from "./ChatStackNavigator";
import ViewContactScreen from "@/Containers/HomeContainer/MainContainer/ProfileContainer/contacts/ViewContactScreen";
import { useAtomValue } from "jotai";
import { initialRouteAtom } from "./Application";
import { navigate } from "./utility";
import EditProfileScreen from "@/Containers/HomeContainer/MainContainer/ProfileContainer/editProfileScreen";
import AboutContainer from "@/Containers/HomeContainer/MainContainer/ProfileContainer/aboutScreen";
import UserManualScreen from "@/Containers/HomeContainer/MainContainer/ProfileContainer/UserManual";
import ViewChatResultScreen from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatPolls/ViewChatResultScreen";
// const { useQuery, useRealm } = RealmContext;

const SeniorStack = createStackNavigator<SeniorNavigatorParamList>();

export function SeniorNavigator() {
  const { MyProfile } = useAppSelector((state) => state.Chat);

  const initialRoute = useAtomValue(initialRouteAtom);

  React.useEffect(() => {
    if (initialRoute.name) {
      setTimeout(() => {
        navigate(initialRoute.name, initialRoute.payload);
      }, 1000);
    }
  }, [initialRoute.name]);

  useChatRoomFormatter();

  if (!MyProfile) {
    return <></>;
  }

  return (
    <View style={{ flex: 1 }}>
      <SeniorStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName={
          MyProfile?.seniorCitizenRoom.length == 0 ? "SeniorChatSelectionScreen" : "SeniorChatScreen"
        }
      >
        <SeniorStack.Screen
          name="SeniorProfileScreen"
          component={SeniorProfileScreen}
          options={{ headerShown: false }}
        />
        <SeniorStack.Screen
          name="SeniorChatSelectionScreen"
          component={SeniorChatSelectionScreen}
          options={{ headerShown: false }}
        />
        <SeniorStack.Screen
          name="ViewChatResultScreen"
          component={ViewChatResultScreen}
          options={{
            headerShown: false,
          }}
        />
        <SeniorStack.Screen
          name="UserManualScreen"
          component={UserManualScreen}
          options={{
            headerShown: false,
          }}
        />
        <SeniorStack.Screen name="SeniorChatScreen" component={SeniorChatScreen} options={{ headerShown: false }} />
        <SeniorStack.Screen
          name="SeniorChatMessageScreen"
          component={SeniorChatMessageScreen}
          options={{ headerShown: false }}
        />
        <SeniorStack.Screen name="ViewContactScreen" component={ViewContactScreen} options={{ headerShown: false }} />
        <SeniorStack.Screen
          name="EditProfileImageScreen"
          component={EditProfileScreen}
          options={{ headerShown: false }}
        />

        <SeniorStack.Screen
          name="AboutContainer"
          component={AboutContainer}
          options={{
            headerShown: false,
          }}
        />
      </SeniorStack.Navigator>
    </View>
  );
}
