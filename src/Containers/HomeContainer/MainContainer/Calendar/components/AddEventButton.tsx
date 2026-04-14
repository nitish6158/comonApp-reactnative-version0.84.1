import { View, Text, Pressable } from "react-native";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { navigate } from "@/navigation/utility";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Reducer";
import _ from "lodash";
import { useAtomValue } from "jotai";
import { useComonContacts } from "@/hooks/useComonContacts";

export default function AddEventButton() {
  const { comonParticipants } = useComonContacts();

  return (
    <Pressable
      style={{ marginHorizontal: 5 }}
      onPress={() => {
        navigate("CreateReminderScreen", {
          participants: comonParticipants(),
        });
      }}
    >
      <Ionicons name="add" size={25} />
    </Pressable>
  );
}
