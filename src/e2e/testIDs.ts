/**
 * Shared Detox / Maestro-friendly testIDs.
 * Use these constants on React Native `testID` props and in Detox matchers.
 */
export const TestIDs = {
  splash: {
    root: 'splash-root',
  },
  auth: {
    loginRoot: 'login-root',
    loginTitle: 'login-title',
    phoneInput: 'login-phone-input',
    passwordInput: 'login-password-input',
    submitButton: 'login-submit-button',
  },
  tabs: {
    root: 'bottom-tabs-root',
    chat: 'tab-chat',
    call: 'tab-call',
    task: 'tab-task',
    calendar: 'tab-calendar',
    updates: 'tab-updates',
  },
} as const;

export type TestIDSection = keyof typeof TestIDs;

/** Flatten nested TestIDs into a list (useful for docs / unit tests). */
export function listTestIDs(
  tree: Record<string, unknown> = TestIDs,
  acc: string[] = [],
): string[] {
  for (const value of Object.values(tree)) {
    if (typeof value === 'string') {
      acc.push(value);
    } else if (value && typeof value === 'object') {
      listTestIDs(value as Record<string, unknown>, acc);
    }
  }
  return acc;
}
