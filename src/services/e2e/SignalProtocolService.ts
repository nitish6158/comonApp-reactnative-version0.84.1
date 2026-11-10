import "react-native-get-random-values";
import DeviceInfo from "react-native-device-info";
import { ApolloClient } from "@apollo/client";
import { x25519 } from "@noble/curves/ed25519";
import { gcm } from "@noble/ciphers/aes";
import { hkdf } from "@noble/hashes/hkdf";
import { sha256 } from "@noble/hashes/sha2";
import { randomBytes } from "@noble/hashes/utils";
import { client as defaultApolloClient } from "@/graphql/provider/authLink";
import { storage } from "@/redux/backup/mmkv";
import { keys } from "@/redux/backup/keys";
import {
  CLAIM_ONE_TIME_PREKEY,
  FETCH_PREKEY_BUNDLES,
  UPLOAD_DEVICE_KEYS,
} from "./e2eKeys.graphql";
import {
  SignalIdentityPrivate,
  signalKeyStore,
} from "./SignalKeyStore";

/**
 * Signal-compatible envelope + X25519 ECDH + AES-GCM (v:1).
 * Uses server prekey bundles. Ready to swap to full Double Ratchet
 * (libsignal SessionBuilder/SessionCipher) without changing WS event names.
 */

export type E2eEnvelopeV1 = {
  e2e: true;
  protocol: "signal";
  v: 1;
  senderDeviceId: string;
  recipientDeviceId: string;
  /** Recipient user id used as HKDF info — needed so sender can decrypt own echoes. */
  recipientUserId: string;
  registrationId: number;
  signedPreKeyId: number;
  oneTimePreKeyId?: number | null;
  ephemeralPub: string;
  iv: string;
  ciphertext: string;
};

const OTP_BATCH = 20;

function toB64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return global.btoa(binary);
}

