import { View, Text, Pressable } from "react-native";
import React from "react";
import { RoomData } from "@/redux/Models/ChatModel";
import { Dialog } from "react-native-ui-lib";
import { navigate } from "@/navigation/utility";
import { Colors } from "@/Constants";

type props = {
  event: RoomData;
  onClose: () => void;
};

export default function ChatAlertModal({ event, onClose }: props) {
  if (!event) {
    return <></>;
  }

  return (
    <Dialog
      containerStyle={{ backgroundColor: "white", paddingVertical: 20, paddingHorizontal: 20, borderRadius: 10 }}
      ignoreBackgroundPress={true}
      visible={event != null}
      onDismiss={() => console.log("dismissed")}
    >
      <Text
        style={{ fontSize: 17, marginBottom: 50, fontWeight: "500",textAlign:'center' }}
      >{`You have received message from ${event.notification.title}`}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
        <Pressable onPress={onClose} style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 16,color:'red' }}>Do not read</Text>
        </Pressable>
        <Pressable
          style={{ flex: 1, alignItems: "center" }}
          onPress={() => {
            navigate("SeniorChatMessageScreen", { roomId: event.myMessage.roomId });
            onClose();
          }}
        >
          <Text style={{ fontSize: 16 ,color:Colors.light.PrimaryColor}}>Read</Text>
        </Pressable>
      </View>
    </Dialog>
  );
}
