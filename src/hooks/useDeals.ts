"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import {
  addPoCRisk,
  getEvaluation,
  getPoC,
  listEvaluations,
  listPoCs,
  removePoCRisk,
  setEvaluationStatus,
  setMilestoneStatus,
  setPoCStatus,
  updateEvaluationKpi,
  updatePoCKpi,
  updatePoCRisk,
  type RiskInput,
} from "@/lib/api/dealsApi";
import { markLeadPoC } from "@/lib/api/leadsApi";
import { ROUTES } from "@/constants/routes";
import { useToast } from "@/hooks/useToast";
import type { Evaluation, EvaluationStatus } from "@/types/evaluation";
import type { MilestoneStatus, PoC, PoCStatus } from "@/types/poc";

export function useEvaluations() {
  return useQuery({ queryKey: ["evaluations"], queryFn: listEvaluations });
}
export function useEvaluation(id: string) {
  return useQuery({
    queryKey: ["evaluation", id],
    queryFn: () => getEvaluation(id),
    enabled: Boolean(id),
  });
}
export function usePoCs() {
  return useQuery({ queryKey: ["pocs"], queryFn: listPoCs });
}
export function usePoC(id: string) {
  return useQuery({ queryKey: ["poc", id], queryFn: () => getPoC(id), enabled: Boolean(id) });
}

/** Evaluation write actions: status + KPI edits. */
export function useEvaluationActions(id: string) {
  const qc = useQueryClient();
  const router = useRouter();
  const { toast } = useToast();
  const onError = (e: unknown) => toast.error((e as Error).message);
  const write = (ev: Evaluation) => {
    qc.setQueryData(["evaluation", ev.id], ev);
    qc.invalidateQueries({ queryKey: ["evaluations"] });
  };

  return {
    setStatus: useMutation({
      mutationFn: (status: EvaluationStatus) => setEvaluationStatus(id, status),
      onSuccess: (ev) => {
        write(ev);
        // A terminal status (lost) can close the lead — refresh lead caches.
        qc.invalidateQueries({ queryKey: ["leads"] });
        qc.invalidateQueries({ queryKey: ["lead", ev.leadId] });
        // Marking an evaluation LOST closes the lead (Evaluation -> Closed).
        // Both are pipeline column changes, and Closed also drops the lead
        // out of NDA_LEAD_STATUSES and so off the NDA list.
        qc.invalidateQueries({ queryKey: ["pipeline"] });
        qc.invalidateQueries({ queryKey: ["nda"] });
        toast.success("Status updated");
      },
      onError,
    }),
    updateKpi: useMutation({
      mutationFn: (vars: {
        kpiId: string;
        patch: { metric?: string; target?: string; result?: string };
      }) => updateEvaluationKpi(id, vars.kpiId, vars.patch),
      onSuccess: (ev) => {
        write(ev);
        toast.success("KPI updated");
      },
      onError,
    }),
    // A won evaluation graduates to a PoC: creates the PoC record and moves
    // the lead into the PoC stage. The API returns the lead, not the new PoC id,
    // so we land the operator on the PoC list where it now appears — otherwise
    // the action looks like it did nothing.
    convertToPoC: useMutation({
      mutationFn: (leadId: string) => markLeadPoC(leadId),
      onSuccess: (lead) => {
        qc.invalidateQueries({ queryKey: ["pocs"] });
        qc.invalidateQueries({ queryKey: ["leads"] });
        qc.invalidateQueries({ queryKey: ["evaluations"] });
        qc.setQueryData(["lead", lead.id], lead);
        toast.success("PoC created");
        router.push(ROUTES.pocs);
      },
      onError,
    }),
  };
}

/** PoC write actions: status, milestones, KPIs, risk register. */
export function usePoCActions(id: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const onError = (e: unknown) => toast.error((e as Error).message);
  const write = (poc: PoC) => {
    qc.setQueryData(["poc", poc.id], poc);
    qc.invalidateQueries({ queryKey: ["pocs"] });
  };

  return {
    setStatus: useMutation({
      mutationFn: (status: PoCStatus) => setPoCStatus(id, status),
      onSuccess: (p) => {
        write(p);
        // Completing a PoC licenses the lead — refresh lead-facing caches.
        qc.invalidateQueries({ queryKey: ["leads"] });
        qc.invalidateQueries({ queryKey: ["lead", p.leadId] });
        // Completing a PoC licenses it (PoC -> Licensed); cancelling closes it.
        // Both are pipeline column changes, and Closed also drops the lead
        // out of NDA_LEAD_STATUSES and so off the NDA list.
        qc.invalidateQueries({ queryKey: ["pipeline"] });
        qc.invalidateQueries({ queryKey: ["nda"] });
        toast.success("Status updated");
      },
      onError,
    }),
    setMilestone: useMutation({
      mutationFn: (vars: { milestoneId: string; status: MilestoneStatus }) =>
        setMilestoneStatus(id, vars.milestoneId, vars.status),
      onSuccess: (p) => {
        write(p);
        toast.success("Milestone updated");
      },
      onError,
    }),
    updateKpi: useMutation({
      mutationFn: (vars: {
        kpiId: string;
        patch: {
          metric?: string;
          baseline?: string;
          target?: string;
          result?: string;
        };
      }) => updatePoCKpi(id, vars.kpiId, vars.patch),
      onSuccess: (p) => {
        write(p);
        toast.success("KPI updated");
      },
      onError,
    }),
    addRisk: useMutation({
      mutationFn: (input: RiskInput) => addPoCRisk(id, input),
      onSuccess: (p) => {
        write(p);
        toast.success("Risk added");
      },
      onError,
    }),
    updateRisk: useMutation({
      mutationFn: (vars: { riskId: string; patch: Partial<RiskInput> }) =>
        updatePoCRisk(id, vars.riskId, vars.patch),
      onSuccess: (p) => {
        write(p);
        toast.success("Risk updated");
      },
      onError,
    }),
    removeRisk: useMutation({
      mutationFn: (riskId: string) => removePoCRisk(id, riskId),
      onSuccess: (p) => {
        write(p);
        toast.success("Risk removed");
      },
      onError,
    }),
  };
}
