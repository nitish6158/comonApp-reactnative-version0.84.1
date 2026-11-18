import { TestIDs } from '../testIDs';

type LaunchOptions = {
  /** Wipe app data between tests (recommended for smoke). */
  newInstance?: boolean;
  /** Extra Detox launch args. */
  launchArgs?: Record<string, unknown>;
};

/**
 * Launch the app and wait until either Splash or Login is visible.
 * Keeps e2e specs thin (KISS) — screens own their testIDs.
 */
export async function launchApp(options: LaunchOptions = {}): Promise<void> {
  const { newInstance = true, launchArgs } = options;

  const launchConfig: Detox.DeviceLaunchAppConfig = {
    newInstance,
    launchArgs,
  };

  // permissions API is iOS-simulator oriented; skip on Android devices
  if (device.getPlatform() === 'ios') {
    launchConfig.permissions = { notifications: 'YES', contacts: 'YES' };
  }

  await device.launchApp(launchConfig);

  try {
    await waitFor(element(by.id(TestIDs.splash.root)))
      .toBeVisible()
      .withTimeout(15000);
  } catch {
    await waitFor(element(by.id(TestIDs.auth.loginRoot)))
      .toBeVisible()
      .withTimeout(30000);
  }
}

/** Relunch without wiping data (session restore paths). */
export async function relaunchApp(): Promise<void> {
  await device.launchApp({ newInstance: false });
}
