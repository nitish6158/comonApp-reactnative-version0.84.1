# Mobile E2E

WhatsApp-style Signal-compatible chat encryption for 1:1 rooms with `e2eEnabled`.

## What ships
- Identity + signed prekey + OTP batch in Keychain (`SignalKeyStore`)
- Public keys uploaded via GraphQL (`uploadDeviceKeys`)
- Text encrypt/decrypt: X25519 ECDH + AES-GCM envelope (`protocol: "signal"`, `v: 1`)
- **Phase 4 media:** AES-256-GCM file encryption before upload; Signal-wrapped media key package in `message`
- Wire still uses `sendChat` / `newMessage` / `updateChat` (opaque JSON string in `message`)

## Media (Phase 4)
1. When `display.e2eEnabled` and room is `individual`, upload components encrypt file bytes with a random AES-256-GCM content key (`e2eMedia.encryptFileToTemp`) **before** `backgroundUpload`.
2. Ciphertext is uploaded as `application/octet-stream`.
3. Media key plaintext `{ t:"media", v:1, key, iv, mime, caption?, thumbIv? }` is Signal-encrypted via `encryptText` and stored in the chat `message` field with the remote `fileURL` (via `updateChat`).
4. Videos encrypt the thumbnail with the **same** content key and a new IV (`thumbIv`).
5. View path: `useE2eMediaUri` decrypts the envelope → downloads ciphertext → `decryptFileToTemp` → returns `file://` (cached by message id under `RNFS.CachesDirectoryPath/e2e-media`).
6. `ChatProvider.maybeDecryptMessage` runs for **any** type when `isE2eEnvelopeMessage`; media packages expose caption in `message` and keys on `e2eMedia`.

## Out of scope
- LiveKit / calls
- Full Double Ratchet session store (interfaces ready to swap to `@privacyresearch/libsignal-protocol-typescript` SessionBuilder/SessionCipher)
- Group E2E media

## Install notes
- Prefer **npm** (repo has `package-lock.json`). Do not run Yarn 4 without `nodeLinker: node-modules` — it wiped `node_modules` via PnP once.
- Already present: `react-native-get-random-values`, `react-native-keychain`, `react-native-mmkv`, `react-native-fs`
- Added: `@noble/curves`, `@noble/ciphers`, `@noble/hashes`, `@privacyresearch/libsignal-protocol-typescript`
