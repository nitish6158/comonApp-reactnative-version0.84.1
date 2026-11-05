import { $space_lg, $space_sm } from "@/Constants/Spaces";

import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";
import { windowWidth } from "@/utils/ResponsiveView";

export const headerStyle = StyleSheet.create({
  currentOrganization: {
    color: Colors.light.link,
    fontWeight: "700",
    marginLeft: $space_sm,
  },
  header: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    height:55,
    backgroundColor:'white',
    paddingHorizontal:10,
    paddingVertical:10,
    
  },
  headerWithScreenName: {
    paddingLeft: $space_sm,
  },
});
