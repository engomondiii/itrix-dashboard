'use client';

/**
 * API calls for the Today queue — paths and payloads exactly as the Django
 * backend mounts them (see lib/today/types.ts for sources). The traps the
 * legacy dashboard client got wrong, corrected here:
 *
 *   - approval queue returns a BARE ARRAY (no envelope)
 *   - follow-up filters are PATH SEGMENTS (/overdue/, /today/), and actions
 *     are POST sub-paths, not PATCH bodies
 *   - support queue is mounted at cockpit/support/queue/ and is READ-ONLY
 *   - attachments list is cockpit/attachments/ (no /queue suffix); action
 *     responses are small acks, so callers must refetch
 *   - leads have no assign-to-me: POST your own email to /assign/
 */

import { http } from '@/lib/api/client';
import type {
  ApprovalAction,
  ApprovalRow,
  AttachmentRow,
  AttachmentSummary,
  FollowUpRow,
  LeadRow,
  NdaRow,
  NdaStatus,
  PaginatedEnvelope,
  ResultsEnvelope,
  SummaryEnvelope,
  SupportRow,
  SupportSummary,
  ThreadRow,
} from './types';

const V1 = '/api/v1';

// -- Approvals ---------------------------------------------------------------

export function listApprovalQueue(): Promise<ApprovalRow[]> {
  return http.get<ApprovalRow[]>(`${V1}/agents/approval-queue/`);
}

/** ADMIN|ASSESSMENT only (403 otherwise). 409 when the same user OKs twice on L4/L5. */
export function actOnApproval(
  id: string,
  action: ApprovalAction,
  payload: { body?: string; reason?: string } = {},
): Promise<ApprovalRow> {
  return http.post<ApprovalRow>(`${V1}/agents/approval/${id}/${action}/`, payload);
}

// -- Follow-up ---------------------------------------------------------------

export type FollowUpScope = 'open' | 'overdue' | 'today';

export function listFollowUp(scope: FollowUpScope): Promise<ResultsEnvelope<FollowUpRow>> {
  const path = scope === 'open' ? '' : `${scope}/`;
  return http.get<ResultsEnvelope<FollowUpRow>>(`${V1}/follow-up/${path}`);
}

export function completeFollowUp(id: string): Promise<FollowUpRow> {
  return http.post<FollowUpRow>(`${V1}/follow-up/${id}/complete/`, {});
}

/** Sets snoozedUntil (dueAt is unchanged). 1–720 hours; server default 24. */
export function snoozeFollowUp(id: string, hours = 24): Promise<FollowUpRow> {
  return http.post<FollowUpRow>(`${V1}/follow-up/${id}/snooze/`, { hours });
}

export function dismissFollowUp(id: string): Promise<FollowUpRow> {
  return http.post<FollowUpRow>(`${V1}/follow-up/${id}/dismiss/`, {});
}

export function rescheduleFollowUp(id: string, dueAt: string): Promise<FollowUpRow> {
  return http.post<FollowUpRow>(`${V1}/follow-up/${id}/reschedule/`, { dueAt });
}

// -- Threads -----------------------------------------------------------------

/**
 * Only `limit` is honoured server-side (max 500, NO offset pagination — the
 * board simply cannot reach older threads than the newest 500; flagged for
 * the backend lane). Ask for the max; render incrementally.
 */
export function listThreads(limit = 500): Promise<ResultsEnvelope<ThreadRow>> {
  return http.get<ResultsEnvelope<ThreadRow>>(`${V1}/cockpit/threads/?limit=${limit}`);
}

// -- Leads -------------------------------------------------------------------

export function listNewLeads(): Promise<PaginatedEnvelope<LeadRow>> {
  // Display-string status value, deliberately: that IS the wire value.
  return http.get<PaginatedEnvelope<LeadRow>>(
    `${V1}/leads/?status=New&sort=submittedAt&dir=desc&pageSize=50`,
  );
}

/**
 * Assign a lead. `owner` = email | display name | uuid; null unassigns.
 * "Take it" sends the signed-in user's own email.
 */
export function assignLead(id: string, owner: string | null): Promise<unknown> {
  return http.post<unknown>(`${V1}/leads/${id}/assign/`, { owner });
}

// -- NDA ---------------------------------------------------------------------

export function listNda(status: NdaStatus): Promise<PaginatedEnvelope<NdaRow>> {
  // pageSize max is 200 — enough that the Today band's count is honest.
  return http.get<PaginatedEnvelope<NdaRow>>(`${V1}/nda/?status=${status}&pageSize=200`);
}

// -- Support (read-only) -----------------------------------------------------

export function getSupportQueue(): Promise<SummaryEnvelope<SupportRow, SupportSummary>> {
  return http.get<SummaryEnvelope<SupportRow, SupportSummary>>(
    `${V1}/cockpit/support/queue/?limit=500`,
  );
}

// -- Attachments -------------------------------------------------------------

export function listAttachmentQueue(): Promise<
  SummaryEnvelope<AttachmentRow, AttachmentSummary>
> {
  return http.get<SummaryEnvelope<AttachmentRow, AttachmentSummary>>(
    `${V1}/cockpit/attachments/?limit=500`,
  );
}

/** Server enforces reason ≥ 12 chars; response is a small ack — refetch after. */
export function actOnAttachment(
  id: string,
  action: 'release' | 'quarantine',
  reason: string,
): Promise<{ attachmentId: string; status: string }> {
  return http.post<{ attachmentId: string; status: string }>(
    `${V1}/cockpit/attachments/${id}/${action}/`,
    { reason },
  );
}

/** Mirror of the server's MIN_REASON_CHARS — enforce in UI to save a round-trip. */
export const ATTACHMENT_REASON_MIN_CHARS = 12;
