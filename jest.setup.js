/* global jest */

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
      return Promise.resolve();
    }),
    getItem: jest.fn(key => Promise.resolve(store[key] ?? null)),
    removeItem: jest.fn(key => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      store = {};
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
    multiGet: jest.fn(keys =>
      Promise.resolve(keys.map(k => [k, store[k] ?? null])),
    ),
    multiSet: jest.fn(pairs => {
      pairs.forEach(([k, v]) => {
        store[k] = String(v);
      });
      return Promise.resolve();
    }),
    multiRemove: jest.fn(keys => {
      keys.forEach(k => delete store[k]);
      return Promise.resolve();
    }),
  };
});

jest.mock('react-native-keychain', () => {
  const values = new Map();

  return {
    ACCESSIBLE: {
      AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY:
        'AccessibleAfterFirstUnlockThisDeviceOnly',
      WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
    },
    ACCESS_CONTROL: {
      BIOMETRY_ANY: 'BiometryAny',
    },
    SECURITY_LEVEL: {
      SECURE_HARDWARE: 'SECURE_HARDWARE',
      SECURE_SOFTWARE: 'SECURE_SOFTWARE',
    },
    getGenericPassword: jest.fn(options => {
      const service = options?.service ?? 'default';
      const password = values.get(service);
      return Promise.resolve(
        password
          ? {
              password,
              service,
              storage: 'mock',
              username: 'comon',
            }
          : false,
      );
    }),
    setGenericPassword: jest.fn((username, password, options) => {
      const service = options?.service ?? 'default';
      values.set(service, password);
      return Promise.resolve({ service, storage: 'mock' });
    }),
    resetGenericPassword: jest.fn(options => {
      values.delete(options?.service ?? 'default');
      return Promise.resolve(true);
    }),
    __clearMockStorage: () => values.clear(),
    __getMockStorage: () => values,
  };
});

jest.mock('react-native-permissions', () =>
  require('react-native-permissions/mock'),
);

jest.mock('@react-native-firebase/messaging', () => {
  const AuthorizationStatus = {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
    DENIED: 0,
  };
  const messaging = jest.fn(() => ({
    requestPermission: jest.fn(() =>
      Promise.resolve(AuthorizationStatus.AUTHORIZED),
    ),
    registerDeviceForRemoteMessages: jest.fn(() => Promise.resolve()),
  }));
  messaging.AuthorizationStatus = AuthorizationStatus;
  return messaging;
});

jest.mock('@/utils/permission', () => ({
  askCameraPermission: jest.fn(() => Promise.resolve(true)),
  checkMediaPermission: jest.fn(() => Promise.resolve(true)),
  askMediaPermission: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('@/utils/socket/SocketConnection', () => {
  const emit = jest.fn(() => Promise.resolve());
  const disconnect = jest.fn();
  const connect = jest.fn(() =>
    Promise.resolve({ connected: true, id: 'mock' }),
  );
  const forceReconnect = jest.fn(() => Promise.resolve());
  const liveSocket = {
    connected: true,
    id: 'mock-socket-id',
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
  };

  return {
    socketConnect: {
      emit,
      disconnect,
      connect,
      forceReconnect,
      getSocket: jest.fn(() => liveSocket),
      getConnectionStatus: jest.fn(() => 'connected'),
      addMessageHandler: jest.fn(),
      removeMessageHandler: jest.fn(),
    },
  };
});

jest.mock('@reduxjs/toolkit', () => ({
  createSlice: config => ({
    name: config.name,
    reducer: jest.fn((state = config.initialState) => state),
    actions: Object.keys(config.reducers || {}).reduce((acc, key) => {
      acc[key] = payload => ({
        type: `${config.name}/${key}`,
        payload,
      });
      // attach reducer impl for optional direct calls in tests
      acc[key].reducer = config.reducers[key];
      return acc;
    }, {}),
  }),
}));
