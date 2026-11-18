import { TestIDs } from '../testIDs';

/** Common Detox element matchers for ComOn screens. */
export const matchers = {
  splashRoot: () => element(by.id(TestIDs.splash.root)),
  loginRoot: () => element(by.id(TestIDs.auth.loginRoot)),
  loginTitle: () => element(by.id(TestIDs.auth.loginTitle)),
  phoneInput: () => element(by.id(TestIDs.auth.phoneInput)),
  passwordInput: () => element(by.id(TestIDs.auth.passwordInput)),
  submitButton: () => element(by.id(TestIDs.auth.submitButton)),
  bottomTabs: () => element(by.id(TestIDs.tabs.root)),
};
