import "react-native-get-random-values";
import { gcm } from "@noble/ciphers/aes";
import { randomBytes } from "@noble/hashes/utils";
import RNFS from "react-native-fs";
import { signalProtocolService } from "./SignalProtocolService";

export type MediaKeyPlaintextV1 = {
  t: "media";
  v: 1;
  key: string;
  iv: string;
  mime?: string;
  caption?: string;
  /** Thumbnail encrypted with same AES key; new IV. */
  thumbIv?: string;
};

export type EncryptFileResult = {
  tempPath: string;
  keyB64: string;
  ivB64: string;
  mimeHint?: string;
};

const E2E_CACHE_DIR = `${RNFS.CachesDirectoryPath}/e2e-media`;

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

export function stripFileScheme(uriOrPath: string): string {
  if (!uriOrPath) return uriOrPath;
  if (uriOrPath.startsWith("file://")) {
    try {
      return decodeURIComponent(uriOrPath.replace("file://", ""));
    } catch {
      return uriOrPath.replace("file://", "");
    }
  }
  return uriOrPath;
}

function guessMimeFromPath(path: string): string | undefined {
  const lower = path.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return undefined;
}

function extFromMimeOrPath(mime?: string, path?: string): string {
  if (mime?.includes("jpeg") || mime?.includes("jpg")) return "jpg";
  if (mime?.includes("png")) return "png";
  if (mime?.includes("gif")) return "gif";
  if (mime?.includes("webp")) return "webp";
  if (mime?.includes("mp4")) return "mp4";
  if (mime?.includes("quicktime")) return "mov";
  if (mime?.includes("mpeg") || mime?.includes("mp3")) return "mp3";
  if (mime?.includes("pdf")) return "pdf";
  if (path) {
    const base = path.split("?")[0];
    const dot = base.lastIndexOf(".");
    if (dot > -1 && dot > base.length - 6) return base.slice(dot + 1);
  }
  return "bin";
}

async function ensureCacheDir(): Promise<void> {
  const exists = await RNFS.exists(E2E_CACHE_DIR);
  if (!exists) {
    await RNFS.mkdir(E2E_CACHE_DIR);
  }
}

async function readFileBytes(uriOrPath: string): Promise<Uint8Array> {
  const path = stripFileScheme(uriOrPath);
  const b64 = await RNFS.readFile(path, "base64");
  return fromB64(b64);
}

async function writeFileBytes(path: string, bytes: Uint8Array): Promise<void> {
  await RNFS.writeFile(path, toB64(bytes), "base64");
}

/**
 * Encrypt file bytes with a random (or provided) AES-256-GCM key.
 * Writes ciphertext to a temp path under CachesDirectoryPath.
 */
export async function encryptFileToTemp(
  localUri: string,
  options?: { keyB64?: string; mimeHint?: string }
): Promise<EncryptFileResult> {
  await ensureCacheDir();
  const plaintext = await readFileBytes(localUri);
  const key = options?.keyB64 ? fromB64(options.keyB64) : randomBytes(32);
  const iv = randomBytes(12);
  const cipher = gcm(key, iv);
  const ciphertext = cipher.encrypt(plaintext);
  const tempPath = `${E2E_CACHE_DIR}/enc-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.bin`;
  await writeFileBytes(tempPath, ciphertext);
  const mimeHint =
    options?.mimeHint ?? guessMimeFromPath(stripFileScheme(localUri));
  return {
    tempPath,
    keyB64: toB64(key),
    ivB64: toB64(iv),
    mimeHint,
  };
}

/**
 * Decrypt an encrypted file to a temp path under CachesDirectoryPath.
 * Returns a `file://` URI suitable for FastImage / Video / FileViewer.
 */
