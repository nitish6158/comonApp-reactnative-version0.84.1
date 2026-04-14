import React from "react";
import { View } from "react-native";
import HeaderWithAction from "@Components/header/HeaderWithAction";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTranslation } from "react-i18next";
import Media from "./Media";
import Links from "./Links";
import Docs from "./Docs";
import Audio from "./Audio";
import { ChatMediaScreenProps } from "@/navigation/screenPropsTypes";
import { useRoomMediaAndDocsProcessor } from "@/hooks/useRoomMediaAndDocsProcessor";

const Tab = createMaterialTopTabNavigator();

export default function MediaLinkAndDocs({ navigation, route }: ChatMediaScreenProps) {
  const { Name } = route.params;
  const { t } = useTranslation();

  // Use the custom hook to process media and docs
  useRoomMediaAndDocsProcessor();

  return (
    <View style={{ flex: 1 }}>
      <HeaderWithAction
        screenName={t("titles.Back")}
        onBackPress={() => {
          navigation.goBack();
        }}
        isActionVisible={false}
        ActionComponent={() => {
          return <></>;
        }}
      />
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={{
            tabBarIndicatorStyle: { backgroundColor: "#33CCFF" },
            tabBarStyle: { backgroundColor: "white" },
            tabBarActiveTintColor: "black",
          }}
          initialRouteName={t("navigation.Media")}
        >
          <Tab.Screen
            name={t("navigation.Media")}
            children={() => <Media name={Name} />}
          />
          <Tab.Screen
            name={t("navigation.Links")}
            children={() => <Links name={Name} />}
          />
          <Tab.Screen
            name={t("navigation.Docs")}
            children={() => <Docs name={Name} />}
          />
          <Tab.Screen
            name={t("moreOption.audio")}
            children={() => <Audio name={Name} />}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
}
