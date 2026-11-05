import { Colors, fonts } from "@/Constants";
import { windowHeight, windowWidth } from "@Util/ResponsiveView";
import { StyleSheet } from "react-native";

const textStyles = StyleSheet.create({
  headingText:{
    fontSize:16,
    fontFamily:fonts.Lato,
    marginLeft:10
  },
});

const containerStyles = StyleSheet.create({
  imageContainer:{
    height:220,
    width:180,
    borderRadius:8
  },
  picker: {
    // backgroundColor: "rgba(51,51,51,.1)",
    alignSelf: "flex-start",
    // height: 30,
    // paddingHorizontal: 15,
    borderRadius: 5,
    // marginVertical: 10,
    marginLeft: 3,
  },
  messageMain:{
    marginVertical:10,
    height:windowHeight -200,
    // marginBottom:500
  },
  videoPlayButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Colors.light.Hiddengray,
    borderRadius: 70,
    height: 60,
    justifyContent: "center",
    marginTop: 90,
    position: "absolute",
    width: 60,
  },
  messageContainer: {
    alignSelf: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 8,
    maxWidth: "70%",
    backgroundColor: "rgb(224,250,255)",
    marginLeft: 50,
    flexDirection: "column",
    borderRadius: 12,
    marginBottom:5
  },
  sendButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 30,
    marginLeft: 10,
    backgroundColor: "#33CCFF",
    justifyContent: "center",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(140,140,140,1)",
  },
  dateError: {
    borderColor: "red",
  },
  dates:{
    flexDirection: "row", alignItems: "center"
  },
  bottomContainer: {
    backgroundColor:'rgba(243,243,243,1)',
    paddingVertical:15,
    paddingHorizontal:15,
    position:'absolute',
    width:'100%',
    zIndex:5,
    bottom:0
  },
  iconStyle: {
    marginRight: 10,
    marginLeft: 2,
  },
  peopleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop:20
    // marginTop: 15,
    // paddingHorizontal: 20,
    // paddingVertical: 20,
  },
  headerContainer: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 15,
    width: windowWidth,
    backgroundColor:'rgba(243,243,243,1)',
    paddingVertical:10
  },
  errorLabel: {
    fontSize: 12,
    color: "red",
    marginLeft: 5,
  },
  errorBox: {
    backgroundColor: "rgba(255,10,10,.1)",
    borderRadius: 5,
    borderColor: "red",
    borderWidth: 0.5,
    marginRight: 3,
  },
  labelText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 7,
    marginTop: 5,
    color: "gray",
  },
  separator: {
    width: "95%",
    height: 2,
    backgroundColor: "rgba(243,243,243,1)",
    marginVertical: 5,
    alignSelf: "center",
  },
});

export const screenStyles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "space-between",
  },
  ...containerStyles,
  ...textStyles,
});
