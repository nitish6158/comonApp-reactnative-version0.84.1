import React, { useContext } from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { AuthContext, AuthProvider } from '@/Components/AuthContext';
import * as sessionApi from '@/utils/session';

jest.mock('@/utils/session', () => {
  let memory = {
    token: null as string | null,
    refresh: null as string | null,
    expireAt: null as string | null,
    mode: null as string | null,
  };

  return {
    getSession: jest.fn(async () => ({ ...memory })),
    setSession: jest.fn(async (input: any) => {
      memory = {
        token: input.token ?? null,
        refresh: input.refresh ?? null,
        expireAt: input.expireAt != null ? String(input.expireAt) : null,
        mode: input.mode ?? null,
      };
      return true;
    }),
    removeSession: jest.fn(async () => {
      memory = { token: null, refresh: null, expireAt: null, mode: null };
    }),
  };
});

function Probe({ onReady }: { onReady: (ctx: any) => void }) {
  const ctx = useContext(AuthContext);
  React.useEffect(() => {
    if (!ctx.loading) onReady(ctx);
  }, [ctx, onReady]);
  return null;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads token from getSession on mount', async () => {
    (sessionApi.getSession as jest.Mock).mockResolvedValueOnce({
      token: 'boot-token',
      refresh: 'r',
      expireAt: '1',
      mode: 'CLASSIC',
    });

    let ready: any;
    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <Probe onReady={ctx => { ready = ctx; }} />
        </AuthProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(ready.tokenLogin).toBe('boot-token');
    expect(ready.loading).toBe(false);
  });

  it('setTokenLogin(null) only clears UI flag (does not wipe Keychain)', async () => {
    (sessionApi.getSession as jest.Mock).mockResolvedValue({
      token: 'alive',
      refresh: 'r',
      expireAt: '1',
      mode: 'CLASSIC',
    });

    let ready: any;
    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <Probe onReady={ctx => { ready = ctx; }} />
        </AuthProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      await ready.setTokenLogin(null);
    });

    expect(ready.tokenLogin).toBeNull();
    expect(sessionApi.removeSession).not.toHaveBeenCalled();
  });

  it('setTokenLogin(token) writes session when token differs', async () => {
    (sessionApi.getSession as jest.Mock).mockResolvedValue({
      token: null,
      refresh: 'keep-refresh',
      expireAt: '9',
      mode: 'CLASSIC',
    });

    let ready: any;
    await act(async () => {
      ReactTestRenderer.create(
        <AuthProvider>
          <Probe onReady={ctx => { ready = ctx; }} />
        </AuthProvider>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      await ready.setTokenLogin('new-token');
    });

    expect(sessionApi.setSession).toHaveBeenCalledWith(
      expect.objectContaining({
        token: 'new-token',
        refresh: 'keep-refresh',
        mode: 'CLASSIC',
      }),
    );
    expect(ready.tokenLogin).toBe('new-token');
  });
});
