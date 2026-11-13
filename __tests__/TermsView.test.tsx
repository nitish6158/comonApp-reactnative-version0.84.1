import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import { ScrollView, Pressable, Text } from "react-native";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));
jest.mock("react-native-autolink", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ text }: { text: string }) => React.createElement(Text, null, text);
});
jest.mock("react-native-elements", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return { Text: ({ children }: any) => React.createElement(Text, null, children) };
});
jest.mock("@Components/Button/arrowDown", () => {
  const React = require("react");
  const { Pressable } = require("react-native");
  return { ArrowDown: ({ onPress }: any) => React.createElement(Pressable, { testID: "arrow-down", onPress }) };
});

import { TermsView } from "../src/Components/TermsView";

describe("TermsView", () => {
  it("renders terms, unlocks Agree button after scroll, and handles button presses", () => {
    const onAgree = jest.fn();
    const onDecline = jest.fn();

    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <TermsView
          boxStyle={{}}
          onAgree={onAgree}
          onDecline={onDecline}
          titleSlot={<Text>Terms Title</Text>}
        />
      );
    });

    const scrollView = tree.root.findByType(ScrollView);
    const declineBtn = tree.root.find((n) => n.props?.onPress === onDecline);
    const agreeBtn = tree.root.find((n) => n.props?.onPress === onAgree);
    const arrowDown = tree.root.findByProps({ testID: "arrow-down" });

    expect(agreeBtn.props.disabled).toBe(true);

    // Arrow press before scrolling down calls scrollToEnd
    act(() => {
      arrowDown.props.onPress();
    });

    act(() => {
      declineBtn.props.onPress();
      scrollView.props.onScroll({
        nativeEvent: {
          contentSize: { height: 5000 },
          layoutMeasurement: { height: 500 },
          contentOffset: { y: 4500 },
        },
      });
    });

    expect(onDecline).toHaveBeenCalled();

    const updatedAgreeBtn = tree.root.find((n) => n.props?.onPress === onAgree);
    expect(updatedAgreeBtn.props.disabled).toBe(false);

    act(() => {
      updatedAgreeBtn.props.onPress();
    });
    expect(onAgree).toHaveBeenCalled();

    // Arrow press after scrolling past 4000 calls scrollTo({ y: 0 })
    act(() => {
      arrowDown.props.onPress();
    });
    act(() => tree.unmount());
  });

  it("renders loader when loader prop is true", () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <TermsView
          boxStyle={{}}
          loader={true}
          onAgree={jest.fn()}
          onDecline={jest.fn()}
          titleSlot={<Text>Terms</Text>}
        />
      );
    });
    expect(tree.toJSON()).toBeTruthy();
    act(() => tree.unmount());
  });
});

