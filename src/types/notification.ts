export type NotificationKind =
  | "new_lead"
  | "tier1_lead"
  | "sla_breach"
  | "nda_signed"
  | "escalation"
  | "system";

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  href?: string;
  read: boolean;
  createdAt: string; // ISO
}
