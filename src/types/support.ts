/**
 * Support requests (Backend v6.0 `apps/customer_success` — SupportRequest,
 * `services/support_router.py`).
 *
 * THE RULE THAT GOVERNS THIS WHOLE AREA: a support question is never answered
 * with a commercial answer. If a customer asks for help, the reply helps. It
 * does not mention a next agreement, an expansion, or another workload — no
 * matter how natural the segue seems (Playbook v1.6 §12D, §00.2).
 *
 * That is enforced in the backend claim checker, not by prompt wording, and the
 * resolution composer on this surface warns rather than relying on discipline.
 */

export const SUPPORT_STATUSES = ["open", "assigned", "waiting", "resolved", "escalated"] as const;
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

export const SUPPORT_STATUS_LABEL: Record<SupportStatus, string> = {
  open: "Open",
  assigned: "Assigned",
  waiting: "Waiting on customer",
  resolved: "Resolved",
  escalated: "Escalated",
};

export const SUPPORT_STATUS_INTENT: Record<
  SupportStatus,
  "neutral" | "info" | "warning" | "success" | "error"
> = {
  open: "warning",
  assigned: "info",
  waiting: "neutral",
  resolved: "success",
  escalated: "error",
};

/**
 * Urgency. `blocking` is not a severity label — it is the condition that
 * suppresses every commercial action for this customer until it clears
 * (Architecture v2.6 §18.7 step 1). Setting it has consequences beyond this
 * queue.
 */
export const SUPPORT_URGENCIES = ["blocking", "high", "normal", "low"] as const;
export type SupportUrgency = (typeof SUPPORT_URGENCIES)[number];

export const SUPPORT_URGENCY_LABEL: Record<SupportUrgency, string> = {
  blocking: "Blocking",
  high: "High",
  normal: "Normal",
  low: "Low",
};

export const SUPPORT_URGENCY_INTENT: Record<
  SupportUrgency,
  "error" | "warning" | "info" | "neutral"
> = {
  blocking: "error",
  high: "warning",
  normal: "info",
  low: "neutral",
};

export interface SupportRequest {
  id: string;
  clientId: string;
  company: string;
  subject: string;
  body: string;
  status: SupportStatus;
  urgency: SupportUrgency;
  owner: string | null;
  /** When a first response is due. Drives the SLA timer. */
  slaDueAt: string; // ISO
  createdAt: string; // ISO
  resolvedAt: string | null; // ISO
  /** Set after resolution — "did this actually resolve it for you?" */
  customerConfirmedResolved: boolean | null;
}

export interface SupportQueueSummary {
  open: number;
  breaching: number;
  blocking: number;
}
