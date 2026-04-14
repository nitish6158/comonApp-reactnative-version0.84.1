import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import React from "react";
import { useDispatch } from "react-redux";
import { useLanguageContext } from "@/hooks";
import { useAppSelector } from "@/redux/Store";
import { useTranslation } from "react-i18next";
// import { useUser } from "@realm/react";
import { useLogoutLazyQuery } from "@/graphql/generated/auth.generated";
import { useSetAtom } from "jotai";
import { ComonSyncStatus, SessionStatus } from "..";
import { getSession, removeCurrentOrganization, removeSession } from "@/utils/session";
import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resetContactState } from "@/redux/Reducer/ContactReducer";
import { resetCallState } from "@/redux/Reducer/CallReducer";
import { resetChatState, setMyProfile } from "@/redux/Reducer/ChatReducer";
import { resetOrganisationState } from "@/redux/Reducer/OrganisationsReducer";
import { SeniorProfileScreenProps } from "@/navigation/screenPropsTypes";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import { Colors, fonts } from "@/Constants";
import { Profile, UserDetails } from "../MainContainer/ProfileContainer/UserProfile";
import AntDesign from "react-native-vector-icons/AntDesign";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { useUpdateUserModeMutation } from "@/graphql/generated/user.generated";
import { navigateAndSimpleReset } from "@/navigation/utility";
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { socketConnect } from "@/utils/socket/SocketConnection";

