import { Language } from "@/graphql/generated/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createStorage } from "@/utils/mmkvStorage";

type initialState = {
  languages: Array<Language>;
  currentLang: string;
};

const initialState: initialState = {
  languages: [],
  currentLang: "en",
};

const languageSlice = createSlice({
  name: "app/language",
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<string>) {
      state.currentLang = action.payload;
    },
    setLanguageList(state, action: PayloadAction<Language[]>) {
      state.languages = action.payload;
    },
  },
});

export const { setLanguage,setLanguageList } = languageSlice.actions;

export default languageSlice.reducer;


export const languageStorage = createStorage() 

export const languagePersister = {
  setItem: (key:string, value:string) => {
    languageStorage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key:string) => {
    const value = languageStorage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key:string) => {
    languageStorage.delete(key);
    return Promise.resolve();
  },
};
