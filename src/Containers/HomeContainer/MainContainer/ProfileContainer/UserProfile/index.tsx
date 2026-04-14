import * as React from "react";

import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Text as NativeText,
} from "react-native";
// import { Realm, useApp, useUser } from "@realm/react";

import {
  getSession,
  removeCurrentOrganization,
  removeSession,
} from "@Util/session";
import { navigate, navigateAndSimpleReset } from "@Navigation/utility";

import { useAtom, useAtomValue, useSetAtom } from "jotai";

import { useDispatch, useSelector } from "react-redux";

import AntDesign from "react-native-vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AvatarComponent } from "@Components/Avatar";
import Colors from "@/Constants/Colors";

import { DefaultImageUrl, user_manual_url } from "@Service/provider/endpoints";

import FastImage from "@d11/react-native-fast-image";
import Feather from "react-native-vector-icons/Feather";

import Ionicons from "react-native-vector-icons/Ionicons";
import { ListItem } from "react-native-elements";

import Octicons from "react-native-vector-icons/Octicons";
import { Organization } from "@Service/generated/types";
import RemoveProfile from "@/Components/RemoveProfile";
import store, { RootState, useAppSelector } from "@Store/Store";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { UserProfileScreenProps } from "@/navigation/screenPropsTypes";
import { currentUserIdAtom } from "@/Atoms";
import fonts from "@/Constants/fonts";
import messaging from "@react-native-firebase/messaging";
import { refreshInvite } from "@Atoms/refreshInviteAtom";
import styles from "./MenuStyle";

import { useGetMyInvitesQuery } from "@Service/generated/organization.generated";
import { useLanguageContext } from "@Hooks/useLanguageContext";
import {
  useLogoutLazyQuery,
  useMeLazyQuery,
} from "@Service/generated/auth.generated";
import { useOrganizations } from "@Hooks/useOrganization";

import { useTaskReport } from "@Hooks/useTaskReport";
import { useTranslation } from "react-i18next";
import { ComonSyncStatus, SessionStatus } from "@/Containers/HomeContainer";
import {
  resetOrganisationState,
  setOrganisationInvites,
} from "@/redux/Reducer/OrganisationsReducer";
import { resetContactState } from "@/redux/Reducer/ContactReducer";
import { resetCallState } from "@/redux/Reducer/CallReducer";
import { resetChatState, setMyProfile } from "@/redux/Reducer/ChatReducer";
import { useUpdateUserModeMutation } from "@/graphql/generated/user.generated";
import { Alert } from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { storage } from "@/redux/backup/mmkv";
import { keys } from "@/redux/backup/keys";
import { socketConnect } from "@/utils/socket/SocketConnection";
import { AuthContext } from "@/Components/AuthContext";

