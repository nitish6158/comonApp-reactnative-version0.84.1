import * as React from "react";

import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  View,
  StyleSheet,
} from "react-native";

import { useRef, useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ArrowDown } from "@/Components/Button/arrowDown";
import Colors from "@/Constants/Colors";
import { Text } from "react-native-elements";
import { layoutStyle } from "@Components/layout/LayoutStyle";
import { mainStyles } from "../styles/main";
import { useTranslation } from "react-i18next";
import Autolink from "react-native-autolink";
import { $space_lg, $space_xl, fonts } from "@/Constants";

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

type TermsScreenProps = {
  onDecline: () => void;
  onAgree: () => void;
};

export default function TermsScreen({ onDecline, onAgree }: TermsScreenProps) {
  const [loader, setLoader] = useState(false);
  const [disableButton, setDisableButton] = useState(true);

  const { t } = useTranslation("terms");
  const translation = useTranslation().t;

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

  return (
    <SafeAreaView
      style={{
        flex: 1,
        marginHorizontal: 20,
      }}
    >
      <Text
        style={{
          marginBottom: 20,
          marginTop: 10,
          fontSize: 18,
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {t("terms.title")}
      </Text>
      <View style={styles.box}>
        <ScrollView
          showsVerticalScrollIndicator={false}
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
          styles.buttonContainer,
          mainStyles.row,
          mainStyles.justifyBetween,
          { alignItems: "center", marginBottom: 50, marginTop: 10 },
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
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  box: {
    backgroundColor: Colors.light.backgroundGray,
    borderRadius: $space_lg,
    flex: 6,
    marginBottom: $space_xl,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  button: {
    borderRadius: 20,
    height: 36,
    maxHeight: 36,
    maxWidth: 100,
    minHeight: 36,
    minWidth: 20,
  },
  buttonContainer: {
    flex: 0,
    // marginBottom: $space_xl,
  },
  title: {
    color: Colors.light.grayText,
    fontWeight: "bold",
    textAlign: "center",
  },
});
