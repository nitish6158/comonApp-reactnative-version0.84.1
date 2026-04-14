import { StyleSheet } from "react-native";
import { Colors } from "@/Constants";

export const taskManagerHeaderStyles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 60,
    position: "relative",
    marginTop: -10,
    marginVertical: 12,
  },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.black,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    zIndex: 1,
    marginTop: 1,
  },
  headerSubmitBtn: {
    backgroundColor: Colors.light.PrimaryColor,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    right: 20,
  },
  submitIcon: {
    marginRight: 4,
  },
  headerSubmitText: {
    color: Colors.light.White,
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: Colors.light.grayText,
    fontWeight: "500",
  },
  progressPercentage: {
    fontSize: 14,
    color: Colors.light.PrimaryColor,
    fontWeight: "600",
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(0, 123, 255, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 3,
  },
});