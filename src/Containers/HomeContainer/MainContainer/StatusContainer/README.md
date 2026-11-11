# Status (Stories) UI

Backend: `comon-backend/src/status`. GraphQL docs: `src/graphql/status.ts`; typed client: `src/services/status/statusApi.ts`.

## Screens
- `StatusFeedScreen` — "Updates" bottom tab (`UpdatesTabScreen`): My status + contact rings (green = unseen, gray = seen). Long-press a contact to mute.
- `StatusComposerScreen` — TEXT (bg colour) or IMAGE (picker → signed URL at `status/{userId}/{file}` → `createStatusItem`). VIDEO is not implemented.
- `StatusViewerScreen` — full-screen viewer, progress bars, tap left/right, hold to pause, `markStatusViewed`, reply via `replyToStatus` → `ChatMessageScreen`.
- `StatusViewersScreen` — viewer list for own item.
- Privacy: Settings → Privacy → Status (`ProfileContainer/StatusPrivacySettings`).

## Flow
1. Tab focus → `getStatusFeed`.
2. Tap row → `StatusViewerScreen` → `getStatusItems(authorId)` → `markStatusViewed` per item.
3. Reply → `replyToStatus` (E2E-encrypted via `signalProtocolService.encryptText`, plaintext fallback) → navigate to `ChatMessageScreen`.
