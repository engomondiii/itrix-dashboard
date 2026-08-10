/**
 * The demo backend is only worth shipping if it honours the same contracts
 * the real one does — otherwise it teaches the wrong lessons. These tests
 * run the browser auth handlers through msw/node and assert the itriX
 * envelope and token semantics the UI depends on. Domain-data contract
 * tests live beside their seeds (notifications.test.ts, etc.).
 */

import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { handlers } from './handlers';
import { DEMO_CREDENTIALS } from './data';

const server = setupServer(...handlers);

const BASE = 'http://demo.test/api/v1';

async function post(path: string, body: unknown, init: RequestInit = {}) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...init.headers },
    body: JSON.stringify(body),
    ...init,
  });
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  // Handlers persist to sessionStorage; each test starts from a fresh seed.
  sessionStorage.clear();
});

describe('demo auth', () => {
  it('rejects a wrong password with a 401 invalid_credentials envelope', async () => {
    const res = await post('/auth/login/', {
      email: DEMO_CREDENTIALS.email,
      password: 'wrong',
    });

    // Mirrors itrix-backend: wrong credentials are a non-field 401 —
    // deliberately not attributed to email or password (non-enumeration).
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('invalid_credentials');
    expect(typeof body.error.detail).toBe('string');
  });

  it('issues tokens and a user for the demo credentials', async () => {
    const res = await post('/auth/login/', DEMO_CREDENTIALS);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.access).toMatch(/^demo-access-/);
    expect(body.user.email).toBe(DEMO_CREDENTIALS.email);
  });

  it('refuses refresh before login and allows it after', async () => {
    const before = await post('/auth/token/refresh/', {});
    expect(before.status).toBe(401);

    await post('/auth/login/', DEMO_CREDENTIALS);
    const after = await post('/auth/token/refresh/', {});
    expect(after.status).toBe(200);
  });
});
