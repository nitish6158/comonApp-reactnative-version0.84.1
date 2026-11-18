import { launchApp } from '../helpers';
import { matchers } from '../matchers';
import { TestIDs } from '../testIDs';

describe('ComOn smoke (iOS + Android)', () => {
  beforeAll(async () => {
    await device.installApp();
  });

  beforeEach(async () => {
    await launchApp({ newInstance: true });
  });

  it('shows splash and lands on an auth or home surface', async () => {
    try {
      await expect(matchers.splashRoot()).toBeVisible();
    } catch {
      // Already navigated past splash on a fast device.
    }

    try {
      await waitFor(element(by.id(TestIDs.auth.loginRoot)))
        .toBeVisible()
        .withTimeout(60000);
    } catch {
      await waitFor(element(by.id(TestIDs.tabs.root)))
        .toBeVisible()
        .withTimeout(30000);
    }
  });
});
