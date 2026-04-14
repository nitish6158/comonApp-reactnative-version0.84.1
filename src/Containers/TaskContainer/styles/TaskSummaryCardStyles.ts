import { StyleSheet } from "react-native";
import { Colors } from "@/Constants";

export const taskSummaryCardStyles = StyleSheet.create({
  summaryCard: {
    backgroundColor: Colors.light.White,
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.PrimaryColor,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.PrimaryColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    position: "relative",
  },
  stepNumber: {
    color: Colors.light.White,
    fontSize: 14,
    fontWeight: "bold",
  },
  checkIcon: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: Colors.light.alertSuccess,
    borderRadius: 8,
    width: 16,
    height: 16,
  },
  summaryContent: {
    flex: 1,
    marginRight: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.black,
    marginBottom: 4,
  },
  summaryDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryTaskType: {
    fontSize: 14,
    color: Colors.light.PrimaryColor,
    fontWeight: "500",
    marginRight: 12,
  },
  summaryMembers: {
    fontSize: 14,
    color: Colors.light.grayText,
  },
  summaryActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandIcon: {
    marginLeft: 8,
  },
});