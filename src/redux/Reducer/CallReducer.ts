import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CallListQuery, MyCallListReponse } from "@Service/generated/call.generated";
import { callAtomType } from "@Atoms/callAtom";
import { createStorage } from "@/utils/mmkvStorage";

interface CallState {
  callList: MyCallListReponse[];
  missedList: MyCallListReponse[];
  activeCallKeys: callAtomType | null;
}

const initialState: CallState = {
  callList: [],
  missedList: [],
  activeCallKeys: null,
};

const callSlice = createSlice({
  name: "user/call",
  initialState,
  reducers: {
    updateCallList(state, action: PayloadAction<MyCallListReponse[]>) {
      state.callList = action.payload;
    },
    updateMissedList(state, action: PayloadAction<MyCallListReponse[]>) {
      state.missedList = action.payload;
    },
    resetCallState(state) {
      return initialState;
    },
    addActiveCall(state, action: PayloadAction<callAtomType>) {
      state.activeCallKeys = action.payload;
    },
    removeActiveCall(state) {
      state.activeCallKeys = null;
    },
  },
});

export const {
  updateCallList,
  updateMissedList,
  resetCallState,
  addActiveCall,
  removeActiveCall,
} = callSlice.actions;
export default callSlice.reducer;


export const callStorage = createStorage() 

export const callPersister = {
  setItem: (key:string, value:string) => {
    callStorage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key:string) => {
    const value = callStorage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key:string) => {
    callStorage.delete(key);
    return Promise.resolve();
  },
};
