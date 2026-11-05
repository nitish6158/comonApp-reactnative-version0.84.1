import * as React from "react";

import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { currentUserIdAtom } from "@Atoms/RealmloginManager";
import { navigate } from "@Navigation/utility";
import { useRef, useState } from "react";

import { ArrowDown } from "@Components/Button/arrowDown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "@Components/Button/Button";
import Colors from "@/Constants/Colors";
import { RNVoipPushKit } from "react-native-voips-calls";
import { TermsScreenProps } from "@/navigation/screenPropsTypes";
import { Text } from "react-native-elements";
import { layoutStyle } from "@Components/layout/LayoutStyle";
import { mainStyles } from "../../../styles/main";
import { requestUserPermission } from "@Util/permissionUtils";
import { termsAndConditionsStyles } from "./TermsAndConditionsStyles";
import { useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import Autolink from "react-native-autolink";
import { fonts } from "@/Constants";
import { useDispatch } from "react-redux";
import { user } from "@/schemas/schema";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";

const translationsList = [
  [1, 2, 3, 4, 5, 6],
  [1, 2, 3, 4],
  [1, 2],
  [1, 2],
  [1, 2],
  [1, 2, "a", "b", "c", "d", "e", "f", "g"],
  [1, 2, "a", "b", "c", "d"],
  [1, 2, 3, 4],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4],
  [1, 2, 3],
  [1, 2, 3],
  [1, 2],
  [1, 2],
  [1, 2],
  [1, 2],
  [1, 2],
  [1, 2, 3, 4, 5, 6, 7],
];

export default function TermsAndConditionsScreen({ route }: TermsScreenProps) {
  const [loader, setLoader] = useState(false);
  const [disableButton, setDisableButton] = useState(true);
  const dispatch = useDispatch();

  const { t } = useTranslation("terms");
  const translation = useTranslation().t;
  const setCurrentId = useSetAtom(currentUserIdAtom);

  const [scrollDirection, setScrollDirection] = useState(false);
  const scrollViewRef = useRef<any>();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const totalContentSize =
      event.nativeEvent.contentSize.height -
      event.nativeEvent.layoutMeasurement.height -
      50;
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY >= totalContentSize) {
      setDisableButton(false);
    }
    if (offsetY > 4000) {
      setScrollDirection(true);
    } else {
      setScrollDirection(false);
    }
  };

  React.useEffect(() => {
    if (Platform.OS === "ios") {
      RNVoipPushKit.requestPermissions();
    }

    requestUserPermission();
  }, []);

  const onGoScrollTo = () => {
    if (scrollDirection) {
      scrollViewRef?.current?.scrollTo({
        y: 0,
        animated: true,
      });
    } else {
      scrollViewRef?.current?.scrollToEnd({ animated: true });
    }
  };

  const onDecline = async () => {
    navigate("Login", { showModal: true });
  };

  const onAgree = async () => {
    setLoader(true);
    const userProfile = await AsyncStorage.getItem("MyProfile");
    if (userProfile) {
      const userData = JSON.parse(userProfile) as user;
      userData["phoneConfirmed"] = true;
      await AsyncStorage.setItem("MyProfile", JSON.stringify(userData));
      setCurrentId(userData);
      dispatch(setMyProfile(userData));
    }
    setLoader(false);
  };

  return (
    <View
      style={[
        layoutStyle.containerBackground,
        layoutStyle.wrapperPadding,
        mainStyles.flex1,
        mainStyles.justifyBetween,
      ]}
    >
      <Text
        h4
        style={[termsAndConditionsStyles.title, mainStyles.paddingTopBottomLg]}
      >
        {t("terms.title")}
      </Text>
      <View style={termsAndConditionsStyles.box}>
        <ScrollView
          ref={scrollViewRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <Text style={mainStyles.offsetBottomXxl}>
            {t("terms.description")}
          </Text>
          {translationsList.map((list, mainIndex) =>
            list.map((_, index) => {
              const literalKeyView =
                typeof _ === "string" ? `(${_})` : undefined;
              const literalKey = typeof _ === "string" ? _ : undefined;
              const key = (mark: string) =>
                index
                  ? `${mainIndex + 1}${mark}${literalKey || index}`
                  : mainIndex + 1;

              return (
                <Autolink
                  key={_ + index.toString() + mainIndex}
                  style={[!index && mainStyles.bold, mainStyles.offsetBottomMd]}
                  text={`${literalKeyView || key(".")}${
                    !literalKeyView ? "." : ""
                  } ${t(`terms.list.${key("-")}`)}`}
                />
              );
            }),
          )}
        </ScrollView>
        <ArrowDown scrollDirection={scrollDirection} onPress={onGoScrollTo} />
      </View>
      <Text
        style={{
          fontSize: 14,
          fontFamily: fonts.Lato,
          textAlign: "left",
          color: Colors.light.black,
          fontWeight: "400",
        }}
      >
        {translation("agreeTermsAndCondition")}
      </Text>
      <View
        style={[
          termsAndConditionsStyles.buttonContainer,
          mainStyles.row,
          mainStyles.justifyBetween,
          { alignItems: "center", marginBottom: 5, marginTop: 10 },
        ]}
      >
        <Pressable
          style={{
            backgroundColor: Colors.light.gray,
            paddingHorizontal: 10,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            height: 35,
          }}
          onPress={() => onDecline()}
        >
          <Text style={{ color: Colors.light.black }}>
            {translation("btn.decline")}
          </Text>
        </Pressable>

        <Pressable
          style={{
            backgroundColor: !disableButton
              ? Colors.light.PrimaryColor
              : Colors.light.gray,
            paddingHorizontal: 10,
            // paddingVertical: 2,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            height: 35,
          }}
          onPress={onAgree}
          disabled={disableButton}
        >
          {loader ? (
            <ActivityIndicator color={Colors.light.White} />
          ) : (
            <Text style={{ color: "white" }}>{translation("btn.agree")}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
