import { ROUTES } from "@/constants/routes";
import type { Notification } from "@/types/notification";

/**
 * In-memory notification store for mock mode. Mutations (mark read / read all)
 * persist for the life of the server process; resets on restart. Real mode
 * proxies to Django instead (see api/notifications routes).
 */
function seed(): Notification[] {
  const now = Date.now();
  return [
    {
      id: "n1",
      kind: "tier1_lead",
      title: "New Tier 1 lead — Cerebra Edge",
      body: "Score 97 · ALPHA Core · escalate within 24h.",
      href: ROUTES.leadsTier(1),
      read: false,
      createdAt: new Date(now - 25 * 60_000).toISOString(),
    },
    {
      id: "n2",
      kind: "sla_breach",
      title: "3 follow-ups past SLA",
      href: ROUTES.followUpOverdue,
      read: false,
      createdAt: new Date(now - 2 * 3600_000).toISOString(),
    },
    {
      id: "n3",
      kind: "nda_signed",
      title: "NDA signed — Atlas Foundry",
      href: ROUTES.nda,
      read: true,
      createdAt: new Date(now - 6 * 3600_000).toISOString(),
    },
  ];
}

let store: Notification[] | null = null;
function db(): Notification[] {
  if (!store) store = seed();
  return store;
}

export interface NotificationFeed {
  results: Notification[];
  count: number;
  unread: number;
}

export function listNotifications(): NotificationFeed {
  const results = db();
  return {
    results,
    count: results.length,
    unread: results.filter((n) => !n.read).length,
  };
}

export function markNotificationRead(id: string): NotificationFeed {
  const n = db().find((x) => x.id === id);
  if (n) n.read = true;
  return listNotifications();
}

export function markAllNotificationsRead(): NotificationFeed {
  db().forEach((n) => {
    n.read = true;
  });
  return listNotifications();
}
