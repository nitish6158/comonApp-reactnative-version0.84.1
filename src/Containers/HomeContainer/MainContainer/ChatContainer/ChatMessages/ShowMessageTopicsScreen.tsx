import { singleRoom } from "@/Atoms";
import { ShowMessageTopicsScreenProps } from "@/navigation/screenPropsTypes";
import { useAtomValue } from "jotai";
import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";
import { useUpdateTopicMutation } from "@/graphql/generated/room.generated";
import ToastMessage from "@Util/ToastMesage";
import { useTranslation } from "react-i18next";

export default function ShowMessageTopicsScreen({ navigation, route }: ShowMessageTopicsScreenProps) {
  const display = useAtomValue(singleRoom);
  const [updateTopicRequest, updateTopicResponse] = useUpdateTopicMutation();
  const {t} = useTranslation()

  return (
    <View style={styles.main}>
      <Pressable style={styles.headerContainer} onPress={navigation.goBack}>
        <AntDesign name="arrowleft" size={25} color="black" />
        <Text style={styles.headingText}>{t("titles.saved-headings")}</Text>
      </Pressable>
      <View>
        <FlatList
          data={display?.currentUserUtility?.topic ?? []}
          renderItem={({ item, index }) => {
            return (
              <Pressable
                style={styles.singleTopic}
                key={index}
                onPress={() => {
                  navigation.navigate("ShowTopicMessagesScreen", {
                    topic: item,
                  });
                }}
              >
                <Text style={styles.singleTopicText}>{item}</Text>
                <Menu>
                  <MenuTrigger>
                    <MaterialCommunityIcons name="dots-vertical" color="black" size={22} />
                  </MenuTrigger>
                  <MenuOptions optionsContainerStyle={{ width: 100 }}>
                    <MenuOption onSelect={() => onTopicEdit(item)}>
                      <Text style={{fontSize:16}}>{t("btn.edit")}</Text>
                    </MenuOption>
                    <MenuOption onSelect={() => onTopicDelete(item)}>
                      <Text style={{ color: "red",fontSize:16 }}>{t("btn.delete")}</Text>
                    </MenuOption>
                  </MenuOptions>
                </Menu>
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );

  function onTopicDelete(topic: string) {
    let updated = display.currentUserUtility?.topic.filter((item) => item !== topic);
    updateTopicRequest({
      variables: {
        input: {
          roomId: display.roomId,
          topic: updated,
        },
      },
    }).then((res) => {
      if (res.data?.updateTopic) {
        ToastMessage(t("label.message-topic-deleted"));
      }
    });
  }

  function onTopicEdit(topic: string) {
    navigation.replace("AddMessageTopicsScreen", {
      mode: "update",
      text: topic,
    });
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headingText: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  singleTopic: {
    marginHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 13,
    marginBottom: 5,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  singleTopicText: {
    fontSize: 16,
    maxWidth: 300,
  },
});
