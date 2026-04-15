import * as React from "react";

import {
  Alert,
  Image,
  Linking,
  Platform,
  View,
  Text as NativeText,
} from "react-native";
import { Button, CheckBox, Dialog } from "react-native-elements";
import { currentUserIdAtom } from "@Atoms/RealmloginManager";
import { useEffect, useState } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  useLogoutDevicesMutation,
  useSigninMutation,
} from "@Service/generated/auth.generated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTimeZone } from "react-native-localize";

import DeviceInfo from "react-native-device-info";
// import { PhoneType } from "../../utils/context/PhoneProvider";
import { Form } from "./Form";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Layout } from "@Components/layout";
import { LoginScreenProps } from "@Navigation/screenPropsTypes";
import Logo from "@Images/logo.png";
import {
  BuildType,
  PRIVACY_POLICY,
  PUBLIC_API,
} from "@Service/provider/endpoints";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { asyncStorageKeys } from "@/Constants/asyncStorageKeys";
import { loginScreenStyles } from "./LoginScreenStyles";
import { mainStyles } from "../../../styles/main";
import messaging from "@react-native-firebase/messaging";
import moment from "moment-timezone";
import { removeSession, SessionKeys, setSession } from "@Util/session";
import { useAtom, useSetAtom } from "jotai";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import Ionicons from "react-native-vector-icons/Ionicons";
// import { useApp } from "@realm/react";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";
import { PhoneType } from "@/Context";
import RBSheet, { RBSheetProps } from "react-native-raw-bottom-sheet";
import TermsScreen from "@/Containers/TermsScreen";
import { user } from "@/schemas/schema";
import { windowHeight } from "@/utils/ResponsiveView";
import { useUpdateUserMutation } from "@/graphql/generated/user.generated";
import VersionCheck from "react-native-version-check";
import { storage } from "@/redux/backup/mmkv";
import { keys } from "@/redux/backup/keys";
import { usePhoneContext } from "@/hooks";
import { navigateAndSimpleReset } from "@/navigation/utility";
import { AuthContext } from "@/Components/AuthContext";
import {
  PlateformType,
  useRequestEmailConfirmQuery,
  useRequestEmailConfirmLazyQuery,
} from "@Service/generated/auth.generated";
import EmailConfirmationModal from "../NewSignUpContainer/EmailConfirmationModal";
import { getFirebaseMessagingToken } from "@/utils/firebaseMessaging";

type payloadType = {
  phone: string;
  password: string;
  timezone: string;
  buildId: string;
  OSVersion: string;
  device: {
    token: string;
    fcmToken: string;
    type: PlateformType;
  };
};

const SeasonSchema = z.object({
  token: z.string(),
  refresh: z.string(),
  mode: z.string(),
  expireAt: z.number(),
});

