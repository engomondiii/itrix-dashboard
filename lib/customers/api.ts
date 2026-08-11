'use client';

import { http } from '@/lib/api/client';
import type { SummaryEnvelope, SupportRow, SupportSummary, ResultsEnvelope } from '@/lib/today/types';
import type {
  CustomerDetail,
  CustomerRow,
  Evaluation,
  EvaluationStatus,
  HealthClass,
  MilestoneStatus,
  Poc,
  PocStatus,
} from './types';

const V1 = '/api/v1';

interface CustomerBoard extends ResultsEnvelope<CustomerRow> {
  healthClasses: HealthClass[];
}

/**
 * Sorted worst-first server-side. limit max 500, no offset pagination —
 * accounts beyond the worst 500 are unreachable until the backend grows
 * paging (flagged for the backend lane).
 */
export function listCustomers(): Promise<CustomerBoard> {
  return http.get<CustomerBoard>(`${V1}/cockpit/customers/?limit=500`);
}

export function getCustomer(clientId: string): Promise<CustomerDetail> {
  return http.get<CustomerDetail>(`${V1}/cockpit/customers/${clientId}/`);
}

export function getCustomerSupport(
  clientId: string,
): Promise<SummaryEnvelope<SupportRow, SupportSummary>> {
  return http.get<SummaryEnvelope<SupportRow, SupportSummary>>(
    `${V1}/cockpit/support/queue/?clientId=${clientId}&includeResolved=true`,
  );
}

// -- Deals: evaluations ({results,count}, unpaginated, no filters) -----------

export function listEvaluations(): Promise<ResultsEnvelope<Evaluation>> {
  return http.get<ResultsEnvelope<Evaluation>>(`${V1}/evaluations/`);
}

export function patchEvaluation(
  id: string,
  patch: Partial<Pick<Evaluation, 'status' | 'scope' | 'fee' | 'timeline'>> & {
    status?: EvaluationStatus;
  },
): Promise<Evaluation> {
  return http.patch<Evaluation>(`${V1}/evaluations/${id}/`, patch);
}

/** Only category/metric/target/result are accepted; returns the WHOLE evaluation. */
export function patchEvaluationKpi(
  id: string,
  kpiId: string,
  patch: { target?: string; result?: string },
): Promise<Evaluation> {
  return http.patch<Evaluation>(`${V1}/evaluations/${id}/kpis/${kpiId}/`, patch);
}

// -- Deals: PoCs -------------------------------------------------------------

export function listPocs(): Promise<ResultsEnvelope<Poc>> {
  return http.get<ResultsEnvelope<Poc>>(`${V1}/pocs/`);
}

export function patchPoc(id: string, patch: { status?: PocStatus }): Promise<Poc> {
  return http.patch<Poc>(`${V1}/pocs/${id}/`, patch);
}

/** Returns the full PoC. */
export function patchPocMilestone(
  id: string,
  milestoneId: string,
  patch: { status?: MilestoneStatus; label?: string; dueAt?: string },
): Promise<Poc> {
  return http.patch<Poc>(`${V1}/pocs/${id}/milestones/${milestoneId}/`, patch);
}

export function addPocRisk(
  id: string,
  risk: { description: string; severity: 'low' | 'medium' | 'high'; mitigation?: string },
): Promise<Poc> {
  return http.post<Poc>(`${V1}/pocs/${id}/risks/`, risk);
}
