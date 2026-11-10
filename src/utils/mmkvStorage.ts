import { createMMKV, type Configuration, type MMKV } from "react-native-mmkv";

/**
 * App storage surface: MMKV v4 API + legacy `delete` alias used across the codebase.
 */
export type AppStorage = MMKV & {
  delete: (key: string) => boolean;
};

type MemoryValue = boolean | string | number | ArrayBuffer;

class MemoryStorage {
  private readonly values = new Map<string, MemoryValue>();

  set(key: string, value: MemoryValue) {
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
    return value instanceof ArrayBuffer ? value : undefined;
  }

  contains(key: string) {
    return this.values.has(key);
  }

  remove(key: string) {
    return this.values.delete(key);
  }

  delete(key: string) {
    return this.remove(key);
  }

  getAllKeys() {
    return Array.from(this.values.keys());
  }

  clearAll() {
    this.values.clear();
  }

  recrypt() {}
  encrypt() {}
  decrypt() {}
  trim() {}
  addOnValueChangedListener() {
    return { remove: () => undefined };
  }
}

const fallbackStores = new Map<string, MemoryStorage>();
const warnedStoreIds = new Set<string>();

function getStoreId(configuration?: Configuration) {
  return configuration?.id ?? "mmkv.default";
}

function getFallbackStore(storeId: string): AppStorage {
  const existingStore = fallbackStores.get(storeId);
  if (existingStore != null) {
    return existingStore as unknown as AppStorage;
  }

  const nextStore = new MemoryStorage();
  fallbackStores.set(storeId, nextStore);
  return nextStore as unknown as AppStorage;
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

function withDeleteAlias(storage: MMKV): AppStorage {
  const aliased = storage as AppStorage;
  if (typeof aliased.delete !== "function") {
    aliased.delete = (key: string) => storage.remove(key);
  }
  return aliased;
}

export function createStorage(configuration?: Configuration): AppStorage {
  try {
    return withDeleteAlias(createMMKV(configuration));
  } catch (error) {
    const storeId = getStoreId(configuration);
    warnFallback(error, storeId);
    return getFallbackStore(storeId);
  }
}
