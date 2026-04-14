import {
  Dimensions,
  Share as NativeShare,
  Platform,
  SectionList,
  View,
  Text as NativeText,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import {
  useAddMyContactMutation,
  useCreateSmsInviteMutation,
  useDeleteMyContactMutation,
  useGetMyComonContactLazyQuery,
  useGetUserPhoneBookLazyQuery,
  useUpdateContactProfileMutation,
} from "@Service/generated/contact.generated";
import Contacts from "react-native-contacts";

import CommonHeader from "@Components/header/CommonHeader";
import CommonLoader from "@Components/CommonLoader";
import Contact from "./Contact";
import { EmptyList } from "@Components/EmptyList";

import Lottie from "lottie-react-native";
// import RealmContext from "../../../../../schemas";
import SearchInput from "@Components/input/SearchInput";

import { String } from "lodash";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { addContact, formattedPhoneBook } from "@Hooks/useSyncContactHook";
import { alphabetList } from "@/Constants/chatectors";
import branch from "react-native-branch";
import { currentUserIdAtom } from "@/Atoms";
import { filterInObject } from "./FilterContact";
import { getDeviceId } from "@Util/comon.functions.utils";
import { navigate } from "@Navigation/utility";
import { produce } from "immer";
import {
  serverContactType,
  updateContact,
  addContact as AddContact,
  removeContact,
  addServerContact,
  updateContactProfile,
} from "@Store/Reducer/ContactReducer";
import styles from "./ContactsStyles";
import { useAtomValue } from "jotai";
import { useCreateRoomMutation, UserContactInput } from "@Service/generated/room.generated";
import { useDispatch, useSelector } from "react-redux";
import { usePhoneContext } from "@Hooks/usePhoneContext";
import { useTranslation } from "react-i18next";
import { InviteContactOnApp } from "./InviteFriends";
import { Colors, fonts } from "@/Constants";
import { StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import ContactTabView, { tabType } from "./ContactTabView";
import AntDesign from "react-native-vector-icons/AntDesign";
import { ContactDetailsDto } from "@/graphql/generated/version.generated";
import { PhoneNumberUtil } from "google-libphonenumber";
import _ from "lodash";
import { RootState } from "@/redux/Reducer";
import { countriesWithLeadingZero } from "./countrycodes";
import {
  useCreateContactReminderMutation,
  useGetContactRemindersLazyQuery,
  useUpdateContactReminderMutation,
} from "@/graphql/generated/user.generated";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";
import { useAppSelector } from "@/redux/Store";
import useActiveContacts from "@/hooks/useActiveContacts";
import { TextField } from "react-native-ui-lib";
import ReminderForm from "./ReminderForm";
import { useRemoveContactReminderMutation } from "../../../../../graphql/generated/user.generated";
import dayjs from "dayjs";
import { useFocusEffect, useNavigation } from '@react-navigation/core';

// const { useQuery } = RealmContext;

export type ContactType = {
  hasComon: boolean;
  hasInvite: boolean;
  profile_img: String;
  userData: Array<{ _id: string }>;
};

const { width, height } = Dimensions.get("window");

function ContactsScreen() {
  const navigation = useNavigation()
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loader, setLoader] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  const MyProfile = useAppSelector((state) => state.Chat.MyProfile);
  const { isLoading: activeContactsLoading } = useActiveContacts();
  const { contacts, comonContact } = useAppSelector((state) => state.Contact);

  const [reminderData, setReminderData] = useState<UserContactInput | null>(null);
  const [linkConfig, setLinkConfig] = useState({
    url: "",
    phone: "",
    name: "",
    region: "",
  });
  const [getServerPhonebook, getServerPhonebookResponse] = useGetUserPhoneBookLazyQuery();

  const [loadingOpenRoom, setloadingOpenRoom] = useState(false);
  const [createRoomRequest] = useCreateRoomMutation();
  const [createContactReminder] = useCreateContactReminderMutation();
  const [getContactReminder] = useGetContactRemindersLazyQuery();
  const [updateContactReminder] = useUpdateContactReminderMutation();
  const [removeContactReminder] = useRemoveContactReminderMutation();
  const [getComonContact] = useGetMyComonContactLazyQuery()

  const [addMyContactRequest, addResponse] = useAddMyContactMutation();
  const [deleteMyContactRequest, deleteResponse] = useDeleteMyContactMutation();
  // const [updateContactRequest, updateResponse] = useUpdateContactMutation();
  const [updateContactProfileRequest, updateContactProfileResponse] = useUpdateContactProfileMutation();

  useFocusEffect(
    React.useCallback(() => {
      ToastMessage(`${t("onlineStatus.contact-refresh")}
`, true);
    }, [])
  );

  const [createSmsInvite] = useCreateSmsInviteMutation();
  const [currentTab, setCurrentTab] = useState<tabType>("All");
  const { code } = usePhoneContext();
  const countryCode = useMemo(() => {
    const phoneUtils = PhoneNumberUtil.getInstance();
    const internationalDialingCode = phoneUtils.getCountryCodeForRegion(code);
    return `+${internationalDialingCode}`;
  }, [code]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          height: height,
          width: width,
          backgroundColor: "white",
        }}
      >
        <Lottie
          source={require("../../../../../../assets/lottie/loader.json")}
          style={{ height: 100, width: width, marginVertical: 20 }}
          autoPlay
          loop
        />
      </View>
    );
  }



  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <CommonHeader
        title="titles.contacts"
        refreshRequired={true}
        refreshing={refreshing}
        onPressRefresh={onPressRefreshing}
        subTitle={`${contacts.length} ${t("label.contacts")}`}
        loaderColor={
          deleteResponse.loading
            ? "red"
            : addResponse.loading
              ? "green"
              : updateContactProfileResponse.loading || getServerPhonebookResponse.loading
                ? "#FFC94A"
                : Colors.light.PrimaryColor
        }
      />
      <View style={{ backgroundColor: "white" }}>
        <View>
          <SearchInput value={search} onChangeText={setSearch} />
          <NativeText style={style.suggestionStyle}>{t("invitationSuggestion")}</NativeText>
          <ContactTabView
            currectTab={currentTab}
            tabList={[t("calls.all"), "Comon", t("label.other")]}
            onTabPressed={setCurrentTab}
          />
          <View style={{ height: Platform.OS === "ios" ? height - 200 : height, backgroundColor: "white" }}>
            {loading || activeContactsLoading ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  height: height,
                  width: width,
                  backgroundColor: "white",
                }}
              >
                <Lottie
                  source={require("../../../../../../assets/lottie/loader.json")}
                  style={{ height: 100, width: width, marginVertical: 20 }}
                  autoPlay
                  loop
                />
              </View>
            ) : (
              <SectionList
                sections={generateContactSections(contacts, search)}
                extraData={refreshing}
                renderSectionHeader={() => null}
                stickySectionHeadersEnabled={false}
                style={[styles.container, { paddingBottom: 100 }]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                  let isReminder = MyProfile?.contact_reminder?.find((v) => v._id == item.userId?._id);
                  let isSefUser = item.userId?._id == MyProfile?._id;
                  return (
                    <View key={index}>
                      <Contact
                        item={item}
                        onComonUserContactPressed={(value) => {
                          if (value.hasComon == true) {
                            if (value.userId?._id) {
                              setloadingOpenRoom(true);

                              createRoomRequest({
                                variables: {
                                  input: {
                                    type: "individual",
                                    users: [value.userId?._id],
                                    localId: "0",
                                    profile_img: null,
                                    name: "",
                                  },
                                },
                              })
                                .then((res) => {
                                  //console.log(res, selected.userId?._id);
                                  if (res.data?.createRoom.success) {
                                    console.log(res.data.createRoom);

                                    // Navigation with stack manipulation to remove current screen and ProfileScreen
                                    navigation.reset({
                                      index: 0,
                                      routes: [
                                        {
                                          name: "ChatMessageScreen",
                                          params: {
                                            RoomId: res.data.createRoom.roomId,
                                          },
                                        },
                                      ],
                                    });

                                    setloadingOpenRoom(false);
                                  } else {
                                    //console.log("issue in create");
                                  }
                                })
                                .catch(() => {
                                  setloadingOpenRoom(false);
                                  //console.log(err, "create room issue");
                                });
                            }
                          } else {
                            onChoosePhone(value);

                            dispatch(updateContactProfile([{ ...item, hasInvited: true, invitedAt: dayjs().unix() }]));
                          }
                        }}
                        onSetReminder={OpenContactReminder}
                        isReminder={isReminder ?? null}
                        loader={false}
                        isSefUser={isSefUser}
                        onDeleteReminder={(id) => {
                          removeContactReminder({
                            variables: {
                              input: {
                                _id: id,
                              },
                            },
                          }).then((res) => {
                            if (res.data?.removeContactReminder) {
                              console.log(res.data?.removeContactReminder.contact_reminder);
                              dispatch(setMyProfile(res.data?.removeContactReminder));
                              ToastMessage("Online Reminder deleted successfully.");
                            }
                          });
                        }}
                      />
                    </View>
                  );
                }}
                ListEmptyComponent={<EmptyList title="errors.contacts.no-data" />}
                ListFooterComponent={<View style={{ height: 350 }} />}
              />
            )}
          </View>
        </View>

        {loadingOpenRoom && <CommonLoader />}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={style.centeredView}>
            <View style={style.modalView}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <View />
                <NativeText style={[style.suggestionStyle, { fontSize: 17, marginHorizontal: 0 }]}>
                  {t("invitationMessage")}
                </NativeText>
                <TouchableOpacity style={style.button} activeOpacity={1} onPress={() => setModalVisible(!modalVisible)}>
                  <Ionicons name="close-sharp" size={20} color={Colors.light.black} />
                </TouchableOpacity>
              </View>

              <NativeText style={[style.suggestionStyle, { fontSize: 14, marginHorizontal: 0, fontWeight: "400" }]}>
                "{t("linkShare")}
                <Text style={[style.suggestionStyle, { fontSize: 14, marginHorizontal: 0, color: "#0000EE" }]}>
                  {" "}
                  {linkConfig.url}
                </Text>
                "
              </NativeText>
              <NativeText
                style={[style.suggestionStyle, { fontSize: 14, marginHorizontal: 0, marginTop: 20, fontWeight: "400" }]}
              >
                {`${t("messengerService")} ${linkConfig.name}`}
              </NativeText>
              <TouchableOpacity style={style.continueButtonContainer} activeOpacity={1} onPress={() => shareLink()}>
                {loader ? (
                  <ActivityIndicator color={Colors.light.White} size={17} />
                ) : (
                  <NativeText style={style.continueTextStyle}>{t("btn.Continue")}</NativeText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={reminderData != null}
          onRequestClose={() => {
            setReminderData(null);
          }}
        >
          <Pressable
            style={style.centeredView}
            onPress={() => {
              setReminderData(null);
            }}
          >
            <View style={style.modalView}>
              <ReminderForm
                contact={reminderData}
                mode={reminderData?.mode}
                onSubmit={(data) => {
                  setContactReminder({ ...reminderData, ...data });
                  setReminderData(null);
                }}
              />
            </View>
          </Pressable>
        </Modal>
      </View>
      <Pressable style={styles.share} onPress={onAddContactPressed}>
        <AntDesign name={"plus"} color="white" size={22} />
      </Pressable>
    </View>
  );

  async function ContactSync() {
    try {
      let res = await getServerPhonebook();
      if (res.data?.getUserPhoneBook) {
        const contactsRaw = res.data?.getUserPhoneBook?.contacts ?? [];
        if (contactsRaw.length) {
          dispatch(updateContact(contactsRaw));

          return contactsRaw;
        } else {
          return [];
        }
      } else {
        console.log(error);
        return [];
      }
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  function OpenContactReminder(data: UserContactInput) {
    setReminderData(data);
  }

  function setContactReminder(data: UserContactInput) {
    console.log(data);
    let { mode, ...formData } = data;
    if (mode == "create") {
      createContactReminder({
        variables: {
          input: { contact_reminder: formData },
        },
      }).then((res) => {
        if (res.data?.createContactReminder) {
          dispatch(setMyProfile(res.data?.createContactReminder));
          ToastMessage(t("onlineStatus.reminder-success"));
        }
      });
    }
    if (mode == "update") {
      updateContactReminder({
        variables: {
          input: { contact_reminder: formData },
        },
      }).then((res) => {
        if (res.data?.updateContactReminder) {
          dispatch(setMyProfile(res.data?.updateContactReminder));
          ToastMessage(t("onlineStatus.reminder-update"));
        }
      });
    }
  }

  function formateNumber(str: string) {
    if (str.startsWith(countryCode)) {
      str = str.replace(countryCode, "");
    }
    if (str.startsWith("00")) {
      str = str.replace("00", "");
    }
    let v = countriesWithLeadingZero.find((v) => str.startsWith(v));
    if (!v && str.startsWith("0")) {
      str = str.replace("0", "");
    }
    return str;
  }

  function onAddContactPressed() {
    Contacts.openContactForm({}).then((contact) => {
      if (contact && contact.phoneNumbers.length > 0) {
        const body = {
          id: contact?.recordID,
          numbers: contact.phoneNumbers[0].number,
          firstName: contact?.givenName ?? "",
          lastName: contact.familyName ?? "",
        };
        // console.log(body)
        const data = {
          variables: {
            input: {
              region: code,
              contacts: [body],
            },
          },
        };
        addMyContactRequest(data)
          .then((res) => {
            if (res.data?.addMyContact) {
              dispatch(addServerContact(res.data?.addMyContact.contacts));
              ToastMessage(`1 ${t("onlineStatus.contact-added")}`);
            }
          })
          .catch((error) => {
            console.log(error.message);
          });
      }
    });
  }

  async function shareLink() {
    try {
      setLoader(true);
      await createSmsInvite({
        variables: {
          input: {
            phone: linkConfig.phone,
            region: linkConfig.region,
          },
        },
      });
      setModalVisible(false);
      setLoader(false);
      setTimeout(() => {
        NativeShare.share({
          title: t("contacts.sms.title"),
          message: t("linkShare") + linkConfig.url,
        });
      }, 300);
    } catch (error) {
      console.error("Error in sharing link", error);
      setLoader(false);
      setModalVisible(false);
      ToastMessage("There has been some error in sharing your link");
    }
  }

  function deleteContacts(contactsToDelete: ContactDetailsDto[]) {
    if (!contactsToDelete.length) return;
    const deleteContact = contactsToDelete.map((e) => e?.localId);
    deleteMyContactRequest({
      variables: {
        input: {
          contactIds: deleteContact,
        },
      },
    })
      .then((res) => {
        if (res.data?.deleteMyContact?.data) {
          dispatch(removeContact(res.data?.deleteMyContact.data));
          ToastMessage(`${res.data?.deleteMyContact?.data.length} ${t("onlineStatus.contacts-removed")}`);
        }
      })
      .catch((Err) => {
        setRefreshing(false);
        console.log("Error in deleting contacts", Err);
        // ToastMessage("There has been some error!");
      });
  }

  async function onPressRefreshing() {
    setRefreshing(true);

    try {
      //Get Formatted contacts from Phonebook
      const PhoneBookContacts = await addContact(t);
      let phoneChange = [] as formattedPhoneBook[];
      let phoneDelete = [] as string[];

      //if new number added or removed then create list of delete and add contact

      //USER DELETED CONTACT FROM PHONEBOOK
      //if contact removed from phonebook or second contact number on single phonebook number
      if (PhoneBookContacts.length <= contacts.length) {
        const ContactToRemove = contacts.filter((contact) => {
          const isLocal = PhoneBookContacts.find((ph_contact) => ph_contact?.localId === contact?.localId);

          if (!isLocal) {
            // console.log(contact.localId)
            //Contact removed from phonebook
            return true;
          } else {
            const isPhoneChanged = isLocal?.phone === contact.originalPhone;

            if (!isPhoneChanged) {
              phoneChange.push(isLocal);
              phoneDelete.push(contact.localId);
            }

            //if server and local both are same then do not send it for delete
            return false;
          }
        });

        console.log("Delete Contact List", ContactToRemove.length);
        deleteContacts(ContactToRemove);
      }

      //USER ADDED CONTACT IN PHONEBOOK
      if (PhoneBookContacts.length > contacts.length) {
        const ContactAdded = PhoneBookContacts.filter((ph_contact) => {
          const isLocal = contacts.find((contact) => ph_contact?.localId === contact?.localId);
          return isLocal ? false : true;
        });
        console.log("New Contact List", ContactAdded.length);
        addContactsToServer(ContactAdded);
      }

      //is any number change then add new number
      if (phoneChange.length > 0) {
        handleNumberChange(phoneDelete, phoneChange);
      }

      //if any contact name change then create list of update contact
      const ContactToUpdate = PhoneBookContacts.filter((ph_contact) => {
        const isFound = contacts.find((con) => con.localId === ph_contact.localId);
        if (isFound) {
          const con_name = `${isFound?.firstName ?? ""}${isFound?.lastName ?? ""}`;
          const ph_name = ph_contact.name + ph_contact.lastName;
          return con_name !== ph_name;
        } else {
          return false;
        }
      }).map((ph_contact) => {
        const localContact = contacts.find((con) => con.localId === ph_contact.localId);
        const updatedContact = localContact
          ? { firstName: ph_contact.name, lastName: ph_contact.lastName, phone: localContact.phone }
          : { ...ph_contact, firstName: ph_contact.name };
        return updatedContact;
      });

      if (ContactToUpdate.length > 0) {
        console.log("ContactToUpdate", ContactToUpdate.length);
        ContactToUpdate.forEach(async (con) => {
          await updateContactProfileRequest({
            variables: {
              input: con,
            },
          }).then((res) => {
            if (res.data?.updateContactProfile) {
              console.log(res.data?.updateContactProfile);
              dispatch(updateContactProfile([res.data?.updateContactProfile]));
            }
          });
        });
        ToastMessage(`${ContactToUpdate.length} contacts updated.`);
      }

      getComonContact({}).then(res => {
        if (res.data?.getMyComonContact) {
          if (res.data?.getMyComonContact.contacts) {
            dispatch(updateContactProfile(res.data?.getMyComonContact.contacts))
          }
        }
      }).catch(console.log)
    } catch (error) {
      console.log(error);
      ToastMessage("Allow Contact Permission from settings.");
    } finally {
      setRefreshing(false);
    }
  }

  function handleNumberChange(oldNumber: string[], newNumber: formattedPhoneBook[]) {
    if (newNumber.length > 0) {
      const rb = _.uniqBy(newNumber, (v) => v.localId);
      const contact = rb.map((item) => ({
        id: item?.localId,
        numbers: item?.phone,
        firstName: item?.name ? item?.name : item?.firstName ? item?.firstName : "",
        lastName: item.lastName,
      }));

      addMyContactRequest({
        variables: {
          input: {
            region: code,
            contacts: contact ?? [],
          },
        },
      })
        .then((res) => {
          if (res.data?.addMyContact) {
            dispatch(addServerContact(res.data?.addMyContact.contacts));
          }
        })
        .catch((err) => {
          console.log("Error in adding contact", err);
          setRefreshing(false);
          ToastMessage("There has been some error!");
        });
    }

    if (oldNumber.length > 0) {
      deleteMyContactRequest({
        variables: {
          input: {
            contactIds: oldNumber,
          },
        },
      })
        .then((res) => {
          if (res.data?.deleteMyContact?.data) {
            dispatch(removeContact(res.data?.deleteMyContact.data));
          }
        })
        .catch((Err) => {
          setRefreshing(false);
          console.log("Error in deleting contacts", Err);
          ToastMessage("There has been some error!");
        });
    }

    ToastMessage(`${oldNumber.length} contact updated.`);
  }

  function addContactsToServer(contactsToSave: Array<any>) {
    if (!contactsToSave.length) {
      return;
    }
    const rb = _.uniqBy(contactsToSave, (v) => v.localId);
    const contact = rb.map((item) => ({
      id: item?.localId,
      numbers: item?.phone,
      firstName: item?.name ? item?.name : item?.firstName ? item?.firstName : "",
      lastName: item.lastName,
    }));

    addMyContactRequest({
      variables: {
        input: {
          region: code,
          contacts: contact ?? [],
        },
      },
    })
      .then((res) => {
        if (res.data?.addMyContact) {
          dispatch(addServerContact(res.data?.addMyContact.contacts));
          ToastMessage(`${contact.length} ${t("onlineStatus.contact-added")}`);
        }
      })
      .catch((err) => {
        console.log("Error in adding contact", err);
        setRefreshing(false);
        // ToastMessage("There has been some error!");
      });
  }

  function generateContactSections(contactsList: serverContactType[], searchText: string) {
    // Show only the primary phonebook record per contact to avoid duplicate rows
    // for multi-number contacts (e.g. same name repeated with _0, _1, _2 localIds).
    const primaryContacts = contactsList.filter((contact) => {
      const localId = contact?.localId ?? "";
      if (!localId) return true;
      return !/_\d+$/.test(localId) || localId.endsWith("_0");
    });

    let filtered = filterInObject({
      searchText: searchText,
      data: primaryContacts,
      // searchKeys: ["firstName", "lastName", "phone"],
      // returnKeys: [],
    });
    const regex = /[A-Za-z]/;

    //hasComon
    if (currentTab == "Comon") {
      filtered = filtered.filter((item) => item.hasComon == true);
      // console.log(filtered);
    }

    if (currentTab === "Other") {
      filtered = filtered.filter((item) => !item.hasComon);
    }

    // If duplicates exist, keep the latest/second entry and remove the first one.
    filtered = _.uniqBy(
      [...filtered].reverse(),
      (item) =>
        `${(item?.firstName ?? "").trim().toLowerCase()}_${(item?.lastName ?? "").trim().toLowerCase()}` ||
        (item?.phone ?? "")
    ).reverse();

    // console.log(filtered);

    const chars: typeof alphabetList = alphabetList;
    const currContacts = produce(chars, (draftChar) => {
      return draftChar
        .map((item) => {
          const data = produce(filtered, (draftalpha) => {
            return draftalpha.filter((con: { firstName: string[]; lastName: string[]; phone: string[] }) => {
              const checkSection = con.firstName[0]?.match(/[A-Za-z]/g)
                ? item.title == con.firstName[0]
                : con.lastName[0]?.match(/[A-Za-z]/g)
                  ? item.title == con.lastName[0]
                  : con.firstName[0] == undefined && con.lastName[0] == undefined && item.title == "#"
                    ? true
                    : item.title == "#";
              if (checkSection) {
                return true;
              } else {
                return false;
              }
            });
          });
          return {
            ...item,
            data: data.sort((a, b) =>
              `${a.firstName ?? ""} ${b.lastName ?? ""}`
                .toLowerCase()
                .localeCompare(`${b.firstName ?? ""} ${b.lastName ?? ""}`.toLowerCase())
            ),
          };
        })
        .filter((con) => con.data.length > 0);
    });

    return currContacts;
  }

  async function onChoosePhone(choosenContact: any) {
    InviteContactOnApp({
      phone: choosenContact?.phone,
      code,
      InviteApi: (phone, region, branchUrl) => {
        setLinkConfig({
          url: branchUrl,
          phone: phone,
          region: region,
          name:
            choosenContact?.firstName && choosenContact?.lastName
              ? `${choosenContact?.firstName} ${choosenContact?.lastName}`
              : choosenContact?.phone,
        });
        setModalVisible(true);
      },
    });
  }
}

const style = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    height: 25,
    width: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionStyle: {
    fontSize: 11,
    fontFamily: fonts.Lato,
    textAlign: "left",
    color: "rgba(51,51,51,.5)",
    fontWeight: "700",
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 10,
  },
  continueButtonContainer: {
    height: 50,
    borderRadius: 40,
    backgroundColor: Colors.light.PrimaryColor,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  continueTextStyle: {
    color: Colors.light.White,
    fontWeight: "700",
    fontFamily: fonts.Lato,
    fontSize: 17,
  },
});

export default ContactsScreen;
