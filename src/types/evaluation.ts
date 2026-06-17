import type { EvaluationPackage } from "@/constants/products";

export type EvaluationStatus =
  | "proposed"
  | "in_progress"
  | "delivered"
  | "won"
  | "lost";

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
  createdAt: string; // ISO
  updatedAt: string; // ISO
}
