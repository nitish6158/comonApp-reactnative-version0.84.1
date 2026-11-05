import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FavoriteChatList, FolderDataList, ProfileData, RoomData } from "../Models/ChatModel";
import { user } from "@/schemas/schema";
import { createStorage } from "@/utils/mmkvStorage";
import { User } from "@/graphql/generated/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ChatState {
  MyProfile: User | null
  FolderDataList: FolderDataList;
  RoomMediaData: any[];
  GetFavoriteChat: FavoriteChatList;
  GetChatsInCommonList: RoomData[];
  DownloadFileStore: any[];
}

const initialState: ChatState = {
  MyProfile: null,
  FolderDataList: [] as FolderDataList,
  RoomMediaData: [],
  GetFavoriteChat: [] as FavoriteChatList,
  GetChatsInCommonList: [] as RoomData[],
  DownloadFileStore: [],
};

const chatSlice = createSlice({
  name: "user/chat",
  initialState,
  reducers: {
    setMyProfile(state, action: PayloadAction<User | null>) {
      state.MyProfile = action.payload;
    },

    setFolderDataList(state, action: PayloadAction<FolderDataList>) {
      state.FolderDataList = action.payload;
    },

    setRoomMediaData(state, action: PayloadAction<any[]>) {
      state.RoomMediaData = action.payload;
    },
    setFavoriteChatList(state, action: PayloadAction<FavoriteChatList>) {
      state.GetFavoriteChat = action.payload;
    },
    setChatsInCommonList(state, action: PayloadAction<RoomData[]>) {
      state.GetChatsInCommonList = action.payload;
    },

    setDownloadFileStore(state, action: PayloadAction<any[]>) {
      state.DownloadFileStore = action.payload;
    },

    resetChatState(state) {
      return initialState;
    },
  },
});

export const {
  setMyProfile,
  setFolderDataList,
  setRoomMediaData,
  setFavoriteChatList,
  setChatsInCommonList,
  setDownloadFileStore,
  resetChatState,
} = chatSlice.actions;
export default chatSlice.reducer;


export const chatStorage = createStorage() 

export const chatPersister = {
  setItem: (key:string, value:string) => {
    chatStorage.set(key, value);
    return AsyncStorage.setItem(`chat_${key}`, value).then(() => true);
  },
  getItem: async (key:string) => {
    const value = chatStorage.getString(key);
    return value ?? (await AsyncStorage.getItem(`chat_${key}`));
  },
  removeItem: (key:string) => {
    chatStorage.delete(key);
    return AsyncStorage.removeItem(`chat_${key}`);
  },
};
