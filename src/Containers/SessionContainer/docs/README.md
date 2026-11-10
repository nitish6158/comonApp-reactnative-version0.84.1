# Session

## Purpose
Session, foreground service, global call events.

## Main entry points
See files under `src/Containers/SessionContainer/`.

## End-to-end flow
1. Navigation opens a screen in this module.
2. Screen uses hooks/atoms/redux/graphql as needed.
3. Realtime actions go through `socketConnect` / `socketManager` (not a second Socket.IO client).
4. Persist only through the module’s agreed storage path (prefer MMKV).
5. `SyncContainer` (`RealmSyncContainer.tsx`) must **not** call `AskPermissions` on mount — that re-showed Access/Permission alerts on every open and slowed cold start.

## Important rules / edge cases
- Keep navigation route names and socket event payloads stable.
- Do not grow god screens further — extract hooks + presentational children (TaskManager pattern).
- Contact/media/camera permissions are requested only when a feature needs them (e.g. Contacts sync), not on every session bootstrap.
- Update this README when behavior changes.

## Module path
`src/Containers/SessionContainer/`
