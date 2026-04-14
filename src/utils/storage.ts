import AsyncStorage from "@react-native-async-storage/async-storage";

export enum DeadlineStorageKeys {
  TIME_TO_RESEND_CONFIRM_EMAIL = "COM_ON_TIME_TO_RESEND_CONFIRM_EMAIL",
  TIME_TO_RESEND_RESET_PASSWORD = "COM_ON_TIME_TO_RESEND_RESET_PASSWORD",
  TIME_TO_RESEND_RESET_SMS = "COM_ON_TIME_TO_RESEND_RESET_SMS",
  TIME_TO_RESEND_DELETE_ACCOUNT_SMS = "TIME_TO_RESEND_DELETE_ACCOUNT_SMS",
}

export enum DefaultStorageKeys {
  COUNTRY_CODE = "COUNTRY_CODE",
  PHONE_NUMBER = "COM_ON_PHONE_NUMBER",
  LANGUAGE = "LANGUAGE",
}

type ReturnDataType<T> = T extends object ? (string | undefined)[] : string | undefined;

export type StorageKeysList = `${DeadlineStorageKeys}` | `${DefaultStorageKeys}`;

export const setStorage = (key: StorageKeysList, value = "true") => AsyncStorage.setItem(key, value);

export const getStorage = <T>(data: StorageKeysList): Promise<ReturnDataType<T>> => {
  return (AsyncStorage.getItem(data) || undefined) as Promise<ReturnDataType<T>>;
};

export const removeStorage = (data: StorageKeysList) => {
  AsyncStorage.removeItem(data);
};
