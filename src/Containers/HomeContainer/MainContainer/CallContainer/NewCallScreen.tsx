import { Alert, FlatList, Pressable, TextInput, View, StyleSheet } from "react-native";
import { Block, HStack, Typography } from "rnmuilib";
import CallContact, { replaceNumberPhone } from "./CallContact";
import { GroupUrl, ImageUrl } from "@Service/provider/endpoints";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { contactReducerType, serverContactType, updateContact } from "@Store/Reducer/ContactReducer";
import { useDispatch, useSelector } from "react-redux";
import { useGetMyContactsQuery, useGetMySmsInvitesQuery } from "@Service/generated/contact.generated";
import Icon from "@Images/Icon";
import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Constants/Colors";
import { EmptyList } from "@Components/EmptyList";
import { InternetAtom } from "@Atoms/InternetAtom";

import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import RealmContext from "../../../../schemas";
import { RootState } from "@Store/Store";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";

import { callAtom } from "@Atoms/callAtom";
import { checkCallPermissions } from "@Util/permission";
import { filterInObject } from "../ProfileContainer/contacts/FilterContact";
import styles from "../ProfileContainer/contacts/ContactsStyles";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { navigateBack } from "@/navigation/utility";
import getAlphabatic from "@Util/alphabeticOrder";

// const { useQuery } = RealmContext;

export type ContactType = {
  hasComon: boolean;
  hasInvite: boolean;
  // userData: Array<{ userId: string; number: string }>;
};

type selectionType = contactReducerType["comonContact"][0] & { isSelected: boolean };

function NewCallScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");
  const [isGroup, setIsGroup] = useState<boolean>(false);
  const [internet] = useAtom(InternetAtom);

  const [serverContact, setServerContact] = useState<selectionType[]>([]);
  const [selectedContact, setSelectedContact] = useState<serverContactType[]>([]);
  const getMyContacts = useGetMyContactsQuery();
  useEffect(() => {
    if (getMyContacts.data?.getMyContacts?.contacts?.length > 0) {
      dispatch(updateContact(getMyContacts.data?.getMyContacts?.contacts));
    }
  }, [getMyContacts.data?.getMyContacts?.contacts?.length]);

  const { MyProfile } = useSelector((state: RootState) => state.Chat);
  const { comonContact } = useSelector((state: any) => state.Contact);
  const [callRequest, setCallRequest] = useAtom(callAtom);

  // const allUserStatus = useQuery("user");

  useEffect(() => {
    setServerContact(
      comonContact
        .map((item: serverContactType) => {
          return { ...item, isSelected: false };
        })
        .filter((fl: serverContactType) => fl.userId?._id != MyProfile?._id)
    );
  }, [comonContact]);

  const filteredList = useMemo(() => {
    const filtered = filterInObject({
      searchText: search,
      data: serverContact,
      // searchKeys: ["firstName", "lastName", "phone"],
      // returnKeys: [],
    });
    // console.log(filtered);
    return getAlphabatic(filtered);
  }, [serverContact, search]);

  const callName = (participants) => {
    if (participants.length > 2) {
      return `${participants[0].firstName} & ${participants.length - 1} Others`;
    } else {
      return `${participants[0].firstName} & ${participants[1].firstName}`;
    }
  };

  return (
    <View style={style.main}>
      <View style={style.header}>
        <Pressable style={style.headerBack} onPress={navigateBack}>
          <AntDesign name="arrowleft" size={22} color={"black"} />
          <Text style={style.headerText}>{t("label.create-new-call")}</Text>
        </Pressable>
        <View>
          {selectedContact.length > 1 && (
            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 5 }}>
              <Pressable onPress={StartAudioCall}>
                <Icon.AudioCall fontSize={12} />
              </Pressable>
              <Pressable style={{ marginHorizontal: 10 }} onPress={StartVideoCall}>
                <Icon.VideoCall />
              </Pressable>
            </View>
          )}
        </View>
      </View>
      <View style={{ backgroundColor: "white" }}>
        <View style={style.searchContainer}>
          <AntDesign name="search1" size={22} color="gray" />
          <TextInput
            style={{ marginLeft: 10, flexGrow: 1, maxWidth: "90%" }}
            onChangeText={(text) => setSearch(text)}
            placeholder={t("share-contact.search-description")}
          />
        </View>
      </View>

      <FlatList
        data={filteredList}
        style={styles.container}
        keyExtractor={(contact) => contact.id}
        renderItem={({ item, index }) => {
          // const lastSeen = allUserStatus.find((e) => e?._id == item?.userId?._id)?.lastSeen;
          const lastSeen = new Date().getTime();
          return (
            <CallContact
              participant={item}
              changeMode={(val) => setIsGroup(val)}
              // onParticipantClicked={(participant: serverContactType) => {}}
              isGroup={isGroup}
              lastSeen={lastSeen}
              isMyself={item.userId?._id === MyProfile?._id}
              onGroupParticipantSelection={(isSelected: boolean) => {
                setServerContact(
                  serverContact.map((seritem) => {
                    if (item?.userId?._id == seritem?.userId?._id) {
                      if (isSelected) {
                        setSelectedContact([...selectedContact, seritem]);
                      } else {
                        setSelectedContact(selectedContact.filter((ci) => ci?.userId?._id != seritem?.userId?._id));
                      }
                      return { ...seritem, isSelected: isSelected };
                    } else {
                      return seritem;
                    }
                  })
                );
              }}
            />
          );
        }}
        ListHeaderComponent={NewCallHeader}
        ListEmptyComponent={<EmptyList title="errors.contacts.no-data" />}
        ListFooterComponent={<View style={{ height: 200 }} />}
      />
    </View>
  );

  function NewCallHeader() {
    if (isGroup) {
      return (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 20,
            marginHorizontal: 25,
            justifyContent: "space-between",
          }}
        >
          <Text>{t("titles.select-participants")}</Text>
          <Pressable
            onPress={() => {
              setIsGroup(false);
              setSelectedContact([]);
            }}
          >
            <Text style={{ color: Colors.light.PrimaryColor }}>{t("btn.cancel")}</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <Pressable
        onPress={() => {
          setIsGroup(true);
        }}
      >
        <HStack height={70} alignItems="center" paddingHorizontal={25}>
          <MaterialIcons name="groups" size={35} color={Colors.light.PrimaryColor} />
          <Block width={16} />
          <Typography fontSize={16}>{t("calls.newGroupCall")}</Typography>
        </HStack>
      </Pressable>
    );
  }

  async function StartAudioCall() {
    const res = await checkCallPermissions("audio");
    if (res === true) {
      const par = selectedContact.map((sc) => {
        return sc.userId?._id;
      });
      if (internet) {
        if (callRequest == null) {
          setCallRequest({
            callType: "audio",
            roomType: "contact_group",
            roomId: null,
            callBackground: GroupUrl,
            roomName: callName(selectedContact),
            participants: [...par, MyProfile?._id],
            isReceiver: false,
          });
          setIsGroup(false);
          setSelectedContact([]);
        } else {
          ToastMessage(t("others.Can not place new call while you are already in a call"));
        }
      } else {
        Alert.alert(
          "",
          t("others.Couldn't place call. Make sure your device have an internet connection and try again")
        );
      }
    }
  }

  async function StartVideoCall() {
    const res = await checkCallPermissions("video");
    if (res === true) {
      const par = selectedContact.map((sc) => {
        return sc.userId?._id;
      });
      if (internet) {
        if (callRequest == null) {
          setCallRequest({
            callType: "video",
            roomType: "contact_group",
            roomId: null,
            callBackground: GroupUrl,
            roomName: callName(selectedContact),
            participants: [...par, MyProfile?._id],
            isReceiver: false,
          });
          setIsGroup(false);
          setSelectedContact([]);
        } else {
          ToastMessage(`${t("toastmessage.incall-already-message")}`);
        }
      } else {
        Alert.alert(
          "",
          t("others.Couldn't place call. Make sure your device have an internet connection and try again")
        );
      }
    }
  }
}

export default NewCallScreen;

const style = StyleSheet.create({
  main: {
    backgroundColor: "white",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 5,
    borderRadius: 30,
    paddingHorizontal: 15,
    height: 45,
    backgroundColor: "white",
    borderColor: "gray",
    borderWidth: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerBack: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    color: "black",
    fontSize: 14,
    marginHorizontal: 10,
  },
});
