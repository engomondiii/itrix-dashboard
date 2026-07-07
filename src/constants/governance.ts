/**
 * Governance status vocabulary (Surface 2 v3.0 · Backend v4 §7).
 * The `governance_status` a message/draft carries after the governance pass.
 */

export const GOVERNANCE_STATUSES = [
  "auto_approved",
  "pending",
  "approved",
  "blocked",
  "under_review",
  "rejected",
] as const;
export type GovernanceStatus = (typeof GOVERNANCE_STATUSES)[number];

export const GOVERNANCE_STATUS_LABEL: Record<GovernanceStatus, string> = {
  auto_approved: "Auto-approved",
  pending: "Pending review",
  approved: "Approved",
  blocked: "Blocked",
  under_review: "Under review",
  rejected: "Rejected",
};

type BadgeIntent = "info" | "warning" | "success" | "neutral" | "gold" | "error";

export const GOVERNANCE_STATUS_INTENT: Record<GovernanceStatus, BadgeIntent> = {
  auto_approved: "success",
  pending: "warning",
  approved: "success",
  blocked: "error",
  under_review: "warning",
  rejected: "error",
};

/** The audiences a Claim-Card may be approved for. */
export const CLAIM_AUDIENCES = [
  "internal",
  "client",
  "investor",
  "partner",
  "public",
] as const;
export type ClaimAudience = (typeof CLAIM_AUDIENCES)[number];
