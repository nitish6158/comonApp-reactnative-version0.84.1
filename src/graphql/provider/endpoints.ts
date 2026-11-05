import { env } from "@/config/env";

export const BuildType: string = env.appEnv;
export const PUBLIC_API_HOST: string = env.publicApiHost;
export const PUBLIC_API: string = env.publicApi;
export const PUBLIC_URL: string = env.publicUrl;
export const PUBLIC_JWT_EXPIRE: number = env.publicJwtExpire;
export const SOCKET_URL: string = env.socketUrl;
export const BACKGROUND_API: string = env.backgroundApi;
export const PRIVACY_POLICY: string = env.privacyPolicy;
export const AGORA_APP_ID: string = env.agoraAppId;
export const GOOGLE_PLACE_API_KEY: string = env.googlePlaceApiKey;
export const IOS_URL: string = env.iosUrl;
export const ANDROID_URL: string = env.androidUrl;

// Fallback compatibility keys
export const REALM_URL: string = env.appEnv === "staging" ? "application-stage-vldxa" : "application-com-dev-ygous";
export const REALM_AUTH_LOGIN: string =
  env.appEnv === "staging"
    ? "iVkmUzUAE4EDaULGUYa7mswv4X2eTWUvhRFydvsnYxyB8X4AHolC52Y8TorRqEjd"
    : "BW2FeGAjKojKWEl7SwBUZnWoRflBeuSaOO0Yo8VGocptAMbgvpMs6yk0KfIPOdOr";

// Static & media assets
export const DefaultImageUrl: string = env.defaultImageUrl;
export const ImageUrl: string = env.imageUrl;
export const GroupUrl: string = env.groupUrl;
export const profileImage: string = DefaultImageUrl + ImageUrl;
export const user_manual_url: string = env.userManualUrl;
