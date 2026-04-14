import { DefaultStorageKeys, getStorage, setStorage } from "@Util/storage";
import React, { createContext, useEffect, useState } from "react";

export interface PhoneContextState {
  settings?: SettingsType;
  phone?: PhoneType;
  setCode: (code: string) => void;
  setPhone: (number?: PhoneType) => void;
  loading?: boolean;
  code: string;
}

export type PhoneType = {
  number: string;
  formattedNumber: string;
};

export const PhoneContext = createContext<PhoneContextState>({
  settings: undefined,
  phone: undefined,
  setPhone: () => {},
  code: "",
  setCode: (code) => {},
});

interface PhoneProviderProps {
  children: React.ReactNode;
}

export const PhoneProvider = ({ children }: PhoneProviderProps) => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({});
  const [phone, setPhone] = useState<PhoneType>({
    formattedNumber: "",
    number: "",
  });
  const [code, setCode] = useState<string>("DE");

  useEffect(() => {
    getStorage(DefaultStorageKeys.PHONE_NUMBER).then((number) => {
      const data =
        typeof number == "string"
          ? JSON.parse(number)
          : {
              number: "",
              formattedNumber: "",
            };
      setPhone(data);
      setLoading(false);
    });
    getStorage(DefaultStorageKeys.COUNTRY_CODE).then((value) => {
      const normalizedCode =
        typeof value === "string" ? value.replace(/^\+/, "").trim().toUpperCase() : "";

      if (/^[A-Z]{2}$/.test(normalizedCode)) {
        setCode(normalizedCode);
      } else {
        fetch("https://ipinfo.io/json")
          .then(async (response) => {
            const res = await response.json();
            if (res?.country) {
              console.log("Res. coiuntru", res.country);
              setCode(res.country);
            }
          })
          .catch((err) => {
            console.log("Error fetching json for ip", err);
          });
      }
    });
  }, []);

  const setPhoneNumber = (phone?: PhoneType) => {
    setStorage(DefaultStorageKeys.PHONE_NUMBER, JSON.stringify(phone));
    setPhone(phone!);
  };

  return (
    <PhoneContext.Provider
      value={{
        settings,
        phone,
        setPhone: setPhoneNumber,
        loading,
        code,
        setCode: (tr) => {
          const normalized = (tr || "").replace(/^\+/, "").trim().toUpperCase();
          setCode(/^[A-Z]{2}$/.test(normalized) ? normalized : "DE");
        },
      }}
    >
      {children}
    </PhoneContext.Provider>
  );
};
