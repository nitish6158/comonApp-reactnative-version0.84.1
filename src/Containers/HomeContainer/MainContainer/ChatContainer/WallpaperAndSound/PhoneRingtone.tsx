import { singleRoom } from "@/Atoms";
import CommonHeader from "@Components/header/CommonHeader";
import { Colors } from "@/Constants";
import { useSetCustomRingtoneMutation } from "@/graphql/generated/room.generated";
import { RootState } from "@/redux/Reducer";
import ToastMessage from "@Util/ToastMesage";
import { useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Sound from "react-native-sound";
import { RadioButton } from "react-native-ui-lib";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import RNFS from "react-native-fs";

const ringtones = [
  {
    id: 1,
    label: "None (default)",
    resource: "default",
  },
  {
    id: 2,
    label: "Love song",
    resource: "lovesong",
  },
  {
    id: 3,
    label: "Piano",
    resource: "piano",
  },
  {
    id: 4,
    label: "Rain instrumental",
    resource: "raininstrumental",
  },
  {
    id: 5,
    label: "SadarChari",
    resource: "sadarchari",
  },
];
let soundPlaying = undefined;
export default function PhoneRingtone() {
  const [phoneRingtones, setPhoneRingtones] = useState(ringtones);
  const [selectedTone, setSelectedTone] = useState({
    id: 1,
    label: "None (default)",
    resource: "",
  });
  const [playedSound, setPlayedSound] = useState<Sound | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const [setCustomRingtone] = useSetCustomRingtoneMutation();
  const display = useAtomValue(singleRoom);

  const { MyProfile } = useSelector((state: RootState) => state.Chat);

  const { t } = useTranslation();

  useEffect(() => {
    const roomRingtones = display?.ringtone ?? [];
    if (roomRingtones.length && MyProfile?._id && !loading) {
      const findMyRingtoneSet = roomRingtones.find((e) => e.userId == MyProfile?._id);
      if (findMyRingtoneSet) {
        const findPredefinedTone = phoneRingtones.find((e) => e.resource == findMyRingtoneSet.ringtone);
        if (findPredefinedTone) setSelectedTone(findPredefinedTone);
      }
    }
    return () => {
      if (soundPlaying) {
        soundPlaying?.stop();
        soundPlaying?.release();
        soundPlaying = undefined;
      }
    };
  }, [MyProfile?._id, display?.ringtone, loading, phoneRingtones]);

  function handleSound(item: { id: number; label: string; resource: string }) {
    if (selectedTone?.id == item?.id) return;
    if (playedSound) playedSound.stop();
    const soundName = `${item.resource}.mp3`;
    const sound = new Sound(soundName, Sound.MAIN_BUNDLE, (err) => {
      if (err) {
        console.error("Error in playing sound", err);
        return;
      }
      soundPlaying = sound;
      setPlayedSound(sound);
      sound.play((success) => {
        if (success) {
          console.log("Success", success);
        }
      });
    });
    setSelectedTone(item);
  }

  function handleSet() {
    const roomRingtones = display?.ringtone ?? [];
    const findMyRingtoneSet = roomRingtones.find((e) => e.userId == MyProfile?._id);
    if (findMyRingtoneSet?.ringtone == selectedTone?.resource) return;
    setLoading(true);
    setCustomRingtone({
      variables: {
        input: {
          roomId: display?.roomId,
          ringtone: selectedTone?.resource,
        },
      },
    })
      .then((response) => {
        if (response.errors) {
          setLoading(false);
          console.error("Error in changing ringtone", response.errors);
          ToastMessage(t("errorInSettingRingtone"));
          return;
        }
        setLoading(false);
        ToastMessage(t("ringtoneSetSuccess"));
      })
      .catch((err) => {
        setLoading(false);
        console.error("Error in changing ringtone", err);
        ToastMessage(t("errorInSettingRingtone"));
      });
  }

  function renderItem({ item }) {
    return (
      <Pressable
        style={[styles.rowDirection, styles.itemWrapper, { justifyContent: "space-between" }]}
        onPress={() => handleSound(item)}
      >
        <View style={styles.rowDirection}>
          <AntDesign
            name="sound"
            size={24}
            color={item?.id == selectedTone?.id ? Colors.light.PrimaryColor : "gray"}
            style={{ marginRight: 10 }}
          />
          <Text
            style={{
              color: item?.id == selectedTone?.id ? Colors.light.PrimaryColor : "gray",
              fontWeight: "500",
            }}
          >
            {item.label}
          </Text>
        </View>
        {playedSound && selectedTone?.id == item?.id ? (
          <Ionicons
            name="stop-circle-outline"
            size={25}
            color={"red"}
            onPress={() => {
              playedSound?.stop();
              playedSound.release();
              setPlayedSound(undefined);
            }}
          />
        ) : (
          <RadioButton selected={selectedTone?.id == item?.id} color={Colors.light.PrimaryColor} />
        )}
      </Pressable>
    );
  }

  return (
    <>
      <CommonHeader
        title={t("phoneRingtone")}
        actionButton={
          <Pressable disabled={loading} style={styles.setButtonContainer} onPress={handleSet}>
            {loading ? (
              <ActivityIndicator color={Colors.light.White} />
            ) : (
              <Text style={{ color: Colors.light.White }}>{t("set")}</Text>
            )}
          </Pressable>
        }
      />
      <View style={styles.container}>
        <FlatList data={phoneRingtones} renderItem={renderItem} keyExtractor={(_, index) => index.toString()} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.White,
  },
  itemWrapper: {
    margin: 10,
    paddingVertical: 5,
  },
  rowDirection: {
    flexDirection: "row",
    alignItems: "center",
  },
  setButtonContainer: {
    paddingHorizontal: 7,
    backgroundColor: Colors.light.PrimaryColor,
    paddingVertical: 5,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
});
