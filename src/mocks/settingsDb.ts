import { SLA_HOURS } from "@/constants/sla";
import type { SessionUser } from "@/types/auth";
import type { NotificationPrefs, SlaConfig } from "@/types/settings";

/**
 * In-memory settings store for mock mode (profile overrides, notification
 * preferences, SLA thresholds). Persists for the server process; resets on
 * restart. Real mode proxies to Django instead.
 */

// ── Profile ───────────────────────────────────────────────────────────────
const profileOverrides = new Map<string, { name: string }>();

export function getProfile(user: SessionUser): SessionUser {
  const override = profileOverrides.get(user.id);
  return override ? { ...user, ...override } : user;
}

export function updateProfile(
  user: SessionUser,
  patch: { name?: string },
): SessionUser {
  const name = String(patch.name ?? "").trim() || user.name;
  profileOverrides.set(user.id, { name });
  return { ...user, name };
}

// ── Notification preferences ────────────────────────────────────────────────
let prefs: NotificationPrefs = { tier1: true, sla: true, nda: false, weekly: true };

export function getNotificationPrefs(): NotificationPrefs {
  return prefs;
}

export function setNotificationPrefs(next: Partial<NotificationPrefs>): NotificationPrefs {
  prefs = { ...prefs, ...next };
  return prefs;
}

// ── SLA thresholds ──────────────────────────────────────────────────────────
let sla: SlaConfig = { ...SLA_HOURS };

export function getSlaConfig(): SlaConfig {
  return sla;
}

export function setSlaConfig(next: Partial<SlaConfig>): SlaConfig {
  sla = { ...sla, ...next };
  return sla;
}
