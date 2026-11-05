import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  useAddMsgToTopicMutation,
  useDeleteTopicMutation,
  useGetTopicByIdLazyQuery,
} from "@/graphql/generated/topics.generated";
import { Chats, Topic } from "@/graphql/generated/types";
import { ViewTopicsScreenProps } from "@/navigation/screenPropsTypes";
import { EmptyList } from "@Components/EmptyList";
import { Loader } from "@/Components/Loader";

import { Colors, fonts } from "@/Constants";

import IonIcon from "react-native-vector-icons/Ionicons";
import { MenuProvider, Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";
import { flatMap, isEmpty } from "lodash";
import { useTranslation } from "react-i18next";
import ToastMessage from "@Util/ToastMesage";
import { useFocusEffect } from "@react-navigation/core";

import CustomButton from "@/Components/Button/CustomButton";
import { windowHeight, windowWidth } from "@Util/ResponsiveView";
import HeaderWithSearch from "@Components/header/HeaderWithSearch";
import AntDesign from "react-native-vector-icons/AntDesign";
import { HistoryStack, StackData } from "./subtopic.utils";
import SavedMessages from "./SavedMessages";
import Feather from "react-native-vector-icons/Feather";

export default function SubTopicScreen({ route, navigation }: ViewTopicsScreenProps) {
  const [getTopicById] = useGetTopicByIdLazyQuery({
    fetchPolicy: "no-cache",
  });
  const [deleterequest, deleteResponse] = useDeleteTopicMutation();
  const [addMessageRequest, addMessageResponse] = useAddMsgToTopicMutation();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [chats, setChats] = useState<Chats[]>([]);

  const [history, setHistory] = useState(new HistoryStack());
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState<StackData | null>(null);
  const [refresh, setRefresh] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    let data = history.getStack();
    if (history.getStack()?.length) {
      setCurrentData(data[0]);
    }
  }, [history.getStack()]);

  useEffect(() => {
    if (!isEmpty(route?.params)) {
      history.push(route?.params);
    }
  }, [route.params]);

  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      if (e.data.action.type == "GO_BACK") {
        if (history.getStack()?.length <= 1) {
        } else {
          setTopics([]);
          history.pop();
          setCurrentData(history.getStack());
          e.preventDefault();
        }
      }
    });

    return navigation.removeListener("beforeRemove", () => {});
  }, []);

  useFocusEffect(useCallback(getData, [currentData]));

  useEffect(() => {
    if (refresh) {
      getData();
    }
  }, [refresh]);

  const onRefresh = () => {
    setRefresh(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <HeaderWithSearch
        onBackPressed={navigation.goBack}
        onSearchTextChanged={onSearch}
        title={getTitle() ?? ""}
        placeholder={t("topics.searchTopic")}
      />
      {loading ? (
        <Loader />
      ) : (
        <>
          <FlatList
            data={filteredData}
            refreshing={refresh}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefresh}
            contentContainerStyle={{ flexGrow: 1 }}
            ListEmptyComponent={() => {
              return isEmpty(filteredData) && isEmpty(chats) ? (
                <View style={{}}>
                  <EmptyList title="errors.contacts.no-data" />
                </View>
              ) : null;
            }}
            ListFooterComponent={
              <View style={{ marginTop: 20 }}>
                {chats?.length ? (
                  <SavedMessages messages={chats} onMessageDelete={getData} topicId={currentData?.parentId ?? null} />
                ) : null}
              </View>
            }
            renderItem={({ item, index }) => {
              return (
                <Pressable
                  key={item._id}
                  style={styles.card}
                  onPress={() => {
                    navigation.navigate("SubTopicScreen", {});
                    setTopics([]);
                    history.push({
                      parentId: item._id,
                      title: item?.name,
                    });
                    setCurrentData(history.getStack());
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
          {isAddButtonVisible() ? (
            <CustomButton
              Title={t("topics.addHere")}
              Btnstyle={styles.btnStyle}
              TitleStyle={{ color: Colors.light.White }}
              onPressButton={addMessage}
            />
          ) : (
            <Pressable
              style={styles.buttonContainer}
              onPress={() => {
                navigation.navigate("CreateTopicsScreen", {
                  parentId: currentData?.parentId,
                  mode: "ADD",
                });
              }}
            >
              <AntDesign name="plus" size={22} color="white" />
            </Pressable>
          )}
        </>
      )}
    </View>
  );

  function isAddButtonVisible() {
    let data = history.getStack();
    if (data?.length) {
      if (data[data?.length - 1].chatData) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  function addMessage() {
    const data = history.getStack();
    const { chatId, roomId } = data[data?.length - 1]?.chatData;
    const payload = {
      chatId: chatId,
      roomId: roomId,
      topicId: currentData.parentId,
    };
    console.log("payload", payload);
    setLoading(true);
    addMessageRequest({
      variables: {
        input: payload,
      },
    })
      .then((res) => {
        console.log("Error", res.errors);
        console.log("Topic", res.data?.addMsgToTopic.success);
        if (res.data?.addMsgToTopic.success) {
          ToastMessage(res?.data?.addMsgToTopic?.message);
          getData();
          navigation.setParams({});
          navigation.pop(2);
        } else {
          setLoading(false);
          ToastMessage(res.data?.addMsgToTopic?.message);
        }
      })
      .catch((err) => {
        console.error("Error in adding topic", err);
        setLoading(false);
      });
  }

  function onSearch(text: string) {
    if (text != "") {
      const newData = topics?.filter((item) => {
        const itemData = item?.name?.toUpperCase()?.includes(text?.toUpperCase())
          ? item?.name?.toUpperCase()
          : "".toUpperCase();
        const textData = text?.toUpperCase();
        return itemData?.indexOf(textData) > -1;
      });
      setFilteredData(newData);
      // setSearchText(text);
    } else {
      setFilteredData(topics);
      // setSearchText(text);
    }
  }

  function onTopicDelete(id: string) {
    deleterequest({
      variables: {
        input: {
          _id: id,
        },
      },
    }).then((res) => {
      if (res.data?.deleteTopic.success) {
        ToastMessage(res.data?.deleteTopic?.message);
        getData();
      } else {
        ToastMessage(res.data?.deleteTopic?.message);
      }
    });
  }

  function onTopicEdit(item) {
    navigation.navigate("CreateTopicsScreen", {
      parentId: item?._id,
      name: item?.name,
      mode: "UPDATE",
    });
  }

  function getTitle() {
    const data = history.getStack();
    if (data.length) {
      if (data?.length >= 2) {
        return `${data[1]?.title} > ${data[0]?.title}`;
      } else {
        return `${data[0]?.title}`;
      }
    }
  }

  function getData() {
    setLoading(true);
    getTopicById({
      variables: {
        input: {
          _id: currentData?.parentId,
        },
      },
    })
      .then((res) => {
        if (res.data?.getTopicById) {
          setTopics(res.data?.getTopicById.subTopics);
          setFilteredData(res.data?.getTopicById.subTopics);
          setChats(res?.data?.getTopicById?.chats);
          setLoading(false);
          setRefresh(false);
        }
      })
      .catch((err) => {
        setLoading(false);
        setRefresh(false);
      });
  }
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
    paddingTop: 10,
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
  messageCard: {
    borderWidth: 1,
    backgroundColor: Colors.light.backgroundMessage,
    marginHorizontal: 10,
    marginTop: 20,
  },
  rowDirection: {
    flexDirection: "row",
    alignItems: "center",
  },
  centeredView: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    flex: 1,
    justifyContent: "center",
    marginTop: 0,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
  modalView: {
    margin: 20,
    marginTop: "-40%",
    backgroundColor: "white",
    borderRadius: 3,
    paddingVertical: 10,

    // justifyContent:'center',
    // alignItem:'center',
    width: "55%",
    maxHeight: "70%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 3,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttoncon: { flexDirection: "row", paddingVertical: 10, width: "90%" },
  chatBackground: { padding: 10, backgroundColor: "rgba(243, 249, 252, 1)", maxWidth: "75%", borderRadius: 5 },
  pdfView: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 10,
    paddingHorizontal: 10,
    maxWidth: "100%",
    paddingVertical: 5,
    backgroundColor: Colors.light.LightBlue,
    borderColor: "rgba(51,51,51,.5)",
    borderWidth: 0.3,
  },
  msgStyle: { fontSize: 14, lineHeight: 18, color: "black", marginTop: 5 },
  btnStyle: {
    width: 350,
    alignSelf: "center",
    height: 45,
    marginBottom: 10,
    borderRadius: 20,
  },
  newbtnStyle: {
    borderWidth: 1.5,
    borderColor: Colors.light.PrimaryColor,
    backgroundColor: Colors.light.White,
    width: windowWidth - 30,
    alignSelf: "center",
    height: 45,
    marginTop: 15,
  },
});
