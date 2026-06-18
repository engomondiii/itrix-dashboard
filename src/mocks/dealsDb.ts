import "server-only";

import { MOCK_LEADS } from "@/mocks/leads";
import { getLead, setStatus } from "@/mocks/leadsDb";
import type { ProductRoute } from "@/constants/products";
import type { Evaluation, EvaluationStatus } from "@/types/evaluation";
import type {
  MilestoneStatus,
  PoC,
  PoCRisk,
  PoCStatus,
  RiskSeverity,
} from "@/types/poc";
import type { Lead } from "@/types/lead";

const now = () => new Date().toISOString();

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

// ── Evaluations ─────────────────────────────────────────────────────────────
function seedEvaluations(): Evaluation[] {
  return MOCK_LEADS.filter((l) =>
    ["Evaluation", "PoC", "Licensed"].includes(l.status),
  ).map((l) => ({
    id: `ev-${l.id}`,
    leadId: l.id,
    leadName: l.company ?? l.email,
    company: l.company,
    pkg: pkgFor(l.productRoute),
    status: evalStatus(l),
    kpis: kpis(`ev-${l.id}`),
    createdAt: l.submittedAt,
    updatedAt: l.submittedAt,
  }));
}

let evals: Evaluation[] | null = null;
function evalDb(): Evaluation[] {
  if (!evals) evals = seedEvaluations();
  return evals;
}

export function listEvaluations(): Evaluation[] {
  return evalDb();
}

export function getEvaluation(id: string): Evaluation | null {
  return evalDb().find((e) => e.id === id) ?? null;
}

export interface EvaluationRequest {
  scope?: string;
  fee?: string;
  timeline?: string;
}

/** Create an evaluation for a lead (idempotent per lead). */
export function createEvaluationForLead(
  lead: Lead,
  req: EvaluationRequest = {},
): Evaluation {
  const existing = evalDb().find((e) => e.leadId === lead.id);
  if (existing) return existing;
  const ev: Evaluation = {
    id: `ev-${lead.id}`,
    leadId: lead.id,
    leadName: lead.company ?? lead.email,
    company: lead.company,
    pkg: pkgFor(lead.productRoute),
    status: "proposed",
    kpis: kpis(`ev-${lead.id}`),
    scope: req.scope?.trim() || undefined,
    fee: req.fee?.trim() || undefined,
    timeline: req.timeline || undefined,
    createdAt: now(),
    updatedAt: now(),
  };
  evalDb().unshift(ev);
  return ev;
}

export function setEvaluationStatus(
  id: string,
  status: EvaluationStatus,
  by?: string,
): Evaluation | null {
  const e = evalDb().find((x) => x.id === id);
  if (!e) return null;
  e.status = status;
  e.updatedAt = now();
  // A lost evaluation ends the deal — don't leave the lead stranded "active".
  if (status === "lost") {
    const lead = getLead(e.leadId);
    if (lead && lead.status === "Evaluation") {
      setStatus(e.leadId, "Closed", by, "Evaluation lost");
    }
  }
  return e;
}

export function updateEvaluationKpi(
  id: string,
  kpiId: string,
  patch: { metric?: string; target?: string; result?: string },
): Evaluation | null {
  const e = evalDb().find((x) => x.id === id);
  if (!e) return null;
  const k = e.kpis.find((x) => x.id === kpiId);
  if (!k) return null;
  if (patch.metric != null) k.metric = patch.metric;
  if (patch.target != null) k.target = patch.target;
  if (patch.result != null) k.result = patch.result;
  e.updatedAt = now();
  return e;
}

// ── PoCs ────────────────────────────────────────────────────────────────────
function pocStatus(l: Lead): PoCStatus {
  return l.status === "Licensed" ? "completed" : l.status === "PoC" ? "active" : "planning";
}

function seedPoCs(): PoC[] {
  return MOCK_LEADS.filter((l) => ["PoC", "Licensed"].includes(l.status)).map(
    (l) => ({
      id: `poc-${l.id}`,
      leadId: l.id,
      leadName: l.company ?? l.email,
      company: l.company,
      status: pocStatus(l),
      milestones: [
        { id: `m1-${l.id}`, label: "Baseline benchmark agreed", status: "done" as MilestoneStatus },
        { id: `m2-${l.id}`, label: "Workload transformed", status: (l.status === "Licensed" ? "done" : "in_progress") as MilestoneStatus },
        { id: `m3-${l.id}`, label: "Runtime validation", status: (l.status === "Licensed" ? "done" : "pending") as MilestoneStatus },
        { id: `m4-${l.id}`, label: "Integration milestone", status: (l.status === "Licensed" ? "done" : "pending") as MilestoneStatus },
      ],
      kpis: kpis(`poc-${l.id}`).map((k) => ({ ...k, baseline: "current stack" })),
      risks: [
        { id: `r1-${l.id}`, description: "Backend adapter effort underestimated", severity: "medium" as RiskSeverity, mitigation: "Scope adapter in PoC" },
        { id: `r2-${l.id}`, description: "Crossover point sensitive to problem size", severity: "low" as RiskSeverity },
      ],
      createdAt: l.submittedAt,
      updatedAt: l.submittedAt,
    }),
  );
}

