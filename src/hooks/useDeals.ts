"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
        toast.success("Status updated");
      },
      onError,
    }),
    setMilestone: useMutation({
      mutationFn: (vars: { milestoneId: string; status: MilestoneStatus }) =>
        setMilestoneStatus(id, vars.milestoneId, vars.status),
      onSuccess: (p) => write(p),
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
