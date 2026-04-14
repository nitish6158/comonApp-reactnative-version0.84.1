import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableWithoutFeedback } from "react-native";
const MaterialCommunityIcons =
  require("react-native-vector-icons/MaterialCommunityIcons").default;
interface CheckboxCardProps {
  label: string;
  value: boolean;
  onChange?: (checked: boolean) => void;
}

const CheckBox: React.FC<CheckboxCardProps> = ({ label, value, onChange }) => {
  const [checked, setChecked] = useState(value);

  const toggleCheckbox = () => {
    setChecked(!checked);
    onChange?.(!checked);
  };

  return (
    <TouchableWithoutFeedback onPress={toggleCheckbox}>
      <View style={styles.row}>
        <View style={styles.checkboxContainer}>
          {checked ? (
            <MaterialCommunityIcons
              name="checkbox-marked"
              size={28}
              color="#007bff"
            />
          ) : (
            <MaterialCommunityIcons
              name="checkbox-blank-outline"
              size={28}
              color="#ccc"
            />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CheckBox;
const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxContainer: {
    marginRight: 12,
    marginLeft: 8,
  },
  textContainer: {
    flexShrink: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
});
