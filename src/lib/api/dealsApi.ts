import { apiGet, apiSend } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { Evaluation, EvaluationStatus } from "@/types/evaluation";
import type {
  MilestoneStatus,
  PoC,
  PoCStatus,
  RiskSeverity,
} from "@/types/poc";

// ── Evaluations ─────────────────────────────────────────────────────────────
export function listEvaluations() {
  return apiGet<{ results: Evaluation[]; count: number }>(API.evaluations);
}
export function getEvaluation(id: string) {
  return apiGet<Evaluation>(API.evaluation(id));
}
export function setEvaluationStatus(id: string, status: EvaluationStatus) {
  return apiSend<Evaluation>(API.evaluation(id), "PATCH", { status });
}
export function updateEvaluationKpi(
  id: string,
  kpiId: string,
  patch: { metric?: string; target?: string; result?: string },
) {
  return apiSend<Evaluation>(API.evaluationKpi(id, kpiId), "PATCH", patch);
}

// ── PoCs ────────────────────────────────────────────────────────────────────
export interface RiskInput {
  description: string;
  severity: RiskSeverity;
  mitigation?: string;
}

export function listPoCs() {
  return apiGet<{ results: PoC[]; count: number }>(API.pocs);
}
export function getPoC(id: string) {
  return apiGet<PoC>(API.poc(id));
}
export function setPoCStatus(id: string, status: PoCStatus) {
  return apiSend<PoC>(API.poc(id), "PATCH", { status });
}
export function setMilestoneStatus(
  id: string,
  milestoneId: string,
  status: MilestoneStatus,
) {
  return apiSend<PoC>(API.pocMilestone(id, milestoneId), "PATCH", { status });
}
export function updatePoCKpi(
  id: string,
  kpiId: string,
  patch: { metric?: string; baseline?: string; target?: string; result?: string },
) {
  return apiSend<PoC>(API.pocKpi(id, kpiId), "PATCH", patch);
}
export function addPoCRisk(id: string, input: RiskInput) {
  return apiSend<PoC>(API.pocRisks(id), "POST", input);
}
export function updatePoCRisk(
  id: string,
  riskId: string,
  patch: Partial<RiskInput>,
) {
  return apiSend<PoC>(API.pocRisk(id, riskId), "PATCH", patch);
}
export function removePoCRisk(id: string, riskId: string) {
  return apiSend<PoC>(API.pocRisk(id, riskId), "DELETE");
}
