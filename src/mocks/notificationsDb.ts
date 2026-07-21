import { ROUTES } from "@/constants/routes";
import { getNotificationPrefs } from "@/mocks/settingsDb";
import type { NotificationKind, Notification } from "@/types/notification";
import type { NotificationPrefs } from "@/types/settings";

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
    // v5.0 — the events that only exist now that Surface 1 is a live conversation.
    {
      id: "n4",
      kind: "support_sla_breach",
      title: "Support SLA breached — production inference stalling",
      body: "Blocking request. Commercial actions are suppressed for this customer.",
      href: ROUTES.support,
      read: false,
      createdAt: new Date(now - 12 * 60_000).toISOString(),
    },
    {
      id: "n5",
      kind: "attachment_quarantine",
      title: "Attachment quarantined — legacy-sim.dat",
      body: "Malware signature matched. Release requires a logged reason.",
      href: ROUTES.attachments,
      read: false,
      createdAt: new Date(now - 40 * 60_000).toISOString(),
    },
    {
      id: "n6",
      kind: "stream_guard_halt",
      title: "Stream guard halted a turn",
      body: "Matched a benchmark-figure pattern mid-stream. Partial text was discarded.",
      href: ROUTES.governanceStreaming,
      read: false,
      createdAt: new Date(now - 55 * 60_000).toISOString(),
    },
    {
      id: "n7",
      kind: "feedback_risk",
      title: "Trust signal — a customer asked for a follow-up",
      body: "Private feedback scored 2/5. Visible to the success team only.",
      href: ROUTES.customers,
      read: true,
      createdAt: new Date(now - 20 * 3600_000).toISOString(),
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

/** Which preference toggle (if any) gates a notification kind. */
const KIND_PREF: Partial<Record<NotificationKind, keyof NotificationPrefs>> = {
  tier1_lead: "tier1",
  sla_breach: "sla",
  nda_signed: "nda",
};

/** A notification is shown unless its category has been toggled off. */
function isEnabled(n: Notification, prefs: NotificationPrefs): boolean {
  const pref = KIND_PREF[n.kind];
  return pref ? prefs[pref] : true;
}

export function listNotifications(): NotificationFeed {
  const prefs = getNotificationPrefs();
  const results = db().filter((n) => isEnabled(n, prefs));
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
