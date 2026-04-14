import { Dimensions, Pressable, StatusBar, StyleSheet, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import React, { useEffect, useState } from "react";
import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Constants/Colors";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Text from "@/Components/Text";
import { navigate } from "@Navigation/utility";
import { useTranslation } from "react-i18next";
import HeaderWithSearch from "@/Components/header/HeaderWithSearch";
import { useAppSelector } from "@Store/Store";
import { FolderDataList } from "@/redux/Models/ChatModel";
import FolderComponent from "./FolderComponent";
import { socketConnect } from "@/utils/socket/SocketConnection";

const { height, width } = Dimensions.get("window");
export default function FolderScreen({ navigation }: any) {
  const FolderList = useAppSelector((state) => state.Chat.MyProfile.folders);

  const [data, setData] = useState<FolderDataList>([]);

  useEffect(() => {
    formatFolder();
  }, [FolderList]);

  const { t } = useTranslation();

  const NavigateToCreateFolder = () => {
    navigate("CreateFolderScreen", { FolderNameParams: "", isEdit: false });
  };

  function formatFolder() {
    let drapableList = FolderList.map((v, vi) => {
      return { key: vi, ...v };
    });
    setData(drapableList);
  }

  function onSearch(text: string) {
    if (text == "") {
      formatFolder();
    } else {
      setData(data.filter((v) => v.name.toLowerCase().includes(text.toLowerCase())));
    }
  }

  const handleDeleteFolderLocal = (folderId: string) => {
    setData((prev) => prev.filter((folder) => folder._id !== folderId));
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: "white", paddingBottom: 30 }}>
      <StatusBar barStyle="dark-content" />

      <HeaderWithSearch
        onBackPressed={navigation.goBack}
        onSearchTextChanged={onSearch}
        title={t("titles.FolderManagement")}
        placeholder={`${t("form.label.search")} ${t("titles.Folders")}`}
      />

      <DraggableFlatList
        showsVerticalScrollIndicator={false}
        style={{ flexGrow: 1, marginBottom: 20, paddingTop: 12, maxHeight: height - 160 }}
        data={data}
        onDragEnd={({ data }) => {
          setData(data);
          socketConnect.emit("reArrangeFolder", { folders: data });
        }}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, drag, isActive }) => (
          <FolderComponent
            item={item}
            drag={drag}
            isActive={isActive}
            onDeleteSuccess={handleDeleteFolderLocal}
          />
        )}
        ListEmptyComponent={
          <View style={{ flex: 1, height: 600, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ marginBottom: 20 }}>{t("folder-management.no-folder-added")}</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      <Pressable style={styles.buttonContainer} onPress={NavigateToCreateFolder}>
        <AntDesign name="plus" size={22} color="white" />
      </Pressable>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rowItem: {
    height: 100,
    width: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
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
});

