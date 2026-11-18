# Detox E2E (iOS + Android)

## Purpose

End-to-end UI tests for ComOn React Native (`0.84.1`) using **Detox 20.x** on:

- **iOS Simulator** (`ios.sim.debug` / `ios.sim.release`)
- **Android Emulator** (`android.emu.debug` / `android.emu.release`)
- **Attached Android device** (`android.att.debug`)

Detox code lives under **`src/e2e`**. The thin root `e2e/` folder only holds the Jest runner config that Detox CLI expects.

> Note: `src/services/e2e/` is **Signal protocol encryption**, not Detox. Do not mix the two.

## Main entry points

| Path | Role |
|------|------|
| `.detoxrc.js` | Apps, devices, named configurations |
| `e2e/jest.config.js` | Detox Jest runner → discovers `src/e2e/tests/**/*.e2e.ts` |
| `src/e2e/testIDs.ts` | Shared `testID` constants (app + tests) |
| `src/e2e/helpers/` | `launchApp`, `waitForVisible`, `tapById`, `typeById` |
| `src/e2e/matchers/` | Reusable Detox element matchers |
| `src/e2e/fixtures/env.ts` | Optional `E2E_PHONE` / `E2E_PASSWORD` |
| `src/e2e/tests/*.e2e.ts` | Detox specs (smoke, login) |
| `src/e2e/__tests__/` | Unit tests for helpers / testIDs (Jest, not Detox) |
| `android/app/src/androidTest/.../DetoxTest.java` | Android instrumentation entry |
| `android/app/src/main/res/xml/network_security_config.xml` | Cleartext localhost for Detox host |

## How we set this up

1. Installed `detox@^20.51.4` (compatible with RN **0.77–0.84**, New Architecture).
2. Added root **`.detoxrc.js`** with ComOn-specific binaries:
   - iOS: `ios/commonapp.xcworkspace` / scheme `commonapp` → `commonapp.app`
   - Android **development** flavor: `assembleDevelopmentDebug` + `assembleDevelopmentDebugAndroidTest`
3. Pointed Detox Jest at **`src/e2e/tests/**/*.e2e.ts`** (not a second parallel tree).
4. Patched Android Gradle + added `DetoxTest.java` + network security config (official Detox project-setup steps).
5. Wired `testID`s on Splash, Login, Form, Bottom tabs so specs can use `by.id(...)`.
6. Added npm scripts: `detox:build:*` / `detox:test:*`.

## Folder map

```txt
.detoxrc.js
e2e/
  jest.config.js          # Detox test runner only
  tsconfig.json
src/e2e/
  docs/README.md          # this file
  index.ts
  testIDs.ts
  helpers/
  matchers/
  fixtures/
  tests/                  # Detox specs (*.e2e.ts)
  __tests__/              # unit tests for e2e helpers
android/app/src/androidTest/java/io/comon/app/DetoxTest.java
```

## Prerequisites

### Shared

- Node `>=20.19.4`
- Project deps installed (`npm install --legacy-peer-deps`)
- Metro not required for **release** Detox builds; **debug** builds talk to Metro / packager as Detox launches the app

### iOS (macOS)

```bash
brew tap wix/brew
brew install applesimutils
cd ios && bundle exec pod install   # or: npm run pods
```

Confirm a simulator type exists (config uses **iPhone 16**):

```bash
xcrun simctl list devicetypes | grep iPhone
```

### Android

- Android SDK + an AVD (config default: **`Pixel_9_Pro`**; also available locally: `Medium_Phone_API_36.0`)
- List AVDs: `emulator -list-avds` (or `$ANDROID_HOME/emulator/emulator -list-avds`)
- Change `devices.emulator.device.avdName` in `.detoxrc.js` if needed
- For USB device: use configuration `android.att.debug`

## npm scripts

| Script | What it does |
|--------|----------------|
| `npm run detox:build:ios` | Build iOS Debug simulator app |
| `npm run detox:test:ios` | Run Detox on iOS simulator (debug) |
| `npm run detox:build:android` | Build Android developmentDebug + androidTest |
| `npm run detox:test:android` | Run Detox on Android emulator (debug) |
| `npm run detox:test:android:device` | Run Detox on attached Android device |
| `npm run detox:build:ios:release` | iOS Release simulator build |
| `npm run detox:build:android:release` | Android developmentRelease + androidTest |

Equivalent CLI:

```bash
npx detox build --configuration ios.sim.debug
npx detox test  --configuration ios.sim.debug

npx detox build --configuration android.emu.debug
npx detox test  --configuration android.emu.debug
```

## End-to-end flow

