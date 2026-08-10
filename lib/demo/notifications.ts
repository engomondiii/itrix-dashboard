/**
 * Demo-mode handlers for the notification endpoints.
 *
 * Kept in their own file (and exported as an array) so the demo worker can
 * compose feature areas without one handlers file growing without bound.
 * Contract rules are the same as `handlers.ts`: real error envelope, real
 * pagination shape, bearer-token guard, per-tab persistence.
 */

import { delay, http, HttpResponse } from 'msw';

import type { NotificationRecord } from '@/lib/notifications';

const STORE_KEY = 'demo:notifications';
const LATENCY = 200;

function daysAgo(days: number, hours = 0): string {
  return new Date(Date.now() - days * 86_400_000 - hours * 3_600_000).toISOString();
}

/** Staff-shaped seeds — every title is a thing this console actually does. */
function seedNotifications(): NotificationRecord[] {
  return [
    { id: 'n-01', title: 'NDA signed', body: 'Kumho Precision Survey signed the mutual NDA.', created_at: daysAgo(0, 2), read: false, href: '/leads' },
    { id: 'n-02', title: 'Draft held for OK', body: 'A Risk 3 reply is waiting in Approvals.', created_at: daysAgo(0, 5), read: false, href: '/approvals' },
    { id: 'n-03', title: 'New P1 lead', body: 'Hanul Engineering submitted an enquiry.', created_at: daysAgo(1), read: false, href: '/leads' },
    { id: 'n-04', title: 'Follow-up overdue', body: 'Daehan Survey Co. slipped past its due date.', created_at: daysAgo(2), read: true, href: '/today' },
    { id: 'n-05', title: 'Welcome to the staff console', body: 'Press Ctrl+K to jump anywhere.', created_at: daysAgo(3), read: true },
    { id: 'n-06', title: 'Profile updated', body: 'Your display name was saved.', created_at: daysAgo(5), read: true, href: '/settings' },
    { id: 'n-07', title: 'New sign-in', body: 'A new session started on this device.', created_at: daysAgo(8), read: true },
    { id: 'n-08', title: 'Scheduled maintenance', body: 'The demo backend never actually goes down.', created_at: daysAgo(12), read: true },
  ];
}

function load(): NotificationRecord[] {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw) as NotificationRecord[];
  } catch {
    // Fall through to a fresh seed.
  }
  const seeded = seedNotifications();
  save(seeded);
  return seeded;
}

function save(records: NotificationRecord[]): void {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify(records));
  } catch {
    // Storage blocked; continue in memory.
  }
}

function unauthenticated() {
  return HttpResponse.json(
    {
      error: {
        detail: 'Authentication credentials were not provided.',
        code: 'not_authenticated',
      },
    },
    { status: 401 },
  );
}

function requireAuth(request: Request): Response | null {
  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer demo-access-')) return unauthenticated();
  return null;
}

const NOTIFICATIONS = '*/api/v1/notifications';

export const notificationHandlers = [
  // Mirrors itrix-backend apps/notifications: POST {id}/read/, POST read-all/,
  // and a list envelope of {results, count, unreadCount} (?unread=true filter).
  http.post(`${NOTIFICATIONS}/read-all/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const records = load();
    for (const record of records) record.read = true;
    save(records);
    return HttpResponse.json({ ok: true });
  }),

  http.post(`${NOTIFICATIONS}/:id/read/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const records = load();
    const record = records.find((n) => n.id === params.id);
    if (!record) {
      return HttpResponse.json(
        { error: { detail: 'Not found.', code: 'not_found' } },
        { status: 404 },
      );
    }
    record.read = true;
    save(records);
    return HttpResponse.json(record);
  }),

  http.get(`${NOTIFICATIONS}/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const records = load();
    const unreadOnly = ['1', 'true', 'yes'].includes(
      (new URL(request.url).searchParams.get('unread') ?? '').toLowerCase(),
    );
    const unreadCount = records.filter((n) => !n.read).length;
    // Newest first, like any inbox.
    const results = [...records]
      .filter((n) => !unreadOnly || !n.read)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    return HttpResponse.json({
      results,
      count: results.length,
      unreadCount,
    });
  }),
];
