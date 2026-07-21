/**
 * The customer-success domain (Backend v6.0 §09 Phase 2, `apps/customer_success`).
 *
 * THE ACTIVATION RULE. Customer success activates at the FIRST PAYMENT, not at
 * license-out (Architecture v2.6 §7.1, R16). A paid Assessment customer — state
 * 7 — already has named owners, support access and success goals. Anything here
 * that keys off "contracted" rather than "paid" is a bug.
 *
 * THE PRIORITY RULE. Keeping paying customers happy and successful is more
 * important than moving them toward another agreement. This is not an upsell
 * surface. That rule is enforced on the backend by `nba_precedence`; this
 * surface renders its output honestly, including when it says "do not sell".
 *
 * CUSTOMER-VISIBLE vs INTERNAL-ONLY is enforced by serializer allow-lists on
 * the client plane, not by frontend omission. Health class, churn risk and
 * feedback scores live only here.
 */

/**
 * Outcome status words. USE EXACTLY THESE (Playbook v1.6 §12B).
 *
 * They are customer-visible vocabulary, so they are fixed: "at risk" and "off
 * plan" mean different things to a customer reading their own outcomes, and
 * paraphrasing either one softens a commitment we made.
 */
export const OUTCOME_STATUSES = ["On plan", "At risk", "Off plan", "Achieved"] as const;
export type OutcomeStatus = (typeof OUTCOME_STATUSES)[number];

export const OUTCOME_STATUS_INTENT: Record<
  OutcomeStatus,
  "success" | "warning" | "error" | "info"
> = {
  "On plan": "info",
  "At risk": "warning",
  "Off plan": "error",
  Achieved: "success",
};

/** An outcome the customer and itriX agreed together. Theirs, not a sales target. */
export interface Outcome {
  id: string;
  clientId: string;
  title: string;
  status: OutcomeStatus;
  /** What we are measuring, in the customer's terms. */
  measure: string;
  targetDate: string | null; // ISO
  updatedAt: string; // ISO
}

/**
 * Overall customer health. INTERNAL-ONLY as a class — the customer sees their
 * outcomes and their deployment status, never a grade about them.
 */
export const HEALTH_CLASSES = ["stable", "watch", "at_risk"] as const;
export type HealthClass = (typeof HEALTH_CLASSES)[number];

export const HEALTH_CLASS_LABEL: Record<HealthClass, string> = {
  stable: "Stable",
  watch: "Watch",
  at_risk: "At risk",
};

export const HEALTH_CLASS_INTENT: Record<HealthClass, "success" | "warning" | "error"> = {
  stable: "success",
  watch: "warning",
  at_risk: "error",
};

export interface DeploymentHealth {
  id: string;
  environment: string;
  version: string;
  status: "healthy" | "degraded" | "down";
  lastCheckedAt: string; // ISO
  knownLimitations: string[];
}

export interface SuccessPlanMilestone {
  id: string;
  title: string;
  horizonDays: 30 | 60 | 90;
  ownerSide: "itrix" | "customer";
  owner: string;
  done: boolean;
  /** Needs something from the customer's side — flagged early so it never surprises. */
  dependency: boolean;
}

export interface SuccessPlan {
  clientId: string;
  milestones: SuccessPlanMilestone[];
}

/**
 * A private satisfaction pulse.
 *
 * NEVER RENDERED BACK TO THE CUSTOMER AS A SCORE ABOUT THEM, never used in copy
 * addressed to them, and never shown outside the success team (Playbook v1.6
 * §12I). It exists to tell us something, not to grade them.
 */
export interface FeedbackPulse {
  id: string;
  clientId: string;
  score: number; // 1..5, internal only
  comment: string | null;
  followUpRequested: boolean;
  at: string; // ISO
}

export interface RelationshipTeamMember {
  id: string;
  name: string;
  role: "Customer success" | "Technical" | "Executive" | "Support";
  email: string;
}

/** One entry in "what changed since your last visit". */
export interface ChangeLogEntry {
  id: string;
  clientId: string;
  kind: "completed" | "resolved" | "shipped" | "awaiting_decision";
  summary: string;
  at: string; // ISO
}

/** Row on the customer health board. */
export interface CustomerListItem {
  clientId: string;
  company: string;
  /** The journey state — 7 upward, because success starts at first payment. */
  journeyNumber: number;
  stateLabel: string;
  healthClass: HealthClass;
  outcomes: { total: number; onPlan: number; atRisk: number; offPlan: number; achieved: number };
  openSupportRequests: number;
  /** True when any open request has breached or is about to breach its SLA. */
  supportBreaching: boolean;
  adoptionPercent: number;
  lastFeedbackScore: number | null;
  nextReviewAt: string | null; // ISO
  firstPaymentAt: string; // ISO
  owner: string | null;
}

export interface CustomerDetail {
  customer: CustomerListItem;
  outcomes: Outcome[];
  deployments: DeploymentHealth[];
  plan: SuccessPlan;
  team: RelationshipTeamMember[];
  feedback: FeedbackPulse[];
  changes: ChangeLogEntry[];
}

/** A scheduled success review and the agenda assembled for it. */
export interface SuccessReview {
  id: string;
  clientId: string;
  company: string;
  scheduledAt: string; // ISO
  owner: string;
  agenda: string[];
}
