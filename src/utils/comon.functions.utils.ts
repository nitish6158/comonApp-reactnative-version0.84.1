import AsyncStorage from "@react-native-async-storage/async-storage";
import DeviceInfo from "react-native-device-info";
import { Platform } from "react-native";
import { asyncStorageKeys } from "@/Constants/asyncStorageKeys";
import { requestLocation } from "./permission/requestLocation";

export async function getDeviceId() {
  const deviceToken = await AsyncStorage.getItem(asyncStorageKeys.deviceToken);
  const deviceId = Platform.select({
    ios: deviceToken,
    android: await DeviceInfo.getUniqueId(),
  });
  return deviceId;
}

export const checkPermission = async () => {
  const location = await requestLocation();
  return location;
};
