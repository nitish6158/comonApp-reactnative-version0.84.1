import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en/default.json";
import de from "./de/default.json";
import fr from "./fr/default.json";
import es from "./es/default.json";
import uk from "./uk/default.json";
import itIT from "./it-IT/default.json";
import tr from "./tr/default.json";
import ru from "./ru/default.json";
import el from "./el/default.json";
import pl from "./pl/default.json";
import pt from "./pt/default.json";
import bg from "./bg/default.json";
import ro from "./ro/default.json";
import hu from "./hu/default.json";
import ko from "./ko/default.json";
import id from "./id/default.json";
import ch from "./ch/default.json";
import sv from "./sv/default.json";
import ja from "./ja/default.json";
import fi from "./fi/default.json";

import termsEn from "./en/terms.json";
import termsDe from "./de/terms.json";
import termsFr from "./fr/terms.json";
import termsEs from "./es/terms.json";
import termsUk from "./uk/terms.json";
import termsItIT from "./it-IT/terms.json";
import termsTr from "./tr/terms.json";
import termsRu from "./ru/terms.json";
import termsEl from "./el/terms.json";
import termsPl from "./pl/terms.json";
import termsPt from "./pt/terms.json";
import termsBg from "./bg/terms.json";
import termsRo from "./ro/terms.json";
import termsHu from "./hu/terms.json";
import termsKo from "./ko/terms.json";
import termsId from "./id/terms.json";
import termsCh from "./ch/terms.json";
import termsSv from "./sv/terms.json";
import termsJa from "./ja/terms.json";
import termsFi from "./fi/terms.json";
import { I18nManager, NativeModules, Platform } from "react-native";
import { getStorage } from "@Util/storage";

const getI18nLocale = () =>
  I18nManager.getConstants().localeIdentifier || NativeModules.I18nManager?.localeIdentifier;

const getDeviceLocale = () => {
  if (Platform.OS === "ios") {
    const settings = NativeModules.SettingsManager?.settings;
    return settings?.AppleLocale || settings?.AppleLanguages?.[0] || getI18nLocale() || "en";
  }

  return getI18nLocale() || "en";
};

let locale = getDeviceLocale();

const getLocale = async () => {
  const loc = await getStorage("LANGUAGE");
  if (loc) {
    locale = loc;
  }
};
getLocale();

export const DEFAULT_LOCALE = locale.replace("_", "-").startsWith("de") ? "de" : "en";

export type locales = "en" | "de" | "fr" |"es" | "uk" |"it-IT" | "tr" | "ru" | "el" | "pl" | "pt" |"bg" | "ro" | "hu" | "ko" | "id" | "ch" | "sv" | "ja" | "fi"


const resources = { 
  en: { translation: en, terms: termsEn }, 
  de: { translation: de, terms: termsDe },
  fr: { translation: fr, terms: termsFr },
  es: { translation: es, terms: termsEs },
  uk: { translation: uk, terms: termsUk },
  "it-IT": { translation: itIT, terms: termsItIT },
  tr: { translation: tr, terms: termsTr },
  ru: { translation: ru, terms: termsRu },
  el: { translation: el, terms: termsEl },
  pl: { translation: pl, terms: termsPl },
  pt: { translation: pt, terms: termsPt },
  bg: { translation: bg, terms: termsBg },
  ro: { translation: ro, terms: termsRo },
  hu: { translation: hu, terms: termsHu },
  ko: { translation: ko, terms: termsKo },
  id: { translation: id, terms: termsId },
  ch: { translation: ch, terms: termsCh },
  sv: { translation: sv, terms: termsSv },
  ja: { translation: ja, terms: termsJa },
  fi: { translation: fi, terms: termsFi },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources,
  //language to use if translations in user language are not available
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false, // not needed for react!!
  },
});

export default i18n;
