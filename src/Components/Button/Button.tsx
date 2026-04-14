import * as React from "react";

import { Pressable, PressableProps, useWindowDimensions } from "react-native";
import { ButtonProps as ReactElementButtonProps, Button as ReactNativeElementButton } from "react-native-elements";
import { mainStyles, typographyStyles } from "../../styles/main";

import { Loader } from "../Loader";
import Text from "../Text";
import { buttonStyles } from "./BottonStyles";

interface ButtonProps extends PressableProps {
  onPress: () => void;
  index: number;
  title: string;
  variant?: "default" | "gray";
  loader?: boolean;
}

export const Button = ({
  onPress,
  index,
  title,
  style,
  loader,
  disabled,
  variant = "default",
  ...props
}: ButtonProps) => {
  const btnStyleDisabled = (variant && variant === "gray") || disabled;

  return (
    <Pressable
      onPress={onPress}
      style={[
        mainStyles.flex1,
        (index + 1) % 2 === 0 ? mainStyles.offsetLeftXl : undefined,
        index + 1 >= 3 ? mainStyles.offsetTopMd : mainStyles.offsetTopLg,
        buttonStyles.containerButton,
        btnStyleDisabled ? buttonStyles.disabledContainer : undefined,
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      {loader ? (
        <Loader smallSize={true} />
      ) : (
        <Text
          size="sm"
          lineNumber={15}
          style={[buttonStyles.textButton, btnStyleDisabled ? buttonStyles.disabledText : undefined]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

interface ElementButtonProps extends ReactElementButtonProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "xxl";
}

export const ElementButton = ({ size = "md", style, ...props }: ElementButtonProps) => {
  const { fontScale } = useWindowDimensions();
  const styles = typographyStyles(fontScale);
  return <ReactNativeElementButton titleStyle={[styles[size], style]} {...props} />;
};
