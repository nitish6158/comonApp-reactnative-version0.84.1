import { listTestIDs, TestIDs } from '../testIDs';

describe('Detox testIDs', () => {
  it('exposes splash and login root ids', () => {
    expect(TestIDs.splash.root).toBe('splash-root');
    expect(TestIDs.auth.loginRoot).toBe('login-root');
  });

  it('lists unique string ids from the tree', () => {
    const ids = listTestIDs();
    expect(ids.length).toBeGreaterThan(5);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('splash-root');
    expect(ids).toContain('login-phone-input');
    expect(ids).toContain('login-submit-button');
  });
});

