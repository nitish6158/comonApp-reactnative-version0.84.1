import { AllChatRooms, ArchiveRoomsAtom } from "@Atoms/allRoomsAtom";
import ChatsScreen from "@/Containers/HomeContainer/MainContainer/ChatContainer/ChatsScreen";
import React, { useCallback, useEffect, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { ChatStackParamList } from "./screenPropsTypes";
import { RootState } from "@Store/Reducer";
import { Text, View } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { groupCallActiveData } from "@Atoms/callActiveStatusAtom";
import { initializeCacheFrom } from "@/Containers/HomeContainer/MainContainer/ChatContainer/memoizeRooms";
import useFileSystem from "@Hooks/useFileSystem";
import { useSelector } from "react-redux";
import { SurveyEventType, SurveyQuestionDto } from "@/graphql/generated/types";
import { SurveyChecker } from "@/Containers/HomeContainer/MainContainer/SurveyContainer/SurveyChecker";
import { socketManager } from "@/utils/socket/SocketManager";
import { CHATlIST } from "@/utils/socket/ChatRoomSocketHandler";
import { useFocusEffect } from "@react-navigation/core";
import _ from "lodash";

const ChatStack = createStackNavigator<ChatStackParamList>();

export default function ChatStackNavigator() {
  const { createComonDirectory } = useFileSystem();

  useEffect(() => {
    // Initialize cache and create directory
    initializeCacheFrom();
    createComonDirectory();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ChatStack.Navigator>
        <ChatStack.Screen
          name="ChatListScreen"
          component={ChatsScreen}
          options={{
            headerShown: false,
          }}
        />
      </ChatStack.Navigator>
      <SurveyChecker type={SurveyEventType["Chat"]} />
    </View>
  );
}

/**
 * Custom hook to setup chat room socket listeners and handle state updates
 */
export function useChatRoomFormatter() {
  const MyProfile = useSelector((state: RootState) => state.Chat.MyProfile);
  const setChatRooms = useSetAtom(AllChatRooms);
  const setArchiveRooms = useSetAtom(ArchiveRoomsAtom);
  const setGroupOnGoingData = useSetAtom(groupCallActiveData);

  useFocusEffect(
    useCallback(() => {
      let cachedList = CHATlIST.getString("rooms");
      if (cachedList) {
        const parsedChatList = cachedList ? JSON.parse(cachedList) : [];
        if (parsedChatList.length > 0) {
          setChatRooms(parsedChatList);
        }
      }

      handleGroupCallOngoingData();

      socketManager.chatRoom.fetchAndUpdateRooms((data) => {
        console.log("All Rooms Data: ", data.rooms.length);

        if (!data.rooms || !MyProfile?._id) {
          console.error("Room state setters or user ID not registered");
          return;
        }

        const archives = data.rooms.filter((room: any) => room.isArchived);
        // data.rooms.forEach((room) => {
        //   console.log(room.last_msg);
        // })
        setChatRooms(data.rooms);
        setArchiveRooms(archives);
        CHATlIST.set("rooms", JSON.stringify(data.rooms));
      });
    }, [MyProfile?._id])
  );

  const handleGroupCallOngoingData = useCallback(() => {
    socketManager.chatRoom.getActiveGroupCalls((data) => {
      console.log("Group Call Ongoing Data: ", data);
      if (data) {
        setGroupOnGoingData(data);
      }
    });
  }, []);
}
