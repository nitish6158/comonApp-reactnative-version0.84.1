import { useEffect, useRef, useState } from "react";
import RNFS from "react-native-fs";
import { DefaultImageUrl } from "@Service/provider/endpoints";
import { Conversation } from "@Models/chatmessage";
import { singleRoomType } from "@Atoms/singleRoom";
import {
  isE2eEnvelopeMessage,
  signalProtocolService,
} from "@/services/e2e/SignalProtocolService";
import {
  cachedDecryptedPath,
  decryptFileToTemp,
  extFromMimeOrPath,
  MediaKeyPlaintextV1,
  parseMediaKeyPlaintext,
  stripFileScheme,
  unlinkQuiet,
} from "@/services/e2e/e2eMedia";

type Kind = "file" | "thumbnail";

type Options = {
  kind?: Kind;
};

type Result = {
  uri: string | null;
  loading: boolean;
  error: string | null;
  mediaPackage: MediaKeyPlaintextV1 | null;
};

const memoryCache = new Map<string, string>();

function remoteUrl(relativePath: string): string {
  if (!relativePath) return "";
  if (
    relativePath.startsWith("http://") ||
    relativePath.startsWith("https://") ||
    relativePath.startsWith("file:")
  ) {
    return relativePath;
  }
  return `${DefaultImageUrl}${relativePath}`;
}

function resolveMediaPackage(message: Conversation | any): MediaKeyPlaintextV1 | null {
  if (message?.e2eMedia && typeof message.e2eMedia === "object") {
    const pkg = message.e2eMedia as MediaKeyPlaintextV1;
    if (pkg?.t === "media" && pkg?.key && pkg?.iv) return pkg;
  }
  return parseMediaKeyPlaintext(message?.message);
}

/**
 * Resolve a displayable URI for chat media.
 * Non-E2E / no media package → existing CDN URL.
 * E2E → decrypt Signal envelope (if needed), download ciphertext, AES-GCM decrypt to cache.
 */
export function useE2eMediaUri(
  message: Conversation | any,
  display: singleRoomType,
  options: Options = {}
): Result {
  const kind: Kind = options.kind ?? "file";
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaPackage, setMediaPackage] = useState<MediaKeyPlaintextV1 | null>(
    null
  );
  const runId = useRef(0);

  useEffect(() => {
    const id = ++runId.current;
    let cancelled = false;

    async function run() {
      setError(null);

      const relativePath =
        kind === "thumbnail" ? message?.thumbnail : message?.fileURL;
      if (!relativePath) {
        setUri(null);
        setMediaPackage(null);
        return;
      }

      // Optimistic / local file — show as-is
      if (
        typeof relativePath === "string" &&
        (relativePath.startsWith("file:") || relativePath.startsWith("content:"))
      ) {
        setUri(relativePath);
        setMediaPackage(null);
        return;
      }

      let pkg = resolveMediaPackage(message);

      // Still a Signal envelope — decrypt then parse media package
      if (!pkg && isE2eEnvelopeMessage(message?.message)) {
        try {
          const plaintext = await signalProtocolService.decryptText(
            message.message,
            String(message.sender ?? "")
          );
          pkg = parseMediaKeyPlaintext(plaintext);
        } catch (err) {
          console.warn("[e2e-media] envelope decrypt failed:", err);
          if (!cancelled && id === runId.current) {
            setError("decrypt");
            setUri(null);
          }
          return;
        }
      }

      if (!pkg) {
        // Non-E2E path: CDN URL (unchanged)
        setMediaPackage(null);
        setUri(remoteUrl(relativePath));
        return;
      }

      if (!cancelled && id === runId.current) {
        setMediaPackage(pkg);
      }

      const messageId = String(message?._id ?? message?.id_local ?? relativePath);
      const cacheKey = `${messageId}:${kind}`;
      const mem = memoryCache.get(cacheKey);
      if (mem) {
        setUri(mem);
        return;
      }

      const outExt = extFromMimeOrPath(
        pkg.mime,
        kind === "thumbnail" ? "thumb.jpg" : relativePath
      );
      const durablePath = cachedDecryptedPath(messageId, kind, outExt);
      try {
        if (await RNFS.exists(stripFileScheme(durablePath))) {
          const fileUri = durablePath.startsWith("file://")
            ? durablePath
            : `file://${durablePath}`;
          memoryCache.set(cacheKey, fileUri);
          if (!cancelled && id === runId.current) setUri(fileUri);
          return;
        }
      } catch {
        // continue to download
      }

      setLoading(true);
      let encTemp: string | null = null;
      try {
        const fromUrl = remoteUrl(relativePath);
        encTemp = `${RNFS.CachesDirectoryPath}/e2e-media/dl-${messageId}-${kind}.bin`;
        const parent = `${RNFS.CachesDirectoryPath}/e2e-media`;
        if (!(await RNFS.exists(parent))) {
          await RNFS.mkdir(parent);
        }
        const dl = await RNFS.downloadFile({
          fromUrl,
          toFile: encTemp,
        }).promise;
        if (dl.statusCode && dl.statusCode >= 400) {
          throw new Error(`download status ${dl.statusCode}`);
        }

        if (kind === "thumbnail" && !pkg.thumbIv) {
          // Thumbnail ciphertext without thumbIv cannot be decrypted — skip
          if (!cancelled && id === runId.current) setUri(null);
          return;
        }
        const iv = kind === "thumbnail" ? pkg.thumbIv! : pkg.iv;

        const decryptedUri = await decryptFileToTemp(
          encTemp,
          pkg.key,
          iv,
          outExt
        );
        // Persist under stable cache path for reuse
        const plainPath = stripFileScheme(decryptedUri);
        const durable = stripFileScheme(durablePath);
        try {
          if (plainPath !== durable) {
            if (await RNFS.exists(durable)) await RNFS.unlink(durable);
            await RNFS.moveFile(plainPath, durable);
          }
        } catch {
          // keep decryptedUri if move fails
          memoryCache.set(cacheKey, decryptedUri);
          if (!cancelled && id === runId.current) setUri(decryptedUri);
          return;
        }
        const fileUri = `file://${durable}`;
        memoryCache.set(cacheKey, fileUri);
        if (!cancelled && id === runId.current) setUri(fileUri);
      } catch (err) {
        console.warn("[e2e-media] resolve failed:", err);
        if (!cancelled && id === runId.current) {
          setError("resolve");
          setUri(null);
        }
      } finally {
        await unlinkQuiet(encTemp);
        if (!cancelled && id === runId.current) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [
    message?._id,
    message?.fileURL,
    message?.thumbnail,
    message?.message,
    message?.e2eMedia,
    message?.sender,
    kind,
    display?.e2eEnabled,
    display?.roomId,
  ]);

  return { uri, loading, error, mediaPackage };
}

export default useE2eMediaUri;
