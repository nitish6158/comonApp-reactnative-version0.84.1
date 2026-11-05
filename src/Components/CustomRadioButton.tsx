import React, { useState } from "react";
import { StyleSheet, Text, TouchableWithoutFeedback, View, ViewStyle } from "react-native";

import Colors from "@/Constants/Colors";
import { EdgeOption } from "@Service/generated/types";

interface Option {
  label: string;
  value: string;
}

interface RadioButtonProps {
  options: EdgeOption[];
  onChange: (option: EdgeOption) => void;
  containerStyle?: ViewStyle;
}

const CustomRadioButton: React.FC<RadioButtonProps> = ({ options, onChange, containerStyle }) => {
  const [selectedOption, setSelectedOption] = useState<EdgeOption | null>(null);

  const handleOptionSelect = (option: EdgeOption) => {
    setSelectedOption(option);
    onChange(option);
  };

  console.log("options===>", options);
  return (
    <View style={containerStyle}>
      {options?.map((option, index) => (
        <TouchableWithoutFeedback key={index} onPress={() => handleOptionSelect(option)}>
          <View style={{ flexDirection: "row", marginVertical: 10 }}>
            <View
              style={{
                height: 25,
                width: 25,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selectedOption === option ? Colors.light.PrimaryColor : "gray",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {selectedOption === option && (
                <View
                  style={{
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: Colors.light.PrimaryColor,
                  }}
                />
              )}
            </View>
            <View style={{ width: "80%" }}>
              <Text style={style.label}>{option?.label}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      ))}
    </View>
  );
};
const style = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default CustomRadioButton;
