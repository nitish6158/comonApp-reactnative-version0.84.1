import { createStorage } from '@/utils/mmkvStorage';

export const CORE_STORAGE = createStorage();

export const reduxMMKVStorage = {
  setItem: (key:string, value:string) => {
    CORE_STORAGE.set(key, value);
    return Promise.resolve(true);
  },
  getItem: (key:string) => {
    const value = CORE_STORAGE.getString(key);
    return Promise.resolve(value);
  },
  removeItem: (key:string) => {
    CORE_STORAGE.delete(key);
    return Promise.resolve();
  },
};

export const ContactMMKV = createStorage();
export const ChatMMKV = createStorage();
export const OrganisationMMKV = createStorage();
export const CallsMMKV = createStorage();

export const storage = createStorage()
