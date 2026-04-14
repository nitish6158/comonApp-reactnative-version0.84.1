import { StyleSheet } from "react-native";

export const standardsStylesObject = {
  backgroundColor: "white",
  borderColor: "grey",
  color: "black",
  borderRadius: 5,
  borderWidth: 0.5,
  fontSizeNormal: 17,
};

const styles = StyleSheet.create({
  StandardContainer: {
    backgroundColor: standardsStylesObject.backgroundColor,
    borderColor: standardsStylesObject.borderColor,
    borderRadius: standardsStylesObject.borderRadius,
    borderWidth: standardsStylesObject.borderWidth,
    marginLeft: 10,
    marginRight: 10,
  },
  StandardText: {
    color: standardsStylesObject.color,
    fontSize: standardsStylesObject.fontSizeNormal,
    padding: 6,
  },
});

export default styles;
