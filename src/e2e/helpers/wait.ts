/**
 * Wait until an element with the given testID is visible.
 */
export async function waitForVisible(
  testID: string,
  timeoutMs = 15000,
): Promise<void> {
  await waitFor(element(by.id(testID)))
    .toBeVisible()
    .withTimeout(timeoutMs);
}

/**
 * Tap an element by testID after it becomes visible.
 */
export async function tapById(
  testID: string,
  timeoutMs = 15000,
): Promise<void> {
  await waitForVisible(testID, timeoutMs);
  await element(by.id(testID)).tap();
}

/**
 * Type into a text field identified by testID.
 */
export async function typeById(
  testID: string,
  text: string,
  timeoutMs = 15000,
): Promise<void> {
  await waitForVisible(testID, timeoutMs);
  await element(by.id(testID)).replaceText(text);
}
