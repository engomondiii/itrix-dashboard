'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addPocRisk,
  getCustomer,
  getCustomerSupport,
  listCustomers,
  listEvaluations,
  listPocs,
  patchEvaluation,
  patchEvaluationKpi,
  patchPoc,
  patchPocMilestone,
} from './api';
import type { Evaluation, Poc } from './types';

const POLL_MS = 30_000;

export function useCustomers() {
  return useQuery({ queryKey: ['customers', 'board'], queryFn: listCustomers, refetchInterval: POLL_MS });
}

export function useCustomer(clientId: string) {
  return useQuery({ queryKey: ['customers', 'detail', clientId], queryFn: () => getCustomer(clientId) });
}

export function useCustomerSupport(clientId: string) {
  return useQuery({
    queryKey: ['customers', 'support', clientId],
    queryFn: () => getCustomerSupport(clientId),
    refetchInterval: POLL_MS,
  });
}

export function useEvaluations() {
  return useQuery({ queryKey: ['deals', 'evaluations'], queryFn: listEvaluations, refetchInterval: POLL_MS });
}

export function usePocs() {
  return useQuery({ queryKey: ['deals', 'pocs'], queryFn: listPocs, refetchInterval: POLL_MS });
}

/** Every deal mutation returns the full object — patch it into the list cache. */
function replaceIn<T extends { id: string }>(rows: T[] | undefined, updated: T): T[] {
  return (rows ?? []).map((row) => (row.id === updated.id ? updated : row));
}

export function useEvaluationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars:
      | { kind: 'status'; id: string; status: Evaluation['status'] }
      | { kind: 'kpi'; id: string; kpiId: string; result: string }) =>
      vars.kind === 'status'
        ? patchEvaluation(vars.id, { status: vars.status })
        : patchEvaluationKpi(vars.id, vars.kpiId, { result: vars.result }),
    onSuccess: (updated) => {
      queryClient.setQueryData<{ results: Evaluation[]; count: number }>(
        ['deals', 'evaluations'],
        (old) => (old ? { ...old, results: replaceIn(old.results, updated) } : old),
      );
    },
  });
}

export function usePocMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars:
      | { kind: 'status'; id: string; status: Poc['status'] }
      | { kind: 'milestone'; id: string; milestoneId: string; status: Poc['milestones'][number]['status'] }
      | { kind: 'risk'; id: string; description: string; severity: 'low' | 'medium' | 'high'; mitigation?: string }) => {
      if (vars.kind === 'status') return patchPoc(vars.id, { status: vars.status });
      if (vars.kind === 'milestone')
        return patchPocMilestone(vars.id, vars.milestoneId, { status: vars.status });
      return addPocRisk(vars.id, {
        description: vars.description,
        severity: vars.severity,
        mitigation: vars.mitigation,
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<{ results: Poc[]; count: number }>(
        ['deals', 'pocs'],
        (old) => (old ? { ...old, results: replaceIn(old.results, updated) } : old),
      );
    },
  });
}
