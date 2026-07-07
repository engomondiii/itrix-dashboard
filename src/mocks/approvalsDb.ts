import "server-only";

import type { ApprovalRequest } from "@/types/agent";

/**
 * Mock approval-queue store. Agent/team drafts above the auto-approve threshold
 * (claim level > 2) land here for a human. L4/L5 require a second, distinct
 * approver — the real governance rule, enforced here in mock mode too.
 */

function seed(): ApprovalRequest[] {
  return [
    {
      id: "apr-1",
      leadId: "lead-1",
      agentKey: "proof",
      claimLevel: 3,
      draftBody:
        "In an internal SPD/Cholesky benchmark, the real-block representation reduced solve time by roughly 3–4×. We can share the harness under NDA.",
      finalBody: "",
      citedChunkIds: ["wp_alpha_secret_001", "axiom_benchmark_003"],
      status: "pending",
      reason: "",
      requiresSecondApprover: false,
      firstApprover: null,
      at: "2026-07-06T14:20:00Z",
    },
    {
      id: "apr-2",
      leadId: "lead-2",
      agentKey: "proposal",
      claimLevel: 5,
      draftBody:
        "Draft LOI: itriX grants a 24-month field-exclusive license for the semiconductor SDK, with a minimum guarantee and milestone schedule as discussed.",
      finalBody: "",
      citedChunkIds: ["commercial_pathway_012"],
      status: "pending",
      reason: "",
      requiresSecondApprover: true,
      firstApprover: null,
      at: "2026-07-06T16:05:00Z",
    },
    {
      id: "apr-3",
      leadId: "lead-3",
      agentKey: "objection",
      claimLevel: 4,
      draftBody:
        "On ROI: partners typically model payback against GPU-hour and energy savings; a paid assessment quantifies the candidate reduction for your workload before any commitment.",
      finalBody: "",
      citedChunkIds: ["commercialization_007"],
      status: "awaiting_second",
      reason: "",
      requiresSecondApprover: true,
      firstApprover: "Stacey",
      at: "2026-07-05T11:30:00Z",
    },
  ];
}

let approvals: ApprovalRequest[] = seed();

export function listApprovalQueue(): ApprovalRequest[] {
  return approvals
    .filter((a) => a.status === "pending" || a.status === "awaiting_second")
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}

/** All approval records (any status) — for the governance audit trail. */
export function listAllApprovals(status?: string): ApprovalRequest[] {
  const all = [...approvals].sort((a, b) => (a.at < b.at ? 1 : -1));
  return status ? all.filter((a) => a.status === status) : all;
}

export type ApprovalOutcome =
  | { ok: true; request: ApprovalRequest }
  | { ok: false; status: 404 | 409; detail: string };

export function actOnApproval(
  id: string,
  action: "approve" | "edit" | "reject",
  actorName: string,
  body?: string,
  reason?: string,
): ApprovalOutcome {
  const idx = approvals.findIndex((a) => a.id === id);
  if (idx < 0) return { ok: false, status: 404, detail: "Not found" };
  const a = { ...approvals[idx] };

  if (action === "reject") {
    a.status = "rejected";
    a.reason = reason ?? "";
    approvals[idx] = a;
    return { ok: true, request: a };
  }

  if (action === "edit") {
    if (!body) return { ok: false, status: 409, detail: "Edit requires a body." };
    a.finalBody = body;
  } else {
    a.finalBody = a.finalBody || a.draftBody;
  }

  // Two-approver rule for L4/L5.
  if (a.requiresSecondApprover) {
    if (a.status !== "awaiting_second") {
      a.status = "awaiting_second";
      a.firstApprover = actorName;
    } else if (a.firstApprover === actorName) {
      return {
        ok: false,
        status: 409,
        detail: "This draft needs a second, different approver.",
      };
    } else {
      a.status = "approved";
    }
  } else {
    a.status = "approved";
  }

  approvals[idx] = a;
  return { ok: true, request: a };
}
