import type { Tier } from "@/constants/tiers";
import { SLA_HOURS, SLA_DUE_SOON_RATIO, type SLAState } from "@/constants/sla";

const HOUR_MS = 60 * 60 * 1000;

/** Deadline for first response, given when the SLA clock started + the tier. */
export function slaDeadline(createdAt: string | Date, tier: Tier): Date | null {
  const hours = SLA_HOURS[tier];
  if (hours == null) return null;
  const start = new Date(createdAt).getTime();
  return new Date(start + hours * HOUR_MS);
}

/** Milliseconds until the deadline (negative if past). */
export function remainingMs(deadline: Date | string, now: number = Date.now()): number {
  return new Date(deadline).getTime() - now;
}

/**
 * Resolve the SLA visual state. If the task is already completed, it's on-track.
 * Otherwise: breached if past deadline, due-soon within the final ratio window.
 */
export function slaState(
  createdAt: string | Date,
  tier: Tier,
  opts: { completed?: boolean; now?: number } = {},
): SLAState {
  if (opts.completed) return "on-track";
  const deadline = slaDeadline(createdAt, tier);
  if (!deadline) return "none";

  const now = opts.now ?? Date.now();
  const hours = SLA_HOURS[tier]!;
  const windowMs = hours * HOUR_MS;
  const left = deadline.getTime() - now;

  if (left <= 0) return "breached";
  if (left <= windowMs * (1 - SLA_DUE_SOON_RATIO)) return "due-soon";
  return "on-track";
}
