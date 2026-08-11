/**
 * Wire types for the Today queue — field names EXACTLY as Django serializes
 * them (all camelCase). Only the fields a work-queue card renders; the full
 * shapes live with each destination screen as it gets built.
 *
 * Sources (itrix-backend):
 *   approvals   apps/governance/serializers.py  (bare array!)
 *   follow-up   apps/follow_up/serializers.py   ({results, count})
 *   threads     apps/cockpit/services/threads.py ({results, count})
 *   leads       apps/leads/serializers.py       (standard pagination)
 *   nda         apps/nda/serializers.py         (standard pagination)
 *   support     apps/cockpit/services/support_queue.py ({results, count, summary})
 *   attachments apps/cockpit/services/attachment_review.py ({results, count, summary})
 */

// -- Approvals ---------------------------------------------------------------

/** pending → first OK outstanding; awaiting_second → a DISTINCT second OK outstanding. */
export type ApprovalStatus = 'pending' | 'approved' | 'edited' | 'rejected' | 'awaiting_second';

export interface ApprovalRow {
  id: string;
  leadId: string | null;
  conversationId: string | null;
  agentKey: string;
  /** 1 conversational … 5 legal/binding. Staff label: "Risk level". */
  claimLevel: 1 | 2 | 3 | 4 | 5;
  draftBody: string;
  finalBody: string;
  status: ApprovalStatus;
  reason: string;
  /** claimLevel ∈ {4,5} — true from creation; NOT "one is still outstanding". */
  requiresSecondApprover: boolean;
  firstApprover: string | null;
  at: string;
}

export type ApprovalAction = 'approve' | 'edit' | 'reject';

// -- Follow-up ---------------------------------------------------------------

export type FollowUpStatus = 'pending' | 'completed' | 'snoozed' | 'dismissed';

export interface FollowUpRow {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  tier: number;
  owner: string | null;
  createdAt: string;
  dueAt: string;
  status: FollowUpStatus;
  snoozedUntil: string | null;
  note: string;
}

// -- Threads (conversation oversight) ---------------------------------------

export interface ThreadRow {
  threadId: string;
  title: string;
  anonymous: boolean;
  leadId: string | null;
  company: string;
  journeyState: string;
  turnCount: number;
  visitorTurns: number;
  /** Backend definition: visitorTurns > 0 (the visitor has engaged). */
  working: boolean;
  lastActivityAt: string | null;
  createdAt: string;
  ownerKind: string;
}

// -- Leads -------------------------------------------------------------------

/** Display strings with spaces/caps — the backend's actual values. */
export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Meeting Booked'
  | 'NDA'
  | 'Evaluation'
  | 'PoC'
  | 'Licensed'
  | 'Closed'
  | 'Qualifying'
  | 'Nurture'
  | 'Negotiation'
  | 'Lost';

export interface LeadRow {
  id: string;
  visitorName: string;
  company: string;
  industry: string;
  role: string;
  productRoute: string;
  primaryPain: string;
  score: number;
  /** 1 = highest priority. Staff label: "Priority". */
  tier: number;
  status: LeadStatus;
  owner: string | null;
  submittedAt: string;
  journeyState: string;
}

// -- NDA ---------------------------------------------------------------------

/** No "drafted" — the pre-send state is `required`. */
export type NdaStatus = 'required' | 'sent' | 'signed' | 'declined' | 'expired';

export interface NdaRow {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  status: NdaStatus;
  docType: 'mutual' | 'one-way';
  signerName: string;
  signerEmail: string;
  requestedAt: string;
  sentAt: string | null;
  signedAt: string | null;
  declineReason: string;
}

// -- Support (READ-ONLY on the backend) --------------------------------------

export type SupportStatus = 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved';
export type SupportUrgency = 'low' | 'normal' | 'high' | 'critical';

export interface SupportRow {
  requestId: string;
  clientId: string;
  company: string;
  subject: string;
  status: SupportStatus;
  urgency: SupportUrgency;
  blocking: boolean;
  owner: string;
  slaDueAt: string | null;
  /** Negative = not yet due. */
  overdueSeconds: number | null;
  slaBreaching: boolean;
  threadId: string | null;
  createdAt: string;
}

export interface SupportSummary {
  open: number;
  blockingOpen: number;
  breaching: number;
  unowned: number;
  resolvedButNotConfirmed: number;
}

// -- Attachments -------------------------------------------------------------

export type AttachmentStatus =
  | 'staged'
  | 'scanning'
  | 'scanned'
  | 'extracting'
  | 'ready'
  | 'quarantined'
  | 'failed'
  | 'purged';

export interface AttachmentRow {
  attachmentId: string;
  threadId: string | null;
  filename: string;
  declaredMime: string;
  detectedMime: string;
  bytes: number;
  status: AttachmentStatus;
  riskFlags: string[];
  preNda: boolean;
  scanVerdict: string;
  scanDetail: string;
  visitorNote: string;
  createdAt: string;
  needsReview: boolean;
}

export interface AttachmentSummary {
  quarantined: number;
  failed: number;
  preNdaAwaitingReview: number;
}

// -- Envelopes ---------------------------------------------------------------

export interface ResultsEnvelope<T> {
  results: T[];
  count: number;
}

export interface PaginatedEnvelope<T> extends ResultsEnvelope<T> {
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SummaryEnvelope<T, S> extends ResultsEnvelope<T> {
  summary: S;
}
