import React from "react";
import ReactTestRenderer, { act } from "react-test-renderer";
import SearchInput from "../src/Components/input/SearchInput";
import { TextInput, Pressable, View } from "react-native";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("@/Components/icons", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    AppIcon: (props: any) => React.createElement(View, { testID: "app-icon", ...props }),
    VectorIconCompat: (props: any) => React.createElement(View, { testID: "vector-icon", ...props }),
  };
});

describe("SearchInput component", () => {
  it("renders with standard value and onChangeText", () => {
    const onChange = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <SearchInput value="test" onChangeText={onChange} />
      );
    });

    const textInput = tree!.root.findByType(TextInput);
    expect(textInput.props.value).toBe("test");

    act(() => {
      textInput.props.onChangeText("new value");
    });
    expect(onChange).toHaveBeenCalledWith("new value");
    act(() => {
      tree!.unmount();
    });
  });

  it("renders with legacy SearchValue and SetSearchValue", () => {
    const setVal = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <SearchInput SearchValue="legacy" SetSearchValue={setVal} placeHolder="Search Here" />
      );
    });

    const textInput = tree!.root.findByType(TextInput);
    expect(textInput.props.value).toBe("legacy");
    expect(textInput.props.placeholder).toBe("Search Here");

    act(() => {
      textInput.props.onChangeText("typed query");
    });
    expect(setVal).toHaveBeenCalledWith("typed query");
    act(() => {
      tree!.unmount();
    });
  });

  it("clears text when close icon is pressed", () => {
    const onChange = jest.fn();
    let tree: ReactTestRenderer.ReactTestRenderer;
    act(() => {
      tree = ReactTestRenderer.create(
        <SearchInput value="clearable" onChangeText={onChange} />
      );
    });

    const pressable = tree!.root.findByProps({ testID: "clear-search-button" });
    act(() => {
      pressable.props.onPress();
    });
    expect(onChange).toHaveBeenCalledWith("");
    act(() => {
      tree!.unmount();
    });
  });
});
