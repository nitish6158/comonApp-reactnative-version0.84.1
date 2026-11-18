/**
 * App-safe Detox exports (no Detox globals).
 * Specs import helpers/matchers via relative paths under src/e2e/.
 */
export { TestIDs, listTestIDs } from './testIDs';
export type { TestIDSection } from './testIDs';
export { e2eEnv } from './fixtures/env';
