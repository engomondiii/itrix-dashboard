'use client';

/**
 * Leads list API — GET /api/v1/leads/ with LeadFilter params.
 * Server accepts: status (iexact, DISPLAY string), tier (number),
 * owner, search, sort=submittedAt|score|tier|status, dir=asc|desc,
 * page/pageSize (standard pagination, max 200).
 *
 * Row type lives in lib/today/types.ts (LeadRow) — one wire truth.
 */

import { http } from '@/lib/api/client';
import type { LeadRow, LeadStatus, PaginatedEnvelope } from '@/lib/today/types';
import type {
  DealSignals,
  LeadDetail,
  NdaRecord,
  NextActionSuggestion,
  PipelineBoard,
} from './types';

const V1 = '/api/v1';

export interface LeadListParams {
  status?: LeadStatus | '';
  tier?: number | null;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: 'submittedAt' | 'score' | 'tier' | 'status';
  dir?: 'asc' | 'desc';
}

export function listLeads(params: LeadListParams = {}): Promise<PaginatedEnvelope<LeadRow>> {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.tier) q.set('tier', String(params.tier));
  if (params.search) q.set('search', params.search);
  q.set('page', String(params.page ?? 1));
  q.set('pageSize', String(params.pageSize ?? 50));
  q.set('sort', params.sort ?? 'submittedAt');
  q.set('dir', params.dir ?? 'desc');
  return http.get<PaginatedEnvelope<LeadRow>>(`${V1}/leads/?${q}`);
}

/**
 * The board comes from the real pipeline endpoint: GET /api/v1/pipeline/
 * always returns all 8 visible stages in canonical order with an `overdue`
 * flag per card. Qualifying/Nurture/Negotiation/Lost are excluded from the
 * board by the backend — they remain reachable as list filters.
 */
export function getPipeline(): Promise<PipelineBoard> {
  return http.get<PipelineBoard>(`${V1}/pipeline/`);
}

export const PARKED_STAGES: LeadStatus[] = ['Qualifying', 'Nurture', 'Negotiation', 'Lost'];

// -- Lead detail -------------------------------------------------------------

export function getLead(id: string): Promise<LeadDetail> {
  return http.get<LeadDetail>(`${V1}/leads/${id}/`);
}

/**
 * Lead actions — every one returns the FULL LeadDetail body, so mutations
 * write it straight into the cache instead of refetching.
 * Do NOT use PATCH for status: it bypasses activity logging and SLA stamps.
 */
export function addLeadNote(id: string, body: string): Promise<LeadDetail> {
  return http.post<LeadDetail>(`${V1}/leads/${id}/note/`, { body });
}

export function setLeadStatus(id: string, status: LeadStatus): Promise<LeadDetail> {
  return http.post<LeadDetail>(`${V1}/leads/${id}/status/`, { status });
}

export function bookLeadMeeting(
  id: string,
  meeting: { scheduledAt: string; durationMins?: number; attendee?: string; location?: string; notes?: string },
): Promise<LeadDetail> {
  // Side effect on the backend: status becomes "Meeting Booked".
  return http.post<LeadDetail>(`${V1}/leads/${id}/meeting/`, meeting);
}

/** No body; sets status to "NDA" and best-effort creates the NDARecord. */
export function requestNda(id: string): Promise<LeadDetail> {
  return http.post<LeadDetail>(`${V1}/leads/${id}/nda/`, {});
}

// -- Deal signals ------------------------------------------------------------

export function getDealSignals(leadId: string): Promise<DealSignals> {
  return http.get<DealSignals>(`${V1}/cockpit/leads/${leadId}/`);
}

export function getNextAction(leadId: string): Promise<NextActionSuggestion> {
  return http.get<NextActionSuggestion>(`${V1}/cockpit/leads/${leadId}/next-action/`);
}

// -- NDA record (per lead) ---------------------------------------------------

/** 404 means "no NDA yet" — surfaced as null by the hook, never an error. */
export function getNdaRecord(leadId: string): Promise<NdaRecord> {
  return http.get<NdaRecord>(`${V1}/nda/${leadId}/`);
}

export function prepareNda(
  leadId: string,
  payload: { docType?: 'mutual' | 'one-way'; body?: string; signerName?: string; signerEmail?: string },
): Promise<NdaRecord> {
  return http.post<NdaRecord>(`${V1}/nda/${leadId}/prepare/`, payload);
}

export function sendNda(
  leadId: string,
  payload: { signerEmail: string; signerName?: string },
): Promise<NdaRecord> {
  return http.post<NdaRecord>(`${V1}/nda/${leadId}/send/`, payload);
}

export function signNda(leadId: string): Promise<NdaRecord> {
  return http.post<NdaRecord>(`${V1}/nda/${leadId}/sign/`, {});
}

export function declineNda(leadId: string, reason: string): Promise<NdaRecord> {
  return http.post<NdaRecord>(`${V1}/nda/${leadId}/decline/`, { reason });
}
