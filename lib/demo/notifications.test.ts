/**
 * Contract tests for the demo notification handlers — same rules as
 * `handlers.test.ts`: the mock backend must speak the real backend's
 * contracts or it teaches the wrong lessons.
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
    expect(body.error.type).toBe('not_authenticated');
  });

  it('lists newest-first in the standard pagination envelope', async () => {
    const res = await fetch(`${BASE}/`, { headers: AUTH });
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body).toMatchObject({ current_page: 1, total_pages: 1 });
    expect(body.count).toBeGreaterThan(0);
    const dates = body.results.map((n: { created_at: string }) => n.created_at);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it('reports the unread count and decrements it on mark-read', async () => {
    const before = await fetch(`${BASE}/unread_count/`, { headers: AUTH }).then((r) => r.json());
    expect(before.unread).toBeGreaterThan(0);

    const list = await fetch(`${BASE}/`, { headers: AUTH }).then((r) => r.json());
    const unread = list.results.find((n: { read: boolean }) => !n.read);

    const marked = await fetch(`${BASE}/${unread.id}/mark_read/`, {
      method: 'POST',
      headers: AUTH,
    });
    expect(marked.status).toBe(200);
    expect((await marked.json()).read).toBe(true);

    const after = await fetch(`${BASE}/unread_count/`, { headers: AUTH }).then((r) => r.json());
    expect(after.unread).toBe(before.unread - 1);
  });

  it('mark-all-read reports the count and zeroes the badge', async () => {
    const before = await fetch(`${BASE}/unread_count/`, { headers: AUTH }).then((r) => r.json());

    const res = await fetch(`${BASE}/mark_all_read/`, { method: 'POST', headers: AUTH });
    expect(res.status).toBe(200);
    expect((await res.json()).count).toBe(before.unread);

    const after = await fetch(`${BASE}/unread_count/`, { headers: AUTH }).then((r) => r.json());
    expect(after.unread).toBe(0);
  });

  it('404s an unknown id with the error envelope', async () => {
    const res = await fetch(`${BASE}/nope/mark_read/`, { method: 'POST', headers: AUTH });
    expect(res.status).toBe(404);
    expect((await res.json()).error.type).toBe('not_found');
  });
});
