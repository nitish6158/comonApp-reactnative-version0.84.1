import { $size_md } from "@/Constants/Sizes";
import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";

const PhoneInputStyle = StyleSheet.create({
  container: {
    marginBottom: 22,
  },
  containerError: {
    borderColor: Colors.light.error,
  },
  containerStyle: {
    borderRadius: 10,
    borderColor: Colors.light.formItemBorder,
    borderStyle: "solid",
    borderWidth: 1,
    flex: 1,
    width: "100%",
    height: $size_md,
    borderRadius: 10,
  },
  error: {
    color: Colors.light.error,
  },
  errorContainer: {
    marginTop: 6,
  },
  textContainerStyle: {
    backgroundColor: Colors.transparent,
    minHeight: 32,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
});

export default PhoneInputStyle;
