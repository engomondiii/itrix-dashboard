export type PoCStatus = "planning" | "active" | "completed" | "stalled" | "cancelled";
export type MilestoneStatus = "pending" | "in_progress" | "done" | "missed";
export type RiskSeverity = "low" | "medium" | "high";

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
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
