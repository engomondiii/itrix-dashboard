/**
 * The refresh mutex is the most failure-prone code in the template — a bug
 * here looks like "users randomly logged out under load", which is close to
 * undebuggable from a report. These tests pin the four behaviours that
 * matter, against a real HTTP boundary (msw/node), not mocked axios:
 *
 *   1. N concurrent 401s → exactly one refresh call, all N retried.
 *   2. A request that 401s even after a fresh token is retried once, not
 *      forever.
 *   3. A failed refresh tears the session down: tokens cleared, the auth
 *      failure handler informed, the original error propagated.
 *   4. During a deliberate logout, 401s pass through without triggering a
 *      refresh at all.
 */

import { http as mswHttp, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { http, setAuthFailureHandler, setLoggingOut } from './client';
import { clearTokens, getAccessToken, setAccessToken } from '@/lib/auth/token-store';

const API = 'http://api.test';

const server = setupServer();

let refreshCalls = 0;
let resourceCalls = 0;

/** Protected resource that accepts only the post-refresh token. */
function protectedResource(validToken: string) {
  return mswHttp.get(`${API}/api/v1/example/items/`, ({ request }) => {
    resourceCalls += 1;
    if (request.headers.get('authorization') === `Bearer ${validToken}`) {
      return HttpResponse.json({ ok: true });
    }
    return HttpResponse.json({ error: { type: 'not_authenticated' } }, { status: 401 });
  });
}

function refreshEndpoint(result: 'success' | 'failure') {
  return mswHttp.post(`${API}/api/v1/auth/token/refresh/`, async () => {
    refreshCalls += 1;
    // A tick of latency so concurrent 401s genuinely overlap the refresh —
    // without it the first caller can finish before the second even starts,
    // and the test would pass with no mutex at all.
    await new Promise((r) => setTimeout(r, 25));
    if (result === 'failure') {
      return HttpResponse.json({ error: { type: 'authentication_failed' } }, { status: 401 });
    }
    return HttpResponse.json({ access: 'fresh-token' });
  });
}

beforeAll(() => {
  process.env.NEXT_PUBLIC_API_URL = API;
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  delete process.env.NEXT_PUBLIC_API_URL;
  server.close();
});

beforeEach(() => {
  refreshCalls = 0;
  resourceCalls = 0;
  setAccessToken('stale-token');
});

afterEach(() => {
  server.resetHandlers();
  setAuthFailureHandler(null);
  setLoggingOut(false);
  clearTokens();
});

describe('refresh mutex', () => {
  it('coalesces concurrent 401s into one refresh and retries them all', async () => {
    server.use(refreshEndpoint('success'), protectedResource('fresh-token'));

    const results = await Promise.all([
      http.get('/api/v1/example/items/'),
      http.get('/api/v1/example/items/'),
      http.get('/api/v1/example/items/'),
    ]);

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    expect(refreshCalls).toBe(1);
    // 3 original attempts + 3 retries.
    expect(resourceCalls).toBe(6);
    expect(getAccessToken()).toBe('fresh-token');
  });

  it('retries a request once, never in a loop', async () => {
    // The resource rejects every token — a server-side permission problem the
    // client cannot refresh its way out of.
    server.use(refreshEndpoint('success'), protectedResource('token-nobody-has'));

    await expect(http.get('/api/v1/example/items/')).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(refreshCalls).toBe(1);
    expect(resourceCalls).toBe(2); // original + exactly one retry
  });

  it('tears down the session when the refresh itself fails', async () => {
    const onFailure = vi.fn();
    setAuthFailureHandler(onFailure);
    server.use(refreshEndpoint('failure'), protectedResource('fresh-token'));

    await expect(http.get('/api/v1/example/items/')).rejects.toBeTruthy();

    expect(onFailure).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
  });

  it('does not refresh while a deliberate logout is in flight', async () => {
    setLoggingOut(true);
    server.use(refreshEndpoint('success'), protectedResource('fresh-token'));

    await expect(http.get('/api/v1/example/items/')).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(refreshCalls).toBe(0);
  });

  it('recovers after a failed refresh instead of caching the rejection', async () => {
    // Regression guard for the `finally { refreshPromise = null }` line: a
    // rejected promise left in the slot would replay the first failure to
    // every later 401, turning one blip into a permanent logout.
    setAuthFailureHandler(vi.fn());
    server.use(refreshEndpoint('failure'), protectedResource('fresh-token'));
    await expect(http.get('/api/v1/example/items/')).rejects.toBeTruthy();

    server.resetHandlers();
    server.use(refreshEndpoint('success'), protectedResource('fresh-token'));
    setAccessToken('stale-token');

    await expect(http.get('/api/v1/example/items/')).resolves.toEqual({ ok: true });
  });
});
