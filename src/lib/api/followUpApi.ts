import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { FollowUpTask } from "@/types/followUp";

export type FollowUpFilter = "overdue" | "today" | undefined;

export function listFollowUp(filter?: FollowUpFilter) {
  return apiGet<{ results: FollowUpTask[]; count: number }>(
    API.followUp,
    filter ? { filter } : undefined,
  );
}

export function completeFollowUp(id: string) {
  return apiSend<FollowUpTask>(API.followUpTask(id), "PATCH", { action: "complete" });
}

export function snoozeFollowUp(id: string, hours = 24) {
  return apiSend<FollowUpTask>(API.followUpTask(id), "PATCH", { action: "snooze", hours });
}

export function dismissFollowUp(id: string) {
  return apiSend<FollowUpTask>(API.followUpTask(id), "PATCH", { action: "dismiss" });
}

export function rescheduleFollowUp(id: string, dueAt: string) {
  return apiSend<FollowUpTask>(API.followUpTask(id), "PATCH", {
    action: "reschedule",
    dueAt,
  });
}
