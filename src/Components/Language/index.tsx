import * as React from "react";

import { Platform, Pressable, ScrollView, StatusBar, View } from "react-native";

import AntDesign from "react-native-vector-icons/AntDesign";
import CommonHeader from "../header/CommonHeader";
import Modal from "react-native-modal";
import Text from "../Text";
import { getStorage } from "@Util/storage";
import { locales } from "../../../localization/i18n.config";
import { mainStyles } from "../../styles/main";
import styles from "./styles";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/redux/Store";
import {
  useGetLanguageListQuery,
  useUpdateUserLanguageMutation,
} from "@/graphql/generated/user.generated";
import { useDispatch } from "react-redux";
import { setMyProfile } from "@/redux/Reducer/ChatReducer";
import { Language } from "@/graphql/generated/types";
import FastImage from "@d11/react-native-fast-image";
import { Image, SvgUri } from "react-native-svg";
import { setLanguage, setLanguageList } from "@/redux/Reducer/LanguageReducer";
import { storage } from "@/redux/backup/mmkv";
import { keys } from "@/redux/backup/keys";
import { SafeAreaView } from "react-native-safe-area-context";

interface LanguageProps {
  visible?: boolean;
  onClose?: () => void;
  onSelect: (locale: locales) => void;
}

const LanguageSelector = ({ visible, onClose, onSelect }: LanguageProps) => {
  const { languages, currentLang } = useAppSelector(
    (state) => state.appLanguage,
  );
  const dispatch = useDispatch();

  const languageList = useGetLanguageListQuery();
  React.useEffect(() => {
    if (languageList.data) {
      dispatch(setLanguageList(languageList.data.getLanguageList));
      storage.set(
        keys.languages,
        JSON.stringify(languageList.data.getLanguageList),
      );
    }
  }, [languageList.data]);

  const { t } = useTranslation();

  const [updateLanguageRequest] = useUpdateUserLanguageMutation();

  const handleSelect = (locale: Language) => () => {
    onSelect(locale);
    updateLanguageRequest({
      variables: {
        input: {
          language: locale._id,
        },
      },
    }).then((res) => {
      if (res.data?.updateUserLanguage) {
        dispatch(setMyProfile(res.data.updateUserLanguage));
        dispatch(setLanguage(locale.code));
      }
    });
  };

  return (
    <Modal
      isVisible={visible}
      style={styles.modal}
      statusBarTranslucent
      useNativeDriver={false}
    >
      <View style={mainStyles.flex1}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="white"
          translucent={Platform.OS === "android"}
        />
        <SafeAreaView style={mainStyles.flex1} edges={["top", "left", "right"]}>
          <CommonHeader
            title={t("others.Language")}
            isModal={true}
            onPress={onClose}
          />
          <ScrollView
            style={{ marginTop: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {languages.map((locale, index) => (
              <Pressable
                key={index}
                onPress={handleSelect(locale)}
                style={[
                  styles.locale,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  },
                ]}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <FastImage
                    style={{ height: 30, width: 60 }}
                    source={{ uri: locale.icon }}
                  />

                  <View>
                    <Text size="lg" style={{ marginLeft: 20 }}>
                      {t(`locales.${locale.code}`)}
                    </Text>
                    <Text size="sm" style={{ marginLeft: 20, color: "gray" }}>
                      ({locale.name})
                    </Text>
                  </View>
                </View>
                {locale.code === currentLang ? (
                  <AntDesign name="check" size={20} />
                ) : (
                  <></>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default LanguageSelector;
