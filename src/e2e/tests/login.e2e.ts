import { e2eEnv } from '../fixtures/env';
import { launchApp, typeById, tapById, waitForVisible } from '../helpers';
import { matchers } from '../matchers';
import { TestIDs } from '../testIDs';

describe('Login screen', () => {
  beforeEach(async () => {
    await launchApp({ newInstance: true });
    await waitForVisible(TestIDs.auth.loginRoot, 60000);
  });

  it('renders login form controls', async () => {
    await expect(matchers.loginTitle()).toBeVisible();
    await expect(matchers.phoneInput()).toBeVisible();
    await expect(matchers.passwordInput()).toBeVisible();
    await expect(matchers.submitButton()).toBeVisible();
  });

  it('accepts credentials when E2E_PHONE / E2E_PASSWORD are set', async () => {
    if (!e2eEnv.hasCredentials()) {
      console.warn(
        'Skipping authenticated login: set E2E_PHONE and E2E_PASSWORD',
      );
      return;
    }

    await typeById(TestIDs.auth.phoneInput, e2eEnv.phone);
    await typeById(TestIDs.auth.passwordInput, e2eEnv.password);
    await tapById(TestIDs.auth.submitButton);

    await waitFor(element(by.id(TestIDs.tabs.root)))
      .toBeVisible()
      .withTimeout(90000);
  });
});
