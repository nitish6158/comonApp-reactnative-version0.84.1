import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Keychain from "react-native-keychain";

/** iOS Keychain / Android Keystore service for auth secrets */
const AUTH_KEYCHAIN_SERVICE = "com.comon.app.auth";

export enum SessionKeys {
  TOKEN = "COM_ON_TOKEN",
  REFRESH = "COM_ON_REFRESH",
  EXPIRE_AT = "COM_ON_TOKEN_EXPIRE_AT",
  MODE = "MODE",
}

export enum phoneCodeSession {
  PhoneCode = "Phone_Code",
}

export enum SessionOrganizationKeys {
  DATA = "COM_ON_ORGANIZATION_DATA",
}

/** Legacy plain-storage keys (migrated once into Keychain, then cleared) */
const LEGACY_TOKEN_KEYS = [
  SessionKeys.TOKEN,
  SessionKeys.REFRESH,
  SessionKeys.EXPIRE_AT,
  SessionKeys.MODE,
  "session_token",
  "token",
] as const;

export type AuthSessionData = {
  token: string | null;
  refresh: string | null;
  expireAt: string | null;
  mode: string | null;
};

type SetSessionInput = {
  token: string;
  refresh: string;
  mode: string;
  expireAt: number | string;
};

let memorySession: AuthSessionData = {
  token: null,
  refresh: null,
  expireAt: null,
  mode: null,
};
let hasLoadedFromKeychain = false;
let loadPromise: Promise<AuthSessionData> | null = null;

function emptySession(): AuthSessionData {
  return { token: null, refresh: null, expireAt: null, mode: null };
}

function hasSecrets(session: AuthSessionData): boolean {
  return !!(session.token || session.refresh);
}

async function clearLegacyPlainTokenStorage(): Promise<void> {
  await Promise.all(LEGACY_TOKEN_KEYS.map((key) => AsyncStorage.removeItem(key)));
}

async function readLegacyPlainSession(): Promise<AuthSessionData | null> {
  const [token, refresh, expireAt, mode, sessionToken, legacyToken] =
    await Promise.all([
      AsyncStorage.getItem(SessionKeys.TOKEN),
      AsyncStorage.getItem(SessionKeys.REFRESH),
      AsyncStorage.getItem(SessionKeys.EXPIRE_AT),
      AsyncStorage.getItem(SessionKeys.MODE),
      AsyncStorage.getItem("session_token"),
      AsyncStorage.getItem("token"),
    ]);

  const resolvedToken = token || sessionToken || legacyToken;
  if (!resolvedToken && !refresh) {
    return null;
  }

  return {
    token: resolvedToken,
    refresh,
    expireAt,
    mode,
  };
}

async function writeKeychainSession(session: AuthSessionData): Promise<boolean> {
  if (!hasSecrets(session)) {
    await Keychain.resetGenericPassword({ service: AUTH_KEYCHAIN_SERVICE });
    return true;
  }

  const saved = await Keychain.setGenericPassword(
    "comon",
    JSON.stringify(session),
    {
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      service: AUTH_KEYCHAIN_SERVICE,
    }
  );

  return !!saved;
}

async function readKeychainSession(): Promise<AuthSessionData | null> {
  try {
    const stored = await Keychain.getGenericPassword({
      service: AUTH_KEYCHAIN_SERVICE,
    });
    if (!stored) return null;

    const parsed = JSON.parse(stored.password) as Partial<AuthSessionData>;
    return {
      token: parsed.token ?? null,
      refresh: parsed.refresh ?? null,
      expireAt: parsed.expireAt != null ? String(parsed.expireAt) : null,
      mode: parsed.mode ?? null,
    };
  } catch (error) {
    console.warn("[session] Keychain read failed:", error);
    return null;
  }
}

/**
 * Load session once: Keychain first, then one-time migrate from AsyncStorage.
 * Keeps login working for users who still have tokens only in plain storage.
 */