export default function Menu({ navigation }: UserProfileScreenProps) {
  const [loader, setLoader] = React.useState(false);
  const [updateUserModeRequest] = useUpdateUserModeMutation();
  const Dispatch = useDispatch();

  const { onOpen } = useLanguageContext();

  const { MyProfile } = useAppSelector((state) => state.Chat);

  const { t } = useTranslation();

  // const user = useUser();

  const [logoutRequest, {}] = useLogoutLazyQuery();
  const sessionStatus = useSetAtom(SessionStatus);
  const comonSyncStatus = useSetAtom(ComonSyncStatus);
  const { setTokenLogin } = React.useContext(AuthContext);
  const _logout = async () => {
    try {
      setLoader(true);
      const { mode } = await getSession();
      logoutRequest({ variables: { input: {} } })
        .then(async (res) => {
          if (res.data?.logout) {
            // user?.logOut();

            await messaging()
              .unsubscribeFromTopic(`${mode}_user_id_${MyProfile?._id}`)
              .then(() => {
                console.log(
                  "topic unSubscribe success",
                  `${mode}_user_id_${MyProfile?._id}`,
                );
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
            storage.clearAll();
            await setTokenLogin(null);
            setLoader(false);
            navigateAndSimpleReset("Auth", {});
          } else {
            setLoader(false);
            console.log("logout failed");
          }
        })
        .catch((error) => {
          console.log(error);
          setLoader(false);
          navigateAndSimpleReset("Auth", {});
        });

      // setReload(true);
    } catch (error) {
      console.error("Error in logout device", error);
      setLoader(false);
    }
  };

  const onNavigateToSettings = () => {
    navigate("ProfileScreen", {});
  };

  const onNavigateToContacts = () => {
    navigate("ContactListScreen", { ShareContact: false });
  };

  const switchToSenior = () => {
    Alert.alert(
      t("seniorMode.switch-to-senior"),
      `${t("seniorMode.confirm")} ${t("seniorMode.switch-to-senior")}?`,
      [
        {
          text: t("btn.cancel"),
          onPress: () => {},
          style: "cancel",
        },
        {
          text: t("btn.ok"),
          onPress: async () => {
            let res = await updateUserModeRequest({
              variables: {
                input: {
                  mode: "SENIORCITIZEN",
                },
              },
            });
            if (res.data?.updateUserMode) {
              Dispatch(setMyProfile({ ...MyProfile, mode: "SENIORCITIZEN" }));
              navigateAndSimpleReset("Senior", {});
            }
          },
        },
      ],
      { cancelable: false },
    );
  };

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
              <Text style={{ color: "white", marginLeft: 5 }}>
                {t("titles.Back")}
              </Text>
            </Pressable>
            <Pressable
              onPress={onOpen}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Feather
                name="globe"
                size={16}
                color={Colors.light.link}
                style={{ marginRight: 5 }}
              />
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
              name={`${MyProfile?.firstName ?? ""} ${
                MyProfile?.lastName ?? ""
              }`}
              phone={MyProfile?.phone ?? ""}
            />
          </Pressable>
        </View>
        <View style={{ marginHorizontal: 10, marginVertical: 10 }}>
          <UserOrganizations />

          <Pressable
            onPress={onNavigateToSettings}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 5,
            }}
          >
            <AntDesign
              name="setting"
              size={22}
              color={Colors.light.PrimaryColor}
              style={{ marginRight: 10, marginLeft: 5 }}
            />
            <Text style={{ fontSize: 17 }}>{t("navigation.settings")}</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              navigate("AboutContainer");
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 5,
            }}
          >
            <AntDesign
              style={{ marginRight: 10, marginLeft: 5 }}
              name="exclamationcircleo"
              size={21}
              color={Colors.light.PrimaryColor}
            />
            <Text style={{ fontSize: 17 }}>{t("navigation.about")}</Text>
          </Pressable>

          <RemoveProfile />

          <Pressable
            onPress={onNavigateToContacts}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 5,
              width: "90%",
            }}
          >
            <AntDesign
              name="adduser"
              size={22}
              color={Colors.light.PrimaryColor}
              style={{ marginRight: 10, marginLeft: 5 }}
            />
            <NativeText style={{ fontSize: 17, fontFamily: fonts.Lato }}>
              {t("invitation")}
            </NativeText>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL(user_manual_url)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 5,
              width: "90%",
            }}
          >
            <MaterialIcons
              name="help-outline"
              size={22}
              color={Colors.light.PrimaryColor}
              style={{ marginRight: 10, marginLeft: 5 }}
            />
            <NativeText style={{ fontSize: 17, fontFamily: fonts.Lato }}>
              {t("userDatabase.help")}
            </NativeText>
          </Pressable>
          <Pressable
            onPress={switchToSenior}
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 5,
              width: "90%",
            }}
          >
            <MaterialIcons
              name="model-training"
              size={25}
              color={Colors.light.PrimaryColor}
              style={{ marginRight: 10, marginLeft: 5 }}
            />
            <NativeText style={{ fontSize: 17, fontFamily: fonts.Lato }}>
              {t("seniorMode.switch-to-senior")}
            </NativeText>
          </Pressable>
        </View>
      </View>

      <View style={{ marginLeft: 20, paddingTop: 10 }}>
        <Pressable
          disabled={loader}
          onPress={() => _logout()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 20,
          }}
        >
          {loader ? (
            <ActivityIndicator
              color={Colors.light.PrimaryColor}
              style={{ marginLeft: 20 }}
            />
          ) : (
            <>
              <SimpleLineIcons
                name="logout"
                size={20}
                color={Colors.light.link}
                style={{ marginRight: 10 }}
              />
              <Text>{t("navigation.logout")}</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function UserOrganizations() {
  const { t } = useTranslation();
  const Dispatch = useDispatch();
  const OrganisationInvites = useSelector(
    (state: RootState) => state.Organisation.invites,
  );
  const { data, loading, refetch } = useGetMyInvitesQuery();

  const Organisations = useSelector(
    (state: RootState) => state.Organisation.organizations,
  );
  const currentOrganization = useSelector(
    (state: RootState) => state.Organisation.currentOrganization,
  );
  const {
    switchOrganization,
    loading: oraganisationLoader,
    FetchAllOrganisation,
  } = useOrganizations();

  const [active, setActive] = React.useState(false);

  const { fetchAllAssigment } = useTaskReport();
  const [invitationRefresh, setInvitationRefresh] = useAtom(refreshInvite);

  React.useEffect(() => {
    if (data?.getMyInvites) {
      Dispatch(setOrganisationInvites(data?.getMyInvites));
    }
  }, [data]);
  React.useEffect(() => {
    if (invitationRefresh) {
      refetch()
        .then((response) => {
          Dispatch(setOrganisationInvites(response.data.getMyInvites));
        })
        .catch((err) => {
          console.log("Error in refetching organisation invites", err);
        });
      setInvitationRefresh(false);
    }
  }, [invitationRefresh]);

  const onOrganizationInvites = () => {
    navigate("OrganisationInvites", {});
    // navigation.dispatch(DrawerActions.closeDrawer());
  };

  const onChooseOrganization = (organization: Organization) => {
    console.log("Organisation", organization);
    global.activeOrg = organization?._id;
    switchOrganization(organization._id)
      .then((res) => {
        ToastMessage(t("label.organisation-selected"));

        fetchAllAssigment(res);
      })
      .catch((err) => {
        // navigation.dispatch(DrawerActions.closeDrawer());
        // navigate("AssignedScreen", {});
        console.log("Err in switching organisation", err);
      });
  };

  const onToggle = () => {
    FetchAllOrganisation();
    refetch()
      .then((response) => {
        Dispatch(setOrganisationInvites(response.data.getMyInvites));
      })
      .catch((err) => {
        console.log("Error in refetching organisation invites", err);
      });

    setActive(!active);
  };

  return (
    <View>
      <ListItem.Accordion
        content={
          <>
            <View
              style={{
                marginRight: 10,
                padding: 10,
                borderRadius: 10,
                backgroundColor: "rgba(100,100,200,.1)",
              }}
            >
              <SimpleLineIcons
                name="organization"
                color={Colors.light.PrimaryColor}
                size={22}
              />
            </View>
            <ListItem.Content>
              <ListItem.Title style={{ fontFamily: fonts.Lato, fontSize: 17 }}>
                {t("task.myOrganization")}
              </ListItem.Title>
              {!active && (
                <Text size="sm" style={{ color: Colors.light.PrimaryColor }}>
                  {currentOrganization.name ?? t("selectOrg")}
                </Text>
              )}
            </ListItem.Content>
          </>
        }
        containerStyle={{
          padding: 0,
          marginVertical: 5,
          borderColor: Colors.light.White,
        }}
        isExpanded={active}
        onPress={onToggle}
        activeOpacity={1}
        Component={TouchableOpacity}
      >
        <ScrollView style={{ marginBottom: 10, height: 200 }}>
          {Organisations?.map((organization, index) => {
            const active = organization._id === currentOrganization?._id;

            return (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 2,
                  paddingVertical: 5,
                  backgroundColor: active ? "rgba(100,200,100,.1)" : "white",
                }}
                key={index}
                onPress={() => {
                  onChooseOrganization(organization);
                }}
              >
                <View
                  style={{
                    height: 10,
                    width: 10,
                    backgroundColor: active ? "green" : "white",
                    borderRadius: 20,
                    marginHorizontal: 20,
                  }}
                ></View>
                <ListItem.Content>
                  <ListItem.Title
                    style={{
                      fontFamily: fonts.Lato,
                      fontSize: 15,
                      color: active ? "rgba(51,51,51,.8)" : "rgba(51,51,51,.5)",
                    }}
                  >
                    {organization.name}
                  </ListItem.Title>
                </ListItem.Content>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ListItem.Accordion>
      <Pressable
        onPress={onOrganizationInvites}
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 12,
          marginBottom: 8,
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Octicons
            name="organization"
            size={20}
            color={Colors.light.PrimaryColor}
            style={{ marginRight: 6, marginLeft: 8 }}
          />
          <Text style={{ fontFamily: fonts.Lato, fontSize: 17, marginLeft: 5 }}>
            {t("others.Organisation Invites")}
          </Text>
        </View>
        {OrganisationInvites !== undefined &&
          OrganisationInvites.length > 0 && (
            <View
              style={{
                height: 22,
                width: 22,
                backgroundColor: Colors.light.red,
                borderRadius: 50,

                marginTop: 4,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ color: Colors.light.White, fontSize: 15 }}>
                {OrganisationInvites.length}
              </Text>
            </View>
          )}
      </Pressable>
    </View>
  );
}

type UserDetailsProps = {
  name: string;
  phone: string;
};
export function UserDetails({ name, phone }: UserDetailsProps) {
  return (
    <View style={{ marginTop: 10, width: "100%", alignItems: "center" }}>
      <Text
        style={{
          color: Colors.light.lightText,
          fontWeight: "bold",
          fontSize: 17,
          textAlign: "center",
          // width: 180,
        }}
      >
        {name}
      </Text>
      <Text size="xs" style={{ color: Colors.light.gray, textAlign: "center" }}>
        {phone}
      </Text>
    </View>
  );
}

export function Profile() {
  const MyProfile = useAtomValue(currentUserIdAtom);

  if (MyProfile?.profile_img && MyProfile?.profile_img.length > 0) {
    return (
      <FastImage
        source={{
          uri: `${DefaultImageUrl}${MyProfile?.profile_img}`,
          // cache: "",
        }}
        onLoadStart={() => {
          // setImageLoading(true);
        }}
        onLoadEnd={() => {
          // setImageLoading(false);
        }}
        onError={() => {}}
        style={{ height: 70, width: 70, borderRadius: 44 }}
      >
        {/* {imageLoading && (
          <View
            style={{
              height: 70,
              width: 70,
              borderRadius: 44,
              backgroundColor: "rgba(243,243,243,.5)",
              justifyContent: "center",
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        )} */}
      </FastImage>
    );
  } else {
    return <AvatarComponent size={70} />;
  }
}