export async function decryptFileToTemp(
  encryptedPathOrUri: string,
  keyB64: string,
  ivB64: string,
  outExt: string
): Promise<string> {
  await ensureCacheDir();
  const ciphertext = await readFileBytes(encryptedPathOrUri);
  const cipher = gcm(fromB64(keyB64), fromB64(ivB64));
  const plaintext = cipher.decrypt(ciphertext);
  const safeExt = (outExt || "bin").replace(/[^a-zA-Z0-9]/g, "") || "bin";
  const outPath = `${E2E_CACHE_DIR}/dec-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${safeExt}`;
  await writeFileBytes(outPath, plaintext);
  return outPath.startsWith("file://") ? outPath : `file://${outPath}`;
}

export function buildMediaKeyPlaintext(input: {
  keyB64: string;
  ivB64: string;
  mime?: string;
  caption?: string;
  thumbIv?: string;
}): string {
  const pkg: MediaKeyPlaintextV1 = {
    t: "media",
    v: 1,
    key: input.keyB64,
    iv: input.ivB64,
  };
  if (input.mime) pkg.mime = input.mime;
  if (input.caption) pkg.caption = input.caption;
  if (input.thumbIv) pkg.thumbIv = input.thumbIv;
  return JSON.stringify(pkg);
}

export function parseMediaKeyPlaintext(
  s: string | undefined | null
): MediaKeyPlaintextV1 | null {
  if (!s || typeof s !== "string") return null;
  const trimmed = s.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const parsed = JSON.parse(trimmed) as MediaKeyPlaintextV1;
    if (
      parsed?.t === "media" &&
      parsed?.v === 1 &&
      typeof parsed.key === "string" &&
      typeof parsed.iv === "string"
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function isE2eMediaRoom(display: {
  e2eEnabled?: boolean;
  roomType?: string;
}): boolean {
  return !!display?.e2eEnabled && display?.roomType === "individual";
}

/** Same peer resolution as SendChatContainer e2ePeerUserId. */
export function resolveE2ePeerUserId(display: {
  e2eEnabled?: boolean;
  roomType?: string;
  participantsNotLeft?: Array<{ user_id?: string }>;
  participants?: Array<{ user_id?: string }>;
  currentUserUtility?: { user_id?: string };
}): string {
  if (!isE2eMediaRoom(display)) return "";
  const selfId = String(display.currentUserUtility?.user_id ?? "");
  const list = display.participantsNotLeft?.length
    ? display.participantsNotLeft
    : display.participants || [];
  const peer = list.find((p) => String(p?.user_id) !== selfId);
  return peer?.user_id ? String(peer.user_id) : "";
}

export function plainCaptionFromMessage(
  messageBody: string | undefined | null
): string | undefined {
  if (!messageBody || typeof messageBody !== "string") return undefined;
  if (parseMediaKeyPlaintext(messageBody)) return undefined;
  const trimmed = messageBody.trim();
  if (!trimmed || trimmed.startsWith("{")) {
    // Likely an envelope or empty — skip
    try {
      const obj = JSON.parse(trimmed);
      if (obj?.e2e === true) return undefined;
    } catch {
      // not JSON — treat as caption
    }
  }
  return trimmed || undefined;
}

/** Signal-wrap the media key JSON for the peer. */
export async function encryptMediaKeyForPeer(
  peerUserId: string,
  packageJson: string
): Promise<string> {
  return signalProtocolService.encryptText(peerUserId, packageJson);
}

export async function unlinkQuiet(pathOrUri?: string | null): Promise<void> {
  if (!pathOrUri) return;
  const path = stripFileScheme(pathOrUri);
  try {
    if (await RNFS.exists(path)) {
      await RNFS.unlink(path);
    }
  } catch {
    // ignore cleanup errors
  }
}

export function mediaCacheKey(messageId: string, kind: "file" | "thumbnail"): string {
  return `${messageId}:${kind}`;
}

export function cachedDecryptedPath(
  messageId: string,
  kind: "file" | "thumbnail",
  ext: string
): string {
  const safeExt = (ext || "bin").replace(/[^a-zA-Z0-9]/g, "") || "bin";
  return `${E2E_CACHE_DIR}/${messageId}-${kind}.${safeExt}`;
}

export { extFromMimeOrPath, E2E_CACHE_DIR };
