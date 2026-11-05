import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import DynamicModal from "@/Components/Modal/DynamicModal";
import { Colors } from "@/Constants";
import { EXPRESSION_OPTIONS, LOGIC_OPTIONS } from "../TaskUtils";
import { taskManagerStyles } from "../styles/TaskManagerStyles";

export const useTaskModals = (taskManager: any) => {
  const {
    alertModal,
    modalValue,
    modalVisible,
    setModalVisible,
    modalRowId,
    setModalRowId,
    anonymousUserSelected,
    setAnonymousUserSelected,
    contacts,
    dropdownModal,
    setDropdownModal,
    handleExpressionChange,
    saveAnonymousUsers,
    t,
  } = taskManager;

  const renderAlertModal = () => (
    <DynamicModal
      visible={alertModal}
      data={modalValue.header}
      description={modalValue.description}
      buttons={modalValue.button}
    />
  );

  const renderAnonymousUsersModal = () => {
    const [tempArr, setTempArr] = React.useState<any[]>([...anonymousUserSelected]);

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={taskManagerStyles.modalOverlay}
          onPress={() => setModalVisible(false)}
        />
        <View style={taskManagerStyles.modalContent}>
          <FlatList
            data={contacts}
            keyExtractor={(item: any) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  taskManagerStyles.option,
                  tempArr.includes(item?.value ?? "") && taskManagerStyles.selectedOption,
                ]}
                onPress={() => {
                  if (tempArr.includes(item.value ?? ""))
                    setTempArr(tempArr.filter((v) => v !== item.value));
                  else setTempArr([...tempArr, item.value]);
                }}
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
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <TouchableOpacity
              style={taskManagerStyles.closeBtn}
              onPress={() => {
                setAnonymousUserSelected([...tempArr]);
                saveAnonymousUsers([...tempArr]);
              }}
            >
              <Text
                style={{
                  color: Colors.light.PrimaryColor,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                {t("taskManager.save")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={taskManagerStyles.closeBtn}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Text
                style={{
                  color: Colors.light.red,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                {t("taskManager.close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderExpressionModal = () => {
    return (
      <Modal visible={dropdownModal.visible} transparent animationType="fade">
        <TouchableOpacity
          style={taskManagerStyles.modalOverlay}
          onPress={() =>
            setDropdownModal({
              visible: false,
              rowId: null,
              exprIdx: null,
              field: null,
            })
          }
        />
        <View style={taskManagerStyles.modalContent}>
          <FlatList
            data={
              dropdownModal.field === "option"
                ? EXPRESSION_OPTIONS
                : LOGIC_OPTIONS
            }
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={taskManagerStyles.option}
                onPress={() => {
                  if (
                    dropdownModal.rowId !== null &&
                    dropdownModal.exprIdx !== null &&
                    dropdownModal.field
                  ) {
                    handleExpressionChange(
                      dropdownModal.rowId,
                      dropdownModal.exprIdx,
                      dropdownModal.field,
                      item.value
                    );
                  }
                  setDropdownModal({
                    visible: false,
                    rowId: null,
                    exprIdx: null,
                    field: null,
                  });
                }}
              >
                <Text
                  style={{
                    color: Colors.light.PrimaryColor,
                    fontWeight: "600",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={taskManagerStyles.closeBtn}
            onPress={() =>
              setDropdownModal({
                visible: false,
                rowId: null,
                exprIdx: null,
                field: null,
              })
            }
          >
            <Text
              style={{ color: Colors.light.PrimaryColor, fontWeight: "600" }}
            >
              {t("taskManager.close")}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  return {
    renderAlertModal,
    renderAnonymousUsersModal,
    renderExpressionModal,
  };
};