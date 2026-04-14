import React, {useState} from "react";
import { useTranslation } from "react-i18next";
import {View, Text, TouchableOpacity, FlatList, StyleSheet} from "react-native";
const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;
interface Option {
  label: string;
  value: string;
}

interface Props {
  data: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

const SingleSelectDropdown: React.FC<Props> = ({
  data,
  label,
  value,
  onChange,
  placeholder,
}) => {
    const {t} = useTranslation();
  const [open, setOpen] = useState(false);

  const selectedLabel = data?.find((item) => item.value === value)?.label;

  return (
    <View style={styles.container}>
      <Text style={{fontSize: 18, marginBottom: 4, color: "#333", padding: 5}}>
        {label}
      </Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setOpen(!open)}>
        <Text style={styles.dropdownText}>
          {selectedLabel || placeholder || t('taskManager.select-option')}
        </Text>
        <MaterialCommunityIcons
          name={open ? "menu-up" : "menu-down"}
          size={24}
          color="#333"
        />
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdownList}>
          <FlatList
            data={data}
            keyExtractor={(item) => item.value}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
              >
                <Text style={styles.optionText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default SingleSelectDropdown;
const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: "#fff",
    maxHeight: 200,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
});
