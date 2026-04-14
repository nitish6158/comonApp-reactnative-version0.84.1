import { Dimensions, FlatList, Pressable, ScrollView, Text, TextInput, View, StyleSheet } from "react-native";
import React, { useMemo, useState } from "react";
import { navigate, navigateBack } from "@Navigation/utility";
import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Constants/Colors";
import Ionicons from "react-native-vector-icons/Ionicons";
import { filterInObject } from "./FilterContact";
import fonts from "@/Constants/fonts";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import getAlphabatic from "@Util/alphabeticOrder";
import { SelectContactScreenProps } from "@/navigation/screenPropsTypes";
import { RootState } from "@/redux/Reducer";
import { ContactDetailsDto } from "@/graphql/generated/types";
import ToastMessage from "@Util/ToastMesage";

const { width, height } = Dimensions.get("window");
//
export default function SelectContactScreen({ route, navigation }: Readonly<SelectContactScreenProps>) {
  const { t } = useTranslation();
  const { currentRoomID } = route.params;
  const { contacts } = useSelector((state: RootState) => state.Contact);
  const [search, setSearch] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<ContactDetailsDto[]>([]);
  const [searchSelected, setSearchSelected] = useState<boolean>(false);

  const filteredList = useMemo(() => {
    const filtered: ContactDetailsDto[] = filterInObject({
      searchText: search,
      data: contacts.filter((v) => v.localId.slice(-2) == "_0"),
    });

    return getAlphabatic(filtered);
  }, [contacts, search]);

  return (
    <View style={styles.main}>
      <View style={styles.headerContainer}>
        <Ionicons name="arrow-back" color="gray" size={30} onPress={onBackPressed} />
        {searchSelected ? (
          <View style={{ flexGrow: 1, maxWidth: width - 80 }}>
            <TextInput
              autoFocus={true}
              style={{ marginLeft: 10, flexGrow: 1, maxWidth: "90%" }}
              onChangeText={(text) => setSearch(text)}
              placeholder={t("share-contact.search-description")}
            />
          </View>
        ) : (
          <View style={{ flexGrow: 1, maxWidth: width - 80, marginLeft: 10 }}>
            <Text style={{ fontSize: 16 }}>{t("contacts-to-send")}</Text>
            <Text style={{ fontSize: 12, marginTop: 3 }}>
              {selectedContact.length} {t("others.Selected")}
            </Text>
          </View>
        )}
        <Pressable onPress={enableContactSearch}>
          <AntDesign name="search1" color="black" size={24} />
        </Pressable>
      </View>
      <View style={{ }}>
        <FlatList
          
          data={filteredList}
          style={{ backgroundColor: "white", paddingTop: 10 }}
          keyExtractor={(contact, index) => index.toString()}
          renderItem={({ item, index }) => {
            return (
              <Pressable
                style={styles.singleContact}
                onPress={() => {
                  let find = selectedContact.find((v) => v.phone === item.phone);
                  if (find) {
                    setSelectedContact(selectedContact.filter((v) => v.phone !== item.phone));
                  } else {
                    setSelectedContact([...selectedContact,item])
                  }
                }}
              >
                <View>
                  <View style={styles.profileView}>
                    <Text style={styles.profileText}>
                      {`${item?.firstName[0] ?? ""}${item?.lastName[0] ?? ""}`.toUpperCase()}
                    </Text>
                  </View>
                  {selectedContact.find((it) => it.phone == item.phone) && (
                    <View style={styles.checkboxView}>
                      <AntDesign style={styles.checkbox} name="checkcircle" size={20} color={"green"} />
                    </View>
                  )}
                </View>
                <View style={{ marginLeft: 20 }}>
                  <Text style={{ fontSize: 16, fontFamily: fonts.Lato }}>{item?.firstName + " " + item?.lastName}</Text>
                  {/* <Text style={{ marginTop: 1, color: "gray", fontSize: 13 }}>{item?.phone}</Text> */}
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text>{t("errors.contacts.no-data")}</Text>
            </View>
          }
          ListHeaderComponent={
            <Text style={styles.label}>{t("label.select-contact")}</Text>
          }
          ListFooterComponent={<View style={{height:200}}/>}
        />
      </View>

      <Pressable style={styles.nextButtonView} onPress={onNextButtonPressed}>
        <AntDesign name="arrowright" color="white" size={22} />
      </Pressable>
    </View>
  );

  function enableContactSearch() {
    setSearchSelected(true);
  }

  function onBackPressed() {
    if (searchSelected) {
      setSearchSelected(false);
      setSearch("");
      return;
    }
    setSelectedContact([]);
    setSearchSelected(false);

    if (currentRoomID) {
      navigate("ChatMessageScreen", {
        RoomId: currentRoomID,
      });
    } else {
      navigateBack();
    }
  }

  function onNextButtonPressed() {
    if (selectedContact.length === 0) {
      ToastMessage(`${t("toastmessage.select-contact-to-share-into-chats")}`);
      return;
    }

    navigation.navigate("SendContactScreen", {
      contactList: selectedContact,
      RoomId: currentRoomID,
    });
  }
}

const styles = StyleSheet.create({
  main: {
    backgroundColor: "white",
    flex: 1,
  },
  headerContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 10,
    height: 55,
    borderBottomColor: "gray",
    borderBottomWidth: 0.2,
  },
  singleContact: {
    marginVertical: 6,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  profileView: {
    height: 45,
    width: 45,
    borderRadius: 40,
    backgroundColor: Colors.light.PrimaryColor,
    justifyContent: "center",
  },
  profileText: {
    textAlign: "center",
    color: "white",
    fontWeight: "500",
  },
  nextButtonView: {
    position: "absolute",
    zIndex: 3,
    right: 15,
    bottom: 15,
    backgroundColor: Colors.light.PrimaryColor,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
  },
  emptyContainer: {
    flexGrow: 1,
    height: height / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxView: {
    position: "absolute",
    zIndex: 3,
    bottom: -4,
    right: -4,
    backgroundColor: "white",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "white",
  },
  checkbox: {},
  cancelBox: {
    position: "absolute",
    zIndex: 5,
    bottom: 17,
    right: 1,
    backgroundColor: "gray",
    borderRadius: 30,
    height: 22,
    width: 22,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  label:{
    fontSize:12,
    color:'gray',
    marginBottom:20,
    marginTop:8,
    textAlign:'center'
  }
});