1. Install tooling (`applesimutils` on macOS; Android AVD ready).
2. `npm run detox:build:ios` **or** `npm run detox:build:android`.
3. `npm run detox:test:ios` **or** `npm run detox:test:android`.
4. Detox installs the app binary, starts the Jest runner from `e2e/jest.config.js`, executes `src/e2e/tests/**/*.e2e.ts`.
5. Specs call `launchApp()` → wait for `splash-root` or `login-root` → assert UI via `TestIDs`.

### Authenticated login (optional)

```bash
export E2E_PHONE='9876543210'
export E2E_PASSWORD='your-password'
npm run detox:test:ios
```

If env vars are missing, the login credential case **skips** (smoke still runs).

## Configurations (`.detoxrc.js`)

| Name | Device | App binary |
|------|--------|------------|
| `ios.sim.debug` | iPhone 16 simulator | Debug `commonapp.app` |
| `ios.sim.release` | iPhone 16 simulator | Release `commonapp.app` |
| `android.emu.debug` | `Pixel_9_Pro` AVD | `app-development-debug.apk` |
| `android.emu.release` | `Pixel_9_Pro` AVD | `app-development-release.apk` |
| `android.att.debug` | any `adb` device | development debug APK |

Android product flavor: **`development`** (matches `android:dev` / MeetUs Dev).

## Android native hooks we added

1. `android/build.gradle` → maven `node_modules/detox/Detox-android`
2. `android/app/build.gradle` → `testInstrumentationRunner`, `testBuildType`, `androidTestImplementation('com.wix:detox:+')`, Detox ProGuard rules
3. `DetoxTest.java` under package `io.comon.app` (matches `MainActivity`)
4. `network_security_config.xml` + `android:networkSecurityConfig` on `<application>` for `localhost` / `10.0.2.2`

## Writing a new Detox test

1. Add a stable `testID` using `TestIDs` (or extend `src/e2e/testIDs.ts`) on the screen component.
2. Create `src/e2e/tests/<feature>.e2e.ts`.
3. Prefer helpers:

```ts
import { launchApp, tapById, waitForVisible } from '../helpers';
import { TestIDs } from '../testIDs';

describe('Chat tab', () => {
  beforeEach(async () => {
    await launchApp();
  });

  it('opens chat tab when logged in', async () => {
    await waitForVisible(TestIDs.tabs.root, 60000);
    await tapById(TestIDs.tabs.chat);
  });
});
```

4. Keep Detox specs out of unit `jest.config.js` discovery — unit Jest ignores `**/*.e2e.ts`.

## Important rules

- **One Detox tree**: helpers + specs under `src/e2e` only; do not duplicate under root `e2e/` beyond the Jest config.
- **Do not confuse** with `src/services/e2e` (crypto).
- Reuse `TestIDs` — avoid hard-coded string ids in specs.
- Prefer debug configs locally; use release configs for CI-like checks.
- Never commit real `E2E_PASSWORD` values.
- After changing Android Gradle / Detox native bits, rebuild with `detox:build:android` before `detox:test:android`.
- Unit-test pure helpers under `src/e2e/__tests__` (`npm run test:ci`).

## Real Android device (USB)

1. Phone: **Developer options → USB debugging ON** (OPPO: also allow “USB debugging (Security settings)” if prompted).
2. Cable se connect → verify:

```bash
adb devices
# must show: <id>    device
```

3. Metro (debug builds):

```bash
npm run start:dev
# other terminal:
adb reverse tcp:8081 tcp:8081
```

4. Build once, then test on attached device:

```bash
npm run detox:build:android
npm run detox:test:android:device
```

Config name: `android.att.debug` (`.detoxrc.js` → `devices.attached`).

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `applesimutils` missing | `brew tap wix/brew && brew install applesimutils` |
| Wrong AVD name | `emulator -list-avds` → update `.detoxrc.js` |
| Android `Could not resolve detox` | Confirm maven url to `node_modules/detox/Detox-android` |
| iOS build path missing `.app` | Ensure scheme `commonapp` and `derivedDataPath ios/build` |
| Flavor APK not found | Use `assembleDevelopmentDebug` paths from `.detoxrc.js` |
| Element not found | Confirm `testID` on component matches `TestIDs` |
| `FileTestStorage` / instrumentation crash | Do **not** put `androidx.test:*` on app `implementation`; keep it in `androidTestImplementation` only |
| `adb devices` empty | Re-plug USB, accept RSA prompt on phone, try another cable/port |
| Debug app blank / disconnect | Start Metro + `adb reverse tcp:8081 tcp:8081` before `detox test` |

## Module path

`src/e2e/`
