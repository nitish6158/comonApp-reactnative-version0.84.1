import { ActivityIndicator, Platform, Pressable, Text, View, useWindowDimensions } from "react-native";
import { AllScreenParamList, navigate, navigateBack } from "@Navigation/utility";
import { mainStyles, typographyStyles } from "../../styles/main";

import Colors from "@/Constants/Colors";
import { ListItem } from "react-native-elements";
import React from "react";
import { TouchableOpacity } from "react-native";
import { goBackStyles } from "../goBack/GoBackStyles";
import { headerStyle } from "./HeaderStyle";
import { layoutStyle } from "../layout/LayoutStyle";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CommonHeader({
  title,
  screenName,
  screenParam,
  onPressRefresh,
  refreshRequired,
  refreshing,
  loaderColor,
  isModal,
  onPress,
  actionButton,
  subTitle
}: {
  title: string;
  screenName?: AllScreenParamList;
  screenParam?: any;
  onPressRefresh?: Function;
  refreshRequired?: Boolean;
  refreshing?: Boolean;
  isModal?: Boolean;
  onPress?: Function;
  actionButton?: React.ReactNode;
  subTitle?:string
  loaderColor?:string
}) {
  const { t } = useTranslation();
  const { fontScale } = useWindowDimensions();
  const typography = typographyStyles(fontScale);
  const insets = useSafeAreaInsets();

  screenParam = screenParam ? screenParam : {};

  return (
    <View
      style={[
  headerStyle.header,
  mainStyles.row,
  layoutStyle.containerBackground,
  headerStyle.headerWithScreenName,
  {
    height: Platform.OS === "ios" 
      ? 2 + Math.max(insets.top, 10) 
      : 55 + Math.max(insets.top, 10),
  
  },
]}
    >
      <Pressable
        onPress={() => {
          if (isModal && onPress) {
            onPress();
            return;
          }

          navigateBack();
        }}
        style={[mainStyles.center, goBackStyles.container]}
      >
        <ListItem.Chevron style={mainStyles.rotate} size={30} color={Colors.light.text} />
      </Pressable>
      <ListItem.Content>
        <ListItem.Title style={typography.md}>{t(title)}</ListItem.Title>
        {subTitle && <Text style={{fontSize:12,color:'gray'}}>{subTitle}</Text>}
      </ListItem.Content>
      {refreshRequired && (
        <TouchableOpacity onPress={onPressRefresh} disabled={refreshing}>
          {refreshing ? (
            <ActivityIndicator color={loaderColor ?? Colors.light.PrimaryColor} />
          ) : (
            <ListItem.Title style={{ color: Colors.light.PrimaryColor }}>{t("others.Refresh")}</ListItem.Title>
          )}
        </TouchableOpacity>
      )}
      {actionButton && actionButton}
     
    </View>
  );
}
