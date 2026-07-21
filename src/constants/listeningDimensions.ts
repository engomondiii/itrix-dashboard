/**
 * The ten listening dimensions (Architecture v2.4 §3.1, carried forward
 * unchanged into v2.6 §3).
 *
 * These are what the coverage tracker tracks. Coverage is DETERMINISTIC — it is
 * Layer 1, updated by structured extraction from every user turn and every
 * attachment, and it is what decides whether the question loop keeps asking.
 * The language model chooses the WORDING of the next question; it never decides
 * whether a dimension is covered (Backend v6.0 §5.1). That division is the
 * reason the loop can be trusted to terminate.
 *
 * INTERNAL-ONLY. `coverage_map` is on the serializer deny-list for every
 * anonymous and client-plane payload (Architecture v2.6 §10.5, §7.4). A visitor
 * is never shown how much of them we think we have gathered.
 */

export const LISTENING_DIMENSIONS = [
  "pain",
  "desired_gain",
  "urgency",
  "role",
  "company_type",
  "workload",
  "current_stack",
  "commercial_intent",
  "strategic_ambition",
  "confidentiality_sensitivity",
] as const;
export type ListeningDimension = (typeof LISTENING_DIMENSIONS)[number];

export const DIMENSION_LABEL: Record<ListeningDimension, string> = {
  pain: "Pain",
  desired_gain: "Desired gain",
  urgency: "Urgency",
  role: "Role",
  company_type: "Company type",
  workload: "Workload",
  current_stack: "Current stack",
  commercial_intent: "Commercial intent",
  strategic_ambition: "Strategic ambition",
  confidentiality_sensitivity: "Confidentiality sensitivity",
};

/** What the platform is listening for on each dimension. */
export const DIMENSION_DESCRIPTION: Record<ListeningDimension, string> = {
  pain: "Where computation hurts today.",
  desired_gain: "The advantage they want to win.",
  urgency: "How soon this matters.",
  role: "Who they are in the decision.",
  company_type: "Industry and context.",
  workload: "The nature of the computation.",
  current_stack: "CPU / GPU / NPU / runtime / solver.",
  commercial_intent: "Learn, evaluate, or partner.",
  strategic_ambition: "Exclusivity, investment, partnership.",
  confidentiality_sensitivity: "How guarded they are.",
};

/**
 * Dimensions surfaced only when signals appear, never asked for directly.
 *
 * `strategic_ambition` is raised only when the visitor's own language opens the
 * door, and `confidentiality_sensitivity` is respected rather than probed —
 * pre-NDA discipline holds. An `unknown` on either of these is normal and is
 * NOT a gap the loop should try to close, which is why the coverage meter
 * renders them differently from the other eight.
 */
export const OPPORTUNISTIC_DIMENSIONS: ReadonlySet<ListeningDimension> = new Set([
  "strategic_ambition",
  "confidentiality_sensitivity",
]);

export const COVERAGE_STATUSES = ["unknown", "partial", "covered"] as const;
export type CoverageStatus = (typeof COVERAGE_STATUSES)[number];

export const COVERAGE_STATUS_LABEL: Record<CoverageStatus, string> = {
  unknown: "Unknown",
  partial: "Partial",
  covered: "Covered",
};

/**
 * Why the question loop stopped. Persisted as `stop_reason` and readable in the
 * cockpit (Backend v6.0 §5.3) — the earliest condition to fire wins.
 *
 * The distinction matters operationally: `covered` means the loop did its job,
 * `budget_exhausted` means it ran out of questions before it did, and
 * `visitor_declined` / `handoff_required` mean a human should look now.
 */
export const STOP_REASONS = [
  "covered",
  "budget_exhausted",
  "visitor_declined",
  "handoff_required",
] as const;
export type StopReason = (typeof STOP_REASONS)[number];

export const STOP_REASON_LABEL: Record<StopReason, string> = {
  covered: "All required dimensions covered",
  budget_exhausted: "Question budget exhausted",
  visitor_declined: "Visitor asked to move on",
  handoff_required: "Governance hand-off required",
};

/**
 * `budget_exhausted` is the one that should prompt a second look: the loop gave
 * up rather than finished, so the artifact was generated on thinner ground.
 */
export const STOP_REASON_INTENT: Record<StopReason, "success" | "warning" | "info" | "error"> = {
  covered: "success",
  budget_exhausted: "warning",
  visitor_declined: "info",
  handoff_required: "error",
};
