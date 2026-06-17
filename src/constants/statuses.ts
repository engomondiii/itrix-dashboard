/**
 * Lead lifecycle statuses (pipeline stages).
 * Source: Master Architecture Flow §8.1 (Status field), §9.3.
 * Order matters — it defines pipeline column order.
 */

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Meeting Booked",
  "NDA",
  "Evaluation",
  "PoC",
  "Licensed",
  "Closed",
] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** URL-safe slug for a status (used by /pipeline/[stageId]). */
export function statusToSlug(status: LeadStatus): string {
  return status.toLowerCase().replace(/\s+/g, "-");
}

export function slugToStatus(slug: string): LeadStatus | undefined {
  return LEAD_STATUSES.find((s) => statusToSlug(s) === slug);
}

/** Status → theme intent for badge coloring (soft-bg + strong-text). */
export const STATUS_INTENT: Record<
  LeadStatus,
  "info" | "warning" | "success" | "neutral"
> = {
  New: "info",
  Contacted: "info",
  "Meeting Booked": "warning",
  NDA: "warning",
  Evaluation: "warning",
  PoC: "warning",
  Licensed: "success",
  Closed: "neutral",
};
