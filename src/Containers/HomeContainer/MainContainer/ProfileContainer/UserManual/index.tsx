import { View, Text, FlatList, Pressable, Linking } from "react-native";
import React from "react";
import { UserManualScreenProps } from "@/navigation/screenPropsTypes";
import { navigate } from "../../../../../navigation/utility";
import HeaderWithBack from "@Components/header/HeaderWithBack";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { HeaderWithScreenName } from "@/Components/header";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Color from "@/Constants/Colors";
import styles from "@/Components/input/CodeInputStyles";
import { useTranslation } from "react-i18next";
import { user_manual_url } from "@/graphql/provider/endpoints";

let userManualList = [
  {
    language: "English",
    link: user_manual_url,
  },
  {
    language: "German",
    link: user_manual_url,
  },
  {
    language: "French",
    link: user_manual_url,
  },
  {
    language: "Spanish",
    link: user_manual_url,
  },
];

export default function UserManualScreen({
  route,
  navigation,
}: UserManualScreenProps) {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <HeaderWithScreenName title={t("userDatabase.user-manual")} />
      <View style={{ paddingHorizontal: 40, marginTop: 20 }}>
        <FlatList
          data={userManualList}
          renderItem={({ item, index }) => {
            return (
              <Pressable
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
                onPress={() => Linking.openURL(item.link)}
              >
                <Text style={{ fontSize: 16 }}>{item.language}</Text>
                <View>
                  <MaterialCommunityIcons
                    name="web"
                    size={32}
                    color={Color.light.PrimaryColor}
                  />
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}
