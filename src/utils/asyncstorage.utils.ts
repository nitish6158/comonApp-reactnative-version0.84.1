import AsyncStorage from "@react-native-async-storage/async-storage";

export async function setDataInAsync(STORAGE_KEY: string, STORAGE_DATA: any) {
  try {
    if (!STORAGE_DATA || !STORAGE_KEY) return;
    const data = typeof STORAGE_DATA === "object" ? JSON.stringify(STORAGE_DATA) : STORAGE_DATA;
    await AsyncStorage.setItem(STORAGE_KEY, data);
  } catch (error) {
    console.error("Error in setting data into async storage", error);
  }
}

export async function getDataFromAsync(STORAGE_KEY: string) {
  try {
    if (!STORAGE_KEY) return;
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return dataParsor(data);
  } catch (error) {
    console.error("Error in getting data from async storage", error);
  }
}

export async function removeDataFromAsync(STORAGE_KEY: string) {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.log("Error in removing item from async storage", error);
  }
}

function dataParsor(data: any) {
  if (data) {
    return typeof data === "string" ? JSON.parse(data) : data;
  }
  return null;
}
