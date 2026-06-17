/**
 * Lead tiers, thresholds, and actions.
 * Source: Master Architecture Flow §6.2, Execution Command §6/§9.
 * Score is 0–100; tier is derived from the score range.
 */

export const TIERS = [1, 2, 3, 4] as const;
export type Tier = (typeof TIERS)[number];

export interface TierDef {
  tier: Tier;
  label: string;
  min: number;
  max: number;
  action: string;
  /** SLA in hours for human response; null = no human follow-up. */
  responseHours: number | null;
  /** Theme token suffix → bg-tier-N-soft / text-tier-N. */
  token: `tier-${Tier}`;
}

export const TIER_DEFS: Record<Tier, TierDef> = {
  1: {
    tier: 1,
    label: "Strategic",
    min: 80,
    max: 100,
    action: "Immediate human concierge handoff",
    responseHours: 24,
    token: "tier-1",
  },
  2: {
    tier: 2,
    label: "Qualified",
    min: 60,
    max: 79,
    action: "Invite paid evaluation or meeting",
    responseHours: 48,
    token: "tier-2",
  },
  3: {
    tier: 3,
    label: "Nurture",
    min: 40,
    max: 59,
    action: "Send personalized brief and follow-up",
    responseHours: 24, // automated
    token: "tier-3",
  },
  4: {
    tier: 4,
    label: "Low Fit",
    min: 0,
    max: 39,
    action: "Educational content only",
    responseHours: null,
    token: "tier-4",
  },
};

/** Map a 0–100 score to its tier. */
export function tierFromScore(score: number): Tier {
  if (score >= 80) return 1;
  if (score >= 60) return 2;
  if (score >= 40) return 3;
  return 4;
}
