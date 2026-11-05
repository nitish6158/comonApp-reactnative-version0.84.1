import { DefaultStorageKeys, getStorage, setStorage } from "@Util/storage";
import React, { createContext, useEffect, useState } from "react";

import LanguageSelector from "@/Components/Language";
import { locales } from "../../localization/i18n.config";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/redux/Store";
import { Language } from "@/graphql/generated/types";

export interface LanguageContextState {
  onOpen: () => void;
  onClose: () => void;
  onSelect: (locale: locales) => void;
  currentLanguage: string;
}

export const LanguageContext = createContext<LanguageContextState>({
  onOpen: () => {},
  onClose: () => {},
  onSelect: () => {},
  currentLanguage: "en",
});

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [visible, setVisible] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const { i18n } = useTranslation();

  const onSelect = (locale: Language) => {
    console.log(locale)
    i18n.changeLanguage(locale.code).then(() => {
      setStorage(DefaultStorageKeys.LANGUAGE, locale.code);
      setCurrentLanguage(locale.code);
      onClose();
    });
  };


  const onOpen = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  return (
    <LanguageContext.Provider
      value={{
        onOpen,
        onClose,
        onSelect: onSelect,
        currentLanguage,
      }}
    >
      <LanguageSelector visible={visible} onClose={onClose} onSelect={onSelect} />
      {children}
    </LanguageContext.Provider>
  );
};
