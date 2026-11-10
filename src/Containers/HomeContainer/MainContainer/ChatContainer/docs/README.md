# Chat

## Purpose
Chat list, room threads, composer, folders, media, favourites, and room settings for the ComOn mobile app.

## Main entry points
- `ChatsScreen.tsx` — room list (`SwipeListView`)
- `ChatMessages/` — thread UI (`ChatListItem`, `SendChatContainer`, headers)
- `Context/ChatProvider.tsx` — per-room conversation cache + search
- `utils/socket/ConversationSocketHandler.ts` + `ChatRoomSocketHandler.ts`
- `navigation/ChatStackNavigator.tsx` — chat stack + room list MMKV cache

## End-to-end flow
1. After splash, `socketConnect.connect()` establishes the single realtime client.
2. Chat list loads rooms via `socketManager.chatRoom` and caches in MMKV.
3. Opening a room sets `ChatProvider` roomId; messages hydrate from MMKV then socket/GraphQL.
4. Send path goes through conversation socket handler (optimistic UI + emit).
5. Presence / typing / status use `socketConnect.emit` / `addMessageHandler` only.

## Important rules / edge cases
- Do not import a second Socket.IO client; legacy `socket` must bridge to `socketConnect`.
- Prefer MMKV for conversation/room cache writes (AsyncStorage read fallback only).
- Keep list rows memoized; avoid heavy work inside `renderItem`.
- Preserve socket event names used with the backend (`sendChat`, `GetAllFormattedRooms`, etc.).

## Module path
`src/Containers/HomeContainer/MainContainer/ChatContainer/`
