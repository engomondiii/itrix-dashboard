/**
 * The customer-first next-best-action rule (Architecture v2.6 §18.7,
 * Backend v6.0 §09 Phase 3 `nba_precedence.py`).
 *
 * THE RULE, in precedence order:
 *   1. blocking support issue open              → support action is primary
 *   2. agreed outcome off plan                  → outcome action is primary
 *   3. adoption below plan                      → enablement action is primary
 *   4. negative trust signal                    → human outreach is primary
 *   5. otherwise, and only if expansion_allowed → commercial action eligible
 *
 * A COMMERCIAL CANDIDATE RANKED PRIMARY WHILE ANY OF 1–4 HOLD IS A DEFECT, not
 * a judgement call. The rule executes on the backend before scoring; this
 * surface renders its output honestly — including when it says "do not sell
 * right now" — and never re-ranks locally.
 *
 * The operator may still act commercially by exception. That is deliberate: a
 * rule nobody can override gets worked around instead of followed. But the UI
 * must show the condition and the override must be logged with a reason.
 */

export const SUPPRESSION_REASONS = [
  "blocking_support_issue",
  "outcome_off_plan",
  "adoption_below_plan",
  "negative_trust_signal",
  "expansion_not_allowed",
] as const;
export type SuppressionReason = (typeof SUPPRESSION_REASONS)[number];

/** Plain language for the operator. Never shown to a customer. */
export const SUPPRESSION_REASON_LABEL: Record<SuppressionReason, string> = {
  blocking_support_issue: "A blocking support issue is open",
  outcome_off_plan: "An agreed outcome is off plan",
  adoption_below_plan: "Adoption is below plan",
  negative_trust_signal: "Recent private feedback is negative",
  expansion_not_allowed: "The expansion gate has not opened",
};

/** What clears it — so the answer to "when can I sell?" is on screen. */
export const SUPPRESSION_CLEARS_WHEN: Record<SuppressionReason, string> = {
  blocking_support_issue:
    "the issue is resolved and customer health returns to stable.",
  outcome_off_plan: "the outcome is back on plan or renegotiated with the customer.",
  adoption_below_plan: "adoption reaches the agreed level, usually through enablement.",
  negative_trust_signal: "the concern behind the feedback has been addressed.",
  expansion_not_allowed: "the deterministic expansion gate opens for this customer.",
};

export type NbaActionType =
  | "support"
  | "outcome"
  | "enablement"
  | "human_outreach"
  | "commercial";

export const NBA_ACTION_TYPE_LABEL: Record<NbaActionType, string> = {
  support: "Support",
  outcome: "Outcome",
  enablement: "Enablement",
  human_outreach: "Human outreach",
  commercial: "Commercial",
};

/**
 * One candidate action.
 *
 * `commercial` is a boolean on every candidate rather than something inferred
 * from the type string — the Strategy agent sets it, and the precedence rule
 * reads it. Inferring it here would let a mislabelled candidate slip past the
 * gate.
 */
export interface NbaCandidate {
  id: string;
  type: NbaActionType;
  label: string;
  rationale: string;
  commercial: boolean;
  /** Set when this candidate was demoted, naming the condition that did it. */
  suppressedBy: SuppressionReason | null;
}

export interface CustomerNextAction {
  clientId: string;
  primary: NbaCandidate;
  candidates: NbaCandidate[];
  /**
   * The condition that suppressed commercial actions, or null when commercial
   * work is eligible. Recorded on the backend and shown to the operator.
   */
  suppressionReason: SuppressionReason | null;
  /** False whenever `suppressionReason` is set. */
  canActCommercially: boolean;
}

/** A logged exception. The rule bends visibly, never silently. */
export interface CommercialOverride {
  clientId: string;
  reason: string;
  by: string;
  at: string; // ISO
}
