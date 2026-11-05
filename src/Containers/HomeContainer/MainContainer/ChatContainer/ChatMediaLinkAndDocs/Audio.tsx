import { RoomAudioAtom } from "@/Atoms";
import { useAtomValue } from "jotai";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import SectionTitle from "./SectionTitle";
import { useTranslation } from "react-i18next";
import { fonts } from "@/Constants";
import AudioMessageComponent from "../ChatMessages/MessageComponents/AudioMessageComponent";

export default function Audio({ name }: { name: string }) {
  const audioData = useAtomValue(RoomAudioAtom);

  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {!audioData.length && (
        <View style={styles.noAudioContainer}>
          <Text style={[styles.textTypo, styles.noAudioTitleStyle]}>{t("noAudio")}</Text>
          <Text style={[styles.textTypo, styles.noAudioDescriptionStyle]}>
            {t("noAudioDescription")} {name ?? "N/A"} {t("noAudioEndDescription")}
          </Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {audioData.map((element: any, elementIndex: any) => (
          <View key={elementIndex} style={{ marginTop: elementIndex === 0 ? 0 : 20 }}>
            <SectionTitle title={element.title} />
            {element?.data?.map((el: any, index: number) => (
              <View style={{ marginVertical: 10 }} key={index}>
                <AudioMessageComponent
                  key={index}
                  isVisible={true}
                  isMessageDeletedForEveryOne={false}
                  isMessageForwarded={false}
                  message={el}
                  senderImage={""}
                  searchText={""}
                  withoutWrapper
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  textTypo: {
    fontFamily: fonts.Lato,
    fontStyle: "normal",
  },
  noAudioContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noAudioTitleStyle: { color: "#333333", fontSize: 18, marginBottom: 16 },
  noAudioDescriptionStyle: { color: "#828282", fontSize: 14, textAlign: "center" },
});
