import type { Tier } from "@/constants/tiers";

export type FollowUpStatus = "pending" | "completed" | "snoozed";

export interface FollowUpTask {
  id: string;
  leadId: string;
  leadName: string;
  company: string | null;
  tier: Tier;
  owner: string | null;
  createdAt: string; // ISO — SLA clock starts here
  dueAt: string; // ISO — derived from tier SLA
  status: FollowUpStatus;
  snoozedUntil?: string | null;
  note?: string;
}
