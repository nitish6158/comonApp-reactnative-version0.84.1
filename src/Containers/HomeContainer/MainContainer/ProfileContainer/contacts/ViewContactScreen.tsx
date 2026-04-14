import { View, StyleSheet, FlatList, Pressable, Share as NativeShare } from "react-native";
import React, { useMemo } from "react";
import { ViewContactScreenProps } from "@/navigation/screenPropsTypes";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ContactDetailsDto } from "@/graphql/generated/types";
import { Colors } from "@/Constants";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ContactInfo } from "@Types/types";
import { Checkbox, Text } from "react-native-ui-lib";
import { useCreateRoomMutation } from "@/graphql/generated/room.generated";
import { useNavigation } from "@react-navigation/core";
import {
  useAddMyContactMutation,
  useCreateSmsInviteMutation,
  useUpdateContactNewMutation,
} from "@/graphql/generated/contact.generated";
import ToastMessage from "@Util/ToastMesage";
import { InviteContactOnApp } from "./InviteFriends";
import { usePhoneContext } from "@/hooks";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/Reducer";
import { DefaultImageUrl, ImageUrl } from "@Service/provider/endpoints";
import AvtaarWithoutTitle from "@Components/AvtaarWithoutTitle";
import { Platform } from "react-native";
import Contacts from "react-native-contacts";

