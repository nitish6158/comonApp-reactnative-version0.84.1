// @ts-nocheck
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import FastImage from "@d11/react-native-fast-image";
import { backgroundUpload } from "react-native-compressor";
import { launchImageLibrary } from "react-native-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/Components/icons";
import { useAppSelector } from "@/redux/Store";
import { createStatusItem, getStatusUploadUrl } from "@/services/status/statusApi";
import ToastMessage from "@/utils/ToastMesage";
import { StatusComposerScreenProps } from "@/navigation/screenPropsTypes";
import { STATUS_BG_COLORS } from "./statusUtils";

export default function StatusComposerScreen({ navigation }: StatusComposerScreenProps) {
  const insets = useSafeAreaInsets();
  const { MyProfile } = useAppSelector((state) => state.Chat);
  const [text, setText] = useState("");
  const [bgIndex, setBgIndex] = useState(0);
  const [image, setImage] = useState<{ uri: string; mime: string; fileName: string } | null>(null);
  const [posting, setPosting] = useState(false);

  const bgColor = STATUS_BG_COLORS[bgIndex];
  const canPost = !posting && (image ? true : text.trim().length > 0);

  const pickImage = async () => {
    const res = await launchImageLibrary({ mediaType: "photo", selectionLimit: 1 });
    const asset = res?.assets?.[0];
    if (!asset?.uri) return;
    const mime = asset.type ?? "image/jpeg";
    const ext = mime.split("/")[1] ?? "jpg";
    setImage({ uri: asset.uri, mime, fileName: `${Date.now()}.${ext}` });
  };

  const onPost = async () => {
    if (!canPost) return;
    setPosting(true);
    try {
      if (image) {
        const path = `status/${MyProfile?._id}/${image.fileName}`;
        const url = await getStatusUploadUrl(path, image.mime);
        await backgroundUpload(url, image.uri, { httpMethod: "PUT", headers: { "Content-Type": image.mime } });
        await createStatusItem({
          type: "IMAGE",
          fileURL: path,
          mime: image.mime,
          text: text.trim() || undefined,
        });
      } else {
        await createStatusItem({ type: "TEXT", text: text.trim(), bgColor });
      }
      navigation.goBack();
    } catch (e) {
      ToastMessage(e?.message ?? "Unable to post status");
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={[styles.main, { backgroundColor: image ? "black" : bgColor }]}>
      {image && <FastImage source={{ uri: image.uri }} style={StyleSheet.absoluteFill} resizeMode="contain" />}

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
          <AppIcon name="close" size={26} color="white" />
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Pressable onPress={image ? () => setImage(null) : pickImage} hitSlop={10} style={{ marginRight: 22 }}>
            <AppIcon name={image ? "edit" : "image"} size={26} color="white" />
          </Pressable>
          {!image && (
            <Pressable onPress={() => setBgIndex((bgIndex + 1) % STATUS_BG_COLORS.length)} hitSlop={10}>
              <AppIcon name="radioOn" size={26} color="white" />
            </Pressable>
          )}
        </View>
      </View>

      <View style={image ? styles.captionWrap : styles.textWrap}>
        <TextInput
          style={image ? styles.captionInput : styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder={image ? "Add a caption..." : "Type a status"}
          placeholderTextColor="rgba(255,255,255,0.6)"
          multiline
          maxLength={700}
          textAlign={image ? "left" : "center"}
        />
      </View>

      <Pressable
        style={[styles.sendButton, { bottom: insets.bottom + 20, opacity: canPost ? 1 : 0.5 }]}
        disabled={!canPost}
        onPress={onPost}
      >
        {posting ? <ActivityIndicator color="white" /> : <AppIcon name="send" size={24} color="white" />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 2,
  },
  textWrap: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  textInput: { color: "white", fontSize: 32, fontWeight: "500", textAlign: "center" },
  captionWrap: { flex: 1, justifyContent: "flex-end", paddingBottom: 100, paddingHorizontal: 16 },
  captionInput: {
    color: "white",
    fontSize: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendButton: {
    position: "absolute",
    right: 20,
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: "#0B63F6",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
