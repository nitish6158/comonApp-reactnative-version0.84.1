import AsyncStorage from "@react-native-async-storage/async-storage";

export enum SessionKeys {
  TOKEN = "COM_ON_TOKEN",
  REFRESH = "COM_ON_REFRESH",
  EXPIRE_AT = "COM_ON_TOKEN_EXPIRE_AT",
  MODE = "MODE",
}
export enum phoneCodeSession {
  PhoneCode = "Phone_Code",
}

export enum SessionOrganizationKeys {
  DATA = "COM_ON_ORGANIZATION_DATA",
}

interface setGlobalPhoneCodeprops {
  PhoneCode: string;
  Country: string | number | undefined;
}
export const setGlobalPhoneCode = async ({ PhoneCode, Country }: setGlobalPhoneCodeprops) => {
  try {
    await AsyncStorage.setItem(phoneCodeSession.PhoneCode, JSON.stringify({ PhoneCode: PhoneCode, Country: Country }));
  } catch (error) {
    return false;
  }
};

export const setSession = async ({
  token,
  refresh,
  mode,
  expireAt,
}: {
  token: string;
  refresh: string;
  mode: string;
  expireAt: number;
}) => {
  try {
    await AsyncStorage.setItem(SessionKeys.TOKEN, token);
    await AsyncStorage.setItem(SessionKeys.REFRESH, refresh);
    await AsyncStorage.setItem(SessionKeys.EXPIRE_AT, expireAt.toString());
    await AsyncStorage.setItem(SessionKeys.MODE, mode);
    return true;
  } catch (error) {
    return false;
  }
};

export const setTermsPolicy = async (phone: string) => {
  try {
    await AsyncStorage.setItem(phone, "true");
    return true;
  } catch (error) {
    return false;
  }
};

export const removeTermsPolicy = async (phone: string) => {
  try {
    await AsyncStorage.removeItem(phone);
    return true;
  } catch (error) {
    return false;
  }
};

export const getTermsPolicy = async (phone?: string) => {
  if (!phone) return;
  try {
    return await AsyncStorage.getItem(phone);
  } catch (error) {
    return false;
  }
};
export const getGlobalPhoneCode = async () => {
  try {
    const phoneCode: { PhoneCode: string; Country: string } = await AsyncStorage.getItem(phoneCodeSession.PhoneCode);
    return {
      phoneCode,
    };
  } catch (error) {
    return false;
  }
};

export const getSession = async () => {
  const token = await AsyncStorage.getItem(SessionKeys.TOKEN);
  const refresh = await AsyncStorage.getItem(SessionKeys.REFRESH);
  const expireAt = await AsyncStorage.getItem(SessionKeys.EXPIRE_AT);
  const mode = await AsyncStorage.getItem(SessionKeys.MODE);
  return {
    token,
    refresh,
    expireAt,
    mode,
  };
};

export const removeSession = async () => {
  console.log("Removing session");
  // Auth Session
  await AsyncStorage.removeItem(SessionKeys.TOKEN);
  await AsyncStorage.removeItem(SessionKeys.REFRESH);
  await AsyncStorage.removeItem(SessionKeys.EXPIRE_AT);
};

type CurrentOrganizationDataType = {
  _id: string;
  link: string;
};

export const setCurrentOrganization = async (data: CurrentOrganizationDataType) => {
  await AsyncStorage.setItem(SessionOrganizationKeys.DATA, JSON.stringify(data));
  return true;
};

export const getCurrentOrganization = async (): Promise<CurrentOrganizationDataType | undefined> => {
  const asyncData = await AsyncStorage.getItem(SessionOrganizationKeys.DATA);
  const data = JSON.parse(<string>asyncData);
  if (data?._id) {
    return data;
  }
  return;
};

export const removeCurrentOrganization = () => {
  AsyncStorage.removeItem(SessionOrganizationKeys.DATA);
};
