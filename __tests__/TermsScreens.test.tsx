import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockVoipRequest = jest.fn();
const mockRequestPerm = jest.fn(async () => "granted");
const mockSetMyProfile = jest.fn((u) => ({ type: "setMyProfile", payload: u }));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children, ...p }: any) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, p, children);
  },
}));
jest.mock("react-native-elements", () => ({
  Text: ({ children, ...p }: any) => {
    const React = require("react");
    const { Text } = require("react-native");
    return React.createElement(Text, p, children);
  },
}));
jest.mock("react-native-autolink", () => ({ text }: any) => {
  const React = require("react");
  const { Text } = require("react-native");
  return React.createElement(Text, null, text);
});
jest.mock("@Components/Button/arrowDown", () => ({
  ArrowDown: () => null,
}));
jest.mock("react-native-voips-calls", () => ({
  RNVoipPushKit: { requestPermissions: () => mockVoipRequest() },
}));
jest.mock("@Navigation/utility", () => ({
  navigate: (...args: any[]) => mockNavigate(...args),
}));
jest.mock("@Util/permissionUtils", () => ({
  requestUserPermission: () => mockRequestPerm(),
}));
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
}));
jest.mock("@/redux/Reducer/ChatReducer", () => ({
  setMyProfile: (u: any) => mockSetMyProfile(u),
}));
jest.mock("@Components/layout/LayoutStyle", () => ({
  layoutStyle: { containerBackground: {}, wrapperPadding: {} },
}));

import TermsScreen from "../src/Containers/TermsScreen";
import TermsAndConditionsScreen from "../src/Containers/AuthContainer/TermsAndConditionsContainer/TermsAndConditionsScreen";
import { TermsView } from "../src/Components/TermsView";

describe("TermsScreen & TermsAndConditionsScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders TermsScreen and forwards decline/agree callbacks", () => {
    const onAgree = jest.fn();
    const onDecline = jest.fn();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(<TermsScreen onAgree={onAgree} onDecline={onDecline} />);
    });
    const view = tree.root.findByType(TermsView);
    view.props.onAgree();
    view.props.onDecline();
    expect(onAgree).toHaveBeenCalled();
    expect(onDecline).toHaveBeenCalled();
    act(() => tree.unmount());
  });

  it("renders TermsAndConditionsScreen, requests iOS VoIP permissions, and updates profile on Agree/Decline", async () => {
    (Platform as any).OS = "ios";
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({ _id: "u1", phoneConfirmed: false })
    );

    let tree!: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(<TermsAndConditionsScreen route={{} as any} navigation={{} as any} />);
    });

    expect(mockVoipRequest).toHaveBeenCalled();
    expect(mockRequestPerm).toHaveBeenCalled();

    const view = tree.root.findByType(TermsView);
    act(() => {
      view.props.onDecline();
    });
    expect(mockNavigate).toHaveBeenCalledWith("Login", { showModal: true });

    await act(async () => {
      await view.props.onAgree();
    });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "MyProfile",
      JSON.stringify({ _id: "u1", phoneConfirmed: true })
    );
    expect(mockDispatch).toHaveBeenCalled();
    act(() => tree.unmount());
  });
});

