import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  box: {
    borderColor: Colors.light.formItemBorder,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    marginTop: 12,
    paddingBottom: 0,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  container: {
    paddingVertical: 24,
  },
});

export default styles;
