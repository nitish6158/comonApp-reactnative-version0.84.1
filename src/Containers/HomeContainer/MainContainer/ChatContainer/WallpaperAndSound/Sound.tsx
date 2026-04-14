/* eslint-disable react-native/no-inline-styles */
import { Pressable, ScrollView, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useChangeNotificationSoundMutation, useGetiOsSoundListQuery } from "@Service/generated/room.generated";
import AntDesign from "react-native-vector-icons/AntDesign";
import Colors from "@/Constants/Colors";
import { SoundHeader } from "./soundHeader";
import Styles from "./Styles";
import Text from "@Components/Text";
import ToastMessage from "@Util/ToastMesage";
import { singleRoom } from "@Atoms/singleRoom";
import { useAtom } from "jotai";
import { useIsFocused } from "@react-navigation/core";
import { useTranslation } from "react-i18next";
import Sound from "react-native-sound";

export default function SoundScreen({ navigation, route }: any) {
  const soundList = useGetiOsSoundListQuery();
  const [AllSound, setAllSound] = useState<Array<{ title: string; url: string }>>([
    { url: "", title: "None (Default)" },
  ]);
  const [display] = useAtom(singleRoom);
  const [changeNotificationSoundRequest] = useChangeNotificationSoundMutation();
  const [selectedSound, setSelectedSound] = useState<{ title: string; url: string }>(
    display.roomSound.title ? display.roomSound : {}
  );

  const isFocused = useIsFocused();

  const { t } = useTranslation();

  function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  useEffect(() => {
    setSelectedSound(display.roomSound);
  }, [isFocused]);

  useEffect(() => {
    if (soundList.data?.getiOSSoundList) {
      // console.log([{ url: "", title: "None (Default)" }, ...soundList.data?.getiOSSoundList]);
      setAllSound([{ url: "", title: "None (Default)" }, ...soundList.data?.getiOSSoundList]);
    }
  }, [soundList.data]);

  function onSaveHandler() {
    console.log(selectedSound);
    route?.params?.onSelectSound?.({
      title: selectedSound?.title || "None (Default)",
      url: selectedSound?.url || "",
    });

    if (selectedSound.title == "None (Default)") {
      changeNotificationSoundRequest({
        variables: {
          input: {
            sound: {
              url: "",
              title: "None (Default)",
            },
            roomId: display.roomId,
          },
        },
      }).then((res) => {
        if (res.data?.changeNotificationSound?.success) {
          ToastMessage(`${t("toastmessage.notification-sound-message")}`);
        }
      });
    } else {
      changeNotificationSoundRequest({
        variables: {
          input: {
            sound: {
              url: selectedSound?.url,
              title: selectedSound?.title,
            },
            roomId: display.roomId,
          },
        },
      }).then((res) => {
        if (res.data?.changeNotificationSound?.success) {
          ToastMessage(`${t("toastmessage.notification-sound-message")}`);
        }
      });
    }

    navigation.goBack();
  }

  return (
    <View style={Styles.MainCon}>
      <SoundHeader
        title={t("wallpaper-sound.sound")}
        onSave={() => {
          onSaveHandler();
        }}
      />
      <ScrollView>
        <Text style={{ marginLeft: 20, paddingVertical: 13, color: Colors.light.Hiddengray }}>
          {t("wallpaper-sound.alert-tone")}
        </Text>

        {AllSound.map((item: { title: string; url: string }) => {
          return (
            <Pressable
              key={item.title}
              onPress={() => {
                setSelectedSound(item);
                if (item.title != "None (Default)") {
                  const notificationSound = new Sound(item.url, Sound.MAIN_BUNDLE, (error) => {
                    if (error) {
                      console.log("failed to load the sound", error);
                      return;
                    }

                    notificationSound.play((success) => {
                      if (success) {
                        console.log("successfully finished playing");
                      } else {
                        console.log("playback failed due to audio decoding errors");
                      }
                    });
                  });
                }
              }}
              style={{ marginHorizontal: 20, flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ paddingVertical: 10, flexDirection: "row", alignItems: "center" }}>
                {item.title != "None (Default)" && (
                  <AntDesign
                    name="sound"
                    size={24}
                    color={item?.title == selectedSound?.title ? Colors.light.PrimaryColor : "gray"}
                    style={{ marginRight: 10 }}
                  />
                )}
                <Text
                  style={{
                    color: item?.title == selectedSound?.title ? Colors.light.PrimaryColor : "gray",
                    fontWeight: "500",
                  }}
                >
                  {capitalizeFirstLetter(item.title)}
                </Text>
              </View>
              {item?.title == selectedSound?.title && (
                <AntDesign name="checkcircle" size={24} color={Colors.light.PrimaryColor} />
              )}
              {/* <Divider /> */}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
