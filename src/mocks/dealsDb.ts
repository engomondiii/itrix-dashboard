import "server-only";

import { MOCK_LEADS } from "@/mocks/leads";
import type { ProductRoute } from "@/constants/products";
import type { Evaluation, EvaluationStatus } from "@/types/evaluation";
import type { PoC, PoCStatus } from "@/types/poc";
import type { Lead } from "@/types/lead";

function pkgFor(route: ProductRoute) {
  return route === "ALPHA Compute"
    ? ("ALPHA Compute Bottleneck Assessment" as const)
    : route === "ALPHA Core"
      ? ("ALPHA Core Runtime Fit Assessment" as const)
      : ("Combined ALPHA Evaluation" as const);
}

function evalStatus(l: Lead): EvaluationStatus {
  return l.status === "Evaluation"
    ? "in_progress"
    : l.status === "PoC"
      ? "delivered"
      : l.status === "Licensed"
        ? "won"
        : "proposed";
}

function kpis(prefix: string) {
  return [
    { id: `${prefix}-k1`, category: "Runtime", metric: "Time-to-solution", target: "−30%", result: "−24%" },
    { id: `${prefix}-k2`, category: "Memory", metric: "Peak memory", target: "−20%", result: "−18%" },
    { id: `${prefix}-k3`, category: "Accuracy", metric: "Residual", target: "< 1e-6", result: "8e-7" },
    { id: `${prefix}-k4`, category: "Energy", metric: "Throughput / watt", target: "+15%" },
  ];
}

export function listEvaluations(): Evaluation[] {
  return MOCK_LEADS.filter((l) => ["Evaluation", "PoC", "Licensed"].includes(l.status)).map(
    (l) => ({
      id: `ev-${l.id}`,
      leadId: l.id,
      leadName: l.company ?? l.email,
      company: l.company,
      pkg: pkgFor(l.productRoute),
      status: evalStatus(l),
      kpis: kpis(`ev-${l.id}`),
      createdAt: l.submittedAt,
      updatedAt: l.submittedAt,
    }),
  );
}

export function getEvaluation(id: string): Evaluation | null {
  return listEvaluations().find((e) => e.id === id) ?? null;
}

function pocStatus(l: Lead): PoCStatus {
  return l.status === "Licensed" ? "completed" : l.status === "PoC" ? "active" : "planning";
}

export function listPoCs(): PoC[] {
  return MOCK_LEADS.filter((l) => ["PoC", "Licensed"].includes(l.status)).map((l) => ({
    id: `poc-${l.id}`,
    leadId: l.id,
    leadName: l.company ?? l.email,
    company: l.company,
    status: pocStatus(l),
    milestones: [
      { id: `m1-${l.id}`, label: "Baseline benchmark agreed", status: "done" },
      { id: `m2-${l.id}`, label: "Workload transformed", status: l.status === "Licensed" ? "done" : "in_progress" },
      { id: `m3-${l.id}`, label: "Runtime validation", status: l.status === "Licensed" ? "done" : "pending" },
      { id: `m4-${l.id}`, label: "Integration milestone", status: l.status === "Licensed" ? "done" : "pending" },
    ],
    kpis: kpis(`poc-${l.id}`).map((k) => ({ ...k, baseline: "current stack" })),
    risks: [
      { id: `r1-${l.id}`, description: "Backend adapter effort underestimated", severity: "medium", mitigation: "Scope adapter in PoC" },
      { id: `r2-${l.id}`, description: "Crossover point sensitive to problem size", severity: "low" },
    ],
    createdAt: l.submittedAt,
    updatedAt: l.submittedAt,
  }));
}

export function getPoC(id: string): PoC | null {
  return listPoCs().find((p) => p.id === id) ?? null;
}
