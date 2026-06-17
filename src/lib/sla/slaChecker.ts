import type { FollowUpTask } from "@/types/followUp";
import { type SLAState } from "@/constants/sla";
import { slaState } from "./slaCalculator";

/** SLA state for a follow-up task (uses its tier + createdAt). */
export function taskSlaState(task: FollowUpTask, now: number = Date.now()): SLAState {
  return slaState(task.createdAt, task.tier, {
    completed: task.status === "completed",
    now,
  });
}

export function isBreached(task: FollowUpTask, now: number = Date.now()): boolean {
  return taskSlaState(task, now) === "breached";
}

export function isDueSoon(task: FollowUpTask, now: number = Date.now()): boolean {
  return taskSlaState(task, now) === "due-soon";
}
