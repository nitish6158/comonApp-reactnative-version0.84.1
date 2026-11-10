# Containers (app shell)

## Purpose
Top-level app containers including Splash and session entry.

## Splash cold-start flow
1. `SplashContainer` reads Keychain session via `getSession`.
2. If refresh token exists → `refreshSession` GraphQL → `setSession` + socket connect + profile.
3. **Immediately** navigate to `Main` / `Senior` (do not wait for contacts).
4. Background: sync server phonebook; device contacts only via `loadContactsIfPermitted` (no Access popup if not granted).

## Important rules
- Do not block splash on contact/media permission dialogs.
- Default bottom tab is `ChatTabScreen` (`initialBottomTabScreenAtom`).
- Update this README when splash/session entry behavior changes.

## Module path
`src/Containers/`
