import { View, Text, Platform, Pressable } from "react-native";
import React, { useMemo, useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import { useTranslation } from "react-i18next";
import { FlatList } from "react-native";
import getAlphabatic from "@Util/alphabeticOrder";
import { participants } from "../../../ChatContainer/ChatsScreen";
import { RoomParticipantData } from "@/redux/Models/ChatModel";
import {
  Participant,
  ParticipantAcceptStatus,
  ParticipantInput,
  ReminderParticipantRole,
} from "@/graphql/generated/types";
import FastImage from "@d11/react-native-fast-image";
import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import { reminderStyle as styles } from "../reminder.styles";
import { filterInObject } from "../../../ProfileContainer/contacts/FilterContact";
import { TextField } from "react-native-ui-lib";

type props = {
  onBackPress: () => void;
  participants: RoomParticipantData[];
  selectedParticipants: ParticipantInput[];
  onChange: (participants: ParticipantInput[]) => void;
};
export default function ParticipantSelection({ onBackPress, participants, selectedParticipants, onChange }: props) {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState<string>("");

  let List = useMemo(() => {
    return getAlphabatic(filterInObject({ searchText, data: participants }));
  }, [searchText, participants]);

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: Platform.OS == "ios" ? 45 : 10,
          marginRight: 10,
        }}
      >
        <View style={[styles.headerContainer]}>
          <AntDesign name="arrowleft" color="gray" size={22} onPress={onBackPress} />
          <View style={{ marginLeft: 20 }}>
            <Text style={{ fontSize: 16 }}>{t("titles.select-participants")}</Text>
            <Text style={{ fontSize: 12 }}>{`${selectedParticipants.length} ${t("others.Selected")}`}</Text>
          </View>
        </View>
        <Pressable onPress={onBackPress}>
          <AntDesign name="check" size={22} color={"black"} style={{}} />
        </Pressable>
      </View>

      <View>
        <TextField
          onChangeText={setSearchText}
          placeholder={t("reminders.search-participants")}
          style={{
            borderWidth: 1,
            height: 45,
            borderRadius: 10,
            paddingHorizontal: 15,
            marginHorizontal: 20,
            marginTop: 5,
          }}
        />
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          data={List}
          style={styles.peopleList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            let isSelected = selectedParticipants.find((sp) => sp._id === item.user_id);
            return (
              <Pressable
                key={index}
                style={styles.singlePeople}
                onPress={() => {
                  let find = selectedParticipants.find((v) => v._id === item.user_id);
                  if (find) {
                    onChange(selectedParticipants.filter((v) => v._id !== item.user_id));
                  } else {
                    onChange([
                      ...selectedParticipants,
                      {
                        ...item,
                        name: item.name,
                        _id: item.user_id,
                        role: ReminderParticipantRole["User"],
                        accepted: ParticipantAcceptStatus["Pending"],
                      },
                    ]);
                  }
                }}
              >
                <View>
                  <FastImage
                    source={{ uri: `${DefaultImageUrl}${item.profile_img ?? ImageUrl}` }}
                    style={{ height: 40, width: 40, borderRadius: 50 }}
                  />
                  {isSelected && (
                    <View
                      style={{
                        position: "absolute",
                        zIndex: 3,
                        bottom: -3,
                        right: -3,
                        backgroundColor: "white",
                        borderRadius: 40,
                        borderWidth: 2,
                        borderColor: "white",
                      }}
                    >
                      <AntDesign name="checkcircle" color="green" size={18} />
                    </View>
                  )}
                </View>
                <View style={{marginLeft:15}}>
                  <Text style={{fontSize:15}}>{item.name}</Text>
                  <Text style={{fontSize:13,color:"gray"}}>{item.phone}</Text>
                </View>
              </Pressable>
            );
          }}
          ListFooterComponent={<View style={{ height: 100 }} />}
          ListHeaderComponent={
            <View style={{ marginTop: 10, marginBottom: 20, justifyContent: "center", alignItems: "center" }}>
              <Text style={{ color: "gray" }}>{t("label.select-participant")}</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
