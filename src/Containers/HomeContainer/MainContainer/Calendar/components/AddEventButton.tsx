import { View, Text, Pressable } from "react-native";
import React from "react";

import { navigate } from "@/navigation/utility";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Reducer";
import _ from "lodash";
import { useAtomValue } from "jotai";
import { useComonContacts } from "@/hooks/useComonContacts";

import { VectorIconCompat } from "@/Components/icons";

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
      <VectorIconCompat name="add" size={25} />
    </Pressable>
  );
}
