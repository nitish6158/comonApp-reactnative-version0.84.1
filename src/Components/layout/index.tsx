import { View } from "react-native";
import * as React from "react";
import { layoutStyle } from "./LayoutStyle";

interface ILayout {
  children: React.ReactNode;
  direction?: "center" | "start" | "end";
  withPadding?: boolean;
  paddingBottom?: string | number;
}

export const Layout = ({ children, direction, withPadding, paddingBottom }: ILayout) => (
  <View
    style={[
      layoutStyle.container,
      layoutStyle.containerBackground,
      direction ? layoutStyle[direction] : null,
      { paddingBottom },
    ]}
  >
    <View style={[layoutStyle.wrapper, withPadding ? layoutStyle.wrapperPadding : null]}>{children}</View>
  </View>
);

Layout.defaultProps = {
  direction: "center",
  withPadding: true,
};
