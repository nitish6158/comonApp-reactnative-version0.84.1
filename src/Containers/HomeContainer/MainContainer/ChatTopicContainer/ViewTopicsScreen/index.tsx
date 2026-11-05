import { View, Text, FlatList, Pressable, StyleSheet, TextInput } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useDeleteTopicMutation, useGetMyTopicsLazyQuery } from "@/graphql/generated/topics.generated";
import { Topic } from "@/graphql/generated/types";
import { ViewTopicsScreenProps } from "@/navigation/screenPropsTypes";
import { EmptyList } from "@Components/EmptyList";
import { Loader } from "@Components/Loader";
import { Colors, fonts } from "@/Constants";

import { useFocusEffect } from "@react-navigation/core";
import IonIcon from "react-native-vector-icons/Ionicons";
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";
import ToastMessage from "@Util/ToastMesage";
import { useTranslation } from "react-i18next";

import { isEmpty } from "lodash";
import AntDesign from "react-native-vector-icons/AntDesign";
import HeaderWithSearch from "@Components/header/HeaderWithSearch";
import Feather from "react-native-vector-icons/Feather";

export default function ViewTopicsScreen({ route, navigation }: ViewTopicsScreenProps) {
  const { chatData = null } = route?.params || {};
  const [getMyTopics] = useGetMyTopicsLazyQuery();
  const [deleterequest, deleteResponse] = useDeleteTopicMutation();
  const [topics, setTopics] = useState<Topic[]>([]);

  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      getData();
    }, [])
  );

  const getData = () => {
    getMyTopics()
      .then((res) => {
        if (res.error) {
          ToastMessage("There is some error fetching topics.");
          setLoading(false);
          setRefresh(false);
        }
        if (res.data?.getMyTopics) {
          setTopics(res.data?.getMyTopics);
          setFilteredData(res.data?.getMyTopics);
          setLoading(false);
          setRefresh(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        setRefresh(false);
      });
  };

  useEffect(() => {
    if (refresh) {
      getData();
    }
  }, [refresh]);

  const onRefresh = () => {
    setRefresh(true);
  };

  function onTopicEdit(item) {
    navigation.navigate("CreateTopicsScreen", {
      parentId: item?._id,
      name: item?.name,
      mode: "UPDATE",
    });
  }

  function onTopicDelete(id: string) {
    setLoading(true);
    deleterequest({
      variables: {
        input: {
          _id: id,
        },
      },
    }).then((res) => {
      if (res.data?.deleteTopic.success) {
        getData();
        ToastMessage(res.data?.deleteTopic.message);
      } else {
        setLoading(false);
        ToastMessage(res.data?.deleteTopic.message);
      }
    });
  }

  function onSearch(text: string) {
    if (text != "") {
      const newData = topics?.filter((item) => {
        const itemData = item?.name?.toUpperCase()?.includes(text?.toUpperCase())
          ? item?.name?.toUpperCase()
          : ""?.toUpperCase();
        const textData = text?.toUpperCase();
        return itemData?.indexOf(textData) > -1;
      });
      setFilteredData(newData);
    } else {
      setFilteredData(topics);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <HeaderWithSearch
        onBackPressed={navigation.goBack}
        onSearchTextChanged={onSearch}
        title={t("topics.savedTopics")}
        placeholder={t("topics.searchTopic")}
      />

      {loading ? (
        <Loader />
      ) : (
        <>
          <FlatList
            data={filteredData}
            refreshing={refresh}
            onRefresh={onRefresh}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            ListEmptyComponent={() => {
              return isEmpty(filteredData) ? (
                <View style={{}}>
                  <EmptyList title="errors.contacts.no-data" />
                </View>
              ) : null;
            }}
            ListFooterComponent={() => {
              return <View style={{ height: 100 }} />;
            }}
            renderItem={({ item, index }) => {
              return (
                <Pressable
                  key={item._id}
                  style={styles.card}
                  onPress={() => {
                    navigation.navigate("SubTopicScreen", {
                      title: item?.name,
                      parentId: item._id,
                      chatData: chatData,
                    });
                  }}
                >
                  <View style={styles.topicInfoContainer}>
                    <Feather name="target" size={32} color={Colors.light.PrimaryColor} />
                    <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                      {item.name}
                    </Text>
                  </View>
                  <Menu>
                    <MenuTrigger>
                      <IonIcon name="ellipsis-vertical" size={20} />
                    </MenuTrigger>
                    <MenuOptions optionsContainerStyle={{ width: 100 }}>
                      <MenuOption onSelect={() => onTopicEdit(item)}>
                        <Text style={{ fontSize: 16 }}>{t("btn.edit")}</Text>
                      </MenuOption>
                      <MenuOption onSelect={() => onTopicDelete(item?._id)}>
                        <Text style={{ color: "red", fontSize: 16 }}>{t("btn.delete")}</Text>
                      </MenuOption>
                    </MenuOptions>
                  </Menu>
                </Pressable>
              );
            }}
          />

          <Pressable
            style={styles.buttonContainer}
            onPress={() => {
              navigation.navigate("CreateTopicsScreen", {
                parentId: null,
                mode: "ADD",
                chatData: chatData,
              });
            }}
          >
            <AntDesign name="plus" size={22} color="white" />
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    right: 15,
    elevation: 2,
    height: 50,
    width: 50,
    shadowColor: Colors.light.PrimaryColor,
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    // borderWidth: 1,
    marginHorizontal: 20,
    flexDirection: "row",
    paddingBottom: 10,
    paddingTop:10,
    alignItems: "center",
    justifyContent: "space-between",
    // marginHorizontal: 10,
    // borderRadius: 5,
    // borderColor: Colors.light.formItemBorder,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.formItemBorder,
  },
  topicInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
    marginRight: 12,
  },
  name: {
    marginLeft: 20,
    fontFamily: fonts.Lato,
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    height: 48,
    marginVertical: 10,
    borderRadius: 7,
    borderWidth: 1,
    marginHorizontal: 10,
    borderColor: Colors.light.PrimaryColor,
  },
  searchInput: { width: "94%", fontSize: 14, fontFamily: fonts.Lato, color: Colors.light.black },
  clearIcon: { width: "6%", textAlign: "center", textAlignVertical: "center" },
});
