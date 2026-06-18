export const POC_STATUSES = [
  "planning",
  "active",
  "completed",
  "stalled",
  "cancelled",
] as const;
export type PoCStatus = (typeof POC_STATUSES)[number];

export const POC_STATUS_LABELS: Record<PoCStatus, string> = {
  planning: "Planning",
  active: "Active",
  completed: "Completed",
  stalled: "Stalled",
  cancelled: "Cancelled",
};

export const MILESTONE_STATUSES = [
  "pending",
  "in_progress",
  "done",
  "missed",
] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const RISK_SEVERITIES = ["low", "medium", "high"] as const;
export type RiskSeverity = (typeof RISK_SEVERITIES)[number];

export interface PoCMilestone {
  id: string;
  label: string;
  status: MilestoneStatus;
  dueAt?: string | null; // ISO
}

export interface PoCKPI {
  id: string;
  category: string;
  metric: string;
  baseline?: string;
  target?: string;
  result?: string;
}

export interface PoCRisk {
  id: string;
  description: string;
  severity: RiskSeverity;
  mitigation?: string;
}

export interface PoC {
  id: string;
  leadId: string;
  leadName: string;
  company: string | null;
  status: PoCStatus;
  milestones: PoCMilestone[];
  kpis: PoCKPI[];
  risks: PoCRisk[];
  /** Captured when the PoC is opened. */
  scope?: string;
  durationWeeks?: number;
  successMetrics?: string;
  startDate?: string; // YYYY-MM-DD
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
