/**
 * SLA response thresholds, keyed by tier.
 * Source: Execution Command §9.3 (Tier 1 < 24h, Tier 2 < 48h), Theme §4.2 SLA discipline.
 * MVP uses calendar hours; business-hours refinement can come later.
 */

import type { Tier } from "./tiers";

/** Hours allowed for first human response, by tier. null = no SLA. */
export const SLA_HOURS: Record<Tier, number | null> = {
  1: 24,
  2: 48,
  3: 24, // automated brief
  4: null,
};

/** Fraction of the SLA window after which a task is "due soon" (amber). */
export const SLA_DUE_SOON_RATIO = 0.75;

/** SLA visual states → theme intent. */
export type SLAState = "on-track" | "due-soon" | "breached" | "none";

export const SLA_STATE_INTENT: Record<SLAState, "neutral" | "warning" | "error"> = {
  "on-track": "neutral",
  "due-soon": "warning",
  breached: "error",
  none: "neutral",
};