export default function ViewContactScreen({ route, navigation }: Readonly<ViewContactScreenProps>) {
  const { contacts } = useSelector((state: RootState) => state.Contact);
  const { t } = useTranslation();

  const groupedData = useMemo(() => {
    let grouped = route.params.data.groupedContact
      ? route.params.data.groupedContact.map((da) => {
          let found = contacts.find((cc) => cc.phone === da.phone);
          return found ?? da;
        })
      : [];
    return { ...route.params.data, groupedContact: grouped };
  }, [contacts, route.params.data]);

  return (
    <View style={styles.main}>
      <View style={styles.headerContainer}>
        <Ionicons name="arrow-back" color="gray" size={30} onPress={navigation.goBack} />
        <Text style={{ fontSize: 17, marginLeft: 10 }}>{t("view-contacts")}</Text>
      </View>
      <View>
        <FlatList
          ListFooterComponent={<View style={{ height: 150 }} />}
          showsVerticalScrollIndicator={false}
          data={[groupedData]}
          renderItem={({ item, index }) => {
            return (
              <View key={index}>
                <ContactGroupingView data={item} />
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

type ContactGroupingViewProps = {
  data: ContactInfo;
};
function ContactGroupingView({ data }: Readonly<ContactGroupingViewProps>) {
  const [createRoomRequest] = useCreateRoomMutation();
  const [createSmsInvite] = useCreateSmsInviteMutation();
  const navigation = useNavigation();
  const { code } = usePhoneContext();
  const { t } = useTranslation();
  const { comonContact, contacts } = useSelector((state: RootState) => state.Contact);
  const MyProfile = useSelector((state: RootState) => state.Chat.MyProfile);
  const [addNewContactRequest, addNewContactResponse] = useAddMyContactMutation();
  const [updateContactRequest, updateContactResponse] = useUpdateContactNewMutation();

  const isBlocked = useMemo(() => {
    return MyProfile.blockedRooms.filter((blr) => blr.pid == data._id).length;
  }, []);

  const parentContact = useMemo(() => {
    let found = comonContact.find((cc) => cc.userId?._id == data._id);
    return found ?? data;
  }, [data, comonContact]);

  return (
    <View style={styles.contactContainer}>
      <View style={styles.parentContainer}>
        {parentContact.hasComon ? (
          <AvtaarWithoutTitle
            ImageSource={{ uri: `${DefaultImageUrl}${isBlocked > 0 ? ImageUrl : data.profile_img}` }}
            AvatarContainerStyle={styles.avatar}
          />
        ) : (
          <View style={styles.profileView}>
            <Text style={styles.profileText}>
              {`${data?.firstName[0] ?? ""}${data?.lastName[0] ?? ""}`.toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={{ fontSize: 20, marginLeft: 15 }}>
          {`${data.firstName}${data.lastName}`.length != 0 ? `${data.firstName} ${data.lastName}` : data.phone}
        </Text>
      </View>
      {data.groupedContact &&
        data.groupedContact.map((sc, sci) => {
          let isContactInPhonebook = contacts.find((cc) => cc.phone === sc.phone);
          return (
            <View key={sci} style={styles.siblingContainer}>
              <View style={styles.siblingDetails}>
                <FontAwesome name="phone" size={26} color={Colors.light.PrimaryColor} style={{ marginRight: 15 }} />
                <Text style={{ fontSize: 16 }}>{sc.phone}</Text>
              </View>
              <View>
                {sc.hasComon ? (
                  <Text
                    onPress={() => {
                      onMessagePressed(sc.userId?._id);
                    }}
                    style={styles.actionText}
                  >
                    {t("Message")}
                  </Text>
                ) : (
                  <Text
                    onPress={() => {
                      if (isContactInPhonebook) {
                        onInvitePressed(sc.phone);
                      } else {
                        onAddContactPressed(sc);
                      }
                    }}
                    style={styles.actionText}
                  >
                    {isContactInPhonebook
                      ? sc.hasInvited
                        ? t("others.Invited")
                        : t("others.Invite")
                      : t("titles.add-to-contact")}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
    </View>
  );

  function onAddContactPressed(contact: ContactDetailsDto) {
    let newContact = {
      phoneNumbers: [
        {
          label: "mobile",
          number: `${contact.phone ? contact.phone.replace(/[\s()-]/g, "") : ""}`,
        },
      ],
    };

    if (Platform.OS == "ios") {
      newContact = { ...newContact, givenName: contact?.firstName ?? "", familyName: contact?.lastName ?? "" };
    }

    if (Platform.OS == "android") {
      newContact = { ...newContact, displayName: `${contact?.firstName ?? ""} ${contact.lastName ?? ""}` };
    }

    Contacts.openContactForm(newContact).then((contact) => {
      if (contact) {
        const body = {
          id: `${contact?.recordID}_0`,
          numbers: [`${contact.phoneNumbers[0]?.number.replace(/[\s()-]/g, "")}`],
          firstName: contact?.givenName ?? "",
          lastName: `${contact.middleName ? `${contact.middleName} ` : ""}${contact.familyName ?? ""}`,
        };
        const data = {
          variables: {
            input: {
              region: code,
              contacts: body,
            },
          },
        };

        addNewContactRequest(data)
          .then(async () => {
            await updateContactRequest();
            navigation.goBack();
            ToastMessage(t("label.contact-profile-added"));
          })
          .catch((error) => {
            console.log(error.message);
          });
      }
    });
  }

  async function onInvitePressed(phone: string) {
    InviteContactOnApp({
      phone: phone,
      code,
      InviteApi: (phone, region, branchUrl) => {
        NativeShare.share({
          title: t("contacts.sms.title"),
          message: t("contacts.sms.description") + branchUrl,
        });
        createSmsInvite({
          variables: {
            input: {
              phone,
              region,
            },
          },
        }).then((res) => {
          if (res.data?.createSmsInvite) {
            ToastMessage(`${t("toastmessage.invite-sended-successfully")}`);
          }
        });
      },
    });
  }

  async function onMessagePressed(userID: string) {
    let res = await createRoomRequest({
      variables: {
        input: {
          type: "individual",
          users: [userID],
          localId: "0",
          profile_img: null,
          name: "",
        },
      },
    });
    if (res.data?.createRoom) {
      navigation.navigate("ChatMessageScreen", {
        RoomId: res.data.createRoom.roomId,
      });
    }
  }
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 10,
    height: 55,
    borderBottomColor: "gray",
    borderBottomWidth: 0.2,
  },
  contactContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 40,
    backgroundColor: Colors.light.PrimaryColor,
    // marginRight: 10,
  },

  parentContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "gray",
    borderBottomWidth: 0.2,
    paddingVertical: 10,
    marginBottom: 10,
  },
  siblingContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  siblingDetails: {
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
    bottom: 20,
    backgroundColor: Colors.light.PrimaryColor,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
  },
  actionText: {
    color: Colors.light.PrimaryColor,
    fontSize: 16,
  },
});
