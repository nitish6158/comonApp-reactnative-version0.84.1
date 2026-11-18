/**
 * E2E credentials / toggles.
 * Prefer CI secrets or a local untracked `.env.e2e` — never commit real passwords.
 */
export const e2eEnv = {
  /** Optional login used by authenticated flows (leave empty for smoke-only). */
  phone: process.env.E2E_PHONE ?? '',
  password: process.env.E2E_PASSWORD ?? '',
  hasCredentials(): boolean {
    return Boolean(this.phone && this.password);
  },
};
