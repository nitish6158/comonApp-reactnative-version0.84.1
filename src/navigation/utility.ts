import { CommonActions, createNavigationContainerRef } from "@react-navigation/native";
import { StackActions } from "@react-navigation/native";
import { RootStackParamList } from "./Application";
import {
  AuthNavigatorParamList,
  TaskTabNavigatorParamList,
  BottomTabParamsList,
  ChatStackParamList,
  CallTabStackParamsList,
  MainNavigatorParamList,
} from "./screenPropsTypes";

export const navigationRef = createNavigationContainerRef();
export type AllScreenParamList = RootStackParamList &
  AuthNavigatorParamList &
  TaskTabNavigatorParamList &
  BottomTabParamsList &
  ChatStackParamList &
  CallTabStackParamsList &
  MainNavigatorParamList;

type newScreens = {
  name: string;
  payload: {};
};

export const navigate = (name: keyof AllScreenParamList, params: any) => {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
};

export const navigateBack = () => {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
};
export const navigateAndReset = (routes = [], index = 0) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes,
      })
    );
  }
};

export const navigateAndSimpleReset = (name: keyof AllScreenParamList, params: any, index = 0) => {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      CommonActions.reset({
        index,
        routes: [{ name, params }],
      })
    );
  }
};

export function getCurrentRoute() {
  return navigationRef.getCurrentRoute()?.name;
}

export function navigateAndReplace(name: keyof AllScreenParamList, params: any) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      StackActions.replace(name, params)
    );
  }
}
