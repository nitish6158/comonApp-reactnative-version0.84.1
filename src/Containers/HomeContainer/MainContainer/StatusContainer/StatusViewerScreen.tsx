// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import FastImage from "@d11/react-native-fast-image";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/Components/icons";
import { useAppSelector } from "@/redux/Store";
import { signalProtocolService } from "@/services/e2e/SignalProtocolService";
import {
  deleteStatusItem,
  getStatusItems,
  markStatusViewed,
  replyToStatus,
  StatusItemView,
} from "@/services/status/statusApi";
import ToastMessage from "@/utils/ToastMesage";
import { StatusViewerScreenProps } from "@/navigation/screenPropsTypes";
import { formatStatusTime, resolveMediaUrl, useStatusAuthors } from "./statusUtils";

const DEFAULT_DURATION_MS = 5000;

export default function StatusViewerScreen({ route, navigation }: StatusViewerScreenProps) {
  const { authorId, startIndex = 0 } = route.params;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const authors = useStatusAuthors();
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const isMine = MyProfile?._id === authorId;
  const author = authors[authorId];

  const [items, setItems] = useState<StatusItemView[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(startIndex);
  const [reply, setReply] = useState("");
  const [replyFocused, setReplyFocused] = useState(false);
  const [holding, setHolding] = useState(false);
  const [sending, setSending] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;
  const progressValue = useRef(0);
  const viewed = useRef<Set<string>>(new Set()).current;

  const current = items[index];
  const paused = replyFocused || holding || sending;

  useEffect(() => {
    getStatusItems(authorId)
      .then((list) => {
        setItems(list);
        if (!list.length) navigation.goBack();
        else setIndex(Math.min(startIndex, list.length - 1));
      })
      .catch((e) => {
        ToastMessage(e?.message ?? "Unable to load status");
        navigation.goBack();
      })
      .finally(() => setLoading(false));
  }, [authorId]);

  useEffect(() => {
    const id = progress.addListener(({ value }) => {
      progressValue.current = value;
    });
    return () => progress.removeListener(id);
  }, []);

  // Reset the bar and mark the item as viewed when the shown item changes.
  useEffect(() => {
    progress.setValue(0);
    progressValue.current = 0;
    if (current && !isMine && !current.seen && !viewed.has(current._id)) {
      viewed.add(current._id);
      markStatusViewed(current._id).catch(() => viewed.delete(current._id));
    }
  }, [current?._id]);

  // Run (or resume) the progress animation for the current item.
  useEffect(() => {
    if (!current || paused) return;
    const total = current.type === "VIDEO" && current.duration ? current.duration * 1000 : DEFAULT_DURATION_MS;
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: total * (1 - progressValue.current),
      easing: Easing.linear,
      useNativeDriver: false,
    });
    animation.start(({ finished }) => finished && goNext());
    return () => animation.stop();
  }, [current?._id, paused]);

  function goNext() {
    if (index < items.length - 1) setIndex(index + 1);
    else navigation.goBack();
  }

  function goPrev() {
    if (index > 0) setIndex(index - 1);
    else {
      progress.setValue(0);
      progressValue.current = 0;
    }
  }

  async function onSendReply() {
    const message = reply.trim();
    if (!message || !current || sending) return;
    setSending(true);
    try {
      let body = message;
      try {
        body = await signalProtocolService.encryptText(authorId, message);
      } catch {
        // Fall back to plain text when E2E keys are unavailable for this peer.
      }
      const res = await replyToStatus(current._id, body);
      setReply("");
      if (res.roomId) navigation.replace("ChatMessageScreen", { RoomId: res.roomId });
      else navigation.goBack();
    } catch (e) {
      ToastMessage(e?.message ?? "Unable to send reply");
    } finally {
      setSending(false);
    }
  }

  function onDelete() {
    if (!current) return;
    setHolding(true);
    Alert.alert("Delete status?", undefined, [
      { text: "Cancel", style: "cancel", onPress: () => setHolding(false) },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteStatusItem(current._id);
            const next = items.filter((i) => i._id !== current._id);
            setItems(next);
            if (!next.length) navigation.goBack();
            else setIndex(Math.min(index, next.length - 1));
          } catch (e) {
            ToastMessage(e?.message ?? "Unable to delete status");
          } finally {
            setHolding(false);
          }
        },
      },
    ]);
  }

  if (loading || !current) {
    return (
      <View style={[styles.main, { justifyContent: "center" }]}>
        <ActivityIndicator color="white" />
      </View>
    );
  }

  const isText = current.type === "TEXT";
  const mediaUri = resolveMediaUrl(current.fileURL);

  return (
    <KeyboardAvoidingView
      style={[styles.main, { backgroundColor: isText ? current.bgColor || "#0B63F6" : "black" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {!isText && mediaUri && (
        <FastImage
          source={{ uri: current.type === "VIDEO" ? resolveMediaUrl(current.thumbnail) : mediaUri }}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
        />
      )}
      {isText && (
        <View style={styles.textWrap} pointerEvents="none">
          <Text style={styles.statusText}>{current.text}</Text>
        </View>
      )}
      {!isText && !!current.text && (
        <View style={styles.captionWrap} pointerEvents="none">
          <Text style={styles.caption}>{current.text}</Text>
        </View>
      )}

      {/* Tap zones: left = previous, right = next, hold = pause */}
      <View style={styles.tapZones}>
        <Pressable
          style={{ flex: 1 }}
          onPress={goPrev}
          onPressIn={() => setHolding(true)}
          onPressOut={() => setHolding(false)}
        />
        <Pressable
          style={{ flex: 2 }}
          onPress={goNext}
          onPressIn={() => setHolding(true)}
          onPressOut={() => setHolding(false)}
        />
      </View>

      <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.bars}>
          {items.map((item, i) => (
            <View key={item._id} style={styles.barTrack}>
              <Animated.View
                style={[
                  styles.barFill,
                  {
                    width:
                      i < index
                        ? "100%"
                        : i === index
                          ? progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] })
                          : "0%",
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <AppIcon name="back" size={24} color="white" />
          </Pressable>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.authorName}>{isMine ? "My status" : (author?.name ?? "ComOn user")}</Text>
            <Text style={styles.authorTime}>{formatStatusTime(current.createdAt)}</Text>
          </View>
          {isMine && (
            <Pressable onPress={onDelete} hitSlop={10}>
              <AppIcon name="delete" size={22} color="white" />
            </Pressable>
          )}
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 10 }]}>
        {isMine ? (
          <Pressable
            style={styles.viewsButton}
            onPress={() => navigation.navigate("StatusViewersScreen", { itemId: current._id })}
          >
            <AppIcon name="eye" size={20} color="white" />
            <Text style={styles.viewsText}>{current.viewCount ?? 0}</Text>
          </Pressable>
        ) : (
          <View style={styles.replyRow}>
            <TextInput
              style={styles.replyInput}
              value={reply}
              onChangeText={setReply}
              onFocus={() => setReplyFocused(true)}
              onBlur={() => setReplyFocused(false)}
              placeholder={t("replyStatus")}
              placeholderTextColor="rgba(255,255,255,0.7)"
              returnKeyType="send"
              onSubmitEditing={onSendReply}
            />
            <Pressable onPress={onSendReply} disabled={!reply.trim() || sending} style={styles.sendButton}>
              {sending ? <ActivityIndicator color="white" /> : <AppIcon name="send" size={20} color="white" />}
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "black" },
  tapZones: { ...StyleSheet.absoluteFillObject, flexDirection: "row", top: 110, bottom: 90 },
  top: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 10 },
  bars: { flexDirection: "row", gap: 4 },
  barTrack: { flex: 1, height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.35)", overflow: "hidden" },
  barFill: { height: 3, backgroundColor: "white" },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  authorName: { color: "white", fontSize: 16, fontWeight: "500" },
  authorTime: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  textWrap: { ...StyleSheet.absoluteFillObject, justifyContent: "center", paddingHorizontal: 24 },
  statusText: { color: "white", fontSize: 30, fontWeight: "500", textAlign: "center" },
  captionWrap: { position: "absolute", left: 16, right: 16, bottom: 110 },
  caption: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  bottom: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 12 },
  viewsButton: { alignSelf: "center", flexDirection: "row", alignItems: "center", padding: 8 },
  viewsText: { color: "white", marginLeft: 6, fontSize: 15 },
  replyRow: { flexDirection: "row", alignItems: "center" },
  replyInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 16,
    color: "white",
  },
  sendButton: {
    marginLeft: 8,
    height: 44,
    width: 44,
    borderRadius: 22,
    backgroundColor: "#0B63F6",
    alignItems: "center",
    justifyContent: "center",
  },
});
