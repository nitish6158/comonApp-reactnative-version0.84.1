import Colors from "@/Constants/Colors";
import { StyleSheet } from "react-native";
import { windowHeight } from "@Util/ResponsiveView";

export const styles = StyleSheet.create({
  AvataarContainer: { borderRadius: 50, height: 50, overflow: "hidden", width: 50 },
  CheckIcon: { marginHorizontal: 10, marginTop: 16 },
  CheckIconContainer: { alignItems: "center", justifyContent: "center" },
  EditImageCon: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderColor: Colors.light.White,
    borderRadius: 50,
    borderWidth: 2.5,
    bottom: 2.3,
    height: 24,
    justifyContent: "center",
    left: 55,
    position: "absolute",
    width: 24,
  },

  LeavGroupText: { color: Colors.light.PrimaryColor, paddingVertical: 12, textAlign: "center" },
  LeaveGroupCon: {
    backgroundColor: "white",
    borderColor: Colors.light.PrimaryColor,
    borderRadius: 5,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 30,
  },
  Name: { marginLeft: 3 },
  TimeText: { color: Colors.light.grayText },
  TopImage: { height: 72, width: 72 },
  TopView: { backgroundColor: "white", height: 160, justifyContent: "center" },
  addMemberCon: {
    alignItems: "center",
    backgroundColor: Colors.light.AddMemberGreen,
    borderRadius: 10,
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  avtaarCon: { alignItems: "center", justifyContent: "center", marginTop: windowHeight / 40 },
  container: {
    backgroundColor: "rgba(243,243,243,1)",
    flex: 1,
  },
  memberAddCon: {
    BorderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginTop: 25,
  },
  participantsName: { fontSize: 15, marginLeft: 0 },
  phone: { color: Colors.light.Hiddengray, fontSize: 13, marginTop: 4 },
});
