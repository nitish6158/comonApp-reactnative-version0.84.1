import { Platform } from "react-native";
import Geolocation from "react-native-geolocation-service";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

export const requestLocation = async (): Promise<undefined | { lat: string; long: string }> => {
  const permission = await request(
    Platform.OS === "ios" ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
  );

  if (permission === RESULTS.GRANTED) {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude.toString(),
            long: position.coords.longitude.toString(),
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          reject(undefined);
        }
      );
    });
  }

  return undefined; // Return undefined if permission is not granted
};

export const requestLastKnownLocation = async () => {
  const permission = await request(
    Platform.OS === "ios" ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
  );

  if (permission === RESULTS.GRANTED) {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve(position);
        },
        (error) => {
          console.error("Error getting last known location:", error);
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });
  } else {
    console.warn("Location permission not granted");
    return undefined;
  }
};
