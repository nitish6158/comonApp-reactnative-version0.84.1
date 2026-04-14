import React, { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext({
  tokenLogin: null as string | null,
  setTokenLogin: async (_: string | null) => { },
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokenLogin, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Save + set
  const setTokenLogin = async (value: string | null) => {
    if (value) {
      await AsyncStorage.setItem("session_token", value);
    } else {
      await AsyncStorage.removeItem("session_token");
    }
    setTokenState(value);
  };

  // Load session once, on app start
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("session_token");
      setTokenState(saved);
      setLoading(false);
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ tokenLogin, setTokenLogin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
