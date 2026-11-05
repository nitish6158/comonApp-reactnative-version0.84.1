import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import CustomTextInput from "./CustomTextInput";
import { Colors } from "@/Constants";

// Dummy users for dropdowns
const usersList = [
  { label: "Alice", value: "alice" },
  { label: "Bob", value: "bob" },
  { label: "Charlie", value: "charlie" },
  { label: "David", value: "david" },
];

type TaskType =
  | "Like/Dislike"
  | "Yes/No"
  | "Enter Free Text"
  | "Numeric Field Only"
  | "Multiple Option"
  | "Min Max Range";

interface TextBoxProps {
  taskType: TaskType;
}

const TASK_TYPES: TaskType[] = [
  "Like/Dislike",
  "Yes/No",
  "Enter Free Text",
  "Numeric Field Only",
  "Multiple Option",
  "Min Max Range",
];

const minMaxOptions = [
  { label: "Equal To", value: "eq" },
  { label: "Greater than", value: "gt" },
  { label: "Less than", value: "lt" },
  { label: "Greater than & equal", value: "gte" },
  { label: "Less than & equal", value: "lte" },
];
const andOrOptions = [
  { label: "OR", value: "or" },
  { label: "AND", value: "and" },
];

const TextBox: React.FC<Partial<TextBoxProps>> = ({
  taskType: propTaskType,
}) => {
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>(
    propTaskType || "Like/Dislike",
  );
  const [rows, setRows] = useState([
    {
      id: Date.now(),
      title: "",
      description: "",
      anonymousUsers: [],
      members: [],
      saved: false,
    },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalRowId, setModalRowId] = useState<number | null>(null);
  const [modalSelected, setModalSelected] = useState<string[]>([]);

  // Add state for min/max and expressions per row
  const [minMaxRange, setMinMaxRange] = useState<{
    [rowId: number]: {
      min: string;
      max: string;
      expressions: ExpressionType[];
    };
  }>({});
  const [dropdownModal, setDropdownModal] = useState<{
    visible: boolean;
    rowId: number | null;
    exprIdx: number | null;
    field: "option" | "logic" | null;
  }>({ visible: false, rowId: null, exprIdx: null, field: null });

  // Add state for Multiple Option task type
  const [multiOptions, setMultiOptions] = useState<{
    [rowId: number]: { value: string; options: string[] };
  }>({});

  // Expression type
  const EXPRESSION_OPTIONS = [
    { label: "Equal To", value: "eq" },
    { label: "Greater than", value: "gt" },
    { label: "Less than", value: "lt" },
    { label: "Greater than & equal", value: "gte" },
    { label: "Less than & equal", value: "lte" },
  ];
  const LOGIC_OPTIONS = [
    { label: "OR", value: "or" },
    { label: "AND", value: "and" },
  ];

  type ExpressionType = {
    prompt: string;
    option: string; // eq, gt, lt, gte, lte
    number: string;
    logic: string; // or, and
  };

  // Handle text changes
  const handleChange = (id: number, field: string, value: any) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: value, saved: false } : row,
      ),
    );
  };

  // Add new row
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "",
        description: "",
        anonymousUsers: [],
        members: [],
        saved: false,
      },
    ]);
  };

  // Remove row
  const removeRow = (id: number) => {
    setRows((prev) => prev.filter((row) => row.id !== id));
  };

  // Save row
  const saveRow = (id: number) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, saved: true } : row)),
    );
    Alert.alert("Row saved!");
  };

  // Open modal for anonymous user selection
  const openModal = (id: number, selected: string[]) => {
    setModalRowId(id);
    setModalSelected(selected);
    setModalVisible(true);
  };

  // Save anonymous users from modal
  const saveAnonymousUsers = () => {
    if (modalRowId !== null) {
      handleChange(modalRowId, "anonymousUsers", modalSelected);
    }
    setModalVisible(false);
  };

  // Multi-select dropdown for members
  const MultiSelectDropdown = ({
    value,
    onChange,
    placeholder,
  }: {
    value: string[];
    onChange: (val: string[]) => void;
    placeholder: string;
  }) => {
    const [visible, setVisible] = useState(false);
    return (
      <>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setVisible(true)}
        >
          <Text
            style={{
              color: value.length ? Colors.light.black : "#888",
              flex: 1,
            }}
          >
            {value.length
              ? usersList
                  .filter((u) => value.includes(u.value))
                  .map((u) => u.label)
                  .join(", ")
              : placeholder}
          </Text>
          <Text style={{ marginLeft: 8, fontSize: 18, color: "#888" }}>▼</Text>
        </TouchableOpacity>
        <Modal visible={visible} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setVisible(false)}
          />
          <View style={styles.modalContent}>
            <FlatList
              data={usersList}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    value.includes(item.value) && styles.selectedOption,
                  ]}
                  onPress={() => {
                    let arr = [...value];
                    if (arr.includes(item.value))
                      arr = arr.filter((v) => v !== item.value);
                    else arr.push(item.value);
                    onChange(arr);
                  }}
                >
                  <Text
                    style={{
                      color: value.includes(item.value)
                        ? Colors.light.PrimaryColor
                        : "#222",
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setVisible(false)}
            >
              <Text
                style={{ color: Colors.light.PrimaryColor, fontWeight: "600" }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </>
    );
  };

  // Handler for option value change
  const handleOptionValueChange = (rowId: number, value: string) => {
    const entry = multiOptions[rowId] || { value: "", options: [] };
    setMultiOptions(
      (prev: { [rowId: number]: { value: string; options: string[] } }) => ({
        ...prev,
        [rowId]: { ...entry, value },
      }),
    );
  };

  // Handler to add option
  const handleAddOption = (rowId: number) => {
    setMultiOptions(
      (prev: { [rowId: number]: { value: string; options: string[] } }) => {
        const entry = prev[rowId] || { value: "", options: [] };
        if (entry.value.trim() && !entry.options.includes(entry.value.trim())) {
          return {
            ...prev,
            [rowId]: {
              value: "",
              options: [...entry.options, entry.value.trim()],
            },
          };
        }
        return prev;
      },
    );
  };

  // Handler to remove option
  const handleRemoveOption = (rowId: number, opt: string) => {
    setMultiOptions(
      (prev: { [rowId: number]: { value: string; options: string[] } }) => ({
        ...prev,
        [rowId]: {
          ...prev[rowId],
          options: prev[rowId].options.filter((o: string) => o !== opt),
        },
      }),
    );
  };

  // Handlers for min/max
  const handleMinMaxChange = (
    rowId: number,
    field: "min" | "max",
    value: string,
  ) => {
    setMinMaxRange((prev) => ({
      ...prev,
      [rowId]: {
        min:
          field === "min"
            ? value.replace(/[^0-9]/g, "")
            : prev[rowId]?.min || "",
        max:
          field === "max"
            ? value.replace(/[^0-9]/g, "")
            : prev[rowId]?.max || "",
        expressions: prev[rowId]?.expressions || [],
      },
    }));
  };

  // Handler to add expression
  const handleAddExpression = (rowId: number) => {
    setMinMaxRange((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        expressions: [
          ...(prev[rowId]?.expressions || []),
          { prompt: "", option: "", number: "", logic: "" },
        ],
      },
    }));
  };

  // Handler to remove expression
  const handleRemoveExpression = (rowId: number, idx: number) => {
    setMinMaxRange((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        expressions: prev[rowId]?.expressions.filter((_, i) => i !== idx) || [],
      },
    }));
  };

  // Handler for expression field change
  const handleExpressionChange = (
    rowId: number,
    idx: number,
    field: keyof ExpressionType,
    value: string,
  ) => {
    setMinMaxRange((prev) => {
      const exprs = prev[rowId]?.expressions || [];
      const updated = exprs.map((expr, i) =>
        i === idx
          ? {
              ...expr,
              [field]:
                field === "number" ? value.replace(/[^0-9]/g, "") : value,
            }
          : expr,
      );
      return {
        ...prev,
        [rowId]: {
          ...prev[rowId],
          expressions: updated,
        },
      };
    });
  };

  // Submit all rows
  const handleSubmit = () => {
    // Only submit saved rows
    const validRows = rows.filter((row) => row.saved);
    if (validRows.length === 0) {
      Alert.alert("Please save at least one row before submitting.");
      return;
    }
    // Here you can make your API call with validRows
    console.log("Submitted Data:", validRows);
    Alert.alert("Submitted! Check console log.");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={{ backgroundColor: Colors.light.White }}
    >
      {/* Task type selector for demo/testing */}
      <View
        style={{
          flexDirection: "row",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {TASK_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 8,
              backgroundColor:
                selectedTaskType === type
                  ? Colors.light.PrimaryColor
                  : "#f2f2f2",
              marginRight: 8,
              marginBottom: 8,
              borderWidth: 1.5,
              borderColor:
                selectedTaskType === type
                  ? Colors.light.PrimaryColor
                  : "#e0e0e0",
            }}
            onPress={() => setSelectedTaskType(type)}
          >
            <Text
              style={{
                color:
                  selectedTaskType === type
                    ? Colors.light.White
                    : Colors.light.PrimaryColor,
                fontWeight: "600",
              }}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.title}>Goal Questions</Text>
      {rows.map((row, index) => (
        <View key={row.id} style={styles.cardRow}>
          <View style={styles.cardContent}>
            <Text style={styles.sectionHeader}>Goal {index + 1}</Text>
            {/* Always show the original UI */}
            <CustomTextInput
              label={"Goal's Title"}
              value={row.title}
              onChangeText={(text) => handleChange(row.id, "title", text)}
              placeholder="Enter goal title"
              required
              minLength={2}
              maxLength={100}
              style={styles.input}
            />
            <CustomTextInput
              label={"Goal's Description"}
              value={row.description}
              onChangeText={(text) => handleChange(row.id, "description", text)}
              placeholder="Enter goal description"
              required
              minLength={2}
              maxLength={300}
              multiline
              numberOfLines={3}
              style={styles.input}
            />
            {/* Min Max Range UI */}
            {selectedTaskType === "Min Max Range" && (
              <>
                <View
                  style={{ flexDirection: "row", gap: 12, marginBottom: 10 }}
                >
                  <CustomTextInput
                    label={"Minimum Value"}
                    value={minMaxRange[row.id]?.min || ""}
                    onChangeText={(val) =>
                      handleMinMaxChange(row.id, "min", val)
                    }
                    placeholder="Min"
                    keyboardType="numeric"
                    style={[styles.input, { flex: 1 }]}
                  />
                  <CustomTextInput
                    label={"Maximum Value"}
                    value={minMaxRange[row.id]?.max || ""}
                    onChangeText={(val) =>
                      handleMinMaxChange(row.id, "max", val)
                    }
                    placeholder="Max"
                    keyboardType="numeric"
                    style={[styles.input, { flex: 1 }]}
                  />
                </View>
                {/* Render expression cards */}
                {(minMaxRange[row.id]?.expressions || []).map((expr, idx) => (
                  <View
                    key={idx}
                    style={{
                      backgroundColor: "#f2f6ff",
                      borderRadius: 12,
                      padding: 14,
                      marginTop: 12,
                      marginBottom: 4,
                      shadowColor: "#b3c6ff",
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      elevation: 1,
                    }}
                  >
                    <CustomTextInput
                      label={"Prompt Message"}
                      value={expr.prompt}
                      onChangeText={(val) =>
                        handleExpressionChange(row.id, idx, "prompt", val)
                      }
                      placeholder="Enter prompt message"
                      style={styles.input}
                    />
                    {/* Select option dropdown */}
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() =>
                        setDropdownModal({
                          visible: true,
                          rowId: row.id,
                          exprIdx: idx,
                          field: "option",
                        })
                      }
                    >
                      <Text
                        style={{
                          color: expr.option ? Colors.light.black : "#888",
                          flex: 1,
                        }}
                      >
                        {EXPRESSION_OPTIONS.find((o) => o.value === expr.option)
                          ?.label || "Select option"}
                      </Text>
                      <Text
                        style={{ marginLeft: 8, fontSize: 18, color: "#888" }}
                      >
                        ▼
                      </Text>
                    </TouchableOpacity>
                    {/* Number input */}
                    <CustomTextInput
                      label={"Number"}
                      value={expr.number}
                      onChangeText={(val) =>
                        handleExpressionChange(row.id, idx, "number", val)
                      }
                      placeholder="Enter number"
                      keyboardType="numeric"
                      style={styles.input}
                    />
                    {/* Logic dropdown */}
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() =>
                        setDropdownModal({
                          visible: true,
                          rowId: row.id,
                          exprIdx: idx,
                          field: "logic",
                        })
                      }
                    >
                      <Text
                        style={{
                          color: expr.logic ? Colors.light.black : "#888",
                          flex: 1,
                        }}
                      >
                        {LOGIC_OPTIONS.find((o) => o.value === expr.logic)
                          ?.label || "Select"}
                      </Text>
                      <Text
                        style={{ marginLeft: 8, fontSize: 18, color: "#888" }}
                      >
                        ▼
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleRemoveExpression(row.id, idx)}
                      style={{ alignSelf: "flex-end", marginTop: 8 }}
                    >
                      <Text
                        style={{
                          color: Colors.light.red,
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        × Remove
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddExpression(row.id)}
                >
                  <Text style={styles.addText}>+ Add Expression</Text>
                </TouchableOpacity>
              </>
            )}
            {/* Multiple Option UI (additional for Multiple Option type) - move above Add Anonymous User */}
            {selectedTaskType === "Multiple Option" && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.sectionHeader}>Options</Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <CustomTextInput
                    label={"Add Option"}
                    value={multiOptions[row.id]?.value || ""}
                    onChangeText={(val) => handleOptionValueChange(row.id, val)}
                    placeholder="Enter option"
                    style={[styles.input, { flex: 1 }]}
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddOption(row.id)}
                  >
                    <Text style={styles.addText}>+ Add</Text>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginTop: 8,
                  }}
                >
                  {(multiOptions[row.id]?.options || []).map(
                    (opt: string, i: number) => (
                      <View key={i} style={styles.chip}>
                        <Text style={styles.chipText}>{opt}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveOption(row.id, opt)}
                        >
                          <Text style={styles.chipCloseText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ),
                  )}
                </View>
              </View>
            )}
            <TouchableOpacity
              style={styles.anonBtn}
              onPress={() => openModal(row.id, row.anonymousUsers)}
            >
              <Text style={styles.anonBtnText}>+ Add Anonymous User</Text>
            </TouchableOpacity>
            {/* Chips for selected anonymous users */}
            {row.anonymousUsers.length > 0 && (
              <View style={styles.chipContainer}>
                {row.anonymousUsers.map((userVal) => {
                  const user = usersList.find((u) => u.value === userVal);
                  return (
                    <View key={userVal} style={styles.chip}>
                      <Text style={styles.chipText}>
                        {user ? user.label : userVal}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          const updated = row.anonymousUsers.filter(
                            (v) => v !== userVal,
                          );
                          handleChange(row.id, "anonymousUsers", updated);
                        }}
                        style={styles.chipCloseBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={styles.chipCloseText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
            <MultiSelectDropdown
              value={row.members}
              onChange={(val) => handleChange(row.id, "members", val)}
              placeholder="Select Members"
            />
            <View style={styles.rowBtnsBottom}>
              <TouchableOpacity
                onPress={() => removeRow(row.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeText}>✕ Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => saveRow(row.id)}
                style={[
                  styles.saveButton,
                  row.saved && { backgroundColor: Colors.light.alertSuccess },
                ]}
              >
                <Text style={styles.saveText}>
                  {row.saved ? "Saved" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}
      <TouchableOpacity onPress={addRow} style={styles.addButton}>
        <Text style={styles.addText}>+ Add Row</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitText}>Submit All</Text>
      </TouchableOpacity>
      {/* Modal for Anonymous User Selection */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlayFull}>
          <View style={styles.modalContentBetter}>
            <Text style={styles.modalTitle}>Select Anonymous Users</Text>
            <FlatList
              data={usersList}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    modalSelected.includes(item.value) && styles.selectedOption,
                  ]}
                  onPress={() => {
                    let arr = [...modalSelected];
                    if (arr.includes(item.value))
                      arr = arr.filter((v) => v !== item.value);
                    else arr.push(item.value);
                    setModalSelected(arr);
                  }}
                >
                  <Text
                    style={{
                      color: modalSelected.includes(item.value)
                        ? Colors.light.PrimaryColor
                        : "#222",
                      fontWeight: modalSelected.includes(item.value)
                        ? "700"
                        : "400",
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.saveAnonBtn}
              onPress={saveAnonymousUsers}
            >
              <Text
                style={{
                  color: Colors.light.White,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeBtnModal}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={{
                  color: Colors.light.PrimaryColor,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Dropdown Modal for Expression Option/Logic */}
      <Modal visible={dropdownModal.visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() =>
            setDropdownModal({
              visible: false,
              rowId: null,
              exprIdx: null,
              field: null,
            })
          }
        />
        <View style={styles.modalContent}>
          <FlatList
            data={
              dropdownModal.field === "option"
                ? EXPRESSION_OPTIONS
                : LOGIC_OPTIONS
            }
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
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
                      item.value,
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
            style={styles.closeBtn}
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
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#f6f8fa",
    minHeight: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: Colors.light.black,
    alignSelf: "center",
  },
  cardRow: {
    width: "100%",
    marginBottom: 24,
    backgroundColor: Colors.light.White,
    borderRadius: 16,
    padding: 18,
    shadowColor: Colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    width: "100%",
    paddingRight: 0,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.PrimaryColor,
    marginBottom: 10,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  rowBtnsBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    gap: 12,
  },
  removeButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    marginLeft: 6, // match saveButton
    borderWidth: 1.5,
    borderColor: Colors.light.red,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
    marginLeft: 6,
  },
  removeText: {
    color: Colors.light.red, // match border color
    fontWeight: "bold",
    fontSize: 16,
  },
  saveText: {
    color: Colors.light.White,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  addButton: {
    backgroundColor: Colors.light.alertSuccess,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 8,
    shadowColor: Colors.light.alertSuccess,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  addText: {
    color: Colors.light.White,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  submitButton: {
    backgroundColor: Colors.light.PrimaryColor,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
    shadowColor: Colors.light.PrimaryColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  submitText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  input: {
    flex: 1,
  },
  anonBtn: {
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 14,
    alignItems: "center",
    paddingBottom: 15,
  },
  anonBtnText: {
    color: Colors.light.White,
    fontWeight: "700",
    fontSize: 15,
  },
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
  modalOverlayFull: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  modalContentBetter: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 22,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: Colors.light.PrimaryColor,
    marginBottom: 12,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    width: 260,
    alignSelf: "center",
  },
  selectedOption: {
    backgroundColor: "#e6f0ff",
  },
  closeBtn: {
    marginTop: 10,
    alignSelf: "flex-end",
  },
  closeBtnModal: {
    marginTop: 8,
    alignSelf: "center",
  },
  saveAnonBtn: {
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 14,
    marginBottom: 4,
  },
  selectedUsersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    gap: 8,
  },
  userChip: {
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  userChipText: {
    color: Colors.light.White,
    fontWeight: "600",
    fontSize: 14,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap", // allow wrapping to next line
    marginTop: 8,
    gap: 8,
    maxWidth: "100%",
  },
  chip: {
    borderColor: Colors.light.PrimaryColor,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 28, // much wider
    paddingVertical: 10, // slightly taller
    marginRight: 10,
    marginBottom: 6,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    minWidth: 90, // ensure minimum width
  },
  chipText: {
    color: Colors.light.PrimaryColor,
    fontWeight: "600",
    fontSize: 15, // slightly larger
  },
  chipCloseBtn: {
    marginLeft: "auto",
    marginRight: -8,
    paddingLeft: 12,
    paddingRight: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  chipCloseText: {
    justifyContent: "center",
    color: Colors.light.PrimaryColor,
    fontWeight: "bold",
    fontSize: 22,
    lineHeight: 24,
    paddingTop: 2, // align with text vertically
  },
});

export default TextBox;
