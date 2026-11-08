import { Platform } from 'react-native';
import Config from 'react-native-config';

type AppEnvironment = 'development' | 'staging' | 'production';

function toBoolean(value: string | undefined): boolean {
  return value === 'true';
}

function toNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
}

const DEFAULT_PUBLIC_API_HOST = 'https://comon.axiusstaging.in/graphql';
const DEFAULT_PUBLIC_API = 'https://comon.axiusstaging.in';
const DEFAULT_PUBLIC_URL = 'https://comon.axiusstaging.in';
const DEFAULT_SOCKET_URL = 'https://comon.axiusstaging.in?token=';
const DEFAULT_BACKGROUND_API = 'https://comon.axiusstaging.in';
const DEFAULT_PRIVACY_POLICY = 'https://fe-pr-preview-pb2r7hxayq-ez.a.run.app/privacy-policy';
const DEFAULT_AGORA_APP_ID = '86c93a4f76bc4f069cd51ffed38048e5';
const DEFAULT_GOOGLE_PLACE_API_KEY = 'AIzaSyAHJGLj2qeJwuI96x7T3Hz_-Q6LV5DKhUk';
const DEFAULT_IMAGE_URL = 'https://storage.googleapis.com/comon-bucket/';
const DEFAULT_USER_MANUAL_URL = 'https://axius-staging.com/wp/comon_user_manual';
const DEFAULT_LIVEKIT_URL = Platform.OS === 'android' ? 'ws://10.0.2.2:7880' : 'ws://localhost:7880';

function normalizeUrl(url: string | undefined, fallback: string): string {
  const target = url || fallback;
  return target
    .replace(/192\.168\.0\.44/g, '192.168.1.38')
    .replace(/192\.168\.1\.43/g, '192.168.1.38');
}

function resolveLiveKitUrl(rawUrl: string | undefined): string {
  const url = normalizeUrl(rawUrl, DEFAULT_LIVEKIT_URL);
  if (Platform.OS === 'android' && url.includes('localhost')) {
    return url.replace('localhost', '10.0.2.2');
  }
  return url;
}

export const env = {
  appEnv: (Config.APP_ENV ?? 'development') as AppEnvironment,
  appName: Config.APP_NAME ?? 'MeetUs',
  publicApiHost: normalizeUrl(Config.PUBLIC_API_HOST, DEFAULT_PUBLIC_API_HOST),
  publicApi: normalizeUrl(Config.PUBLIC_API, DEFAULT_PUBLIC_API),
  publicUrl: normalizeUrl(Config.PUBLIC_URL, DEFAULT_PUBLIC_URL),
  socketUrl: normalizeUrl(Config.SOCKET_URL, DEFAULT_SOCKET_URL),
  backgroundApi: normalizeUrl(Config.BACKGROUND_API, DEFAULT_BACKGROUND_API),
  privacyPolicy: Config.PRIVACY_POLICY ?? DEFAULT_PRIVACY_POLICY,
  agoraAppId: Config.AGORA_APP_ID ?? DEFAULT_AGORA_APP_ID,
  livekitUrl: resolveLiveKitUrl(Config.LIVEKIT_URL),
  useLivekit: Config.USE_LIVEKIT !== undefined ? toBoolean(Config.USE_LIVEKIT) : true,
  googlePlaceApiKey: Config.GOOGLE_PLACE_API_KEY ?? DEFAULT_GOOGLE_PLACE_API_KEY,
  publicJwtExpire: toNumber(Config.PUBLIC_JWT_EXPIRE, 10),
  iosUrl: Config.IOS_URL ?? 'https://apps.apple.com/in/app/comon-app/id1624464685',
  androidUrl: Config.ANDROID_URL ?? 'https://play.google.com/store/apps/details?id=io.comon.app',
  defaultImageUrl: Config.DEFAULT_IMAGE_URL ?? DEFAULT_IMAGE_URL,
  imageUrl: 'resources/images/16694514102-individual_default.png',
  groupUrl: 'resources/images/16694514287-group_default.png',
  userManualUrl: Config.USER_MANUAL_URL ?? DEFAULT_USER_MANUAL_URL,
  usesCleartextTraffic: toBoolean(Config.USES_CLEARTEXT_TRAFFIC),
} as const;

export default env;

