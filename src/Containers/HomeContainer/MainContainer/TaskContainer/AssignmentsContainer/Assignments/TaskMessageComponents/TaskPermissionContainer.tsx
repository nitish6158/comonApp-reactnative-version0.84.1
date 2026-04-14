import { Dimensions, Linking, Pressable, View, StyleSheet, Text } from "react-native";
import React, { useEffect, useState } from "react";

import { openSettings } from "react-native-permissions";
import { requestLocation } from "@Util/permission/requestLocation";
import { useTranslation } from "react-i18next";
import { Colors } from "@/Constants";

export const defaultUserLocation = { lat: undefined, long: undefined };
const { width } = Dimensions.get("screen");
export function TaskPermissionContainer({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation();
  const [permissionErr, setPermissionErr] = useState("");

  useEffect(() => {
    const checkPermission = async () => {
      const location = await requestLocation();

      if (location) {
        setPermissionErr("");
      } else {
        setPermissionErr(t("permissions.location"));
      }
    };

    checkPermission();
  }, []);

  const openAppSettings = () => {
    openSettings().catch(() => {
      Linking.openSettings();
    });
  };
  return (
    <View style={{ width: width - 40, alignSelf: "center" }}>
      {permissionErr ? (
        <View style={styles.main}>
          <Text style={{ textAlign: "center", fontSize: 14 }}>Location Permission needed</Text>
          <Pressable onPress={openAppSettings}>
            <Text>{t("btn.open-settings")}</Text>
          </Pressable>
        </View>
      ) : (
        children
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 30,
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 10,
    width: 300,
  },
});
