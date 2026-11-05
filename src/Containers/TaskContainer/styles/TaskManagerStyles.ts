import { StyleSheet } from "react-native";
import { Colors } from "@/Constants";

export const taskManagerStyles = StyleSheet.create({
  container: {
    padding: 10,
    paddingBottom: 40,
    backgroundColor: "white",
    minHeight: "100%",
  },

  // Step-based styles
  stepWrapper: {
    marginBottom: 16,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  stepIndicatorExpanded: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.PrimaryColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberExpanded: {
    color: Colors.light.White,
    fontSize: 16,
    fontWeight: "bold",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.PrimaryColor,
    flex: 1,
  },
  collapseButton: {
    padding: 8,
  },

  // Card styles
  cardRow: {
    width: "100%",
    marginBottom: 24,
    backgroundColor: Colors.light.White,
    borderRadius: 16,
    padding: 18,
  },
  cardContent: {
    width: "100%",
    paddingRight: 0,
  },

  // Form row styles
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
    marginLeft: 6,
    borderWidth: 1.5,
    borderColor: Colors.light.red,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginLeft: 6,
  },
  removeText: {
    color: Colors.light.red,
    fontWeight: "bold",
    fontSize: 16,
  },
  saveText: {
    color: Colors.light.White,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.2,
  },

  // Input styles
  input: {
    flex: 1,
  },
  textArea: {
    flex: 1,
    height: 100,
    textAlignVertical: "top",
  },

  // Anonymous user chips
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 8,
    maxWidth: "100%",
  },
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
    fontSize: 24,
    paddingLeft: 4,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
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
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
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

  // Publish Modal styles
  publishModalContent: {
    position: "absolute",
    top: "5%",
    left: "5%",
    right: "5%",
    bottom:"12%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  publishModalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  publishModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.light.PrimaryColor,
    marginTop: 12,
    textAlign: "center",
  },
  publishModalBody: {
    marginBottom: 24,
  },
  publishModalDescription: {
    fontSize: 16,
    color: Colors.light.grayText,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  publishModalStats: {
    alignItems: "center",
  },
  publishModalStat: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  publishModalStatText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.alertSuccess,
    marginLeft: 8,
  },
  publishModalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  publishModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  publishModalCancelButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  publishModalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.grayText,
  },
  publishModalConfirmButton: {
    backgroundColor: Colors.light.PrimaryColor,
  },
  publishModalConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.White,
    marginLeft: 8,
  },

  // Bottom Sheet styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
  },
  bottomSheetContainer: {
    backgroundColor: Colors.light.White,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    paddingBottom: 20,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  bottomSheetCloseButton: {
    padding: 4,
  },
  bottomSheetList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  bottomSheetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#F8F9FA",
  },
  bottomSheetItemSelected: {
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    borderWidth: 1,
    borderColor: Colors.light.PrimaryColor,
  },
  bottomSheetItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bottomSheetItemIcon: {
    marginRight: 12,
  },
  bottomSheetItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    flex: 1,
  },
  bottomSheetItemTextSelected: {
    color: Colors.light.PrimaryColor,
    fontWeight: "600",
  },
});