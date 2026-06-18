import type { EvaluationPackage } from "@/constants/products";

export const EVALUATION_STATUSES = [
  "proposed",
  "in_progress",
  "delivered",
  "won",
  "lost",
] as const;
export type EvaluationStatus = (typeof EVALUATION_STATUSES)[number];

export const EVALUATION_STATUS_LABELS: Record<EvaluationStatus, string> = {
  proposed: "Proposed",
  in_progress: "In progress",
  delivered: "Delivered",
  won: "Won",
  lost: "Lost",
};

export interface EvaluationKPI {
  id: string;
  category: string; // Runtime, Memory, Energy, Accuracy, Reproducibility, Integration
  metric: string;
  target?: string;
  result?: string;
}

export interface Evaluation {
  id: string;
  leadId: string;
  leadName: string;
  company: string | null;
  pkg: EvaluationPackage;
  status: EvaluationStatus;
  kpis: EvaluationKPI[];
  /** Captured when the evaluation is requested. */
  scope?: string;
  fee?: string;
  timeline?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
