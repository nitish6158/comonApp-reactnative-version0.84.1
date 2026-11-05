import { Image, View } from "react-native";

import { Layout } from "./layout";
import ListEmpty from "@Images/list-empty.png";
import React from "react";
import Text from "./Text";
import { loginScreenStyles } from "@Containers/AuthContainer/LoginContainer/LoginScreenStyles";
import { mainStyles } from "../styles/main";
import { useTranslation } from "react-i18next";

export const EmptyList: React.FC<{ title: string }> = ({ title }) => {
  const { t } = useTranslation();

  return (
    <Layout direction="start">
      <View style={[mainStyles.center, mainStyles.offsetTopLg]}>
        <Image source={ListEmpty} style={[loginScreenStyles.logo, mainStyles.offsetBottomMd]} />
        <Text size="md" lineNumber={3} style={{ textAlign: "center" }}>
          {t(title)}
        </Text>
      </View>
    </Layout>
  );
};
