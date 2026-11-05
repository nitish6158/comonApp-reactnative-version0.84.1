import { StyleSheet } from "react-native";
import { Colors } from "@/Constants";

export const taskFormStyles = StyleSheet.create({
  // Empty state styles
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.light.black,
    textAlign: "center",
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.light.grayText,
    textAlign: "center",
    lineHeight: 24,
  },

  // Add task button styles
  addTaskContainer: {
    marginHorizontal: 20,
    marginVertical: 20,
    alignItems: "center",
  },
  addTaskHint: {
    fontSize: 14,
    color: Colors.light.grayText,
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
  },
  addTaskButton: {
    backgroundColor: Colors.light.PrimaryColor,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 200,
  },
  addTaskButtonDisabled: {
    backgroundColor: Colors.light.backgroundGray,
    elevation: 0,
    shadowOpacity: 0,
  },
  addTaskIcon: {
    marginRight: 8,
  },
  addTaskText: {
    color: Colors.light.White,
    fontSize: 16,
    fontWeight: "600",
  },
  addTaskTextDisabled: {
    color: Colors.light.grayText,
  },

  // Form input styles
  input: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.PrimaryColor,
    marginBottom: 0,
    marginTop: 2,
    letterSpacing: 0.2,
  },

  // Dropdown styles
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

  // Multiple options styles
  addButtonOption: {
    backgroundColor: Colors.light.PrimaryColor,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 2,
    marginTop: 32,
  },
  disableButton: {
    backgroundColor: Colors.light.backgroundGray,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
    shadowColor: Colors.light.backgroundGray,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  addText: {
    color: Colors.light.White,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  addTextDisabled: {
    color: Colors.light.grayText,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  addButtonLast: {
    backgroundColor: Colors.light.alertSuccess,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  // Chip styles
  chip: {
    borderColor: Colors.light.PrimaryColor,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 6,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
    justifyContent: "center",
    textAlignVertical: "center",
  },
  chipText: {
    color: Colors.light.PrimaryColor,
    fontWeight: "600",
    fontSize: 15,
  },
  chipCloseText: {
    justifyContent: "center",
    color: Colors.light.PrimaryColor,
    fontWeight: "bold",
    fontSize: 24,
    paddingLeft: 4,
  },
});