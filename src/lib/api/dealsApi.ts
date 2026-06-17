import { apiGet } from "@/lib/api/client";
import { API } from "@/constants/routes";
import type { Evaluation } from "@/types/evaluation";
import type { PoC } from "@/types/poc";

export function listEvaluations() {
  return apiGet<{ results: Evaluation[]; count: number }>(API.evaluations);
}
export function getEvaluation(id: string) {
  return apiGet<Evaluation>(API.evaluation(id));
}
export function listPoCs() {
  return apiGet<{ results: PoC[]; count: number }>(API.pocs);
}
export function getPoC(id: string) {
  return apiGet<PoC>(API.poc(id));
}
