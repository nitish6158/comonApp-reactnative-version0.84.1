import reducers from "./Reducer";
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import  {createLogger} from 'redux-logger'
import { reduxMMKVStorage } from "./backup/mmkv";

const logger = createLogger({
  duration:true,
  predicate: (getState, action) => {
    console.log("REDUX-TOOLKIT:- ",action.type)
    return false
  }
});


const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    immutableCheck: { warnAfter: 512 },
    serializableCheck: { 
      ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      warnAfter: 512
    },
  }).concat(logger)
});
export const persistor = persistStore(store);
export default store;


export type RootState = ReturnType<typeof store.getState>

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector