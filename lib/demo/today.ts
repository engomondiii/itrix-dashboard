/**
 * Demo-mode handlers for every Today-queue endpoint — same contract-fidelity
 * rules as `handlers.ts`, mirroring itrix-backend exactly:
 *
 *   approval queue    → BARE ARRAY; actions POST /agents/approval/{id}/{action}/
 *   follow-up         → {results, count}; scopes are PATH segments; actions POST sub-paths
 *   threads           → {results, count}; only ?limit honoured
 *   leads             → standard pagination; assign takes {owner}
 *   nda               → standard pagination; ?status= exact
 *   support queue     → {results, count, summary}; READ-ONLY (no action routes AT ALL)
 *   attachments       → {results, count, summary}; release/quarantine need reason ≥12 chars
 */

import { delay, http, HttpResponse } from 'msw';

import type {
  ApprovalRow,
  AttachmentRow,
  FollowUpRow,
  LeadRow,
  NdaRow,
  SupportRow,
  ThreadRow,
} from '@/lib/today/types';

const LATENCY = 200;

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}
function hoursAhead(h: number): string {
  return new Date(Date.now() + h * 3_600_000).toISOString();
}

// ---------------------------------------------------------------------------
// Seeds (per-tab persistence, one store per domain)
// ---------------------------------------------------------------------------

function seedApprovals(): ApprovalRow[] {
  return [
    {
      id: 'ap-01', leadId: 'ld-02', conversationId: 'cv-11', agentKey: 'pitch',
      claimLevel: 3,
      draftBody:
        'In our internal benchmark the current pipeline processed a full survey batch in under 40 minutes — I can share the methodology note if useful.',
      finalBody: '', status: 'pending', reason: '', requiresSecondApprover: false,
      firstApprover: null, at: hoursAgo(1),
    },
    {
      id: 'ap-02', leadId: 'ld-01', conversationId: 'cv-07', agentKey: 'pitch',
      claimLevel: 5,
      draftBody:
        'Our patent coverage extends to the correction workflow itself, so a license would include exclusivity for your market segment.',
      finalBody: '', status: 'awaiting_second', reason: '', requiresSecondApprover: true,
      firstApprover: 'Demo User', at: hoursAgo(3),
    },
  ];
}

function seedFollowUps(): FollowUpRow[] {
  return [
    {
      id: 'fu-01', leadId: 'ld-03', leadName: 'H. Cho', company: 'Daehan Survey Co.',
      tier: 1, owner: 'Demo User', createdAt: hoursAgo(50), dueAt: hoursAgo(26),
      status: 'pending', snoozedUntil: null, note: 'Send the evaluation scope doc',
    },
    {
      id: 'fu-02', leadId: 'ld-04', leadName: 'M. Ortiz', company: 'GeoField Ltda.',
      tier: 3, owner: null, createdAt: hoursAgo(30), dueAt: hoursAgo(4),
      status: 'pending', snoozedUntil: null, note: 'Reply to pricing question',
    },
    {
      id: 'fu-03', leadId: 'ld-02', leadName: 'K. Tanaka', company: 'Shinkai Instruments',
      tier: 2, owner: 'Demo User', createdAt: hoursAgo(20), dueAt: hoursAhead(5),
      status: 'pending', snoozedUntil: null, note: 'Confirm meeting agenda',
    },
  ];
}

function seedThreads(): ThreadRow[] {
  return [
    {
      threadId: 'th-01', title: 'Survey correction throughput', anonymous: false,
      leadId: 'ld-02', company: 'Shinkai Instruments', journeyState: 'ENGAGED',
      turnCount: 14, visitorTurns: 6, working: true,
      lastActivityAt: hoursAgo(0.5), createdAt: hoursAgo(6), ownerKind: 'lead',
    },
    {
      threadId: 'th-02', title: 'Pricing for a 3-team rollout', anonymous: true,
      leadId: null, company: '', journeyState: 'ARRIVED',
      turnCount: 5, visitorTurns: 3, working: true,
      lastActivityAt: hoursAgo(2), createdAt: hoursAgo(3), ownerKind: 'session',
    },
    {
      threadId: 'th-03', title: 'Old exploratory chat', anonymous: true,
      leadId: null, company: '', journeyState: 'ARRIVED',
      turnCount: 4, visitorTurns: 2, working: true,
      lastActivityAt: hoursAgo(70), createdAt: hoursAgo(72), ownerKind: 'session',
    },
  ];
}

