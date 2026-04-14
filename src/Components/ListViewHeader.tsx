import { StyleSheet, View } from "react-native";

import Colors from "@/Constants/Colors";
import Text from "./Text";

interface ListViewHeaderProps {
  Name: string;
  ContainerStyle: {};
}
const ListViewHeader = ({ Name, ContainerStyle }: ListViewHeaderProps) => {
  return (
    <View style={[styles.HeaderContainer, ContainerStyle]}>
      <Text style={styles.headerText}>{Name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  HeaderContainer: { backgroundColor: Colors.light.HighLighter, marginVertical: 10, paddingVertical: 6 },

  headerText: { marginLeft: 20, textAlignVertical: "center" },
});

export default ListViewHeader;
