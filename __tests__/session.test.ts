const AUTH_SERVICE = 'com.comon.app.auth';

async function loadSessionModule() {
  jest.resetModules();
  const Keychain = require('react-native-keychain');
  Keychain.__clearMockStorage?.();
  const AsyncStorage = require('@react-native-async-storage/async-storage');
  await AsyncStorage.clear();
  const session = require('@/utils/session') as typeof import('@/utils/session');
  return { session, Keychain, AsyncStorage };
}

describe('session (Keychain)', () => {
  it('setSession writes secrets to Keychain and clears AsyncStorage token keys', async () => {
    const { session, Keychain, AsyncStorage } = await loadSessionModule();

    await AsyncStorage.setItem('session_token', 'legacy-token');
    await AsyncStorage.setItem('COM_ON_TOKEN', 'legacy-token');

    const ok = await session.setSession({
      token: 'access-1',
      refresh: 'refresh-1',
      mode: 'CLASSIC',
      expireAt: 123456,
    });

    expect(ok).toBe(true);
    expect(Keychain.setGenericPassword).toHaveBeenCalled();

    const stored = await Keychain.getGenericPassword({ service: AUTH_SERVICE });
    expect(stored).toBeTruthy();
    const parsed = JSON.parse((stored as any).password);
    expect(parsed.token).toBe('access-1');
    expect(parsed.refresh).toBe('refresh-1');
    expect(parsed.mode).toBe('CLASSIC');

    expect(await AsyncStorage.getItem('session_token')).toBeNull();
    expect(await AsyncStorage.getItem('COM_ON_TOKEN')).toBeNull();
  });

  it('getSession returns in-memory / Keychain session', async () => {
    const { session } = await loadSessionModule();

    await session.setSession({
      token: 't2',
      refresh: 'r2',
      mode: 'SENIOR',
      expireAt: 99,
    });

    const loaded = await session.getSession();
    expect(loaded).toEqual({
      token: 't2',
      refresh: 'r2',
      expireAt: '99',
      mode: 'SENIOR',
    });
  });

  it('migrates legacy AsyncStorage tokens into Keychain once', async () => {
    const { session, Keychain, AsyncStorage } = await loadSessionModule();

    await AsyncStorage.setItem('COM_ON_TOKEN', 'old-access');
    await AsyncStorage.setItem('COM_ON_REFRESH', 'old-refresh');
    await AsyncStorage.setItem('MODE', 'CLASSIC');
    await AsyncStorage.setItem('COM_ON_TOKEN_EXPIRE_AT', '555');

    const loaded = await session.getSession();
    expect(loaded.token).toBe('old-access');
    expect(loaded.refresh).toBe('old-refresh');

    const stored = await Keychain.getGenericPassword({ service: AUTH_SERVICE });
    expect(stored).toBeTruthy();

    expect(await AsyncStorage.getItem('COM_ON_TOKEN')).toBeNull();
    expect(await AsyncStorage.getItem('COM_ON_REFRESH')).toBeNull();
  });

  it('removeSession clears Keychain and legacy keys', async () => {
    const { session, Keychain, AsyncStorage } = await loadSessionModule();

    await session.setSession({
      token: 'x',
      refresh: 'y',
      mode: 'CLASSIC',
      expireAt: 1,
    });
    await AsyncStorage.setItem('COM_ON_LOGIN_DEVICE', '{}');

    await session.removeSession();

    const stored = await Keychain.getGenericPassword({ service: AUTH_SERVICE });
    expect(stored).toBe(false);

    const after = await session.getSession();
    expect(after.token).toBeNull();
    expect(after.refresh).toBeNull();
    expect(await AsyncStorage.getItem('COM_ON_LOGIN_DEVICE')).toBeNull();
  });
});
