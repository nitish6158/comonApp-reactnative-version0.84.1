# Mobile Automated Build Pipeline (GitHub Actions)

Automated CI/CD pipelines live in `.github/workflows/` so Android (`.apk` / `.aab`) and iOS (`.app` Simulator / signed `.ipa`) builds can be generated directly from GitHub without depending on a developer laptop.

---

## 1. Workflows Overview

| Workflow File | Triggers | Outputs |
|---|---|---|
| `.github/workflows/ci-quality.yml` | Push (`main`, `master`, `develop`, `storyfeature`) & PRs | TypeScript typecheck + Jest coverage artifact |
| `.github/workflows/android-build.yml` | Manual (`workflow_dispatch`), push to `main` (staging APK), or `v*` tags (prod APK + AAB + GitHub Release) | Downloadable `.apk` & `.aab` artifacts (+ GitHub Release on tags) |
| `.github/workflows/ios-build.yml` | Manual (`workflow_dispatch`), or `v*` tags (`app-store` IPA) | `.app.zip` (simulator) or signed `.ipa` (+ optional TestFlight upload) |

---

## 2. How to Generate a Build From GitHub UI

1. Push the branch containing `.github/workflows/` to GitHub (`origin`).
2. Open your repository on GitHub -> **Actions** tab.
3. Choose **Android Automated Build** or **iOS Automated Build** -> click **Run workflow**.
4. Select:
   - **Android:** `environment` (`development` | `staging` | `production`), `build_type` (`apk` | `aab` | `both`), and optional `version_name`.
   - **iOS:** `environment` (`development` | `staging` | `production`), `build_mode` (`simulator` | `ad-hoc` | `app-store`), and `upload_testflight`.
5. Once the workflow turns green, download your `.apk`, `.aab`, `.app.zip`, or `.ipa` from the **Artifacts** section at the bottom of the workflow run (or under **Releases** when pushing a `v1.x.x` tag).

---

## 3. GitHub Repository Secrets Setup

Go to **GitHub Repo -> Settings -> Secrets and variables -> Actions -> New repository secret**.

### Environment Config Secrets (Recommended)
If omitted during initial testing, workflows warn and fall back to `.env.example`.

| Secret Name | Contents |
|---|---|
| `ENV_DEVELOPMENT` | Full contents of `.env.development` |
| `ENV_STAGING` | Full contents of `.env.staging` |
| `ENV_PRODUCTION` | Full contents of `.env.production` |

### Android Release Signing Secrets (Required for Google Play `.aab` / Production APK)
If omitted, Android release builds fall back to `android/app/debug.keystore` for internal testing only.

| Secret Name | Description |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded upload `.keystore` file |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore store password |
| `ANDROID_KEY_ALIAS` | Upload key alias |
| `ANDROID_KEY_PASSWORD` | Upload key password |

Generate a release upload keystore locally (one-time) and convert to base64 on macOS:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore meetus-upload.keystore -alias meetus-upload -keyalg RSA -keysize 2048 -validity 10000
base64 -i meetus-upload.keystore | pbcopy
```
*(Never commit `*.keystore` release keys to Git.)*

### iOS Signing & TestFlight Secrets (Required for `ad-hoc` / `app-store` `.ipa`)
Note: `build_mode = simulator` works without any Apple secrets.

| Secret Name | Description |
|---|---|
| `IOS_CERTIFICATE_P12_BASE64` | Base64-encoded Apple Distribution `.p12` certificate |
| `IOS_CERTIFICATE_PASSWORD` | Password used when exporting `.p12` |
| `IOS_PROVISIONING_PROFILE_BASE64` | Base64-encoded `.mobileprovision` for `com.comon.comonapp` |
| `IOS_TEAM_ID` | Apple Developer Team ID (defaults to `4FXM237WD5` if omitted) |
| `IOS_KEYCHAIN_PASSWORD` | Optional temporary CI keychain password |
| `ASC_KEY_ID` | App Store Connect API Key ID (only if `upload_testflight = true`) |
| `ASC_ISSUER_ID` | App Store Connect Issuer ID (only if `upload_testflight = true`) |
| `ASC_PRIVATE_KEY` | Contents of `AuthKey_<KEY_ID>.p8` (only if `upload_testflight = true`) |

---

## 4. Local Release Build Commands

```bash
# Android Staging Release APK
npm run build:android:staging:release

# Android Production Release APK
npm run build:android:prod

# Android Play Store Bundle (.aab)
npm run build:android:prod:aab
```

To sign locally with your upload keystore, export `MYAPP_UPLOAD_STORE_FILE`, `MYAPP_UPLOAD_STORE_PASSWORD`, `MYAPP_UPLOAD_KEY_ALIAS`, and `MYAPP_UPLOAD_KEY_PASSWORD` (or place them in `~/.gradle/gradle.properties`).

