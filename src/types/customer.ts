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
 *
 * FOUR VALUES, from Backend v7.0 §3.1. `critical` is deliberately not collapsed
 * into `at_risk` — that distinction is what step 1 of the customer-first
 * precedence rule turns on. `unknown` means the inputs could not be computed,
 * which is an answer, not an absence: a board that renders unknown as stable
 * has hidden exactly the account nobody is measuring. (v6.0's `watch` is
 * retired; the backend never had it.)
 */
export const HEALTH_CLASSES = ["stable", "at_risk", "critical", "unknown"] as const;
export type HealthClass = (typeof HEALTH_CLASSES)[number];

export const HEALTH_CLASS_LABEL: Record<HealthClass, string> = {
  stable: "Stable",
  at_risk: "At risk",
  critical: "Critical",
  unknown: "Unknown",
};

export const HEALTH_CLASS_INTENT: Record<
  HealthClass,
  "success" | "warning" | "error" | "neutral"
> = {
  stable: "success",
  at_risk: "warning",
  critical: "error",
  unknown: "neutral",
};

/** Worst-first board order (Surface 2 v6.0 §4.3): critical → at_risk → unknown → stable. */
export const HEALTH_CLASS_URGENCY: Record<HealthClass, number> = {
  critical: 3,
  at_risk: 2,
  unknown: 1,
  stable: 0,
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

/**
 * Row on the customer health board — the Backend v7.0 §3.1 wire shape
 * (`customer_health.board()` rows, `results` envelope).
 */
export interface CustomerListItem {
  clientId: string;
  company: string;
  /** The journey state — 7 upward, because success starts at first payment. */
  journeyNumber: number;
  stateLabel: string;
  healthClass: HealthClass;
  /**
   * Why the class is what it is. Always rendered beside the badge — a health
   * class an operator cannot explain is a number they will learn to ignore.
   */
  reasons: string[];
  /**
   * False while a suppression condition holds. Feeds the customer-first rule's
   * display; the rule itself executes on the backend, and an override never
   * flips this — the condition stays true, a human acted against it on record.
   */
  expansionAllowed: boolean;
  outcomes: { total: number; onPlan: number; atRisk: number; offPlan: number; achieved: number };
  openSupportCount: number;
  /** True when any open request has breached or is about to breach its SLA. */
  slaBreaching: boolean;
  adoptionPercent: number;
  lastFeedbackScore: number | null;
  nextReviewDate: string | null; // ISO
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
