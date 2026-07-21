/**
 * v5.0 adds five kinds (Surface 2 v5.0 §06 Phase 2/3).
 *
 * `support_sla_breach` deliberately reuses the same alerting path as an overdue
 * follow-up rather than getting a quieter one of its own — the Phase 2
 * acceptance criterion is that "a support request breaching SLA raises the same
 * alerting path as an overdue follow-up". A customer waiting on help is not a
 * lesser event than a prospect waiting on a call.
 */
export type NotificationKind =
  | "new_lead"
  | "tier1_lead"
  | "sla_breach"
  | "nda_signed"
  | "escalation"
  | "system"
  | "support_sla_breach"
  | "feedback_risk"
  | "success_review_due"
  | "attachment_quarantine"
  | "stream_guard_halt";

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  href?: string;
  read: boolean;
  createdAt: string; // ISO
}
