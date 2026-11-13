# SonarQube Setup (MeetUs Mobile App)

This project is configured for local SonarQube / SonarScanner security, vulnerability, bug, and code smell analysis.

## Files Added

- `sonar-project.properties` — Project scan configuration (`meetus-mobile`, TypeScript & Jest LCOV coverage)
- `docker-compose.sonar.yml` — Local SonarQube Community container (`http://localhost:9000`)

## Quick Start

1. **Start Local SonarQube Server**
   ```bash
   npm run sonar:up
   ```
   Wait 30–60 seconds, then open [http://localhost:9000](http://localhost:9000).
   *(Default login on first boot: `admin` / `admin`, then change password).*

2. **Generate a Project / User Token**
   - In SonarQube UI: **My Account -> Security -> Generate Tokens** (or create project `meetus-mobile`).
   - Save the token locally in `.env.sonar.local` (gitignored):
     ```env
     SONAR_TOKEN=sqa_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```

3. **Run Jest Coverage + SonarQube Scan**
   ```bash
   npm run sonar:local
   ```
   Or scan without re-running tests:
   ```bash
   npm run sonar
   ```

4. **Stop SonarQube Server**
   ```bash
   npm run sonar:down
   ```

## Pre-Scan Quality Checks

```bash
npm run typecheck
npm run lint:src
npm run test:ci
```

## Coverage, Baseline & Exclusions

- **Project Version Baseline**: `sonar.projectVersion=0.0.2` (in `sonar-project.properties`) marks the clean `0`-issue (`A`/`A`/`A`) Security, Reliability, and Maintainability milestone; new/changed lines on top of this baseline are evaluated against the `>= 80%` New Code coverage Quality Gate.
- **Test Coverage Path**: `coverage/lcov.info` (populated via `collectCoverageFrom` in `jest.config.js`)
- **Excluded from Analysis**: `node_modules/`, `android/`, `ios/`, `coverage/`, `libs/`, `modules/`, `scripts/`, `src/docs/`, `src/graphql/generated/**`, test specs (indexed separately under `sonar.tests`), `.d.ts`, and config files.