let pocs: PoC[] | null = null;
function pocDb(): PoC[] {
  if (!pocs) pocs = seedPoCs();
  return pocs;
}

export function listPoCs(): PoC[] {
  return pocDb();
}

export function getPoC(id: string): PoC | null {
  return pocDb().find((p) => p.id === id) ?? null;
}

export interface PoCRequest {
  scope?: string;
  durationWeeks?: number;
  successMetrics?: string;
  startDate?: string;
}

/** Create a PoC for a lead (idempotent per lead). */
export function createPoCForLead(lead: Lead, req: PoCRequest = {}): PoC {
  const existing = pocDb().find((p) => p.leadId === lead.id);
  if (existing) return existing;
  const poc: PoC = {
    id: `poc-${lead.id}`,
    leadId: lead.id,
    leadName: lead.company ?? lead.email,
    company: lead.company,
    status: "planning",
    milestones: [
      { id: `m1-${lead.id}`, label: "Baseline benchmark agreed", status: "pending" },
      { id: `m2-${lead.id}`, label: "Workload transformed", status: "pending" },
      { id: `m3-${lead.id}`, label: "Runtime validation", status: "pending" },
      { id: `m4-${lead.id}`, label: "Integration milestone", status: "pending" },
    ],
    kpis: kpis(`poc-${lead.id}`).map((k) => ({ ...k, baseline: "current stack" })),
    risks: [],
    scope: req.scope?.trim() || undefined,
    durationWeeks: req.durationWeeks || undefined,
    successMetrics: req.successMetrics?.trim() || undefined,
    startDate: req.startDate || undefined,
    createdAt: now(),
    updatedAt: now(),
  };
  pocDb().unshift(poc);
  return poc;
}

export function setPoCStatus(id: string, status: PoCStatus, by?: string): PoC | null {
  const p = pocDb().find((x) => x.id === id);
  if (!p) return null;
  p.status = status;
  p.updatedAt = now();
  // A completed PoC converts the lead into a licensed customer.
  if (status === "completed") {
    const lead = getLead(p.leadId);
    if (lead && lead.status !== "Licensed" && lead.status !== "Closed") {
      setStatus(p.leadId, "Licensed", by);
    }
  }
  // A cancelled PoC ends the deal. ("stalled" is recoverable — leave the lead.)
  if (status === "cancelled") {
    const lead = getLead(p.leadId);
    if (lead && lead.status === "PoC") {
      setStatus(p.leadId, "Closed", by, "PoC cancelled");
    }
  }
  return p;
}

export function setMilestoneStatus(
  pocId: string,
  milestoneId: string,
  status: MilestoneStatus,
): PoC | null {
  const p = pocDb().find((x) => x.id === pocId);
  if (!p) return null;
  const m = p.milestones.find((x) => x.id === milestoneId);
  if (!m) return null;
  m.status = status;
  p.updatedAt = now();
  return p;
}

export function updatePoCKpi(
  pocId: string,
  kpiId: string,
  patch: { metric?: string; baseline?: string; target?: string; result?: string },
): PoC | null {
  const p = pocDb().find((x) => x.id === pocId);
  if (!p) return null;
  const k = p.kpis.find((x) => x.id === kpiId);
  if (!k) return null;
  if (patch.metric != null) k.metric = patch.metric;
  if (patch.baseline != null) k.baseline = patch.baseline;
  if (patch.target != null) k.target = patch.target;
  if (patch.result != null) k.result = patch.result;
  p.updatedAt = now();
  return p;
}

let riskSeq = 0;
export function addPoCRisk(
  pocId: string,
  input: { description: string; severity: RiskSeverity; mitigation?: string },
): PoC | null {
  const p = pocDb().find((x) => x.id === pocId);
  if (!p) return null;
  const risk: PoCRisk = {
    id: `risk-new-${(riskSeq += 1)}`,
    description: input.description.trim(),
    severity: input.severity,
    mitigation: input.mitigation?.trim() || undefined,
  };
  p.risks.push(risk);
  p.updatedAt = now();
  return p;
}

export function updatePoCRisk(
  pocId: string,
  riskId: string,
  patch: { description?: string; severity?: RiskSeverity; mitigation?: string },
): PoC | null {
  const p = pocDb().find((x) => x.id === pocId);
  if (!p) return null;
  const r = p.risks.find((x) => x.id === riskId);
  if (!r) return null;
  if (patch.description != null) r.description = patch.description.trim();
  if (patch.severity != null) r.severity = patch.severity;
  if (patch.mitigation != null) r.mitigation = patch.mitigation.trim() || undefined;
  p.updatedAt = now();
  return p;
}

export function removePoCRisk(pocId: string, riskId: string): PoC | null {
  const p = pocDb().find((x) => x.id === pocId);
  if (!p) return null;
  const i = p.risks.findIndex((x) => x.id === riskId);
  if (i === -1) return null;
  p.risks.splice(i, 1);
  p.updatedAt = now();
  return p;
}
