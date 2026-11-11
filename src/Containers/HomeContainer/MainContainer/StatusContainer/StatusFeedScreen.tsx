// @ts-nocheck
import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import FastImage from "@d11/react-native-fast-image";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/Components/icons";
import { Colors, fonts } from "@/Constants";
import { navigate } from "@/navigation/utility";
import { useAppSelector } from "@/redux/Store";
import { getStatusFeed, muteStatusAuthor, StatusFeed, StatusFeedRow } from "@/services/status/statusApi";
import ToastMessage from "@/utils/ToastMesage";
import {
  formatStatusTime,
  resolveMediaUrl,
  STATUS_RING_SEEN,
  STATUS_RING_UNSEEN,
  StatusAuthor,
  useStatusAuthors,
} from "./statusUtils";

export default function StatusFeedScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const authors = useStatusAuthors();
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const [feed, setFeed] = useState<StatusFeed>({ myStatus: null, rows: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setFeed(await getStatusFeed());
    } catch (e) {
      ToastMessage(e?.message ?? "Unable to load status");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openViewer = (authorId: string) => navigate("StatusViewerScreen", { authorId });

  const onMyStatusPress = () => {
    if (feed.myStatus?.items?.length) openViewer(feed.myStatus.authorId);
    else navigate("StatusComposerScreen");
  };

  const onMute = (row: StatusFeedRow) => {
    const name = authors[row.authorId]?.name ?? "";
    Alert.alert(`Mute ${name}?`, "Their status updates will be hidden from your feed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mute",
        style: "destructive",
        onPress: async () => {
          try {
            await muteStatusAuthor(row.authorId);
            setFeed((prev) => ({ ...prev, rows: prev.rows.filter((r) => r.authorId !== row.authorId) }));
          } catch (e) {
            ToastMessage(e?.message ?? "Unable to mute");
          }
        },
      },
    ]);
  };

  const myItems = feed.myStatus?.items ?? [];
  const myLast = myItems[myItems.length - 1];

  return (
    <View style={styles.main}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title}>{t("updates")}</Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.light.PrimaryColor} />
      ) : (
        <FlatList
          data={feed.rows}
          keyExtractor={(row) => row.authorId}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          ListHeaderComponent={
            <View>
              <Pressable style={styles.row} onPress={onMyStatusPress}>
                <View>
                  <Avatar
                    author={authors[MyProfile?._id ?? ""]}
                    ringColor={myItems.length ? STATUS_RING_SEEN : "transparent"}
                  />
                  <Pressable style={styles.plusBadge} onPress={() => navigate("StatusComposerScreen")} hitSlop={8}>
                    <AppIcon name="plus" size={14} color="white" />
                  </Pressable>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.name}>My status</Text>
                  <Text style={styles.subtitle}>
                    {myLast ? formatStatusTime(myLast.createdAt) : "Tap to add status update"}
                  </Text>
                </View>
                {myItems.length > 0 && (
                  <Text style={styles.subtitle}>{`${myLast?.viewCount ?? 0} views`}</Text>
                )}
              </Pressable>
              {feed.rows.length > 0 && <Text style={styles.sectionLabel}>Recent updates</Text>}
            </View>
          }
          renderItem={({ item }) => {
            const author = authors[item.authorId] ?? { _id: item.authorId, name: "ComOn user" };
            return (
              <Pressable
                style={styles.row}
                onPress={() => openViewer(item.authorId)}
                onLongPress={() => onMute(item)}
              >
                <Avatar author={author} ringColor={item.unseenCount > 0 ? STATUS_RING_UNSEEN : STATUS_RING_SEEN} />
                <View style={styles.rowText}>
                  <Text style={styles.name}>{author.name}</Text>
                  <Text style={styles.subtitle}>{formatStatusTime(item.lastUpdated)}</Text>
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.subtitle, { textAlign: "center", marginTop: 30 }]}>No recent updates</Text>
          }
        />
      )}

      <Pressable style={styles.fab} onPress={() => navigate("StatusComposerScreen")}>
        <AppIcon name="edit" size={22} color="white" />
      </Pressable>
    </View>
  );
}

function Avatar({ author, ringColor }: { author?: StatusAuthor; ringColor: string }) {
  const uri = resolveMediaUrl(author?.profile_img);
  const initials = (author?.name ?? "").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <View style={[styles.ring, { borderColor: ringColor }]}>
      {uri ? (
        <FastImage source={{ uri }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={{ color: "white", fontWeight: "500" }}>{initials}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "white" },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "600", color: Colors.light.black, fontFamily: fonts.Lato },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10 },
  rowText: { flex: 1, marginLeft: 14 },
  name: { fontSize: 16, color: Colors.light.black, fontFamily: fonts.Lato },
  subtitle: { fontSize: 13, color: "gray", marginTop: 2 },
  sectionLabel: { fontSize: 14, color: "gray", marginHorizontal: 20, marginTop: 14, marginBottom: 4 },
  ring: {
    height: 62,
    width: 62,
    borderRadius: 31,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { height: 52, width: 52, borderRadius: 26 },
  avatarFallback: { backgroundColor: Colors.light.PrimaryColor, alignItems: "center", justifyContent: "center" },
  plusBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    height: 22,
    width: 22,
    borderRadius: 11,
    backgroundColor: Colors.light.PrimaryColor,
    borderWidth: 2,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    height: 54,
    width: 54,
    borderRadius: 27,
    backgroundColor: Colors.light.PrimaryColor,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
