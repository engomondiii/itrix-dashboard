import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { Role } from "@/constants/roles";
import type { TeamMember } from "@/types/team";
import type { Notification } from "@/types/notification";
import type { SessionUser } from "@/types/auth";
import type { NotificationPrefs, SlaConfig } from "@/types/settings";

export interface TeamMemberInput {
  name: string;
  email: string;
  role: Role;
}
export type TeamMemberPatch = Partial<TeamMemberInput & { active: boolean }>;

export interface NotificationFeed {
  results: Notification[];
  count: number;
  unread: number;
}

// ── Team ────────────────────────────────────────────────────────────────────
export function listTeam() {
  return apiGet<{ results: TeamMember[]; count: number }>(API.team);
}

export function inviteTeamMember(input: TeamMemberInput) {
  return apiSend<TeamMember>(API.team, "POST", input);
}

export function updateTeamMember(id: string, patch: TeamMemberPatch) {
  return apiSend<TeamMember>(API.teamMember(id), "PATCH", patch);
}

export function removeTeamMember(id: string) {
  return apiSend<{ ok: true }>(API.teamMember(id), "DELETE");
}

// ── Notification feed (bell) ─────────────────────────────────────────────────
export function listNotifications() {
  return apiGet<NotificationFeed>(API.notifications);
}

export function markNotificationRead(id: string) {
  return apiSend<NotificationFeed>(API.notification(id), "PATCH");
}

export function markAllNotificationsRead() {
  return apiSend<NotificationFeed>(API.notifications, "PATCH");
}

// ── Profile ───────────────────────────────────────────────────────────────
export function getProfile() {
  return apiGet<SessionUser>(API.settingsProfile);
}

export function updateProfile(patch: { name: string }) {
  return apiSend<SessionUser>(API.settingsProfile, "PATCH", patch);
}

// ── Notification preferences ────────────────────────────────────────────────
export function getNotificationPrefs() {
  return apiGet<NotificationPrefs>(API.settingsNotifications);
}

export function updateNotificationPrefs(prefs: NotificationPrefs) {
  return apiSend<NotificationPrefs>(API.settingsNotifications, "PATCH", prefs);
}

// ── SLA thresholds ──────────────────────────────────────────────────────────
export function getSlaConfig() {
  return apiGet<SlaConfig>(API.settingsSla);
}

export function updateSlaConfig(config: SlaConfig) {
  return apiSend<SlaConfig>(API.settingsSla, "PATCH", config);
}
