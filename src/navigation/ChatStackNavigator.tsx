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
import AsyncStorage from "@react-native-async-storage/async-storage";
import _ from "lodash";

const ChatStack = createStackNavigator<ChatStackParamList>();
const CHAT_ROOMS_CACHE_PREFIX = "COM_ON_CHAT_ROOMS_CACHE";

const getChatRoomsCacheKey = (userId: string) => `${CHAT_ROOMS_CACHE_PREFIX}_${userId}`;

const readCachedRooms = async (userId: string) => {
  const cacheKey = getChatRoomsCacheKey(userId);
  try {
    const userCache = CHATlIST.getString(cacheKey) || (await AsyncStorage.getItem(cacheKey));
    if (userCache) {
      return userCache;
    }

    const legacyCache = CHATlIST.getString("rooms");
    if (!legacyCache) {
      return null;
    }

    const legacyRooms = JSON.parse(legacyCache);
    const isCurrentUserCache =
      Array.isArray(legacyRooms) &&
      legacyRooms.length > 0 &&
      legacyRooms.every((room: any) =>
        room?.participants?.some((participant: any) => {
          const participantId = String(participant?.user_id?._id ?? participant?.user_id ?? "");
          return participantId === userId;
        })
      );

    if (!isCurrentUserCache) {
      return null;
    }

    saveCachedRooms(legacyRooms, userId);
    return legacyCache;
  } catch (error) {
    console.warn("Unable to read cached chat rooms:", error);
    return null;
  }
};

const saveCachedRooms = (rooms: any[], userId: string) => {
  const cacheKey = getChatRoomsCacheKey(userId);
  const serializedRooms = JSON.stringify(rooms);
  try {
    CHATlIST.set(cacheKey, serializedRooms);
  } catch (error) {
    console.warn("Unable to save chat rooms in MMKV:", error);
  }
  AsyncStorage.setItem(cacheKey, serializedRooms).catch((error) => {
    console.warn("Unable to save chat rooms in AsyncStorage:", error);
  });
};

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
      if (!MyProfile?._id) {
        return;
      }

      let isActive = true;

      readCachedRooms(MyProfile._id).then((cachedList) => {
        if (!isActive || !cachedList) {
          return;
        }

        try {
          const parsedChatList = JSON.parse(cachedList);
          if (Array.isArray(parsedChatList) && parsedChatList.length > 0) {
            setChatRooms(parsedChatList);
            setArchiveRooms(parsedChatList.filter((room: any) => room.isArchived));
          }
        } catch (error) {
          console.warn("Unable to parse cached chat rooms:", error);
        }
      });

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
        saveCachedRooms(data.rooms, MyProfile._id);
      });

      return () => {
        isActive = false;
      };
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
