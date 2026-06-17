import { apiGet } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { TeamMember } from "@/types/team";
import type { Notification } from "@/types/notification";

export function listTeam() {
  return apiGet<{ results: TeamMember[]; count: number }>(API.team);
}

export function listNotifications() {
  return apiGet<{ results: Notification[]; count: number; unread: number }>(
    API.notifications,
  );
}