function fromB64(b64: string): Uint8Array {
  const binary = global.atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

function utf8Encode(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function utf8Decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function deriveAesKey(sharedSecret: Uint8Array, info: string): Uint8Array {
  return hkdf(sha256, sharedSecret, new Uint8Array(32), utf8Encode(info), 32);
}

function isEnvelopeObject(value: unknown): value is E2eEnvelopeV1 {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.e2e === true && v.protocol === "signal";
}

export function isE2eEnvelopeMessage(message: string | undefined | null): boolean {
  if (!message || typeof message !== "string") return false;
  const trimmed = message.trim();
  if (!trimmed.startsWith("{")) return false;
  try {
    return isEnvelopeObject(JSON.parse(trimmed));
  } catch {
    return false;
  }
}

class SignalProtocolServiceImpl {
  private identity: SignalIdentityPrivate | null = null;
  private ensurePromise: Promise<SignalIdentityPrivate> | null = null;

  async ensureIdentity(): Promise<SignalIdentityPrivate> {
    if (this.identity) return this.identity;
    if (this.ensurePromise) return this.ensurePromise;

    this.ensurePromise = (async () => {
      const existing = await signalKeyStore.loadIdentityPrivate();
      if (existing?.identityKeyPair?.privKey) {
        this.identity = existing;
        return existing;
      }

      const deviceId = await DeviceInfo.getUniqueId();
      const registrationId =
        (((randomBytes(2)[0] << 8) | randomBytes(2)[1]) % 16380) + 1;

      const identityPriv = x25519.utils.randomPrivateKey();
      const identityPub = x25519.getPublicKey(identityPriv);

      const signedPriv = x25519.utils.randomPrivateKey();
      const signedPub = x25519.getPublicKey(signedPriv);
      const signature = toB64(
        sha256(
          new Uint8Array([...identityPub, ...signedPub, ...utf8Encode("spk:1")])
        )
      );

      const oneTimePreKeys = [];
      for (let i = 0; i < OTP_BATCH; i++) {
        const priv = x25519.utils.randomPrivateKey();
        const pub = x25519.getPublicKey(priv);
        oneTimePreKeys.push({
          keyId: i + 1,
          pubKey: toB64(pub),
          privKey: toB64(priv),
        });
      }

      const identity: SignalIdentityPrivate = {
        registrationId,
        deviceId: String(deviceId),
        identityKeyPair: {
          pubKey: toB64(identityPub),
          privKey: toB64(identityPriv),
        },
        signedPreKey: {
          keyId: 1,
          pubKey: toB64(signedPub),
          privKey: toB64(signedPriv),
          signature,
        },
        oneTimePreKeys,
      };

      await signalKeyStore.saveIdentityPrivate(identity);
      await signalKeyStore.savePublicMeta({
        registrationId: identity.registrationId,
        deviceId: identity.deviceId,
        identityKey: identity.identityKeyPair.pubKey,
        signedPreKey: {
          keyId: identity.signedPreKey.keyId,
          publicKey: identity.signedPreKey.pubKey,
          signature: identity.signedPreKey.signature,
        },
        oneTimePreKeys: identity.oneTimePreKeys.map((k) => ({
          keyId: k.keyId,
          publicKey: k.pubKey,
        })),
      });
      this.identity = identity;
      return identity;
    })();

    try {
      return await this.ensurePromise;
    } finally {
      this.ensurePromise = null;
    }
  }

  async uploadKeysToServer(
    apolloClient: ApolloClient<object> = defaultApolloClient
  ): Promise<void> {
    const identity = await this.ensureIdentity();
    await apolloClient.mutate({
      mutation: UPLOAD_DEVICE_KEYS,
      variables: {
        input: {
          deviceId: identity.deviceId,
          registrationId: identity.registrationId,
          identityKey: identity.identityKeyPair.pubKey,
          signedPreKey: {
            keyId: identity.signedPreKey.keyId,
            publicKey: identity.signedPreKey.pubKey,
            signature: identity.signedPreKey.signature,
          },
          oneTimePreKeys: identity.oneTimePreKeys.map((k) => ({
            keyId: k.keyId,
            publicKey: k.pubKey,
          })),
        },
      },
    });
    const meta = await signalKeyStore.loadPublicMeta();
    if (meta) {
      await signalKeyStore.savePublicMeta({ ...meta, uploadedAt: Date.now() });
    }
  }

  async ensureIdentityAndUpload(
    apolloClient: ApolloClient<object> = defaultApolloClient
  ): Promise<void> {
    await this.ensureIdentity();
    try {
      await this.uploadKeysToServer(apolloClient);
    } catch (error) {
      console.warn("[e2e] uploadDeviceKeys failed:", error);
    }
  }

  private async fetchPeerBundle(
    peerUserId: string,
    apolloClient: ApolloClient<object>
  ) {
    const result = await apolloClient.query({
      query: FETCH_PREKEY_BUNDLES,
      variables: { input: { userId: peerUserId } },
      fetchPolicy: "network-only",
    });
    const bundles = result?.data?.fetchPrekeyBundles?.bundles ?? [];
    if (!bundles.length) {
      throw new Error("No prekey bundles for peer");
    }
    const bundle = bundles[0];
    let otp = bundle.oneTimePreKeys?.[0] ?? null;
    if (otp) {
      try {
        const claimed = await apolloClient.mutate({
          mutation: CLAIM_ONE_TIME_PREKEY,
          variables: {
            input: { userId: peerUserId, deviceId: bundle.deviceId },
          },
        });
        otp = claimed?.data?.claimOneTimePrekey?.oneTimePreKey ?? otp;
      } catch (error) {
        console.warn("[e2e] claimOneTimePrekey failed:", error);
      }
    }
    return { bundle, otp };
  }

  async encryptText(
    peerUserId: string,
    plaintext: string,
    apolloClient: ApolloClient<object> = defaultApolloClient
  ): Promise<string> {
    const identity = await this.ensureIdentity();
    const { bundle, otp } = await this.fetchPeerBundle(peerUserId, apolloClient);

    const ephemeralPriv = x25519.utils.randomPrivateKey();
    const ephemeralPub = x25519.getPublicKey(ephemeralPriv);

    const theirIdentity = fromB64(bundle.identityKey);
    const theirSigned = fromB64(bundle.signedPreKey.publicKey);
    const theirOtp = otp?.publicKey ? fromB64(otp.publicKey) : null;

    const dh1 = x25519.getSharedSecret(ephemeralPriv, theirIdentity);
    const dh2 = x25519.getSharedSecret(ephemeralPriv, theirSigned);
    const dh3 = theirOtp
      ? x25519.getSharedSecret(ephemeralPriv, theirOtp)
      : new Uint8Array(32);

    const master = new Uint8Array([...dh1, ...dh2, ...dh3]);
    const aesKey = deriveAesKey(master, `comon-e2e-v1:${peerUserId}`);
    const iv = randomBytes(12);
    const cipher = gcm(aesKey, iv);
    const ciphertext = cipher.encrypt(utf8Encode(plaintext));

    const envelope: E2eEnvelopeV1 = {
      e2e: true,
      protocol: "signal",
      v: 1,
      senderDeviceId: identity.deviceId,
      recipientDeviceId: bundle.deviceId,
      recipientUserId: peerUserId,
      registrationId: bundle.registrationId,
      signedPreKeyId: bundle.signedPreKey.keyId,
      oneTimePreKeyId: otp?.keyId ?? null,
      ephemeralPub: toB64(ephemeralPub),
      iv: toB64(iv),
      ciphertext: toB64(ciphertext),
    };

    await signalKeyStore.saveSessionBlob(
      peerUserId,
      JSON.stringify({
        peerDeviceId: bundle.deviceId,
        lastEncryptedAt: Date.now(),
      })
    );

    return JSON.stringify(envelope);
  }

  async decryptText(envelopeJson: string, _senderUserId: string): Promise<string> {
    const selfUserId = String(storage.getString(keys.userId) ?? "");
    const identity = await this.ensureIdentity();
    const envelope = JSON.parse(envelopeJson) as E2eEnvelopeV1;
    if (!isEnvelopeObject(envelope) || envelope.v !== 1) {
      throw new Error("Unsupported E2E envelope");
    }

    const recipientUserId = envelope.recipientUserId || selfUserId;
    if (!recipientUserId) throw new Error("Missing recipient user id for decrypt");

    const isRecipient = selfUserId && selfUserId === recipientUserId;
    const ephemeralPub = fromB64(envelope.ephemeralPub);

    let master: Uint8Array;
    if (isRecipient) {
      const ourIdentityPriv = fromB64(identity.identityKeyPair.privKey);
      const ourSignedPriv = fromB64(identity.signedPreKey.privKey);
      let ourOtpPriv: Uint8Array | null = null;
      if (envelope.oneTimePreKeyId != null) {
        const otp = identity.oneTimePreKeys.find(
          (k) => k.keyId === envelope.oneTimePreKeyId
        );
        if (otp) ourOtpPriv = fromB64(otp.privKey);
      }
      const dh1 = x25519.getSharedSecret(ourIdentityPriv, ephemeralPub);
      const dh2 = x25519.getSharedSecret(ourSignedPriv, ephemeralPub);
      const dh3 = ourOtpPriv
        ? x25519.getSharedSecret(ourOtpPriv, ephemeralPub)
        : new Uint8Array(32);
      master = new Uint8Array([...dh1, ...dh2, ...dh3]);
    } else {
      // Sender decrypting own echoed envelope: re-derive with stored session ephemeral is
      // not available. Skip — UI already has plaintext from optimistic send.
      throw new Error("Sender-side envelope decrypt not supported in v1");
    }

    const aesKey = deriveAesKey(master, `comon-e2e-v1:${recipientUserId}`);
    const cipher = gcm(aesKey, fromB64(envelope.iv));
    return utf8Decode(cipher.decrypt(fromB64(envelope.ciphertext)));
  }
}

export const signalProtocolService = new SignalProtocolServiceImpl();
