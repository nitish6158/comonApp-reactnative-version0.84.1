# Socket

## Purpose
Single realtime transport for chat, rooms, presence, org invites, and call-related events.

## Main entry points
- `SocketConnection.ts` — singleton `socketConnect` (connect/emit/handlers)
- `SocketManager.ts` — domain handler registry
- `ConversationSocketHandler.ts`, `ChatRoomSocketHandler.ts`, voip/org handlers
- Legacy bridge: `redux/Reducer/SocketSlice.ts` re-exports compatibility `socket` → live connection

## End-to-end flow
1. Splash/session calls `socketConnect.connect()` with session token.
2. `SocketManager` registers domain handlers on `addMessageHandler`.
3. UI emits via `socketConnect.emit` or legacy `socket.emit` (bridged).
4. Incoming `message` / `newMessage` fan out to handlers once — never double-subscribe.

## Important rules / edge cases
- Never call `io()` outside `SocketConnection.connect`.
- Do not pair `socket.on("message")` with `socketConnect.addMessageHandler` on the same screen.
- Disconnect on logout via `socketConnect.disconnect()`.

## Module path
`src/utils/socket/`
