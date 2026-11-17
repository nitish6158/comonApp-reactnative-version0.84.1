# Profile

## Purpose
Profile, contacts, account settings.

## Main entry points
See files under `src/Containers/HomeContainer/MainContainer/ProfileContainer/`.

## End-to-end flow
1. Navigation opens a screen in this module (Profile, ContactsScreen, ViewContactScreen, etc.).
2. `ContactsScreen` fetches the latest phonebook from server on screen focus (`ContactSync()`), updates Redux store `state.Contact.contacts`.
3. Pull-to-refresh or tap refresh (`onPressRefreshing`) requests contacts permissions if not already granted, reads device phonebook, and synchronizes additions/deletions with backend `/api/v1/phonebook/sync`.
4. `filterInObject` normalizes search queries and phone numbers (stripping non-digit characters, matching prefixes and last 10 digits, and case-insensitive full name matching).
5. `generateContactSections` groups contacts into uppercase alphabetic sections A-Z and `#` without dropping lowercase names or numbers, and deduplicates without losing distinct contacts.
6. Realtime actions go through `socketConnect` / `socketManager` (not a second Socket.IO client).
7. Persist only through the module’s agreed storage path (prefer MMKV).

## Important rules / edge cases
- Keep navigation route names and socket event payloads stable.
- Phone searching must always normalize digits (`replace(/\D/g, "")`) so numbers match regardless of country codes (`+91`), spaces, hyphens, or brackets.
- Alphabet section grouping must compare case-insensitively (`displayName[0].toUpperCase()`) and sort non-alpha names under `"#"` safely.
- Never gate phonebook contact addition/deletion on flawed length comparisons (`<=` or `>`); always diff `localId` against server contacts.
- Do not grow god screens further — extract hooks + presentational children (TaskManager pattern).
- Update this README when behavior changes.

## Module path
`src/Containers/HomeContainer/MainContainer/ProfileContainer/`
