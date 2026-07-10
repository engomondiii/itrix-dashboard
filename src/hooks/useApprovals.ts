"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveDraft,
  editDraft,
  listAgentRuns,
  listApprovalQueue,
  rejectDraft,
} from "@/lib/api/agentsApi";
import { useToast } from "@/hooks/useToast";
import type { ApprovalRequest } from "@/types/agent";

export function useApprovalQueue() {
  return useQuery({ queryKey: ["approvals"], queryFn: listApprovalQueue });
}

export function useAgentRuns() {
  return useQuery({ queryKey: ["agent-runs"], queryFn: listAgentRuns });
}

export function useApprovalActions() {
  const qc = useQueryClient();
  const { toast } = useToast();

  function done(msg: string) {
    qc.invalidateQueries({ queryKey: ["approvals"] });
    // An approved draft is delivered into its thread and recorded in the run log,
    // so refresh those surfaces too.
    qc.invalidateQueries({ queryKey: ["conversations"] });
    qc.invalidateQueries({ queryKey: ["conversation"] });
    qc.invalidateQueries({ queryKey: ["agent-runs"] });
    qc.invalidateQueries({ queryKey: ["governance-audit"] });
    toast.success(msg);
  }
  function fail(e: unknown) {
    toast.error((e as Error).message);
  }

  return {
    approve: useMutation({
      mutationFn: (v: { id: string; body?: string }) => approveDraft(v.id, v.body),
      onSuccess: (r: ApprovalRequest) =>
        done(
          r.status === "awaiting_second"
            ? "Approval 1 of 2 recorded — a different approver must confirm"
            : "Approved & delivered to the thread",
        ),
      onError: fail,
    }),
    edit: useMutation({
      mutationFn: (v: { id: string; body: string }) => editDraft(v.id, v.body),
      onSuccess: () => done("Draft edited"),
      onError: fail,
    }),
    reject: useMutation({
      mutationFn: (v: { id: string; reason?: string }) => rejectDraft(v.id, v.reason),
      onSuccess: () => done("Draft rejected"),
      onError: fail,
    }),
  };
}