export function LoginScreen({ route, navigation }: LoginScreenProps) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const { phone, setPhone, setCode } = usePhoneContext();
  const { setTokenLogin, tokenLogin } = React.useContext(AuthContext);
  console.log("LOGIN SCREEN TOKEN:", tokenLogin);
  const { t } = useTranslation();
  // const app = useApp();
  const termsTranslate = useTranslation("terms").t;
  const [checked, setChecked] = useState(true);
  const [loader, setLoader] = useState(false);

  const dispatch = useDispatch();

  const [LoginRequest, LoginResponse] = useSigninMutation();
  const [updateAgreeStatus] = useUpdateUserMutation();
  const [logoutDevicesRequest, {}] = useLogoutDevicesMutation();
  const setCurrentId = useSetAtom(currentUserIdAtom);
  const [tempPayload, setTeamPayload] = useState<payloadType | null>(null);
  const [waitingPayload, setWaitingPayload] = useState<{
    user: user;
    mode: string;
    password: string;
  } | null>(null);
  const termsSheetRef = React.useRef<RBSheetProps>(null);

  const [showMailConfirmModal, setShowMailConfirmModal] = useState(false);

  const [requestEmailConfirm, { data, loading, error }] =
    useRequestEmailConfirmLazyQuery({});

  useEffect(() => {
    handleLoginResponse();
  }, [LoginResponse.data, LoginResponse.error]);

  return (
    <KeyboardAwareScrollView
      nestedScrollEnabled
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      extraScrollHeight={20}
      style={{ flex: 1, backgroundColor: "white" }}
    >
      <Layout withPadding>
        <View style={mainStyles.center}>
          <Image
            source={Logo}
            style={[loginScreenStyles.logo, mainStyles.offsetBottomMd]}
          />
        </View>
        <Text h4 style={loginScreenStyles.title}>
          {t("sign-in.title")}
        </Text>
        <Form onSubmit={onLoginRequested} loading={loader} />
        <View
          style={[
            mainStyles.row,
            mainStyles.alignCenter,
            mainStyles.flexWrap,
            // loginScreenStyles.privacyBox,
            { alignSelf: "center", marginBottom: 20 },
          ]}
        >
          <CheckBox
            checked={checked}
            onPress={onSetChecked}
            containerStyle={[loginScreenStyles.privacyCheckbox]}
          />
          <Text size="xs">{termsTranslate("terms.privacy")}</Text>
          <Text
            size="xs"
            style={[loginScreenStyles.privacyLink, mainStyles.link]}
            onPress={onGoPrivacyPolicy}
          >
            {termsTranslate("terms.privacy-link")}
          </Text>
        </View>

        <Button
          title={t("sign-in.actions.text") + " Register Here"}
          onPress={() => {
            navigation.navigate("Registration", {});
            // navigation.navigate("OtpVerify", {
            //   phone: "+91 99999 12345",
            //   email: "sourav.r@test.com",
            // });
          }}
          buttonStyle={{ borderRadius: 10, height: 45 }}
        />

        {BuildType == "dev" && (
          <View style={{ alignSelf: "center", marginTop: 10 }}>
            <Text size="xs" style={{ color: "gray", opacity: 0.8 }}>
              Build No: {DeviceInfo.getVersion()} (
              {DeviceInfo.getBuildNumber() ?? "-"})
            </Text>
            <Text size="xs" style={{ color: "gray", opacity: 0.8 }}>
              Server:
              {PUBLIC_API == "https://comon.axiusstaging.in"
                ? "Development"
                : "Staging"}
            </Text>
          </View>
        )}
        <Dialog
          isVisible={showModal}
          overlayStyle={loginScreenStyles.modalOverlay}
        >
          <NativeText
            style={{
              fontSize: 25,
              textAlign: "center",
              marginBottom: 15,
              fontWeight: "500",
            }}
          >
            Alert
          </NativeText>
          <NativeText
            style={{ fontSize: 16, textAlign: "center", marginBottom: 30 }}
          >
            {termsTranslate("terms.login-modal")}
          </NativeText>
          {/* <View style={{ marginBottom: 20 }}>
            <Chip
              containerStyle={{ justifyContent: "space-between", paddingHorizontal: 20, height: 55, marginBottom: 8 }}
              labelStyle={{ fontSize: 16 }}
              label="+49 172 2804503"
              onPress={openHelpPhone}
              leftElement={<Ionicons name="call" size={22} color="black" />}
            />
            <Chip
              containerStyle={{ justifyContent: "space-between", paddingHorizontal: 20, height: 55, marginBottom: 8 }}
              labelStyle={{ fontSize: 16 }}
              label="M.Ketteler@gmx.de"
              onPress={openHelpMail}
              leftElement={<Ionicons name="mail" size={22} color="black" />}
            />
          </View> */}

          <Button
            title={t("btn.cancel")}
            containerStyle={{ borderRadius: 20 }}
            onPress={onCloseModal}
          />
        </Dialog>
      </Layout>

      <EmailConfirmationModal
        visible={showMailConfirmModal}
        onClose={() => {
          setShowMailConfirmModal(false);
        }}
      />
      <RBSheet
        height={windowHeight}
        ref={termsSheetRef}
        closeOnDragDown={false}
        closeOnPressBack={false}
        closeOnPressMask={false}
      >
        <TermsScreen
          onDecline={onTermDecline}
          onAgree={() => {
            if (waitingPayload) {
              termsSheetRef.current?.close();
              AsyncStorage.setItem(
                "MyProfile",
                JSON.stringify(waitingPayload?.user),
              );
              const id = waitingPayload.user._id;
              setCurrentId(waitingPayload.user);
              dispatch(setMyProfile(waitingPayload?.user));
              console.log(
                "topic Subscribe success",
                `${waitingPayload?.mode}_user_id_${id}`,
              );
              messaging().subscribeToTopic(
                `${waitingPayload?.mode}_user_id_${id}`,
              );

              const result = SeasonSchema.safeParse({
                token: LoginResponse?.data?.signin.token,
                refresh: LoginResponse?.data?.signin.refresh,
                mode: LoginResponse?.data?.signin.mode,
                expireAt: LoginResponse?.data?.signin?.expiredAt,
              });

              if (result.success && tempPayload) {
                setSession(result.data);
                updateAgreeStatus({
                  variables: {
                    input: {
                      _id: waitingPayload?.user._id,
                      timezone: getTimeZone(),
                      isAgree: true,
                    },
                  },
                }).then((res) => {
                  let email = waitingPayload?.user?.email;
                  let password = waitingPayload?.password;
                  handleRealmLogin(email, password);
                });
              }
            }
          }}
        />
      </RBSheet>
    </KeyboardAwareScrollView>
  );

  function onTermDecline() {
    termsSheetRef.current?.close();
    setLoader(false);
    setTimeout(() => {
      setShowModal(true);
    }, 1000);
  }

  async function onLoginRequested(data: {
    phone: PhoneType;
    password: string;
  }) {
    try {
      if (!checked) {
        ToastMessage(t("termsAndConditionAgreement"));
        return;
      }
      setLoader(true);

      const deviceToken = await AsyncStorage.getItem(
        asyncStorageKeys.deviceToken,
      );
      const fcmToken = await getFirebaseMessagingToken().catch(() => "");
      const uniqueId = await DeviceInfo.getUniqueId();
      const loginDeviceToken =
        Platform.OS === "ios" ? deviceToken || uniqueId || fcmToken : uniqueId;
      const tokenCheck = Platform.select({
        ios: loginDeviceToken,
        android: fcmToken,
      });

      if (!tokenCheck) {
        ToastMessage(t("deviceConfigIssue"));
        setLoader(false);
        return;
      }

      const platformType =
        Platform.OS === "ios" ? PlateformType.IOs : PlateformType.Android;
      storage.set(
        keys.device,
        JSON.stringify({
          token: loginDeviceToken,
          fcmToken: fcmToken,
          type: platformType,
        }),
      );
      await AsyncStorage.setItem(
        "COM_ON_LOGIN_DEVICE",
        JSON.stringify({
          token: loginDeviceToken,
          fcmToken: fcmToken,
          type: platformType,
        }),
      );

      const payload = {
        phone: data.phone.formattedNumber.replace(/\s+/g, ""),
        password: data.password,
        timezone: moment.tz.guess(),
        buildId: DeviceInfo.getModel(),
        OSVersion: DeviceInfo.getSystemVersion(),
        appVersion: VersionCheck.getCurrentVersion(),
        // device: {
        //   token: '',
        //   fcmToken: 'fcmToken',
        //   type: Platform.OS === "ios" ? "iOS" : "ANDROID",
        // },
        device: {
          token: loginDeviceToken,
          fcmToken: fcmToken,
          type: platformType,
        },
      };

      setTeamPayload(payload);
      console.log(payload);
      await LoginRequest({
        variables: {
          input: payload,
        },
      });
    } catch (error) {
      console.error("Error in logging in", error);
      setLoader(false);
    }
  }

  async function logoutDevices(token: string) {
    if (!token) {
      ToastMessage("Something went wrong");
      return;
    }

    setLoader(true);
    try {
      await AsyncStorage.setItem(SessionKeys.TOKEN, token);
      const response = await logoutDevicesRequest();

      ToastMessage(
        `${response.data?.logoutDevices?.message ?? ""}. ${t(
          "label.now-try-to-login-again",
        )}`,
      );
    } catch (err) {
      console.log("Error in logout devices request", err);
      ToastMessage("Something went wrong");
    } finally {
      await removeSession();
      await AsyncStorage.removeItem(SessionKeys.MODE);
      setLoader(false);
    }
  }

  // async function logoutDevices() {
  //   await AsyncStorage.removeItem("session_token");
  //   setToken(null);

  //   // optional
  //   // realm.write(() => realm.deleteAll());
  // }
  async function handleLoginResponse() {
    if (LoginResponse?.error) {
      setLoader(false);
      console.log("hwdgbhjwgb", JSON.stringify(LoginResponse?.error));
      if (LoginResponse.error.graphQLErrors[0]) {
        let error = LoginResponse.error.graphQLErrors[0];
        let code = error?.extensions?.exception?.response?.code;
        console.log("code", code);

        switch (code) {
          case 1:
            ToastMessage(t("account-not-found"));
            break;
          case 2:
            ToastMessage(t("account-password-wrong"));
            break;
          case 3:
            Alert.alert(
              "Force Logout ?",
              `${t("account-already-login")} ${
                error?.extensions?.exception?.response?.buildId ??
                "other device"
              }, ${t("account-logout")} ${
                error?.extensions?.exception?.response?.buildId ??
                "other device"
              }.`,
              [
                {
                  text: "Cancel",
                  onPress: () => console.log("Cancel Pressed"),
                  style: "cancel",
                },
                {
                  text: "OK",
                  onPress: () => {
                    logoutDevices(
                      error?.extensions?.exception?.response?.token,
                    );
                  },
                },
              ],
            );
            break;

          default:
            break;
        }
      }
    }
    if (LoginResponse?.data?.signin) {
      console.log("LoginResponse", JSON.stringify(LoginResponse?.data));
      let user = LoginResponse?.data?.signin.user;
      let mode = LoginResponse?.data.signin.mode;
      let isAgree = user.isAgree;

      // mail not confirmed
      if (!user.emailConfirmed) {
        setLoader(false);
        setShowMailConfirmModal(true);
        await requestEmailConfirm({
          variables: {
            input: { user: LoginResponse?.data?.signin.user },
          },
        });
        return;
      }

      setWaitingPayload({ user, password: tempPayload?.password, mode });

      if (isAgree) {
        AsyncStorage.setItem("MyProfile", JSON.stringify(user));
        const id = user._id;
        setCurrentId(user);
        dispatch(setMyProfile(user));
        console.log("topic Subscribe success", `${mode}_user_id_${id}`);
        // await messaging().subscribeToTopic(`${mode}_user_id_${id}`);

        const result = SeasonSchema.safeParse({
          token: LoginResponse?.data?.signin.token,
          refresh: LoginResponse?.data?.signin.refresh,
          mode: LoginResponse?.data?.signin.mode,
          expireAt: LoginResponse?.data?.signin?.expiredAt,
        });

        if (result.success && tempPayload) {
          console.log("Setting session data", result.data.token);
          setSession(result.data);
          let email = user.email;
          let password = tempPayload?.password;
          setLoader(false);
          setTokenLogin(result?.data?.token);
          // handleRealmLogin(email, password);
        }
      } else {
        termsSheetRef.current?.open();
      }
    }
  }

  // async function handleRealmLogin(email: string, password: string) {
  //   try {
  //     //if user not have register with realm before then register user with realm.
  //     //this register is needed for users that already have account on comon but not on realm.
  //     //if user email is already present in realm then catch block will do login process for the users that already have account on realm.
  //     await app.emailPasswordAuth.registerUser({ email, password });
  //     try {
  //       //if new user register with realm then we are going login process.
  //       //after login user can access realmDB and navigate to Main app.
  //       await app.logIn(Realm.Credentials.emailPassword(email, password));
  //       setLoader(false);

  //     } catch (loginError) {
  //       console.log("Error in login", JSON.stringify(loginError));
  //     }
  //   }
  //   catch (registerError) {
  //     //if user come to catch block it means user already have account on Realm.
  //     console.log("Error in register", JSON.stringify(registerError));
  //     try {
  //       //in some cases user come to catch block because of password change so we are also insuring that users comon password and realm password must be same.
  //       await app.emailPasswordAuth.callResetPasswordFunction({
  //         email,
  //         password,
  //       });
  //       try {
  //         //hear we are going login process for user that already have account on realm.
  //         let res = await app.logIn(
  //           Realm.Credentials.emailPassword(email, password)
  //         );
  //         setLoader(false);
  //         console.log("success on login", res);
  //       } catch (loginErrorAfterReset) {
  //         setLoader(false);
  //         console.log("LOGIN AFTER RESET ERROR ---->", JSON.stringify(loginErrorAfterReset));
  //       }
  //     } catch (resetPasswordError) {
  //        setLoader(false);
  //        console.log("RESET PASSWORD ERROR ---->", JSON.stringify(resetPasswordError));
  //     }
  //   }
  // }
  async function handleRealmLogin(email: string, password: string) {
    try {
      // 🚫 Realm sync disabled — skipping login
      console.log("Realm login skipped (sync disabled)");
    } catch (e) {
      console.log("Realm login skipped (error)", e);
    } finally {
      // 👇 ALWAYS stop loader and move to app
      setLoader(false);
      navigation.replace("Main");
    }
  }

  function onSetChecked() {
    setChecked(!checked);
  }

  function onGoPrivacyPolicy() {
    Linking.openURL(PRIVACY_POLICY);
  }

  function onCloseModal() {
    setShowModal(false);
  }

  function openHelpPhone() {
    Linking.openURL("tel:+491722804503");
  }

  function openHelpMail() {
    Linking.openURL("mailto://M.Ketteler@gmx.de");
  }
}
