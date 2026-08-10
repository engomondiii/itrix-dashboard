/**
 * Contract tests for the demo notification handlers — same rules as
 * `handlers.test.ts`: the mock backend must speak the real backend's
 * contracts (itrix-backend `apps/notifications`) or it teaches the wrong
 * lessons: `{results, count, unreadCount}` list envelope, `POST {id}/read/`,
 * `POST read-all/`, itriX error envelope.
 */

import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { notificationHandlers } from './notifications';

const server = setupServer(...notificationHandlers);

const BASE = 'http://demo.test/api/v1/notifications';
const AUTH = { Authorization: 'Bearer demo-access-1' };

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  sessionStorage.clear();
});

describe('demo notifications', () => {
  it('requires a bearer token and answers with the error envelope', async () => {
    const res = await fetch(`${BASE}/`);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe('not_authenticated');
    expect(typeof body.error.detail).toBe('string');
  });

  it('lists newest-first in the itriX list envelope', async () => {
    const res = await fetch(`${BASE}/`, { headers: AUTH });
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.count).toBeGreaterThan(0);
    expect(body.unreadCount).toBeGreaterThan(0);
    const dates = body.results.map((n: { created_at: string }) => n.created_at);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('filters to unread rows with ?unread=true while unreadCount rides along', async () => {
    const body = await fetch(`${BASE}/?unread=true`, { headers: AUTH }).then((r) => r.json());
    expect(body.results.every((n: { read: boolean }) => !n.read)).toBe(true);
    expect(body.count).toBe(body.results.length);
    expect(body.unreadCount).toBe(body.results.length);
  });

  it('reports the unread count and decrements it on mark-read', async () => {
    const before = await fetch(`${BASE}/`, { headers: AUTH }).then((r) => r.json());
    expect(before.unreadCount).toBeGreaterThan(0);

    const unread = before.results.find((n: { read: boolean }) => !n.read);

    const marked = await fetch(`${BASE}/${unread.id}/read/`, {
      method: 'POST',
      headers: AUTH,
    });
    expect(marked.status).toBe(200);
    expect((await marked.json()).read).toBe(true);

    const after = await fetch(`${BASE}/`, { headers: AUTH }).then((r) => r.json());
    expect(after.unreadCount).toBe(before.unreadCount - 1);
  });

  it('read-all acknowledges and zeroes the badge', async () => {
    const res = await fetch(`${BASE}/read-all/`, { method: 'POST', headers: AUTH });
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);

    const after = await fetch(`${BASE}/`, { headers: AUTH }).then((r) => r.json());
    expect(after.unreadCount).toBe(0);
  });

  it('404s an unknown id with the error envelope', async () => {
    const res = await fetch(`${BASE}/nope/read/`, { method: 'POST', headers: AUTH });
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('not_found');
  });
});
