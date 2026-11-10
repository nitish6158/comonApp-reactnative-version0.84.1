import React, { createContext, useEffect, useState } from "react";
import { getSession, setSession } from "@/utils/session";

export const AuthContext = createContext({
  tokenLogin: null as string | null,
  setTokenLogin: async (_: string | null) => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokenLogin, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * UI auth gate + keep Keychain token field in sync when setting a token.
   * Clearing (`null`) only updates React state — callers must `removeSession()`
   * for a full Keychain wipe (same as previous AsyncStorage behavior).
   */
  const setTokenLogin = async (value: string | null) => {
    if (!value) {
      setTokenState(null);
      return;
    }

    const current = await getSession();
    if (current.token !== value) {
      await setSession({
        token: value,
        refresh: current.refresh || "",
        mode: current.mode || "",
        expireAt: current.expireAt || 0,
      });
    }
    setTokenState(value);
  };

  useEffect(() => {
    (async () => {
      const session = await getSession();
      setTokenState(session.token);
      setLoading(false);
    })();
  }, []);

  return (
    <AuthContext.Provider value={{ tokenLogin, setTokenLogin, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
