import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import _ from "lodash";
import { ContactDetailsDto } from "@Service/generated/types";
import { createStorage } from "@/utils/mmkvStorage";

export type serverContactType = ContactDetailsDto;

interface ContactState {
  contacts: serverContactType[];
  comonContact: serverContactType[];
}

const initialState: ContactState = {
  contacts: [],
  comonContact: [],
};

function formatContact(data: serverContactType[]) {
  const tempContact: serverContactType[] = [];
  for (let one of data) {
    if (one.userId?._id) {
      tempContact.push(one);
    }
  }
  return tempContact;
}

const contactSlice = createSlice({
  name: "user/contact",
  initialState,
  reducers: {
    updateContact(state, action: PayloadAction<serverContactType[]>) {
      state.contacts = action.payload;
      state.comonContact = _.uniqBy(formatContact(action.payload), (v) => v.userId?._id);
    },
    removeContact: (state, action: PayloadAction<string[]>) => {
      state.contacts = state.contacts.filter((v) => !action.payload.find((b) => b == v.localId));
      state.comonContact = state.comonContact.filter((v) => !action.payload.find((b) => b == v.localId));
    },
    addServerContact: (state, action: PayloadAction<ContactDetailsDto[]>) => {
      let newComon = action.payload.filter((v) => v.hasComon);
      state.comonContact = [...state.comonContact, ...newComon];
      state.contacts = [...state.contacts, ...action.payload];
    },
    updateContactProfile: (state, action: PayloadAction<ContactDetailsDto[]>) => {
      // console.log(action.payload);
      let newComon = state.contacts.map((v) => {
        let find = action.payload.find((b) => b.localId == v.localId);
        if (find) {
          return { ...find };
        } else {
          return v;
        }
      });
      state.comonContact = newComon.filter((v) => v.hasComon);
      state.contacts = newComon;
    },
    updateComonContact: (state, action: PayloadAction<ContactDetailsDto[]>) => {
      state.comonContact = action.payload;
    },
    resetContactState(state) {
      return initialState;
    },
  },
});

export const {
  updateContact,
  resetContactState,
  removeContact,
  updateContactProfile,
  addServerContact,
  updateComonContact,
} = contactSlice.actions;

export default contactSlice.reducer;

export const contactStorage = createStorage();

export const contactPersister = {
  setItem: (key: string, value: string) => {
    contactStorage.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key: string) => {
    const value = contactStorage.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key: string) => {
    contactStorage.delete(key);
    return Promise.resolve();
  },
};
