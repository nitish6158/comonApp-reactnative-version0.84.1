import { AllChatRooms, FolderAndTabsAtom } from "@Atoms/allRoomsAtom";
import { FlatList, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import React, { memo, useEffect, useMemo } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import Colors from "@/Constants/Colors";
// import RealmContext from "../../../../../schemas";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/redux/Store";
import { capitalize } from "lodash";
import { useLanguageContext } from "@/hooks";


function TopTabs() {
  const [currentTab, setCurrentTab] = useAtom(FolderAndTabsAtom);
  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageContext();

  const [allRooms] = useAtom(AllChatRooms);

  const FoldersData = useMemo(() => {
    if (MyProfile?.folders == 0) {
      return [];
    }
    let removedArchive = allRooms.filter((v) => {
      if (v.archivedBy.length == 0) {
        return true;
      } else if (v.archivedBy.find((b) => b.user_id === MyProfile?._id)) {
        return false;
      } else {
        return false;
      }
    });
    const roomsWithCount = removedArchive.map((item) => {
      return { _id: item?._id, count: item?.unread ?? 0 };
    });

    const AllRoomsCount = roomsWithCount.reduce((total, item) => {
      const count = item.count;
      return total + count;
    }, 0);

    const updatedFolders = MyProfile?.folders.map((folder) => {
      const notificationCount = folder.roomId?.reduce((total, roomId) => {
        const isExist = roomsWithCount.find((wc) => wc._id == roomId);
        if (isExist) {
          return total + isExist.count;
        } else {
          return total;
        }
      }, 0);

      return { name: folder.name, notificationCount: notificationCount || 0 };
    });

    return [{ name: t("all-chats"), notificationCount: AllRoomsCount }, ...(updatedFolders ?? [])];
  }, [MyProfile?.folders, allRooms, currentLanguage]);

  return (
    <View>
      <FlatList
        contentContainerStyle={Styles.Container}
        data={FoldersData}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          return (
            <TouchableWithoutFeedback
              onPress={() => {
                setCurrentTab(index);
              }}
            >
              <View
                style={{
                  backgroundColor: index == currentTab ? "#F3F9FC" : "white",
                  borderBottomWidth: 3,
                  borderColor: index == currentTab ? Colors.light.PrimaryColor : "#F3F9FC",
                  paddingHorizontal: 20,
                  paddingBottom: 8,
                  borderRadius: 8,
                }}
              >
                <View style={Styles.tabsTextCon}>
                  <Text style={{ textAlign: "center", fontWeight: "400", fontSize: 15 }}>{capitalize(item?.name)}</Text>
                  <View style={Styles.NotifyCon}>
                    {item?.notificationCount ? (
                      <View style={Styles.UnreadMessageIcon}>
                        <Text style={{ fontSize: 9, color: Colors.light.White }}>{item?.notificationCount}</Text>
                      </View>
                    ) : (
                      <></>
                    )}
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          );
        }}
      />
    </View>
  );
}

const Styles = StyleSheet.create({
  Container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  NotifyCon: { flexDirection: "row", justifyContent: "flex-end", marginLeft: 10 },

  Specifictab: {
    height: 45,
    minWidth: 100,
    padding: 5,
  },
  UnreadMessageIcon: {
    alignItems: "center",
    backgroundColor: Colors.light.PrimaryColor,
    borderRadius: 30,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  tabsTextCon: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
});

//make this component available to the app
export default memo(TopTabs);