function seedLeads(): LeadRow[] {
  return [
    {
      id: 'ld-05', visitorName: 'S. Park', company: 'Hanul Engineering', role: 'CTO',
      productRoute: 'survey-automation', primaryPain: 'Manual correction backlog',
      score: 86, tier: 1, status: 'New', owner: null,
      submittedAt: hoursAgo(2), journeyState: 'ARRIVED',
    },
    {
      id: 'ld-06', visitorName: 'A. Weber', company: 'FeldMesser GmbH', role: 'Ops lead',
      productRoute: 'survey-automation', primaryPain: 'Field-to-office turnaround',
      score: 61, tier: 2, status: 'New', owner: null,
      submittedAt: hoursAgo(8), journeyState: 'ARRIVED',
    },
    {
      id: 'ld-07', visitorName: 'J. Doe', company: '', role: '',
      productRoute: '', primaryPain: '', score: 22, tier: 4, status: 'New',
      owner: 'Demo User', submittedAt: hoursAgo(12), journeyState: 'ARRIVED',
    },
    // The rest of the funnel, so the board view has columns to show.
    {
      id: 'ld-01', visitorName: 'B. Novak', company: 'Adria Geodesy', role: 'Managing partner',
      productRoute: 'survey-automation', primaryPain: 'Season peak overload',
      score: 74, tier: 2, status: 'Contacted', owner: 'Demo User',
      submittedAt: hoursAgo(96), journeyState: 'ENGAGED',
    },
    {
      id: 'ld-02', visitorName: 'K. Tanaka', company: 'Shinkai Instruments', role: 'BD director',
      productRoute: 'survey-automation', primaryPain: 'Manual QA cost',
      score: 81, tier: 1, status: 'NDA', owner: 'Demo User',
      submittedAt: hoursAgo(120), journeyState: 'QUALIFIED',
    },
    {
      id: 'ld-03', visitorName: 'H. Cho', company: 'Daehan Survey Co.', role: 'COO',
      productRoute: 'survey-automation', primaryPain: 'Correction turnaround SLA',
      score: 90, tier: 1, status: 'Evaluation', owner: 'Demo User',
      submittedAt: hoursAgo(200), journeyState: 'EVALUATING',
    },
    {
      id: 'ld-04', visitorName: 'M. Ortiz', company: 'GeoField Ltda.', role: 'Head of ops',
      productRoute: 'survey-automation', primaryPain: 'Pricing clarity',
      score: 55, tier: 3, status: 'Meeting Booked', owner: null,
      submittedAt: hoursAgo(60), journeyState: 'ENGAGED',
    },
    {
      id: 'ld-08', visitorName: 'R. Silva', company: 'TopoBras', role: 'CEO',
      productRoute: 'survey-automation', primaryPain: 'Rework rate',
      score: 78, tier: 2, status: 'PoC', owner: 'Demo User',
      submittedAt: hoursAgo(400), journeyState: 'POC',
    },
    {
      id: 'ld-09', visitorName: 'E. Laine', company: 'Pohjola Kartta', role: 'CTO',
      productRoute: 'survey-automation', primaryPain: '',
      score: 88, tier: 1, status: 'Licensed', owner: 'Demo User',
      submittedAt: hoursAgo(900), journeyState: 'LICENSED',
    },
    {
      id: 'ld-10', visitorName: 'T. Okafor', company: 'Delta Mapping', role: 'Surveyor',
      productRoute: '', primaryPain: 'Budget next quarter',
      score: 40, tier: 3, status: 'Nurture', owner: null,
      submittedAt: hoursAgo(500), journeyState: 'ENGAGED',
    },
  ];
}

function seedNdas(): NdaRow[] {
  return [
    {
      id: 'nd-01', leadId: 'ld-02', leadName: 'K. Tanaka', company: 'Shinkai Instruments',
      status: 'required', docType: 'mutual', signerName: '', signerEmail: '',
      requestedAt: hoursAgo(28), sentAt: null, signedAt: null, declineReason: '',
    },
    {
      id: 'nd-02', leadId: 'ld-03', leadName: 'H. Cho', company: 'Daehan Survey Co.',
      status: 'sent', docType: 'one-way', signerName: 'H. Cho',
      signerEmail: 'h.cho@daehan.example', requestedAt: hoursAgo(80),
      sentAt: hoursAgo(52), signedAt: null, declineReason: '',
    },
  ];
}

function seedSupport(): SupportRow[] {
  return [
    {
      requestId: 'sp-01', clientId: 'cl-01', company: 'Daehan Survey Co.',
      subject: 'Export job stuck at 90%', status: 'open', urgency: 'critical',
      blocking: true, owner: '', slaDueAt: hoursAgo(1), overdueSeconds: 3600,
      slaBreaching: true, threadId: null, createdAt: hoursAgo(7),
    },
    {
      requestId: 'sp-02', clientId: 'cl-02', company: 'GeoField Ltda.',
      subject: 'How to add a second reviewer?', status: 'in_progress', urgency: 'normal',
      blocking: false, owner: 'Demo User', slaDueAt: hoursAhead(20),
      overdueSeconds: -72_000, slaBreaching: false, threadId: null, createdAt: hoursAgo(2),
    },
  ];
}

function seedAttachments(): AttachmentRow[] {
  return [
    {
      attachmentId: 'at-01', threadId: 'th-01', filename: 'site-survey-raw.zip',
      declaredMime: 'application/zip', detectedMime: 'application/zip',
      bytes: 48_211_004, status: 'quarantined', riskFlags: ['macro-container'],
      preNda: true, scanVerdict: 'suspicious', scanDetail: 'Archive contains executable content',
      visitorNote: 'Raw data sample as discussed', createdAt: hoursAgo(26), needsReview: true,
    },
    {
      attachmentId: 'at-02', threadId: 'th-02', filename: 'requirements.docx',
      declaredMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      detectedMime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      bytes: 402_113, status: 'failed', riskFlags: [], preNda: false,
      scanVerdict: '', scanDetail: 'Scanner timeout', visitorNote: '',
      createdAt: hoursAgo(5), needsReview: true,
    },
  ];
}

// ---------------------------------------------------------------------------
// Store plumbing
// ---------------------------------------------------------------------------

function makeStore<T>(key: string, seed: () => T[]) {
  return {
    load(): T[] {
      try {
        const raw = sessionStorage.getItem(key);
        if (raw) return JSON.parse(raw) as T[];
      } catch {
        // fall through to a fresh seed
      }
      const seeded = seed();
      this.save(seeded);
      return seeded;
    },
    save(rows: T[]): void {
      try {
        sessionStorage.setItem(key, JSON.stringify(rows));
      } catch {
        // storage blocked; continue in memory
      }
    },
  };
}

const approvals = makeStore('demo:today:approvals', seedApprovals);
const followUps = makeStore('demo:today:follow-ups', seedFollowUps);
const threads = makeStore('demo:today:threads', seedThreads);
const leads = makeStore('demo:today:leads', seedLeads);
const ndas = makeStore('demo:today:ndas', seedNdas);
const support = makeStore('demo:today:support', seedSupport);
const attachments = makeStore('demo:today:attachments', seedAttachments);

interface DemoNote {
  id: string;
  leadId: string;
  body: string;
  author: string;
  createdAt: string;
}

interface DemoActivity {
  id: string;
  leadId: string;
  type: string;
  label: string;
  at: string;
  by: string | null;
}

const leadNotes = makeStore<DemoNote>('demo:today:lead-notes', () => []);
const leadActivity = makeStore<DemoActivity>('demo:today:lead-activity', () => []);

function logActivity(leadId: string, type: string, label: string): void {
  const rows = leadActivity.load();
  rows.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    leadId,
    type,
    label,
    at: new Date().toISOString(),
    by: 'Demo User',
  });
  leadActivity.save(rows);
}

/** Build the full LeadDetailSerializer shape from a list row + side stores. */
function leadDetail(row: LeadRow) {
  return {
    ...row,
    email: row.company ? `contact@${row.company.toLowerCase().replace(/[^a-z]+/g, '')}.example` : '',
    commercialPath: 'Non-Exclusive',
    specialRights: 'None',
    timeline: 'This quarter',
    computeBottleneck: '',
    workloadType: 'survey-correction',
    currentStack: ['QGIS', 'in-house scripts'],
    commercialIntent: '',
    scoreBreakdown: {},
    recommendedNextStep: '',
    humanHandoffTrigger: false,
    ctaClicked: false,
    documentsViewed: 2,
    clientId: null,
    valueDelivered: false,
    qualification: {},
    notes: leadNotes
      .load()
      .filter((n) => n.leadId === row.id)
      .map((n) => ({ id: n.id, body: n.body, author: n.author, createdAt: n.createdAt })),
    activity: [
      ...leadActivity
        .load()
        .filter((a) => a.leadId === row.id)
        .map((a) => ({ id: a.id, type: a.type, label: a.label, at: a.at, by: a.by })),
      { id: `act-sub-${row.id}`, type: 'submission', label: 'Lead submitted', at: row.submittedAt, by: null },
    ],
    meetings: [],
  };
}

function errorEnvelope(status: number, code: string, detail: string) {
  return HttpResponse.json({ error: { detail, code } }, { status });
}

function requireAuth(request: Request): Response | null {
  const header = request.headers.get('authorization') ?? '';
  if (!header.startsWith('Bearer demo-access-')) {
    return errorEnvelope(401, 'not_authenticated', 'Authentication credentials were not provided.');
  }
  return null;
}

function effectiveDue(task: FollowUpRow): string {
  return task.snoozedUntil ?? task.dueAt;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

const V1 = '*/api/v1';

export const todayHandlers = [
  // --- Approvals (bare array; governance-admin actions) ---------------------
  http.get(`${V1}/agents/approval-queue/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const rows = approvals
      .load()
      .filter((r) => r.status === 'pending' || r.status === 'awaiting_second')
      .sort((a, b) => b.at.localeCompare(a.at));
    return HttpResponse.json(rows);
  }),

  http.post(`${V1}/agents/approval/:id/:action/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const { id, action } = params as { id: string; action: string };
    const rows = approvals.load();
    const row = rows.find((r) => r.id === id);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    const body = (await request.json().catch(() => ({}))) as { body?: string; reason?: string };

    if (action === 'approve') {
      if (row.requiresSecondApprover && row.status === 'pending') {
        row.status = 'awaiting_second';
        row.firstApprover = 'Demo User';
      } else if (row.status === 'awaiting_second' && row.firstApprover === 'Demo User') {
        // Same-approver guard, mirrored from the backend's 409.
        return errorEnvelope(409, 'conflict', 'A second, distinct approver is required for L4/L5.');
      } else {
        row.status = 'approved';
      }
    } else if (action === 'edit') {
      if (!body.body) return errorEnvelope(400, 'invalid', 'body is required to edit.');
      row.finalBody = body.body;
      row.status = 'edited';
    } else if (action === 'reject') {
      row.status = 'rejected';
      row.reason = body.reason ?? '';
    } else {
      return errorEnvelope(400, 'invalid', 'Unknown action.');
    }
    approvals.save(rows);
    return HttpResponse.json(row);
  }),

  // --- Follow-up (path-segment scopes; POST action sub-paths) ---------------
  http.get(`${V1}/follow-up/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const results = followUps
      .load()
      .filter((t) => t.status === 'pending' || t.status === 'snoozed')
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    return HttpResponse.json({ results, count: results.length });
  }),

  http.get(`${V1}/follow-up/overdue/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const now = new Date().toISOString();
    const results = followUps
      .load()
      .filter((t) => t.status === 'pending' && effectiveDue(t) < now)
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    return HttpResponse.json({ results, count: results.length });
  }),

  http.get(`${V1}/follow-up/today/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const results = followUps
      .load()
      .filter(
        (t) =>
          (t.status === 'pending' || t.status === 'snoozed') &&
          t.dueAt >= now.toISOString() &&
          t.dueAt <= endOfDay.toISOString(),
      )
      .sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    return HttpResponse.json({ results, count: results.length });
  }),

  http.post(`${V1}/follow-up/:id/:action/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const { id, action } = params as { id: string; action: string };
    const rows = followUps.load();
    const row = rows.find((t) => t.id === id);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    const body = (await request.json().catch(() => ({}))) as { hours?: number; dueAt?: string };

    if (action === 'complete') row.status = 'completed';
    else if (action === 'dismiss') row.status = 'dismissed';
    else if (action === 'snooze') {
      const hours = Math.min(720, Math.max(1, body.hours ?? 24));
      row.status = 'snoozed';
      row.snoozedUntil = new Date(Date.now() + hours * 3_600_000).toISOString();
    } else if (action === 'reschedule') {
      if (!body.dueAt) return errorEnvelope(400, 'invalid', 'dueAt is required.');
      row.dueAt = body.dueAt;
      row.snoozedUntil = null;
      row.status = 'pending';
    } else {
      return errorEnvelope(400, 'invalid', 'Unknown action.');
    }
    followUps.save(rows);
    return HttpResponse.json(row);
  }),

  // --- Threads --------------------------------------------------------------
  http.get(`${V1}/cockpit/threads/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const limit = Math.min(500, Number(new URL(request.url).searchParams.get('limit')) || 200);
    const results = threads
      .load()
      .sort((a, b) => (b.lastActivityAt ?? '').localeCompare(a.lastActivityAt ?? ''))
      .slice(0, limit);
    return HttpResponse.json({ results, count: results.length });
  }),

  // --- Leads ----------------------------------------------------------------
  http.get(`${V1}/leads/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const params = new URL(request.url).searchParams;
    let rows = leads.load();
    const status = params.get('status');
    if (status) rows = rows.filter((l) => l.status.toLowerCase() === status.toLowerCase());
    rows = [...rows].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    return HttpResponse.json({
      results: rows,
      count: rows.length,
      page: 1,
      pageSize: Math.max(rows.length, 25),
      totalPages: 1,
    });
  }),

  // Detail = list row + detail extras + embedded notes/activity/meetings.
  // Every lead action returns this full shape, like the real backend.
  http.get(`${V1}/leads/:id/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const row = leads.load().find((l) => l.id === params.id);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    return HttpResponse.json(leadDetail(row));
  }),

  http.post(`${V1}/leads/:id/assign/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const rows = leads.load();
    const row = rows.find((l) => l.id === params.id);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    const body = (await request.json().catch(() => ({}))) as { owner?: string | null };
    row.owner = body.owner ? 'Demo User' : null;
    leads.save(rows);
    logActivity(row.id, 'owner_change', body.owner ? 'Assigned to Demo User' : 'Unassigned');
    return HttpResponse.json(leadDetail(row));
  }),

  http.post(`${V1}/leads/:id/note/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const row = leads.load().find((l) => l.id === params.id);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    const body = (await request.json().catch(() => ({}))) as { body?: string };
    if (!body.body) return errorEnvelope(400, 'invalid', 'body is required.');
    const notes = leadNotes.load();
    notes.unshift({
      id: `note-${Date.now()}`,
      leadId: row.id,
      body: body.body,
      author: 'Demo User',
      createdAt: new Date().toISOString(),
    });
    leadNotes.save(notes);
    logActivity(row.id, 'note', 'Note added');
    return HttpResponse.json(leadDetail(row));
  }),

  http.post(`${V1}/leads/:id/status/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const rows = leads.load();
    const row = rows.find((l) => l.id === params.id);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    const body = (await request.json().catch(() => ({}))) as { status?: string };
    const valid = [
      'New', 'Contacted', 'Meeting Booked', 'NDA', 'Evaluation', 'PoC',
      'Licensed', 'Closed', 'Qualifying', 'Nurture', 'Negotiation', 'Lost',
    ];
    if (!body.status || !valid.includes(body.status)) {
      return errorEnvelope(400, 'itrix_error', `Unknown status: ${body.status}`);
    }
    row.status = body.status as LeadRow['status'];
    leads.save(rows);
    logActivity(row.id, 'status_change', `Status → ${body.status}`);
    return HttpResponse.json(leadDetail(row));
  }),

  http.post(`${V1}/leads/:id/nda/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const rows = leads.load();
    const row = rows.find((l) => l.id === params.id);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    row.status = 'NDA';
    leads.save(rows);
    const all = ndas.load();
    if (!all.some((n) => n.leadId === row.id)) {
      all.push({
        id: `nd-${Date.now()}`,
        leadId: row.id,
        leadName: row.visitorName,
        company: row.company,
        status: 'required',
        docType: 'mutual',
        signerName: '',
        signerEmail: '',
        requestedAt: new Date().toISOString(),
        sentAt: null,
        signedAt: null,
        declineReason: '',
      });
      ndas.save(all);
    }
    logActivity(row.id, 'nda', 'NDA requested');
    return HttpResponse.json(leadDetail(row));
  }),

  // --- Pipeline board (all 8 visible stages, always, in order) --------------
  http.get(`${V1}/pipeline/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const BOARD = [
      'New', 'Contacted', 'Meeting Booked', 'NDA', 'Evaluation', 'PoC', 'Licensed', 'Closed',
    ];
    const rows = leads.load();
    return HttpResponse.json({
      stages: BOARD.map((status) => {
        const cards = rows
          .filter((l) => l.status === status)
          .map((l) => ({ ...l, overdue: l.tier <= 2 && status === 'New' }));
        return { status, count: cards.length, leads: cards };
      }),
    });
  }),

  // --- NDA record per lead (404 = none yet, exactly like the backend) -------
  http.get(`${V1}/nda/:leadId/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const record = ndas.load().find((n) => n.leadId === params.leadId);
    if (!record) return errorEnvelope(404, 'not_found', 'No NDARecord matches the given query.');
    return HttpResponse.json({ ...record, body: '', checklist: [] });
  }),

  http.post(`${V1}/nda/:leadId/:action/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const all = ndas.load();
    const record = all.find((n) => n.leadId === params.leadId);
    if (!record) return errorEnvelope(404, 'not_found', 'No NDARecord matches the given query.');
    const body = (await request.json().catch(() => ({}))) as Record<string, string>;
    const action = params.action as string;

    if (action === 'prepare') {
      if (body.docType === 'mutual' || body.docType === 'one-way') record.docType = body.docType;
      if (body.signerName) record.signerName = body.signerName;
      if (body.signerEmail) record.signerEmail = body.signerEmail;
    } else if (action === 'send') {
      if (!body.signerEmail) return errorEnvelope(400, 'invalid', 'signerEmail is required.');
      record.signerEmail = body.signerEmail;
      if (body.signerName) record.signerName = body.signerName;
      record.status = 'sent';
      record.sentAt = new Date().toISOString();
    } else if (action === 'sign') {
      record.status = 'signed';
      record.signedAt = new Date().toISOString();
    } else if (action === 'decline') {
      if (!body.reason) return errorEnvelope(400, 'invalid', 'reason is required.');
      record.status = 'declined';
      record.declineReason = body.reason;
    } else if (action === 'expire') {
      record.status = 'expired';
    } else {
      return errorEnvelope(400, 'invalid', 'Unknown action.');
    }
    ndas.save(all);
    return HttpResponse.json({ ...record, body: '', checklist: [] });
  }),

  // --- Deal signals (deterministic, mirrors cockpit formulas) ---------------
  http.get(`${V1}/cockpit/leads/:leadId/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const row = leads.load().find((l) => l.id === params.leadId);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    const clamp = (n: number) => Math.min(100, Math.max(0, n));
    return HttpResponse.json({
      leadId: row.id,
      company: row.company,
      tier: row.tier,
      score: row.score,
      journeyState: row.journeyState,
      productRoute: row.productRoute,
      commercialPath: 'Non-Exclusive',
      valueDelivered: false,
      pitchEngagement: {
        opened: true, slidesViewed: 6, totalDwellSeconds: 480,
        ctaClicks: 1, questionsAsked: 3, reopens: 1, engagementScore: 62,
      },
      pain: row.primaryPain || null,
      gain: 'Faster correction turnaround',
      visitorType: 'Operator',
      buyerPsychology: 'Proof-driven',
      objectionSignals: row.score < 60 ? ['Wants proof before any commitment'] : [],
      readiness: { nda: clamp(row.score - 8), assessment: clamp(row.score), poc: clamp(row.score - 18) },
      licenseOutProbability: clamp(row.score - 5),
      ladderStage: 'Review',
    });
  }),

  http.get(`${V1}/cockpit/leads/:leadId/next-action/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const row = leads.load().find((l) => l.id === params.leadId);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    const isNew = row.status === 'New';
    return HttpResponse.json({
      leadId: row.id,
      state: row.journeyState,
      nextAction: isNew ? 'await_diagnosis' : 'propose_evaluation',
      reason: isNew
        ? 'The lead has not been worked yet — make first contact.'
        : 'Engagement is strong enough to propose a scoped evaluation.',
      primary: {
        key: isNew ? 'contact' : 'propose_evaluation',
        label: isNew ? 'Make first contact' : 'Propose an evaluation',
        detail: '',
        href: '',
      },
      primaryKind: null,
      secondary: [],
      suppressionReason: null,
      suppressionCopy: null,
      suppressedCount: 0,
      signals: {},
    });
  }),

  // --- NDA ------------------------------------------------------------------
  http.get(`${V1}/nda/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const status = new URL(request.url).searchParams.get('status');
    let rows = ndas.load();
    if (status) rows = rows.filter((n) => n.status === status);
    return HttpResponse.json({
      results: rows,
      count: rows.length,
      page: 1,
      pageSize: 25,
      totalPages: 1,
    });
  }),

  // --- Support (read-only; there are deliberately NO action handlers) -------
  http.get(`${V1}/cockpit/support/queue/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const rows = support.load().filter((r) => r.status !== 'resolved');
    // Blocking first → urgency → most overdue, like the server.
    const urgencyRank = { critical: 0, high: 1, normal: 2, low: 3 } as const;
    const results = [...rows].sort(
      (a, b) =>
        Number(b.blocking) - Number(a.blocking) ||
        urgencyRank[a.urgency] - urgencyRank[b.urgency] ||
        (b.overdueSeconds ?? -1) - (a.overdueSeconds ?? -1),
    );
    return HttpResponse.json({
      results,
      count: results.length,
      summary: {
        open: results.length,
        blockingOpen: results.filter((r) => r.blocking).length,
        breaching: results.filter((r) => r.slaBreaching).length,
        unowned: results.filter((r) => !r.owner).length,
        resolvedButNotConfirmed: 0,
      },
    });
  }),

  // --- Attachments ----------------------------------------------------------
  http.get(`${V1}/cockpit/attachments/`, async ({ request }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const results = attachments
      .load()
      .filter((a) => a.status === 'quarantined' || a.status === 'failed')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt)); // oldest first
    return HttpResponse.json({
      results,
      count: results.length,
      summary: {
        quarantined: results.filter((a) => a.status === 'quarantined').length,
        failed: results.filter((a) => a.status === 'failed').length,
        preNdaAwaitingReview: results.filter((a) => a.preNda).length,
      },
    });
  }),

  http.post(`${V1}/cockpit/attachments/:id/:action/`, async ({ request, params }) => {
    await delay(LATENCY);
    const denied = requireAuth(request);
    if (denied) return denied;
    const { id, action } = params as { id: string; action: string };
    const rows = attachments.load();
    const row = rows.find((a) => a.attachmentId === id);
    if (!row) return errorEnvelope(404, 'not_found', 'Not found.');
    const body = (await request.json().catch(() => ({}))) as { reason?: string };

    // MIN_REASON_CHARS = 12, enforced server-side.
    if (!body.reason || body.reason.trim().length < 12) {
      return errorEnvelope(400, 'invalid', 'A reason of at least 12 characters is required.');
    }
    if (action === 'release') {
      if (row.status !== 'quarantined') {
        return errorEnvelope(400, 'invalid', 'Only quarantined files can be released.');
      }
      row.status = 'scanned';
      row.needsReview = false;
      attachments.save(rows);
      return HttpResponse.json({ attachmentId: id, status: 'scanned', released: true });
    }
    if (action === 'quarantine') {
      row.status = 'quarantined';
      row.needsReview = true;
      attachments.save(rows);
      return HttpResponse.json({ attachmentId: id, status: 'quarantined', quarantined: true });
    }
    return errorEnvelope(400, 'invalid', 'Unknown action.');
  }),
];
