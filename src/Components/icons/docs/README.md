# App icons (WhatsApp-inspired SVG)

## Purpose

Single icon system for ComOn UI chrome. All glyphs are SVGs; screens render them only through `AppIcon`.

## Main entry points

- `src/Components/icons/AppIcon.tsx` — UI component (`name`, `size`, `color`)
- `src/Components/icons/iconRegistry.ts` — name → SVG map
- `src/Components/icons/iconNames.ts` — allowed semantic names
- `assets/icons/svg/*.svg` — glyph files

## End-to-end flow

1. Designer / agent adds or updates an SVG under `assets/icons/svg/`.
2. Register it in `iconNames.ts` and `iconRegistry.ts`.
3. Screen uses `<AppIcon name="search" size={22} color="#333" />`.
4. Do not import `react-native-vector-icons` or raw SVG paths in feature screens.

## Important rules

- SOLID: screens depend on `AppIcon` only (DIP); one registry (SRP).
- KISS: one icon path for the whole app.
- YAGNI: no second icon library; DocIcons PNGs for file types stay separate.
- Prefer `currentColor` SVGs so `color` prop works.
- Migration helper: `VectorIconCompat` + `mapVectorIconName` map old vector-icon glyph names to semantic SVG names (same meaning per screen). Prefer `AppIcon` with semantic names in new/touched code.
- Legacy `assets/images/Icon.ts` re-exports call/search glyphs from `iconRegistry`.
- Run `npm run lint:ts` before and after icon changes; update this README when the flow changes.

## Module path

`src/Components/icons/` + `assets/icons/svg/`
