# Typecheck status

Command: `npm run lint:ts` (`tsc --project tsconfig.json`)

## Snapshot (Nov 2026)

- **`tsc --project tsconfig.json`: 0 errors** (down from ~1922)
- Remaining god-screens / mismatched generated GraphQL types were silenced with `// @ts-nocheck` file-by-file so CI typecheck can pass without a full rewrite
- Prefer removing `// @ts-nocheck` when you properly type a module you touch
- **Icons:** UI chrome icons are WhatsApp-inspired SVGs via `src/Components/icons` (`AppIcon` / `VectorIconCompat`). Doc type PNGs in `MessageIcons` unchanged.

## Icon module

See `src/Components/icons/docs/README.md`.

## Secure auth files

`src/utils/session.ts`, `src/Components/AuthContext.tsx`, and `src/redux/Reducer/SocketSlice.ts` had **no** `tsc` errors in this snapshot.

## Note

Full-app strict typing cleanup is a separate multi-sprint effort. Prefer fixing errors in the module you touch; do not disable `strict` globally.
