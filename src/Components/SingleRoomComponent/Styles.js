import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";
import fonts from "@/Constants/fonts";
import { windowWidth } from "@Util/ResponsiveView";

export const Styles = StyleSheet.create({
  roomName:{
    fontFamily: fonts.Lato, 
    fontWeight: "600", 
    flexGrow: 1, 
    maxWidth: windowWidth / 2,
    marginRight:5
  },
  broadcastLogo: {
    height: 15,
    width: 15,
    position: "absolute",
    left: 55,
    bottom: 15,
    zIndex: 1000,
    borderWidth: 2,
    borderColor: Colors.light.White,
    borderRadius: 15,
  },
  AvataarContainer: {
    borderRadius: 50,
    height: 50,
    overflow: "hidden",
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  Container: {
    backgroundColor: Colors.light.background,
    flexDirection: "row",
    height: 82,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  NameCon: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  NotifyCon: { flexDirection: "row", justifyContent: "flex-end",  },
  TextandIconContainer: { marginLeft: 16, width: "84%" },
  TimeIconCon: { alignItems: "center", flexDirection: "row", justifyContent: "center", marginRight: 8 },
  TimeText: { color: Colors.light.grayText, fontFamily: fonts.Lato },
  UnreadMessageIcon: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 30,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  messageContainer: { flexDirection: "row", width: "100%", justifyContent: "space-between", marginTop: 3 },
  onLine: {
    height: 15,
    width: 15,
    backgroundColor: Colors.light.onlineGreen,
    position: "absolute",
    borderRadius: 50,
    left: 55,
    top: 52,
    borderWidth: 2,
    borderColor: Colors.light.background,
  },
});
