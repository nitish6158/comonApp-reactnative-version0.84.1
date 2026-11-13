# Environment Setup (Dev, Staging, Production)

The app uses `react-native-config` for development, staging, and production environment management (following the exact architecture of Yaden).

---

## 1. Environment Files

| Environment | File | Description |
| :--- | :--- | :--- |
| **Development** | `.env.development` | Local / Development API (`comon.axiusstaging.in` / local) |
| **Staging** | `.env.staging` | Cloud Run Staging API (`api-pr-preview-...`) |
| **Production** | `.env.production` | Production API & Live configs |
| **Default Fallback** | `.env` | Default active environment fallback |

---

## 2. Configured Variables

```txt
APP_ENV
APP_NAME
PUBLIC_API_HOST
PUBLIC_API
PUBLIC_URL
SOCKET_URL
BACKGROUND_API
PRIVACY_POLICY
AGORA_APP_ID
GOOGLE_PLACE_API_KEY
PUBLIC_JWT_EXPIRE
IOS_URL
ANDROID_URL
DEFAULT_IMAGE_URL
USER_MANUAL_URL
USES_CLEARTEXT_TRAFFIC
```

---

## 3. How to Run the App

### Android:
```bash
# Development
npm run android:dev

# Staging
npm run android:staging

# Production
npm run android:prod
```

### iOS:
```bash
# Development
npm run ios:dev

# Staging
npm run ios:staging

# Production
npm run ios:prod
```

### Metro Bundler:
```bash
# Start with Dev env
npm run start:dev

# Start with Staging env
npm run start:staging

# Start with Prod env
npm run start:prod
```

---

## 4. How to Build Release APK / Bundles

```bash
# Build Dev Debug APK
npm run build:android:dev

# Build Staging Debug APK / Staging Release APK
npm run build:android:staging
npm run build:android:staging:release

# Build Production Release APK / Play Store AAB
npm run build:android:prod
npm run build:android:prod:aab
```

For automated GitHub Actions builds (Android APK/AAB + iOS Simulator/IPA/TestFlight), see [BUILD_PIPELINE.md](./BUILD_PIPELINE.md).

---

## 5. Usage in Code

### Option A: Typed Wrapper (`src/config/env.ts`)
```typescript
import { env } from '@/config/env';

console.log(env.appEnv);        // 'development' | 'staging' | 'production'
console.log(env.publicApiHost); // Dynamic GraphQL host
console.log(env.agoraAppId);    // Dynamic Agora App ID
```

### Option B: Seamless Backwards Compatibility (`src/graphql/provider/endpoints.ts`)
All existing imports across the project continue to work unchanged, automatically reflecting the active environment:
```typescript
import { PUBLIC_API_HOST, SOCKET_URL, AGORA_APP_ID } from '@Service/provider/endpoints';
```

