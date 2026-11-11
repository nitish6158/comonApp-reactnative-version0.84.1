// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { HeaderWithScreenName } from "@/Components/header";
import { AppIcon } from "@/Components/icons";
import { Colors, fonts } from "@/Constants";
import { RootState } from "@/redux/Reducer";
import ToastMessage from "@/utils/ToastMesage";
import { StatusPrivacySettingsProps } from "@/navigation/screenPropsTypes";
import {
  getMyStatusPrivacy,
  StatusPrivacyMode,
  updateMyStatusPrivacy,
} from "@/services/status/statusApi";

type Option = { mode: StatusPrivacyMode; labelKey: string };

const OPTIONS: Option[] = [
  { mode: "contacts", labelKey: "myContacts" },
  { mode: "contacts_except", labelKey: "contactsExcept" },
  { mode: "only_share_with", labelKey: "onlyShareWith" },
];

export default function StatusPrivacySettings({ navigation }: StatusPrivacySettingsProps) {
  const { t } = useTranslation();
  const { comonContact } = useSelector((state: RootState) => state.Contact);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<StatusPrivacyMode>("contacts");
  const [exceptUserIds, setExceptUserIds] = useState<string[]>([]);
  const [onlyUserIds, setOnlyUserIds] = useState<string[]>([]);
  const [pickerFor, setPickerFor] = useState<null | "contacts_except" | "only_share_with">(null);

  useEffect(() => {
    getMyStatusPrivacy()
      .then((privacy) => {
        setMode((privacy.mode as StatusPrivacyMode) ?? "contacts");
        setExceptUserIds(privacy.exceptUserIds ?? []);
        setOnlyUserIds(privacy.onlyUserIds ?? []);
      })
      .catch((e) => ToastMessage(e?.message ?? "Unable to load status privacy"))
      .finally(() => setLoading(false));
  }, []);

  const selectedCount = (m: StatusPrivacyMode) =>
    m === "contacts_except" ? exceptUserIds.length : m === "only_share_with" ? onlyUserIds.length : 0;

  const onSelectMode = (next: StatusPrivacyMode) => {
    setMode(next);
    if (next !== "contacts") setPickerFor(next);
  };

  const onSave = async () => {
    if (mode === "only_share_with" && onlyUserIds.length === 0) {
      ToastMessage("Select at least one contact");
      return;
    }
    setSaving(true);
    try {
      await updateMyStatusPrivacy({
        mode,
        ...(mode === "contacts_except" ? { exceptUserIds } : {}),
        ...(mode === "only_share_with" ? { onlyUserIds } : {}),
      });
      ToastMessage(t("statusPrivacy"));
      navigation.goBack();
    } catch (e) {
      ToastMessage(e?.message ?? "Unable to update status privacy");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.main}>
      <HeaderWithScreenName title={t("statusPrivacy")} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.light.PrimaryColor} />
      ) : (
        <View style={styles.container}>
          <Text style={styles.sectionLabel}>{t("status")}</Text>
          {OPTIONS.map((option) => {
            const active = mode === option.mode;
            const count = selectedCount(option.mode);
            return (
              <Pressable key={option.mode} style={styles.optionRow} onPress={() => onSelectMode(option.mode)}>
                <AppIcon
                  name={active ? "radioOn" : "radioOff"}
                  size={22}
                  color={active ? Colors.light.PrimaryColor : "gray"}
                />
                <Text style={styles.optionText}>{t(option.labelKey)}</Text>
                {option.mode !== "contacts" && (
                  <Pressable onPress={() => setPickerFor(option.mode)} hitSlop={8}>
                    <Text style={styles.countText}>{count > 0 ? `${count}` : ""}</Text>
                  </Pressable>
                )}
              </Pressable>
            );
          })}
          <Pressable style={[styles.saveButton, saving && { opacity: 0.6 }]} disabled={saving} onPress={onSave}>
            {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Save</Text>}
          </Pressable>
        </View>
      )}

      <ContactMultiSelect
        visible={!!pickerFor}
        title={pickerFor === "only_share_with" ? t("onlyShareWith") : t("contactsExcept")}
        contacts={comonContact ?? []}
        selected={pickerFor === "only_share_with" ? onlyUserIds : exceptUserIds}
        onClose={() => setPickerFor(null)}
        onDone={(ids) => {
          if (pickerFor === "only_share_with") setOnlyUserIds(ids);
          else setExceptUserIds(ids);
          setPickerFor(null);
        }}
      />
    </View>
  );
}

function ContactMultiSelect({ visible, title, contacts, selected, onClose, onDone }) {
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<string[]>(selected);

  useEffect(() => {
    if (visible) {
      setDraft(selected);
      setSearch("");
    }
  }, [visible]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts
      .filter((c) => c?.userId?._id)
      .filter((c) => !q || `${c.firstName ?? ""} ${c.lastName ?? ""} ${c.phone ?? ""}`.toLowerCase().includes(q));
  }, [contacts, search]);

  const toggle = (id: string) =>
    setDraft((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.main}>
        <View style={styles.pickerHeader}>
          <Pressable onPress={onClose} hitSlop={8}>
            <AppIcon name="close" size={24} color="gray" />
          </Pressable>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={{ fontSize: 16, fontFamily: fonts.Lato }}>{title}</Text>
            <Text style={{ fontSize: 12, color: "gray" }}>{draft.length}</Text>
          </View>
          <Pressable onPress={() => onDone(draft)} hitSlop={8}>
            <Text style={{ color: Colors.light.PrimaryColor, fontSize: 16 }}>Done</Text>
          </Pressable>
        </View>
        <TextInput style={styles.search} placeholder="Search" value={search} onChangeText={setSearch} />
        <FlatList
          data={list}
          keyExtractor={(c) => c.userId._id}
          renderItem={({ item }) => {
            const id = item.userId._id;
            const checked = draft.includes(id);
            return (
              <Pressable style={styles.contactRow} onPress={() => toggle(id)}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {`${item.firstName?.[0] ?? ""}${item.lastName?.[0] ?? ""}`.toUpperCase()}
                  </Text>
                </View>
                <Text style={{ flex: 1, marginLeft: 16, fontSize: 16, fontFamily: fonts.Lato }}>
                  {`${item.firstName ?? ""} ${item.lastName ?? ""}`.trim() || item.phone}
                </Text>
                <AppIcon
                  name={checked ? "checkboxMarked" : "checkboxBlank"}
                  size={22}
                  color={checked ? Colors.light.PrimaryColor : "gray"}
                />
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "white" },
  container: { paddingHorizontal: 20, paddingTop: 20 },
  sectionLabel: { fontSize: 14, color: "gray", marginBottom: 10, fontFamily: fonts.Lato },
  optionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  optionText: { flex: 1, marginLeft: 16, fontSize: 16, color: Colors.light.black, fontFamily: fonts.Lato },
  countText: { fontSize: 14, color: Colors.light.PrimaryColor },
  saveButton: {
    marginTop: 30,
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: { color: "white", fontSize: 16, fontWeight: "500" },
  pickerHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12 },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F2",
  },
  contactRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 10 },
  avatar: {
    height: 45,
    width: 45,
    borderRadius: 40,
    backgroundColor: Colors.light.PrimaryColor,
    justifyContent: "center",
  },
  avatarText: { textAlign: "center", color: "white", fontWeight: "500" },
});
