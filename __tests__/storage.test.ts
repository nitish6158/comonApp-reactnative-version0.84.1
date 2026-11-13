import AsyncStorage from "@react-native-async-storage/async-storage";
import { DefaultStorageKeys, getStorage, removeStorage, setStorage } from "../src/utils/storage";

describe("storage utilities", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("sets, retrieves, and removes values cleanly", async () => {
    expect(await getStorage(DefaultStorageKeys.LANGUAGE)).toBeUndefined();

    await setStorage(DefaultStorageKeys.LANGUAGE, "en");
    expect(await getStorage(DefaultStorageKeys.LANGUAGE)).toBe("en");

    await setStorage(DefaultStorageKeys.COUNTRY_CODE);
    expect(await getStorage(DefaultStorageKeys.COUNTRY_CODE)).toBe("true");

    await removeStorage(DefaultStorageKeys.LANGUAGE);
    expect(await getStorage(DefaultStorageKeys.LANGUAGE)).toBeUndefined();
  });
});

