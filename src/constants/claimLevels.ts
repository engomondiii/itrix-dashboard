/**
 * Claim-Card 5-level matrix (Surface 2 v3.0 · Backend v4 §7).
 * Single-sourced with the backend `apps/governance` ClaimLevel. Drives the
 * governance admin + approval queue (Phase 2/3); declared here as the shared
 * vocabulary. `AGENT_AUTO_APPROVE_MAX_LEVEL` mirrors the backend setting.
 */

export const CLAIM_LEVELS = [1, 2, 3, 4, 5] as const;
export type ClaimLevel = (typeof CLAIM_LEVELS)[number];

export const CLAIM_LEVEL_LABEL: Record<ClaimLevel, string> = {
  1: "Basic factual",
  2: "Product capability",
  3: "Technical / performance",
  4: "Commercial / ROI",
  5: "Legal / IP / license",
};

export const CLAIM_LEVEL_DESCRIPTION: Record<ClaimLevel, string> = {
  1: "Company or public product description.",
  2: "Supports a defined feature or workflow.",
  3: "Speed, accuracy, benchmark, architecture — draft + cite, human approves.",
  4: "Cost / revenue / productivity impact — draft only, mandatory approval.",
  5: "Patent scope, exclusivity, valuation, terms — executive approval, never auto.",
};

type BadgeIntent = "info" | "warning" | "success" | "neutral" | "accent" | "error";

export const CLAIM_LEVEL_INTENT: Record<ClaimLevel, BadgeIntent> = {
  1: "neutral",
  2: "info",
  3: "warning",
  4: "warning",
  5: "error",
};

/** Drafts at or below this level auto-deliver; above it they queue for a human. */
export const AGENT_AUTO_APPROVE_MAX_LEVEL: ClaimLevel = 2;

/** These levels require a second, distinct approver before delivery. */
export const SECOND_APPROVER_LEVELS: readonly ClaimLevel[] = [4, 5];

export function requiresApproval(level: ClaimLevel): boolean {
  return level > AGENT_AUTO_APPROVE_MAX_LEVEL;
}

export function requiresSecondApprover(level: ClaimLevel): boolean {
  return SECOND_APPROVER_LEVELS.includes(level);
}
