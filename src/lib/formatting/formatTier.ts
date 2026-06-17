import { TIER_DEFS, type Tier } from "@/constants/tiers";

/** "Tier 1" */
export function formatTier(tier: Tier): string {
  return `Tier ${tier}`;
}

/** "Tier 1 · Strategic" */
export function formatTierLabel(tier: Tier): string {
  return `Tier ${tier} · ${TIER_DEFS[tier].label}`;
}