export default function SeniorProfileScreen({ navigation }: SeniorProfileScreenProps) {
  const [loader, setLoader] = React.useState(false);

  const Dispatch = useDispatch();
  const [updateUserModeRequest] = useUpdateUserModeMutation();

  const { onOpen } = useLanguageContext();

  const { MyProfile } = useAppSelector((state) => state.Chat);

  const { t } = useTranslation();

  // const user = useUser();

  const [logoutRequest, { }] = useLogoutLazyQuery();
  const sessionStatus = useSetAtom(SessionStatus);
  const comonSyncStatus = useSetAtom(ComonSyncStatus);

  const _logout = async () => {
    try {
      setLoader(true);
      const { mode } = await getSession();
      logoutRequest({ variables: { input: {} } }).then(async (res) => {
        if (res.data?.logout) {
          // user?.logOut();
          await messaging()
            .unsubscribeFromTopic(`${mode}_user_id_${MyProfile?._id}`)
            .then(() => {
              console.log("topic unSubscribe success", `${mode}_user_id_${MyProfile?._id}`);
            });

          await AsyncStorage.removeItem("roomDataCache");

          await AsyncStorage.removeItem("me");

          removeCurrentOrganization();
          Dispatch(resetContactState());
          Dispatch(resetCallState());
          Dispatch(resetChatState());

          sessionStatus(false);
          comonSyncStatus(false);
          socketConnect.disconnect();
          Dispatch(resetOrganisationState());
          await removeSession();
          Dispatch(setMyProfile(null));

          setLoader(false);
        }
      });

      // setReload(true);
    } catch (error) {
      console.error("Error in logout device", error);
    }
  };

  const onNavigateToSettings = () => {
    navigation.navigate("EditProfileScreen", {});
  };

  const onNavigateToContacts = () => {
    navigation.navigate("ContactListScreen", { ShareContact: false });
  };

  const switchToClassic = () => {
    Alert.alert(
      t("seniorMode.switch-to-classic"),
      `${t("seniorMode.confirm")} ${t("seniorMode.switch-to-classic")}?`,
      [
        {
          text: t("btn.cancel"),
          onPress: () => { },
          style: "cancel",
        },
        {
          text: t("btn.ok"),
          onPress: async () => {
            let res = await updateUserModeRequest({
              variables: {
                input: {
                  mode: "CLASSIC",
                },
              },
            });
            if (res.data?.updateUserMode) {
              Dispatch(setMyProfile({ ...MyProfile, mode: "CLASSIC" }))
              navigateAndSimpleReset("Main", {});
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  function onUpdateChatList() {
    navigation.navigate("SeniorChatSelectionScreen", {});
  }

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.avatar}>
          <View
            style={{
              width: "100%",
              marginBottom: 10,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Pressable
              style={{ flexDirection: "row", alignItems: "center" }}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
              <Text style={{ color: "white", marginLeft: 5 }}>{t("titles.Back")}</Text>
            </Pressable>
            <Pressable onPress={onOpen} style={{ flexDirection: "row", alignItems: "center" }}>
              <Feather name="globe" size={16} color={Colors.light.link} style={{ marginRight: 5 }} />
              <Text size="sm" style={{ color: "white" }}>
                {t("locales.language")}
              </Text>
            </Pressable>
          </View>
          <Pressable
            onPress={() => {
              navigation.navigate("EditProfileImageScreen");
            }}
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <Profile />
            <UserDetails
              name={`${MyProfile?.firstName ?? ""} ${MyProfile?.lastName ?? ""}`}
              phone={MyProfile?.phone ?? ""}
            />
          </Pressable>
        </View>
        <View style={{ marginHorizontal: 10, marginVertical: 10 }}>
          {/* <Pressable
            onPress={onNavigateToSettings}
            style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}
          >
            <AntDesign
              name="setting"
              size={22}
              color={Colors.light.PrimaryColor}
              style={{ marginRight: 10, marginLeft: 5 }}
            />
            <Text style={{ fontSize: 17 }}>{t("navigation.settings")}</Text>
          </Pressable> */}

          <Pressable
            onPress={() => {
              navigation.navigate("AboutContainer");
            }}
            style={{ flexDirection: "row", alignItems: "center", marginVertical: 5 }}
          >
            <AntDesign
              style={{ marginRight: 10, marginLeft: 5 }}
              name="exclamationcircleo"
              size={21}
              color={Colors.light.PrimaryColor}
            />
            <Text style={{ fontSize: 17 }}>{t("navigation.about")}</Text>
          </Pressable>

          {/* <Pressable
            onPress={onNavigateToContacts}
            style={{ flexDirection: "row", alignItems: "center", marginVertical: 5, width: "90%" }}
          >
            <AntDesign
              name="adduser"
              size={22}
              color={Colors.light.PrimaryColor}
              style={{ marginRight: 10, marginLeft: 5 }}
            />
            <Text style={{ fontSize: 17, fontFamily: fonts.Lato }}>{t("invitation")}</Text>
          </Pressable> */}
          <Pressable
            onPress={onUpdateChatList}
            style={{ flexDirection: "row", alignItems: "center", marginVertical: 5, width: "90%" }}
          >
            <AntDesign
              name="message1"
              size={22}
              color={Colors.light.PrimaryColor}
              style={{ marginRight: 10, marginLeft: 5 }}
            />
            <Text style={{ fontSize: 17, fontFamily: fonts.Lato }}>{t("seniorMode.update-chatrooms")}</Text>
          </Pressable>
          <Pressable
            onPress={switchToClassic}
            style={{ flexDirection: "row", alignItems: "center", marginVertical: 5, width: "90%" }}
          >
            <MaterialIcons
              name="model-training"
              size={25}
              color={Colors.light.PrimaryColor}
              style={{ marginRight: 10, marginLeft: 5 }}
            />
            <Text style={{ fontSize: 17, fontFamily: fonts.Lato }}>{t("seniorMode.switch-to-classic")}</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("UserManualScreen", {})}
            style={{ flexDirection: "row", alignItems: "center", marginVertical: 5, width: "90%" }}
          >
            <MaterialIcons
              name="help-outline"
              size={22}
              color={Colors.light.PrimaryColor}
              style={{ marginRight: 10, marginLeft: 5 }}
            />
            <Text style={{ fontSize: 17, fontFamily: fonts.Lato }}>{t("userDatabase.help")}</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ marginLeft: 20, paddingTop: 10 }}>
        <Pressable
          disabled={loader}
          onPress={() => _logout()}
          style={{ flexDirection: "row", alignItems: "center", marginVertical: 20 }}
        >
          {loader ? (
            <ActivityIndicator color={Colors.light.PrimaryColor} style={{ marginLeft: 20 }} />
          ) : (
            <>
              <SimpleLineIcons name="logout" size={20} color={Colors.light.link} style={{ marginRight: 10 }} />
              <Text>{t("navigation.logout")}</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  accounts: {
    paddingLeft: 12,
    paddingTop: 12,
  },
  avatar: {
    backgroundColor: "#284b63",
    paddingBottom: 18,
    paddingHorizontal: 12,
    paddingTop: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: Colors.light.background,
    flex: 1,
    justifyContent: "space-between",
  },
  info: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  links: {
    marginTop: 24,
    paddingLeft: 12,
  },
});
