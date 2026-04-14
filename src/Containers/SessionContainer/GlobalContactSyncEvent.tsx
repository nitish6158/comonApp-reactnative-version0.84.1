import {
  useAddMyContactMutation,
  useDeleteMyContactMutation,
  useGetUserPhoneBookLazyQuery,
  useUpdateContactProfileMutation,
} from "@/graphql/generated/contact.generated";
import { addContact, usePhoneContext } from "@/hooks";
import { useAppSelector } from "@/redux/Store";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { ContactDetailsDto } from "@/graphql/generated/types";
import {
  addServerContact,
  removeContact,
  serverContactType,
  updateContact,
  updateContactProfile,
} from "@/redux/Reducer/ContactReducer";
import { ActivityIndicator, AppState, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/Constants";
import React from "react";
import { windowHeight } from "@/utils/ResponsiveView";
import FastImage from "@d11/react-native-fast-image";
import { useSetAtom } from "jotai";
import { AllChatRooms } from "@/Atoms";
import { socketManager } from "@/utils/socket/SocketManager";

export default function GlobalContactSyncEvent() {
  const { code } = usePhoneContext();
  const dispatch = useDispatch();
  const setAllRooms = useSetAtom(AllChatRooms);

  const [addMyContactRequest, addMyContactResponse] = useAddMyContactMutation();
  const [deleteMyContactRequest, deleteResponse] = useDeleteMyContactMutation();
  const [updateContactProfileRequest] = useUpdateContactProfileMutation();
  const [error, setError] = useState<boolean>(false);
  const [payload, setPayload] = useState(null);
  const [syncTrigger, setSyncTrigger] = useState(0);
  const appStateRef = useRef(AppState.currentState);
  const syncInProgressRef = useRef(false);
  const lastSyncAtRef = useRef(0);

  const { contacts } = useAppSelector((state) => state.Contact);
  const [getServerPhonebook, getServerPhonebookResponse] = useGetUserPhoneBookLazyQuery();

  const { t } = useTranslation();

  function refreshChatRooms() {
    socketManager.chatRoom.fetchAndUpdateRooms((data) => {
      if (data?.rooms) {
        setAllRooms([...data.rooms]);
      }
    });
  }

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState) => {
      const wasInBackground = appStateRef.current === "inactive" || appStateRef.current === "background";
      if (wasInBackground && nextState === "active") {
        setSyncTrigger((v) => v + 1);
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const now = Date.now();
    if (syncInProgressRef.current) return;
    if (now - lastSyncAtRef.current < 5000) return;

    syncInProgressRef.current = true;
    ContactSync()
      .then((list) => {
        if (list) {
          syncContactsToDb(list);
          lastSyncAtRef.current = Date.now();
        }
      })
      .finally(() => {
        syncInProgressRef.current = false;
      });
  }, [code, syncTrigger, contacts.length]);

  function deleteContacts(contactsToDelete: ContactDetailsDto[]) {
    if (!contactsToDelete.length) return;
    const deleteContact = contactsToDelete.map((e) => e?.localId);
    deleteMyContactRequest({
      variables: {
        input: {
          contactIds: deleteContact,
        },
      },
    }).then((res) => {
      if (res.data?.deleteMyContact?.data) {
        dispatch(removeContact(res.data?.deleteMyContact.data));
        refreshChatRooms();
      }
    });
  }

  async function ContactSync() {
    try {
      let res = await getServerPhonebook();
      if (res.data?.getUserPhoneBook) {
        const contactsRaw = res.data?.getUserPhoneBook?.contacts ?? [];

        if (contactsRaw.length > 0) {
          dispatch(updateContact(contactsRaw));
          return contactsRaw;
        } else {
          dispatch(updateContact([]));
          return [];
        }
      } else {
        console.log(error);
        return null;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async function syncContactsToDb(serverContact: serverContactType[]) {
    addContact(t).then(async (phonebook) => {
      const RemoveFromServer = serverContact.filter((e: { localId: string }) => {
        //If contact not found on server then add to the list
        let isFound = phonebook.find((v) => v.localId === e.localId);
        if (!isFound) {
          return true;
        } else {
          return false;
        }
      });

      if (RemoveFromServer.length > 0) {
        deleteContacts(RemoveFromServer);
      }

      const AddToServer = phonebook.filter((e: { localId: string }) => {
        //If contact not found on server then add to the list
        let isFound = serverContact.find((v) => v.localId === e.localId);
        if (!isFound) {
          return true;
        } else {
          return false;
        }
      });

      const ContactToUpdate = phonebook
        .filter((ph_contact) => {
          const isFound = serverContact.find((con) => con.localId === ph_contact.localId);
          if (!isFound) return false;
          const serverName = `${isFound?.firstName ?? ""}${isFound?.lastName ?? ""}`.trim();
          const phoneName = `${ph_contact?.name ?? ph_contact?.firstName ?? ""}${ph_contact?.lastName ?? ""}`.trim();
          return serverName !== phoneName;
        })
        .map((ph_contact) => {
          const localContact = serverContact.find((con) => con.localId === ph_contact.localId);
          return localContact
            ? {
                firstName: ph_contact.name ?? ph_contact.firstName ?? "",
                lastName: ph_contact.lastName ?? "",
                phone: localContact.phone,
              }
            : null;
        })
        .filter(Boolean);

      if (AddToServer.length > 0) {
        const contacts = AddToServer.map((item) => ({
          id: item?.localId,
          numbers: item?.phone,
          firstName: item?.name ? item?.name : item?.firstName ? item?.firstName : "",
          lastName: item.lastName,
        }));

        console.log({
          region: code,
          contacts: contacts.length,
        });

        addMyContactRequest({
          variables: {
            input: {
              region: code,
              contacts: contacts,
            },
          },
        })
          .then((response) => {
            if (response.data?.addMyContact) {
              console.log(response.data?.addMyContact.contacts?.length);
              dispatch(addServerContact(response.data?.addMyContact.contacts));
              refreshChatRooms();
            }
          })
          .catch((err) => {
            console.log(err);
            setPayload({
              region: code,
              contacts: contacts,
            });
            setError(true);
          });
      }

      if (ContactToUpdate.length > 0) {
        await Promise.all(
          ContactToUpdate.map(async (con: any) => {
            try {
              const res = await updateContactProfileRequest({
                variables: {
                  input: con,
                },
              });
              if (res.data?.updateContactProfile) {
                dispatch(updateContactProfile([res.data.updateContactProfile]));
              }
            } catch (err) {
              console.log("Error updating contact profile", err);
            }
          }),
        );
        refreshChatRooms();
      }
    });
  }

  if (getServerPhonebookResponse.loading) {
    return <></>;
  }

  if (deleteResponse.loading || (addMyContactResponse.loading && contacts.length > 0)) {
    return (
      <View
        style={{
          height: 30,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: Colors.light.LightBlue,
          paddingHorizontal: 15,
        }}
      >
        <Text style={{ fontSize: 12 }}>{t("onlineStatus.updating-contact")}...</Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <ActivityIndicator size="small" />
        </View>
      </View>
    );
  }

  if (addMyContactResponse.loading && contacts.length == 0) {
    return (
      <View
        style={{
          height: windowHeight,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          paddingHorizontal: 15,
        }}
      >
        <FastImage
          source={require("../../../assets/images/logo.png")}
          style={{ height: 150, width: 150, borderRadius: 75, marginBottom: 50 }}
        />
        <Text style={{ fontSize: 16, width: 330, textAlign: "center" }}>{t("onlineStatus.contact-syncing")}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 20 }}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  } else if (error) {
    return (
      <View
        style={{
          height: windowHeight,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          paddingHorizontal: 15,
        }}
      >
        <FastImage
          source={require("../../../assets/images/logo.png")}
          style={{ height: 150, width: 150, borderRadius: 75, marginBottom: 50 }}
        />
        <Text style={{ fontSize: 16, width: 330, textAlign: "center" }}>{t("onlineStatus.contact-error")}</Text>
        <TouchableOpacity
          onPress={() => {
            setError(false);
            if (payload) {
              addMyContactRequest({
                variables: {
                  input: {
                    ...payload,
                  },
                },
              })
                .then((response) => {
                  if (response.data?.addMyContact) {
                    console.log(response.data?.addMyContact.contacts?.length);
                    dispatch(addServerContact(response.data?.addMyContact.contacts));
                    setPayload(null);
                    refreshChatRooms();
                  }
                })
                .catch((err) => {
                  console.log(err);

                  setError(true);
                });
            }
          }}
        >
          <Text style={{ fontSize: 18, color: "red", marginTop: 20 }}>{t("onlineStatus.retry")}</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    return <></>;
  }
}
