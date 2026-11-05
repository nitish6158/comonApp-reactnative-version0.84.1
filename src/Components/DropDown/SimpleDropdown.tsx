import React from "react";
import { useState, useEffect } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@/Constants";

const SimpleDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  multiple = false,
  disabled = false,
}: {
  options: { label: string; value: string }[];
  value: string[] | string;
  onChange: (val: any) => void;
  placeholder?: string;
  multiple?: boolean;
  disabled?: boolean;
}) => {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState(options);
  useEffect(() => {
    if (!search.trim()) setFiltered(options);
    else
      setFiltered(
        options.filter((o) =>
          o.label.toLowerCase().includes(search.toLowerCase()),
        ),
      );
  }, [search, options]);

  const isSelected = (val: string) =>
    multiple ? (value as string[]).includes(val) : value === val;
  const handleSelect = (val: string) => {
    if (multiple) {
      let arr = Array.isArray(value) ? [...value] : [];
      if (arr.includes(val)) arr = arr.filter((v) => v !== val);
      else arr.push(val);
      onChange(arr);
    } else {
      onChange(val);
      setVisible(false);
    }
  };
  return (
    <>
      <TouchableOpacity
        style={[styles.dropdown, disabled && { opacity: 0.5 }]}
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}
      >
        <Text
          style={{
            color:
              value && (multiple ? (value as string[]).length : value)
                ? "#222"
                : "#888",
          }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {multiple
            ? (value as string[]).length
              ? options
                  .filter((o) => (value as string[]).includes(o.value))
                  .map((o) => o.label)
                  .join(", ")
              : placeholder || "Select..."
            : options.find((o) => o.value === value)?.label ||
              placeholder ||
              "Select..."}
        </Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        />
        <View style={styles.modalContentLarge}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search..."
            placeholderTextColor="#aaa"
            autoFocus
          />
          {filtered.length === 0 ? (
            <Text style={{ textAlign: "center", color: "#888", padding: 16 }}>
              No results found
            </Text>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    isSelected(item.value) && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={{
                      color: isSelected(item.value) ? "#007bff" : "#222",
                      fontSize: 18,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              initialNumToRender={20}
              maxToRenderPerBatch={30}
              windowSize={15}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 350 }}
            />
          )}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setVisible(false)}
          >
            <Text style={{ color: "#007bff", fontWeight: "600" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default SimpleDropdown;

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 12,
    marginBottom: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalContentLarge: {
    position: "absolute",
    top: "15%",
    left: "5%",
    right: "5%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    minHeight: 200,
    maxHeight: 420,
  },
  searchInput: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 10,
    fontSize: 18,
    marginBottom: 10,
    color: "#222",
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedOption: {
    backgroundColor: "#e6f0ff",
  },
  closeBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
  },
});
