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
  },
  codeTextStyle: {
    color: Colors.light.black,
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  countryPickerAccessory: {
    alignItems: "center",
    flexDirection: "row",
    left: 10,
    position: "absolute",
    zIndex: 10,
  },
  countryPickerButtonStyle: {
    minWidth: 72,
    width: 72,
  },
  dropDownImage: {
    height: 12,
    marginLeft: 3,
    width: 10,
  },
  error: {
    color: Colors.light.error,
  },
  flagEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },
  flagImage: {
    height: 14,
    width: 20,
  },
  errorContainer: {
    marginTop: 6,
  },
  textContainerStyle: {
    backgroundColor: Colors.transparent,
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  textInputStyle: {
    color: Colors.light.black,
    fontSize: 14,
    paddingVertical: 0,
  },
  flagButtonStyle: {
    minWidth: 72,
    width: 72,
  },
});

export default PhoneInputStyle;
