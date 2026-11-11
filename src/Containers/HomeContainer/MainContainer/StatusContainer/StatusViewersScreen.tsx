// @ts-nocheck
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import FastImage from "@d11/react-native-fast-image";
import { HeaderWithScreenName } from "@/Components/header";
import { Colors, fonts } from "@/Constants";
import { getStatusViewers, StatusViewer } from "@/services/status/statusApi";
import ToastMessage from "@/utils/ToastMesage";
import { StatusViewersScreenProps } from "@/navigation/screenPropsTypes";
import { formatStatusTime, resolveMediaUrl, useStatusAuthors } from "./statusUtils";

export default function StatusViewersScreen({ route }: StatusViewersScreenProps) {
  const { itemId } = route.params;
  const authors = useStatusAuthors();
  const [viewers, setViewers] = useState<StatusViewer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStatusViewers(itemId)
      .then((res) => setViewers(res.viewers))
      .catch((e) => ToastMessage(e?.message ?? "Unable to load viewers"))
      .finally(() => setLoading(false));
  }, [itemId]);

  return (
    <View style={styles.main}>
      <HeaderWithScreenName title="Viewed by" subtitle={loading ? undefined : `${viewers.length}`} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.light.PrimaryColor} />
      ) : (
        <FlatList
          data={viewers}
          keyExtractor={(v) => v.viewerId}
          renderItem={({ item }) => {
            const viewer = authors[item.viewerId];
            const uri = resolveMediaUrl(viewer?.profile_img);
            return (
              <View style={styles.row}>
                {uri ? (
                  <FastImage source={{ uri }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.fallback]}>
                    <Text style={{ color: "white" }}>{(viewer?.name ?? "?")[0]?.toUpperCase()}</Text>
                  </View>
                )}
                <View style={{ marginLeft: 14 }}>
                  <Text style={styles.name}>{viewer?.name ?? "ComOn user"}</Text>
                  <Text style={styles.time}>{formatStatusTime(item.viewedAt)}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No views yet</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "white" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10 },
  avatar: { height: 48, width: 48, borderRadius: 24 },
  fallback: { backgroundColor: Colors.light.PrimaryColor, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 16, color: Colors.light.black, fontFamily: fonts.Lato },
  time: { fontSize: 13, color: "gray", marginTop: 2 },
  empty: { textAlign: "center", color: "gray", marginTop: 30 },
});
