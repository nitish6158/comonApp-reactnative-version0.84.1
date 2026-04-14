import {Colors} from "@/Constants";
import React, {useCallback, useState} from "react";
import { useTranslation } from "react-i18next";
import {
  TouchableOpacity,
  StyleSheet,
  Modal,
  View,
  Text,
  FlatList,
} from "react-native";

const MultiSelectDropdownComponent = ({
  value,
  onChange,
  placeholder,
  data: usersList,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  placeholder: string;
  data: any;
}) => {
  const {t} = useTranslation();
  const [visible, setVisible] = useState(false);
  const [tempArr, setTempArr] = useState<string[]>([...value]);

  const handleChange = ({item}: any) => {
    setTempArr([...value]);
    if (tempArr.includes(item.value))
      setTempArr(tempArr.filter((v) => v !== item.value));
    else setTempArr([...tempArr, item.value]);
  };

  const applyChanges = () => {
    onChange(tempArr);
    setVisible(false);
  };
  return (
    <View>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setVisible(true)}
      >
        <Text
          style={{
            color: tempArr.length ? Colors.light.black : "#888",
            flex: 1,
          }}
        >
          {tempArr.length
            ? usersList
                .filter((u: any) => tempArr.includes(u.value))
                .map((u: any) => u.label)
                .join(", ")
            : placeholder}
        </Text>
        <Text style={{marginLeft: 8, fontSize: 18, color: "#888"}}>▼</Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => {
            setVisible(false);
          }}
          activeOpacity={1}
        />
        <View style={styles.modalContent}>
          <FlatList
            data={usersList}
            keyExtractor={(item) => item.value}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.option,
                  tempArr.includes(item.value) && styles.selectedOption,
                ]}
                onPress={() => handleChange({item})}
              >
                <Text
                  style={{
                    color: tempArr.includes(item.value)
                      ? Colors.light.PrimaryColor
                      : "#222",
                    fontSize: 18,
                    padding: 5,
                    paddingHorizontal: 10,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
          <View style={{flexDirection: "row", justifyContent: "space-around"}}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => applyChanges()}
            >
              <Text
                style={{
                  color: Colors.light.PrimaryColor,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                {t('taskManager.save')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                tempArr.length > 0 ? setTempArr([...value]) : setTempArr([]);
                setVisible(false);
              }}
            >
              <Text
                style={{
                  color: Colors.light.red,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                {t('taskManager.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MultiSelectDropdownComponent;

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 15,
    minWidth: 120,
    minHeight: 44,
    justifyContent: "center",
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  modalContent: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderRadius: 12,
    width: 300,
    alignSelf: "center",
  },
  selectedOption: {
    backgroundColor: "#e6f0ff",
  },
  closeBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
  },
});
