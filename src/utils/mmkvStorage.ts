import { MMKV, type MMKVConfiguration, type NativeMMKV } from "react-native-mmkv";

type StorageConfig = ConstructorParameters<typeof MMKV>[0];

class MemoryStorage implements NativeMMKV {
  private readonly values = new Map<string, boolean | string | number | Uint8Array>();

  set(key: string, value: boolean | string | number | Uint8Array) {
    this.values.set(key, value);
  }

  getBoolean(key: string) {
    const value = this.values.get(key);
    return typeof value === "boolean" ? value : undefined;
  }

  getString(key: string) {
    const value = this.values.get(key);
    return typeof value === "string" ? value : undefined;
  }

  getNumber(key: string) {
    const value = this.values.get(key);
    return typeof value === "number" ? value : undefined;
  }

  getBuffer(key: string) {
    const value = this.values.get(key);
    return value instanceof Uint8Array ? value : undefined;
  }

  contains(key: string) {
    return this.values.has(key);
  }

  delete(key: string) {
    this.values.delete(key);
  }

  getAllKeys() {
    return Array.from(this.values.keys());
  }

  clearAll() {
    this.values.clear();
  }

  recrypt() {}
}

const fallbackStores = new Map<string, MemoryStorage>();
const warnedStoreIds = new Set<string>();

function getStoreId(configuration?: StorageConfig) {
  return configuration?.id ?? "mmkv.default";
}

function getFallbackStore(storeId: string) {
  const existingStore = fallbackStores.get(storeId);
  if (existingStore != null) {
    return existingStore;
  }

  const nextStore = new MemoryStorage();
  fallbackStores.set(storeId, nextStore);
  return nextStore;
}

function warnFallback(error: unknown, storeId: string) {
  if (warnedStoreIds.has(storeId)) {
    return;
  }

  warnedStoreIds.add(storeId);
  const message = error instanceof Error ? error.message : String(error);
  const prefix = __DEV__
    ? `[MMKV] Falling back to in-memory storage for "${storeId}" in debug mode. ` +
      `Use an on-device debugger and disable remote JS debugging/React Native Debugger if you need real MMKV data.`
    : `[MMKV] Falling back to in-memory storage for "${storeId}" in release mode.`;

  console.warn(`${prefix}\n${message}`);
}

export function createStorage(configuration?: StorageConfig): NativeMMKV {
  try {
    return new MMKV(configuration as MMKVConfiguration | undefined);
  } catch (error) {
    const storeId = getStoreId(configuration);
    warnFallback(error, storeId);
    return getFallbackStore(storeId);
  }
}
