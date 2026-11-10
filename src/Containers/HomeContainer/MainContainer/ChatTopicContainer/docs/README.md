# ChatTopic

## Purpose
Topic-related chat surfaces.

## Main entry points
See files under `src/Containers/HomeContainer/MainContainer/ChatTopicContainer/`.

## End-to-end flow
1. Navigation opens a screen in this module.
2. Screen uses hooks/atoms/redux/graphql as needed.
3. Realtime actions go through `socketConnect` / `socketManager` (not a second Socket.IO client).
4. Persist only through the module’s agreed storage path (prefer MMKV).

## Important rules / edge cases
- Keep navigation route names and socket event payloads stable.
- Do not grow god screens further — extract hooks + presentational children (TaskManager pattern).
- Update this README when behavior changes.

## Module path
`src/Containers/HomeContainer/MainContainer/ChatTopicContainer/`
