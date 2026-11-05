import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

export const IMAGE_HEIGHT = 200;
export const IMAGE_HEIGHT_SMALL = 70;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    height: "100%",
  },
  empty: {
    alignItems: "center",
    backgroundColor: Colors.light.background,
    flex: 1,
    justifyContent: "center",
    padding: 25,
  },
  emptyTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  loader: {
    backgroundColor: Colors.light.background,
    height: "100%",
  },
  section: {
    bottom: -22,
    height: 30,
    left: 10,
    position: "absolute",
    top: 22,
    width: 30,
    zIndex: 98,
  },
  sectionHeader: {
    color: Colors.light.link,
    textAlign: "center",
  },
  share: {
    alignItems: "center",
    backgroundColor: Colors.light.link,
    borderRadius: 40,
    bottom: 20,
    height: 40,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    width: 40,
    elevation: 10,
  },
});

export default styles;