async function loadSessionInternal(): Promise<AuthSessionData> {
  if (hasLoadedFromKeychain && hasSecrets(memorySession)) {
    return memorySession;
  }

  const fromKeychain = await readKeychainSession();
  if (fromKeychain && hasSecrets(fromKeychain)) {
    memorySession = fromKeychain;
    hasLoadedFromKeychain = true;
    // Cleanup any leftover plain copies
    await clearLegacyPlainTokenStorage();
    return memorySession;
  }

  const legacy = await readLegacyPlainSession();
  if (legacy && hasSecrets(legacy)) {
    memorySession = legacy;
    hasLoadedFromKeychain = true;
    try {
      const saved = await writeKeychainSession(legacy);
      if (saved) {
        await clearLegacyPlainTokenStorage();
      }
    } catch (error) {
      console.warn("[session] migrate to Keychain failed; keeping legacy read:", error);
    }
    return memorySession;
  }

  memorySession = emptySession();
  hasLoadedFromKeychain = true;
  return memorySession;
}

async function ensureSessionLoaded(): Promise<AuthSessionData> {
  if (hasLoadedFromKeychain) {
    return memorySession;
  }
  if (!loadPromise) {
    loadPromise = loadSessionInternal().finally(() => {
      loadPromise = null;
    });
  }
  return loadPromise;
}

interface setGlobalPhoneCodeprops {
  PhoneCode: string;
  Country: string | number | undefined;
}

export const setGlobalPhoneCode = async ({
  PhoneCode,
  Country,
}: setGlobalPhoneCodeprops) => {
  try {
    await AsyncStorage.setItem(
      phoneCodeSession.PhoneCode,
      JSON.stringify({ PhoneCode, Country })
    );
  } catch {
    return false;
  }
};

/**
 * Persist auth secrets in Keychain (same public API as before — flow unchanged).
 */
export const setSession = async ({
  token,
  refresh,
  mode,
  expireAt,
}: SetSessionInput) => {
  try {
    const next: AuthSessionData = {
      token: token ?? null,
      refresh: refresh ?? null,
      expireAt: expireAt != null ? String(expireAt) : null,
      mode: mode ?? null,
    };

    memorySession = next;
    hasLoadedFromKeychain = true;

    const saved = await writeKeychainSession(next);
    if (!saved) {
      console.warn("[session] Keychain write returned false");
      return false;
    }

    // Never leave tokens in plain AsyncStorage after a successful secure write
    await clearLegacyPlainTokenStorage();
    return true;
  } catch (error) {
    console.warn("[session] setSession failed:", error);
    return false;
  }
};

export const setTermsPolicy = async (phone: string) => {
  try {
    await AsyncStorage.setItem(phone, "true");
    return true;
  } catch {
    return false;
  }
};

export const removeTermsPolicy = async (phone: string) => {
  try {
    await AsyncStorage.removeItem(phone);
    return true;
  } catch {
    return false;
  }
};

export const getTermsPolicy = async (phone?: string) => {
  if (!phone) return;
  try {
    return await AsyncStorage.getItem(phone);
  } catch {
    return false;
  }
};

export const getGlobalPhoneCode = async () => {
  try {
    const phoneCode: { PhoneCode: string; Country: string } = await AsyncStorage.getItem(
      phoneCodeSession.PhoneCode
    ) as any;
    return {
      phoneCode,
    };
  } catch {
    return false;
  }
};

export const getSession = async (): Promise<AuthSessionData> => {
  return ensureSessionLoaded();
};

/**
 * Sync peek of in-memory session after load (optional helpers).
 * Prefer getSession() for correctness.
 */
export const getMemorySession = (): AuthSessionData => memorySession;

export const removeSession = async () => {
  console.log("Removing session");
  memorySession = emptySession();
  hasLoadedFromKeychain = true;

  try {
    await Keychain.resetGenericPassword({ service: AUTH_KEYCHAIN_SERVICE });
  } catch (error) {
    console.warn("[session] Keychain reset failed:", error);
  }

  await clearLegacyPlainTokenStorage();
  await AsyncStorage.removeItem("COM_ON_LOGIN_DEVICE");
};

type CurrentOrganizationDataType = {
  _id: string;
  link: string;
};

export const setCurrentOrganization = async (data: CurrentOrganizationDataType) => {
  await AsyncStorage.setItem(SessionOrganizationKeys.DATA, JSON.stringify(data));
  return true;
};

export const getCurrentOrganization = async (): Promise<
  CurrentOrganizationDataType | undefined
> => {
  const asyncData = await AsyncStorage.getItem(SessionOrganizationKeys.DATA);
  if (!asyncData) return;
  try {
    const data = JSON.parse(asyncData);
    if (data?._id) return data;
  } catch {
    return;
  }
  return;
};

export const removeCurrentOrganization = () => {
  AsyncStorage.removeItem(SessionOrganizationKeys.DATA);
};
