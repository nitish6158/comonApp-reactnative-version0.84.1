# Auth

## Purpose
Login, signup, OTP/confirm, forgot/reset password, and secure session persistence for MeetUs mobile.

## Main entry points
- `LoginContainer/LoginScreen.tsx` — Login with bypassed email confirmation guard for standalone/dev environments
- `NewSignUpContainer/SignUpScreen.tsx` — Safe-area aware, padded signup form with direct login redirect and inline tooltips
- `ConfirmOTPContainer`, `ForgotPasswordContainer`, `ResetPasswordContainer`
- `src/utils/session.ts` — Keychain-backed `setSession` / `getSession` / `removeSession`
- `src/Components/AuthContext.tsx` — React `tokenLogin` flag synced from Keychain
- `src/graphql/provider/authLink.ts` — Bearer token from `getSession()` + refresh

## End-to-end flow
1. User signs in → GraphQL `signin` returns `token`, `refresh`, `mode`, `expiredAt`.
2. App calls `await setSession(...)` → secrets stored in **react-native-keychain** (`com.comon.app.auth`).
3. `AuthContext.setTokenLogin(token)` updates UI gate (does not keep tokens in AsyncStorage).
4. Cold start: `getSession()` reads Keychain; if empty, **one-time migrates** legacy AsyncStorage keys then clears them.
5. Splash refresh / `authLink` refresh → `setSession` again with new tokens.
6. Logout → `removeSession()` resets Keychain + clears legacy plain token keys.

## Security rules
- Access + refresh tokens live in Keychain only (`AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`).
- Do **not** write tokens to AsyncStorage (`session_token`, `COM_ON_*`, `token`) or MMKV `keys.token`.
- Non-secrets (phone code, org id, MyProfile cache) may stay in AsyncStorage/MMKV.
- Existing login/splash/socket flow APIs (`setSession` / `getSession`) stay the same so callers keep working.

## Module path
`src/Containers/AuthContainer/`
