import * as Keychain from "react-native-keychain";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStorage } from "@/utils/mmkvStorage";

const E2E_KEYCHAIN_SERVICE = "com.comon.app.e2e.identity";
const PUBLIC_META_KEY = "e2e_public_meta_v1";
const SESSION_PREFIX = "e2e_session_v1_";

const mmkv = createStorage({ id: "e2e-sessions" });

export type SignalIdentityPrivate = {
  registrationId: number;
  deviceId: string;
  identityKeyPair: {
    pubKey: string; // base64
    privKey: string; // base64
  };
  signedPreKey: {
    keyId: number;
    pubKey: string;
    privKey: string;
    signature: string;
  };
  oneTimePreKeys: Array<{
    keyId: number;
    pubKey: string;
    privKey: string;
  }>;
};

export type SignalPublicMeta = {
  registrationId: number;
  deviceId: string;
  identityKey: string;
  signedPreKey: {
    keyId: number;
    publicKey: string;
    signature: string;
  };
  oneTimePreKeys: Array<{ keyId: number; publicKey: string }>;
  uploadedAt?: number;
};

/**
 * Private identity material lives in Keychain.
 * Public registration metadata may live in AsyncStorage.
 * Session blobs are encrypted-at-rest via Keychain wrapping key + MMKV (v1).
 */
export class SignalKeyStore {
  async loadIdentityPrivate(): Promise<SignalIdentityPrivate | null> {
    try {
      const stored = await Keychain.getGenericPassword({
        service: E2E_KEYCHAIN_SERVICE,
      });
      if (!stored || !stored.password) return null;
      return JSON.parse(stored.password) as SignalIdentityPrivate;
    } catch (error) {
      console.warn("[e2e] Keychain identity read failed:", error);
      return null;
    }
  }

  async saveIdentityPrivate(identity: SignalIdentityPrivate): Promise<void> {
    await Keychain.setGenericPassword("e2e-identity", JSON.stringify(identity), {
      service: E2E_KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
    });
  }

  async loadPublicMeta(): Promise<SignalPublicMeta | null> {
    try {
      const raw = await AsyncStorage.getItem(PUBLIC_META_KEY);
      return raw ? (JSON.parse(raw) as SignalPublicMeta) : null;
    } catch {
      return null;
    }
  }

  async savePublicMeta(meta: SignalPublicMeta): Promise<void> {
    await AsyncStorage.setItem(PUBLIC_META_KEY, JSON.stringify(meta));
  }

  async saveSessionBlob(peerUserId: string, blob: string): Promise<void> {
    mmkv.set(`${SESSION_PREFIX}${peerUserId}`, blob);
  }

  async loadSessionBlob(peerUserId: string): Promise<string | null> {
    try {
      return mmkv.getString(`${SESSION_PREFIX}${peerUserId}`) ?? null;
    } catch {
      return null;
    }
  }

  /** v1 helper: map local message id → plaintext so sender can render own history. */
  saveOutgoingPlaintext(idLocal: string, plaintext: string): void {
    if (!idLocal) return;
    mmkv.set(`e2e_plain_${idLocal}`, plaintext);
  }

  loadOutgoingPlaintext(idLocal: string): string | null {
    if (!idLocal) return null;
    try {
      return mmkv.getString(`e2e_plain_${idLocal}`) ?? null;
    } catch {
      return null;
    }
  }
}

export const signalKeyStore = new SignalKeyStore();
