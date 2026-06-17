import type { LeadStatus } from "@/constants/statuses";
import type { LeadListItem } from "./lead";

/** A pipeline column = one lead status, with its leads and count. */
export interface PipelineStage {
  status: LeadStatus;
  count: number;
  leads: PipelineCardData[];
}

export interface PipelineCardData extends LeadListItem {
  /** True when the lead's follow-up SLA is breached (renders error bar). */
  overdue?: boolean;
}

export interface PipelineBoard {
  stages: PipelineStage[];
}
