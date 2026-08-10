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
 * Canonical stage order for the board view. The backend has no pipeline
 * endpoint — the board is the list grouped by status, client-side.
 * Core selling flow first; parked/terminal states collapse into one column.
 */
export const BOARD_STAGES: LeadStatus[] = [
  'New',
  'Contacted',
  'Meeting Booked',
  'NDA',
  'Evaluation',
  'PoC',
  'Negotiation',
  'Licensed',
];

export const PARKED_STAGES: LeadStatus[] = ['Qualifying', 'Nurture', 'Closed', 'Lost'];
