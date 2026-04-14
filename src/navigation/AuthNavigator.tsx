import * as React from "react";

import { StackScreenProps, createStackNavigator } from "@react-navigation/stack";

import { AuthNavigatorParamList } from "./screenPropsTypes";
import ConfirmScreen from "@Containers/AuthContainer/ConfirmOTPContainer/ConfirmScreen";
import ForgotPasswordScreen from "@Containers/AuthContainer/ForgotPasswordContainer/ForgotPasswordScreen";
import { HeaderWithScreenName } from "@Components/header/HeaderWithScreenName";
import { LoginScreen } from "@Containers/AuthContainer/LoginContainer/LoginScreen";
import NotFoundScreen from "@Containers/AuthContainer/PageNotFoundContainer/NotFoundScreen";
import { ResetPasswordScreen } from "@Containers/AuthContainer/ResetPasswordContainer/ResetPasswordSceeen";
import { SignUpScreen } from "@Containers/AuthContainer/NewSignUpContainer/SignUpScreen";
import branch from "react-native-branch";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/core";
import { usePhoneContext } from "@/hooks";
import { atom, useSetAtom } from "jotai";

const AuthStack = createStackNavigator<AuthNavigatorParamList>();

export const branchAtom = atom({
  phoneNumber: "",
  region: "",
});

export function AuthNavigator() {
  const navigation = useNavigation();
  const { setCode } = usePhoneContext();
  const setBranchParams = useSetAtom(branchAtom);

  useEffect(() => {
    const subscription = branch.subscribe({
      onOpenStart: ({ uri, cachedInitialEvent }) => {
        // console.log("subscribe onOpenStart, will open " + uri + " cachedInitialEvent is " + cachedInitialEvent);
      },
      onOpenComplete: async ({ error, params, uri }) => {
        if (error) {
          console.error("subscribe onOpenComplete, Error from opening uri: " + uri + " error: " + error);
          return;
        } else if (params) {
          if (params["~tags"]?.length && params["~campaign"]?.includes("Auth/Registration")) {
            setCode(params["~tags"][1]);
            console.log("onOpenComplete");
            setBranchParams({
              phoneNumber: params["~tags"][0],
              region: params["~tags"][1],
            });

            navigation.navigate("Registration", {
              phoneNumber: params["~tags"][0],
              region: params["~tags"][1],
            });
          }
        }
      },
    });
    return () => subscription();
  }, []);

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen
        name="Login"
        component={LoginScreen}
        initialParams={{ showModal: false }}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen
        name="Registration"
        component={SignUpScreen}
        options={{
          headerShown: false,
        }}
      />
      <AuthStack.Screen
        name="Verification"
        component={ConfirmScreen}
        options={{
          headerShown: true,
          header: () => (
            <HeaderWithScreenName title="navigation.back" navigateNested={{ page: "Login", screen: "Login" }} />
          ),
        }}
      />

      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerShown: false,
        }}
      />
      <AuthStack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          headerShown: false,
        }}
      />
      <AuthStack.Screen name="NotFound" component={NotFoundScreen} />
    </AuthStack.Navigator>
  );
}
