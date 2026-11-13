import * as React from "react";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Autolink from "react-native-autolink";
import { Text } from "react-native-elements";
import { useTranslation } from "react-i18next";

import Colors from "@/Constants/Colors";
import { fonts } from "@/Constants";
import { ArrowDown } from "@Components/Button/arrowDown";
import { mainStyles } from "../styles/main";

const TRANSLATIONS_LIST: ReadonlyArray<ReadonlyArray<number | string>> = [
  [1, 2, 3, 4, 5, 6],
  [1, 2, 3],
  [1, 2, 3, 4],
  [1, 2, 3, 4, 5, 6, 7],
  [1, 2],
  [1, 2, 3],
  [1, 2],
  [1, 2],
  [1, 2],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, "a", "b", "c", "d", 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
  [1, 2, 3, 4, 5, 6, 7, 8],
  [1, 2, 3, 4, 5, 6],
  [1, 2],
  [1, 2, 3, 4, 5, 6],
  [1, 2, 3, 4, 5, 6, 7],
];

type TermsViewProps = {
  boxStyle: StyleProp<ViewStyle>;
  buttonContainerStyle?: StyleProp<ViewStyle>;
  footerMarginBottom?: number;
  loader?: boolean;
  onAgree: () => void;
  onDecline: () => void;
  showsVerticalScrollIndicator?: boolean;
  titleSlot: React.ReactNode;
};

export function TermsView({
  boxStyle,
  buttonContainerStyle,
  footerMarginBottom = 5,
  loader = false,
  onAgree,
  onDecline,
  showsVerticalScrollIndicator = true,
  titleSlot,
}: TermsViewProps) {
  const [disableButton, setDisableButton] = useState(true);
  const [scrollDirection, setScrollDirection] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const { t } = useTranslation("terms");
  const { t: translate } = useTranslation();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const totalContentSize =
      event.nativeEvent.contentSize.height -
      event.nativeEvent.layoutMeasurement.height -
      50;
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY >= totalContentSize) {
      setDisableButton(false);
    }
    setScrollDirection(offsetY > 4000);
  };

  const onGoScrollTo = () => {
    if (scrollDirection) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  return (
    <>
      {titleSlot}
      <View style={boxStyle}>
        <ScrollView
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          ref={scrollViewRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <Text style={mainStyles.offsetBottomXxl}>{t("terms.description")}</Text>
          {TRANSLATIONS_LIST.map((list, mainIndex) =>
            list.map((item, index) => {
              const literalKeyView = typeof item === "string" ? `(${item})` : undefined;
              const literalKey = typeof item === "string" ? item : undefined;
              const getKey = (mark: string) =>
                index ? `${mainIndex + 1}${mark}${literalKey || index}` : mainIndex + 1;

              return (
                <Autolink
                  key={`${item}_${index}_${mainIndex}`}
                  style={[!index && mainStyles.bold, mainStyles.offsetBottomMd]}
                  text={`${literalKeyView || getKey(".")}${
                    !literalKeyView ? "." : ""
                  } ${t(`terms.list.${getKey("-")}`)}`}
                />
              );
            })
          )}
        </ScrollView>
        <ArrowDown scrollDirection={scrollDirection} onPress={onGoScrollTo} />
      </View>
      <Text style={localStyles.agreeLabel}>{translate("agreeTermsAndCondition")}</Text>
      <View
        style={[
          buttonContainerStyle,
          mainStyles.row,
          mainStyles.justifyBetween,
          localStyles.footerRow,
          { marginBottom: footerMarginBottom },
        ]}
      >
        <Pressable style={localStyles.declineBtn} onPress={onDecline}>
          <Text style={localStyles.declineText}>{translate("btn.decline")}</Text>
        </Pressable>

        <Pressable
          style={[
            localStyles.agreeBtn,
            { backgroundColor: !disableButton ? Colors.light.PrimaryColor : Colors.light.gray },
          ]}
          onPress={onAgree}
          disabled={disableButton}
        >
          {loader ? (
            <ActivityIndicator color={Colors.light.White} />
          ) : (
            <Text style={localStyles.agreeText}>{translate("btn.agree")}</Text>
          )}
        </Pressable>
      </View>
    </>
  );
}

const localStyles = StyleSheet.create({
  agreeLabel: {
    fontSize: 14,
    fontFamily: fonts.Lato,
    textAlign: "left",
    color: Colors.light.black,
    fontWeight: "400",
  },
  footerRow: {
    alignItems: "center",
    marginTop: 10,
  },
  declineBtn: {
    backgroundColor: Colors.light.gray,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 35,
  },
  declineText: {
    color: Colors.light.black,
  },
  agreeBtn: {
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    height: 35,
  },
  agreeText: {
    color: "white",
  },
});

