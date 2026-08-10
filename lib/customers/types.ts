/**
 * Customers + deals wire types (itrix-backend).
 *
 * Team-plane reality: the customer board/detail is deliberately THIN —
 * clientId, company, health + reasons, a few booleans, and (detail only)
 * contractState. Outcomes / success plan / team / deployments live on the
 * CLIENT plane and are unreachable with a team JWT. Never render slots for
 * them here.
 */

export type HealthClass = 'stable' | 'at_risk' | 'critical' | 'unknown';

export interface CustomerRow {
  clientId: string;
  company: string;
  healthClass: HealthClass;
  reasons: string[];
  blockingSupport: boolean;
  outcomesOffPlan: number;
  negativePulse: boolean;
  degradedDeployments: number;
  expansionAllowed: boolean;
}

export interface CustomerDetail extends CustomerRow {
  contractState: string;
}

export type EvaluationStatus = 'proposed' | 'in_progress' | 'delivered' | 'won' | 'lost';

export interface EvaluationKpi {
  id: string;
  category: string;
  metric: string;
  target?: string;
  result?: string;
}

export interface Evaluation {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  pkg: string;
  status: EvaluationStatus;
  kpis: EvaluationKpi[];
  scope: string;
  fee: string;
  timeline: string;
  createdAt: string;
  updatedAt: string;
}

export type PocStatus = 'planning' | 'active' | 'completed' | 'stalled' | 'cancelled';
export type MilestoneStatus = 'pending' | 'in_progress' | 'done' | 'missed';

export interface PocMilestone {
  id: string;
  label: string;
  status: MilestoneStatus;
  dueAt?: string;
}

export interface PocRisk {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface Poc {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  status: PocStatus;
  milestones: PocMilestone[];
  kpis: Array<EvaluationKpi & { baseline?: string }>;
  risks: PocRisk[];
  scope: string;
  durationWeeks: number | null;
  successMetrics: string;
  startDate: string | null;
  createdAt: string;
  updatedAt: string;
}
