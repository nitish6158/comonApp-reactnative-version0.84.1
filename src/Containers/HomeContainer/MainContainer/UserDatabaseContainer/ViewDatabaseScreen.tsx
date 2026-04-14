import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ViewDatabaseScreenProps } from "@/navigation/screenPropsTypes";
import { Button, FloatingButton } from "react-native-ui-lib";
import HeaderWithSearch from "@/Components/header/HeaderWithSearch";
import { useTranslation } from "react-i18next";
import { Colors } from "@/Constants";
import AntDesign from "react-native-vector-icons/AntDesign";
import { windowHeight } from "@/utils/ResponsiveView";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import dayjs from "dayjs";
import { Menu, MenuOption, MenuOptions, MenuTrigger, renderers } from "react-native-popup-menu";
import Feather from "react-native-vector-icons/Feather";
import {
  useDeleteRecordMutation,
  useDeleteUserFolderMutation,
  useGetMyFoldersQuery,
} from "@/graphql/generated/database.generated";
import { useFocusEffect } from "@react-navigation/core";
import ToastMessage from "@/utils/ToastMesage";
import HeaderWithAction from "@Components/header/HeaderWithAction";
import _ from 'lodash'

let history = [] as Array<{ title: string; parentId: string | null }>;

export default function ViewDatabaseScreen({ navigation, route }: ViewDatabaseScreenProps) {
  const [onSearch, setOnSearch] = useState<string>("");
  const { t } = useTranslation();
  const getFolderList = useGetMyFoldersQuery({
    variables: { input: { _id: route.params.parentId } },
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });
  const [deleteFolderRequest] = useDeleteUserFolderMutation();
  const [deleteRecordRequest] = useDeleteRecordMutation();

  useFocusEffect(
    useCallback(() => {
      getFolderList.refetch();
    }, [])
  );

  useEffect(() => {
    console.log(route.params.title)
    
    history.push({
      title: route.params.title,
      parentId: route.params.parentId,
    });
    history = _.uniqBy(history,(a)=> a.parentId)
  }, []);

  function EmptyComponent() {
    if (getFolderList.loading) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", height: 500 }}>
          <ActivityIndicator />
        </View>
      );
    }

    if (
      getFolderList.data?.getMyFolders.subFolders?.length == 0 &&
      getFolderList.data?.getMyFolders.records.length == 0
    ) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", height: 500 }}>
          <Text>{t("userDatabase.no-record-found")}</Text>
        </View>
      );
    } else {
      return <></>;
    }
  }

  function FooterComponent() {
    if (getFolderList.data?.getMyFolders.records) {
      return (
        <View>
          {getFolderList.data?.getMyFolders.records?.map((item, index) => {
            return (
              <Pressable
                key={index}
                style={styles.categoryContainer}
                onPress={() => {
                  navigation.navigate("ViewRecordScreen", { recordId: item._id });
                }}
              >
                <View style={styles.categoryDetails}>
                  <FontAwesome name="file-text-o" size={32} color={Colors.light.PrimaryColor} />
                  <View style={{ marginLeft: 20 }}>
                    <Text style={{ fontSize: 16 }}>{item.title}</Text>
                    <Text style={{ fontSize: 12, color: "gray", marginTop: 3 }}>
                      {t("userDatabase.updated-at")} {dayjs(item.updatedAt).format("MMM DD.YYYY HH:mm")}
                    </Text>
                  </View>
                </View>
                <Menu key={index} renderer={renderers.Popover}>
                  <MenuTrigger>
                    <View style={{ marginLeft: 10 }}>
                      <Feather name="more-vertical" size={18} color={"black"} />
                    </View>
                  </MenuTrigger>
                  <MenuOptions>
                    <MenuOption
                      onSelect={() => {
                        navigation.navigate("CreateRecordScreen", {
                          parentId: getFolderList.data?.getMyFolders.parent,
                          recordId: item._id,
                          mode: "update",
                        });
                      }}
                     
                    >
                       <View style={{paddingHorizontal:10,marginBottom:5,marginTop:5}}>
                          <Text style={{fontSize:16}}>{t("reminders.change")}</Text>
                        </View>
                    </MenuOption>

                    <MenuOption
                      onSelect={() => {
                        console.log(item._id);
                        deleteRecordRequest({
                          variables: {
                            input: {
                              _id: item._id,
                            },
                          },
                        })
                          .then((res) => {
                            if (res.errors) {
                              console.log(res.errors);
                            }
                            if (res.data?.deleteRecord) {
                              ToastMessage(t("userDatabase.record-deleted"));
                              getFolderList.refetch({ input: { _id: route.params.parentId } });
                            }
                          })
                          .catch((res) => {
                            console.log(res);
                          });
                      }}
                      
                    >
                      <View style={{paddingHorizontal:10,marginBottom:5}}>
                          <Text style={{fontSize:16,color:'red'}}>{t("reminders.delete")}</Text>
                        </View>
                    </MenuOption>
                  </MenuOptions>
                </Menu>
              </Pressable>
            );
          })}
        </View>
      );
    } else {
      return <></>;
    }
  }

  return (
    <View style={styles.main}>
      <View>
        <HeaderWithAction
          onBackPress={() => {
            if (getFolderList.loading) {
              return;
            }
            console.log(history.length)
            if (history.length == 1) {
              navigation.goBack();
            } else {
              let lastItem = history.slice(0, -1);
              history = lastItem;
              let currentValue = lastItem[lastItem.length - 1];
              if (currentValue) {
                // console.log(currentValue);
                navigation.setParams(currentValue);
              }
            }
          }}
          isActionVisible={false}
          screenName={route.params.title}
          ActionComponent={() => <></>}
        />
        <View style={{ marginTop: 10 }}>
          <FlatList
            showsVerticalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            data={getFolderList.data?.getMyFolders.subFolders ?? []}
            renderItem={({ item, index }) => {
              return (
                <Pressable
                  style={styles.categoryContainer}
                  onPress={() => {
                    history.push({
                      title: item.name,
                      parentId: item._id,
                    });
                    history = _.uniqBy(history,(a)=> a.parentId)
                    navigation.setParams({
                      title: item.name,
                      parentId: item._id,
                    });
                  }}
                >
                  <View style={styles.categoryDetails}>
                    <FontAwesome name="folder" size={32} color={Colors.light.PrimaryColor} />
                    <View style={{ marginLeft: 20 }}>
                      <Text style={{ fontSize: 16 }}>{item.name}</Text>
                      <Text style={{ fontSize: 12, color: "gray", marginTop: 3 }}>
                        {t("userDatabase.updated-at")} {dayjs(item.updatedAt).format("MMM DD.YYYY HH:mm")}
                      </Text>
                    </View>
                  </View>
                  <Menu key={index} renderer={renderers.Popover}>
                    <MenuTrigger>
                      <View style={{ marginLeft: 10 }}>
                        <Feather name="more-vertical" size={18} color={"black"} />
                      </View>
                    </MenuTrigger>
                    <MenuOptions>
                      <MenuOption
                        onSelect={() => {
                          navigation.navigate("CreateCategoryScreen", {
                            parentId: getFolderList.data?.getMyFolders.parent,
                            categoryId: item._id,
                            mode: "update",
                            text: item.name,
                          });
                        }}
                      >
                        <View style={{paddingHorizontal:10,marginBottom:5,marginTop:5}}>
                          <Text style={{fontSize:16}}>{t("reminders.change")}</Text>
                        </View>
                      </MenuOption>

                      <MenuOption
                        onSelect={() => {
                          deleteFolderRequest({
                            variables: {
                              input: {
                                _id: item._id,
                              },
                            },
                          }).then((res) => {
                            if (res.data?.deleteUserFolder) {
                              getFolderList.refetch({ input: { _id: route.params.parentId } });
                            }
                          });
                        }}
                      >
                        <View style={{paddingHorizontal:10,marginBottom:5}}>
                          <Text style={{fontSize:16,color:'red'}}>{t("reminders.delete")}</Text>
                        </View>
                      </MenuOption>
                    </MenuOptions>
                  </Menu>
                </Pressable>
              );
            }}
            style={{ height: windowHeight - 230 }}
            ListEmptyComponent={EmptyComponent}
            ListFooterComponent={FooterComponent}
          />
        </View>
      </View>
      {!getFolderList.loading && (
        <View style={styles.floatingButton}>
          <Button
            onPress={onNewCategoryPressed}
            label={`${t("userDatabase.new-category")}`}
            size={Button.sizes.large}
            backgroundColor={Colors.light.PrimaryColor}
            style={{ flex: 1 }}
            borderRadius={10}
          />
      

          {history.length > 1 &&<Button
            onPress={onNewRecordPressed}
            label={`${t("userDatabase.new-record")}`}
            size={Button.sizes.large}
            backgroundColor={Colors.light.PrimaryColor}
            style={{ flex: 1,marginLeft:20 }}
            borderRadius={10}
          />}
        </View>
      )}
    </View>
  );

  function onNewCategoryPressed() {
    if (getFolderList.data?.getMyFolders) {
      navigation.navigate("CreateCategoryScreen", { mode: "create", parentId: getFolderList.data?.getMyFolders._id });
    }
  }

  function onNewRecordPressed() {
    navigation.navigate("CreateRecordScreen", { mode: "create", parentId: getFolderList.data?.getMyFolders._id });
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
    height: windowHeight,
    justifyContent: "space-between",
  },
  floatingButton: {
    marginHorizontal: 40,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryContainer: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
