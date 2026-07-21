import "server-only";

import {
  journeyNumber,
  type JourneyState,
} from "@/constants/journeyStates";
import {
  LISTENING_DIMENSIONS,
  OPPORTUNISTIC_DIMENSIONS,
  type CoverageStatus,
  type ListeningDimension,
  type StopReason,
} from "@/constants/listeningDimensions";
import { STATE_CEILING, type IdentityState } from "@/constants/shellContract";
import type {
  CoverageEntry,
  CoverageOverview,
  LoopState,
  QuestionHistoryEntry,
  ThreadArtifact,
  ThreadDetail,
  ThreadListItem,
  ThreadTurn,
} from "@/types/thread";
import { worstVerdict, type ScanVerdict } from "@/types/attachment";
import { getJourney } from "@/mocks/journeyDb";
import { MOCK_LEADS } from "@/mocks/leads";

/**
 * Mock thread store — live conversation oversight without a backend.
 *
 * Two populations, deliberately:
 *
 *   1. A thread for every mock LEAD, so the cockpit's "open the live thread"
 *      link always resolves.
 *   2. A handful of ANONYMOUS threads with no lead at all. These matter more
 *      than they look: the whole point of v5.0 thread oversight is that a
 *      conversation exists from the visitor's first sentence, long before a
 *      Lead record does. A board that only showed threads with leads would
 *      reproduce exactly the blind spot this feature exists to remove.
 */

/** Deterministic PRNG (mulberry32) so server and client render identical mocks. */
function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return h;
}

/** A fixed "now" so relative times and SLAs are stable across renders. */
const NOW = Date.parse("2026-07-21T11:00:00Z");

const ANON_TITLES = [
  "Inference cost on the training fleet",
  "HBM traffic during long simulation runs",
  "Runtime path for a new accelerator",
  "Solver reproducibility across releases",
  "Licensing conversation — early stage",
  "Cooling limits in the new hall",
];

/**
 * Coverage for a thread at a given depth.
 *
 * Dimensions close in the order the conversation naturally reaches them, so a
 * shallow thread has the first few covered and the rest unknown. The two
 * opportunistic dimensions are left `unknown` unless the thread is deep —
 * they are surfaced only when the visitor's own language opens the door, so
 * an `unknown` on them is not a gap the loop should be trying to close.
 */
function buildCoverage(threadId: string, depth: number): CoverageEntry[] {
  const rand = rng(Math.abs(hash(threadId)));
  return LISTENING_DIMENSIONS.map((dimension, i): CoverageEntry => {
    let status: CoverageStatus;
    if (OPPORTUNISTIC_DIMENSIONS.has(dimension)) {
      status = depth >= 9 && rand() > 0.5 ? "partial" : "unknown";
    } else if (i < depth - 2) {
      status = "covered";
    } else if (i < depth) {
      status = rand() > 0.45 ? "partial" : "covered";
    } else {
      status = "unknown";
    }
    return {
      dimension,
      status,
      evidenceMessageId: status === "unknown" ? null : `${threadId}-m${i + 1}`,
      updatedAt: new Date(NOW - (10 - i) * 60_000).toISOString(),
    };
  });
}

function summariseCoverage(entries: CoverageEntry[]) {
  return {
    covered: entries.filter((e) => e.status === "covered").length,
    partial: entries.filter((e) => e.status === "partial").length,
    unknown: entries.filter((e) => e.status === "unknown").length,
  };
}

const QUESTION_BUDGET_STAGE_1 = 3;
const QUESTION_BUDGET_STAGE_2 = 4;

function buildLoop(state: JourneyState, coverage: CoverageEntry[], seed: number): LoopState {
  const n = journeyNumber(state) ?? 1;
  const budget = n <= 3 ? QUESTION_BUDGET_STAGE_1 : QUESTION_BUDGET_STAGE_2;
  const rand = rng(seed);

  // The loop is open only while the platform is still listening (state 2).
  if (n === 2) {
    const asked = Math.min(budget - 1, 1 + Math.floor(rand() * budget));
    return { open: true, questionsAsked: asked, budgetRemaining: budget - asked, stopReason: null };
  }
  if (n === 1) {
    return { open: false, questionsAsked: 0, budgetRemaining: budget, stopReason: null };
  }

  const required = coverage.filter((e) => !OPPORTUNISTIC_DIMENSIONS.has(e.dimension));
  const allCovered = required.every((e) => e.status === "covered");
  const asked = allCovered ? Math.max(1, budget - 1) : budget;
  const stopReason: StopReason = allCovered ? "covered" : "budget_exhausted";

  return { open: false, questionsAsked: asked, budgetRemaining: budget - asked, stopReason };
}

const QUESTION_TEXT: Record<ListeningDimension, string> = {
  pain: "Where is the computation hurting most today?",
  desired_gain: "If this were solved, what would it unlock for you?",
  urgency: "Is this a now problem or a next-year problem?",
  role: "How does a decision like this usually get made on your side?",
  company_type: "What kind of work does your team do?",
  workload: "What is the workload, roughly?",
  current_stack: "What does it run on today?",
  commercial_intent: "Are you exploring, or actively looking to act?",
  strategic_ambition: "Is this a capability question or a positioning question for you?",
  confidentiality_sensitivity: "How much of this can we discuss before an NDA is in place?",
};

function buildQuestionHistory(
  threadId: string,
  coverage: CoverageEntry[],
  loop: LoopState,
): QuestionHistoryEntry[] {
  // Questions target the dimensions that were open at the time, in order.
  const targets = coverage
    .filter((e) => !OPPORTUNISTIC_DIMENSIONS.has(e.dimension))
    .slice(0, loop.questionsAsked);

  return targets.map((entry, i) => ({
    id: `${threadId}-q${i + 1}`,
    primaryText: QUESTION_TEXT[entry.dimension],
    chips: [],
    targetDimension: entry.dimension,
    askedAt: new Date(NOW - (targets.length - i) * 4 * 60_000).toISOString(),
    // A question is productive when the dimension it targeted actually moved.
    productive: entry.status !== "unknown",
  }));
}

function identityForState(state: JourneyState): IdentityState {
  const n = journeyNumber(state) ?? 1;
  if (n >= 10) return "authenticated_customer";
  if (n >= 3) return "identified";
  return "anonymous";
}

function buildThreadForLead(leadIndex: number): ThreadListItem {
  const lead = MOCK_LEADS[leadIndex];
  const journey = getJourney(lead.id);
  const state: JourneyState = journey?.state ?? "ARRIVED";
  const n = journeyNumber(state) ?? 1;
  const id = `thr_${lead.id}`;
  const rand = rng(Math.abs(hash(id)));

  const coverage = buildCoverage(id, Math.min(10, n + 3));
  const loop = buildLoop(state, coverage, Math.abs(hash(id)));

  const attachmentCount = Math.floor(rand() * 4);
  const verdicts: ScanVerdict[] = Array.from({ length: attachmentCount }, () =>
    rand() > 0.9 ? "suspicious" : "clean",
  );

  return {
    id,
    title: lead.computeBottleneck.slice(0, 58),
    ownerKind: n >= 6 ? "client" : "session",
    context: n >= 10 ? "customer_success" : n >= 6 ? "portal" : "review",
    identityState: identityForState(state),
    state,
    journeyNumber: journeyNumber(state),
    live: rand() > 0.82,
    coverage: summariseCoverage(coverage),
    loop,
    attachments: { count: attachmentCount, worstScan: worstVerdict(verdicts) },
    blocking: null,
    guardHalted: false,
    humanOwner: lead.owner,
    leadId: lead.id,
    createdAt: lead.submittedAt,
    lastActivityAt: new Date(NOW - Math.floor(rand() * 6 * 3_600_000)).toISOString(),
  };
}

/**
 * Anonymous threads with no Lead behind them — a visitor mid-sentence.
 *
 * One is deliberately blocked on a level-4 approval with the visitor still
 * connected, because that is the case the streaming approval console exists for
 * and it must be visible in mock mode. One has a stream-guard halt, for the
 * same reason.
 */
function buildAnonymousThreads(): ThreadListItem[] {
  return ANON_TITLES.map((title, i) => {
    const id = `thr_anon_${i + 1}`;
    const rand = rng(Math.abs(hash(id)));
    const state: JourneyState = i < 4 ? "IN_REVIEW" : "ARRIVED";
    const coverage = buildCoverage(id, i < 4 ? 4 + i : 1);
    const loop = buildLoop(state, coverage, Math.abs(hash(id)));
    const attachmentCount = i === 1 ? 3 : i === 2 ? 1 : 0;
    const verdicts: ScanVerdict[] =
      i === 1 ? ["clean", "clean", "malicious"] : i === 2 ? ["clean"] : [];

    return {
      id,
      title,
      ownerKind: "session" as const,
      context: "anonymous_review" as const,
      identityState: "anonymous" as const,
      state,
      journeyNumber: journeyNumber(state),
      live: i < 3,
      coverage: summariseCoverage(coverage),
      loop,
      attachments: { count: attachmentCount, worstScan: worstVerdict(verdicts) },
      blocking:
        i === 0
          ? { approvalId: "apr-live-1", claimLevel: 4, waitingSeconds: 214 }
          : null,
      guardHalted: i === 2,
      // An anonymous visitor has no named owner — one appears at identification.
      humanOwner: null,
      leadId: null,
      createdAt: new Date(NOW - (i + 1) * 20 * 60_000).toISOString(),
      lastActivityAt: new Date(NOW - Math.floor(rand() * 15) * 60_000).toISOString(),
    };
  });
}

let CACHE: ThreadListItem[] | null = null;

function allThreads(): ThreadListItem[] {
  if (!CACHE) {
    CACHE = [
      ...buildAnonymousThreads(),
      ...MOCK_LEADS.map((_, i) => buildThreadForLead(i)),
    ];
  }
  return CACHE;
}

export interface ThreadQuery {
  identity?: string;
  state?: string;
  liveOnly?: boolean;
  hasAttachments?: boolean;
  blockedOnApproval?: boolean;
  guardHalted?: boolean;
}

export function listThreads(q: ThreadQuery = {}): ThreadListItem[] {
  let rows = allThreads();
  if (q.identity && q.identity !== "all") {
    rows = rows.filter((t) => t.identityState === q.identity);
  }
  if (q.state && q.state !== "all") rows = rows.filter((t) => t.state === q.state);
  if (q.liveOnly) rows = rows.filter((t) => t.live);
  if (q.hasAttachments) rows = rows.filter((t) => t.attachments.count > 0);
  if (q.blockedOnApproval) rows = rows.filter((t) => t.blocking !== null);
  if (q.guardHalted) rows = rows.filter((t) => t.guardHalted);

  // Live and blocked threads first — someone is waiting on us.
  return [...rows].sort((a, b) => {
    const aUrgent = (a.blocking ? 2 : 0) + (a.live ? 1 : 0);
    const bUrgent = (b.blocking ? 2 : 0) + (b.live ? 1 : 0);
    if (aUrgent !== bUrgent) return bUrgent - aUrgent;
    return Date.parse(b.lastActivityAt) - Date.parse(a.lastActivityAt);
  });
}

export function getThread(threadId: string): ThreadDetail | null {
  const thread = allThreads().find((t) => t.id === threadId);
  if (!thread) return null;

  const n = thread.journeyNumber ?? 1;
  const coverageMap = buildCoverage(
    thread.id,
    thread.leadId ? Math.min(10, n + 3) : thread.coverage.covered + thread.coverage.partial,
  );
  const loop = thread.loop;
  const questionHistory = buildQuestionHistory(thread.id, coverageMap, loop);

  return {
    thread,
    turns: buildTurns(thread, questionHistory),
    artifacts: buildArtifacts(thread),
    coverageMap,
    questionHistory,
    disclosureCeiling: STATE_CEILING[thread.state],
  };
}

function buildTurns(
  thread: ThreadListItem,
  questions: QuestionHistoryEntry[],
): ThreadTurn[] {
  const turns: ThreadTurn[] = [];
  let seq = 1;

  turns.push({
    id: `${thread.id}-m${seq}`,
    seq,
    author: "visitor",
    body: thread.title,
    streamingStatus: "settled",
    createdAt: thread.createdAt,
    citedChunkIds: [],
    envelopeLevel: null,
    haltedPattern: null,
    attachmentIds: [],
  });
  seq += 1;

  for (const q of questions) {
    turns.push({
      id: `${thread.id}-m${seq}`,
      seq,
      author: "agent",
      body: `Thank you — we have that. ${q.primaryText}`,
      streamingStatus: "settled",
      createdAt: q.askedAt,
      citedChunkIds: [`kc-public-${seq}`],
      envelopeLevel: 2,
      haltedPattern: null,
      attachmentIds: [],
    });
    seq += 1;

    turns.push({
      id: `${thread.id}-m${seq}`,
      seq,
      author: "visitor",
      body: "…",
      streamingStatus: "settled",
      createdAt: new Date(Date.parse(q.askedAt) + 90_000).toISOString(),
      citedChunkIds: [],
      envelopeLevel: null,
      haltedPattern: null,
      attachmentIds: [],
    });
    seq += 1;
  }

  // A halted turn: the guard matched mid-stream, the partial text was discarded.
  if (thread.guardHalted) {
    turns.push({
      id: `${thread.id}-m${seq}`,
      seq,
      author: "agent",
      body: "",
      streamingStatus: "halted",
      createdAt: new Date(NOW - 8 * 60_000).toISOString(),
      citedChunkIds: [],
      envelopeLevel: 3,
      haltedPattern: "benchmark_figure",
      attachmentIds: [],
    });
    seq += 1;
  }

  // A turn held at the gate, with the visitor still sitting in front of it.
  if (thread.blocking) {
    turns.push({
      id: `${thread.id}-m${seq}`,
      seq,
      author: "agent",
      body: "",
      streamingStatus: "under_review",
      createdAt: new Date(NOW - thread.blocking.waitingSeconds * 1000).toISOString(),
      citedChunkIds: [],
      envelopeLevel: thread.blocking.claimLevel,
      haltedPattern: null,
      attachmentIds: [],
    });
  }

  return turns;
}

function buildArtifacts(thread: ThreadListItem): ThreadArtifact[] {
  const n = thread.journeyNumber ?? 1;
  const out: ThreadArtifact[] = [];
  const ceiling = STATE_CEILING[thread.state];

  const add = (type: ThreadArtifact["type"], atState: number) => {
    if (n < atState) return;
    out.push({
      id: `${thread.id}-art-${type}`,
      type,
      version: 1,
      disclosureLevel: ceiling,
      governanceStatus: "approved",
      createdAt: new Date(NOW - (12 - atState) * 3_600_000).toISOString(),
      supersededById: null,
    });
  };

  add("reflection", 3);
  add("pitch_room", 4);
  add("review_summary", 5);
  add("boundary_waste_map", 7);
  add("poc_evidence", 8);
  add("integration_readiness", 9);
  add("success_overview", 10);

  return out;
}

/**
 * Loop productivity across the book.
 *
 * The interesting number is not how many questions were asked but which
 * dimensions the loop keeps failing to close — those are the ones where either
 * the question bank or the extraction is weak.
 */
export function getCoverageOverview(): CoverageOverview {
  const threads = allThreads().filter((t) => (t.journeyNumber ?? 1) >= 2);
  const totals = new Map<ListeningDimension, { unknown: number; partial: number }>();
  for (const d of LISTENING_DIMENSIONS) totals.set(d, { unknown: 0, partial: 0 });

  const stopReasonCounts: Partial<Record<StopReason, number>> = {};

  for (const thread of threads) {
    const detail = getThread(thread.id);
    if (!detail) continue;
    for (const entry of detail.coverageMap) {
      const bucket = totals.get(entry.dimension)!;
      if (entry.status === "unknown") bucket.unknown += 1;
      if (entry.status === "partial") bucket.partial += 1;
    }
    const reason = thread.loop.stopReason;
    if (reason) stopReasonCounts[reason] = (stopReasonCounts[reason] ?? 0) + 1;
  }

  const analysed = Math.max(1, threads.length);
  const weakestDimensions = [...totals.entries()]
    .map(([dimension, v]) => ({
      dimension,
      unknownRate: Math.round((v.unknown / analysed) * 100),
      partialRate: Math.round((v.partial / analysed) * 100),
    }))
    .sort((a, b) => b.unknownRate - a.unknownRate);

  const questionCounts = threads
    .map((t) => t.loop.questionsAsked)
    .sort((a, b) => a - b);
  const median = questionCounts.length
    ? questionCounts[Math.floor(questionCounts.length / 2)]
    : 0;

  return {
    threadsAnalysed: threads.length,
    weakestDimensions,
    stopReasonCounts,
    medianQuestionsToArtifact: median,
  };
}

/** Threads that are live right now — the overview widget's count. */
export function countLiveThreads(): number {
  return allThreads().filter((t) => t.live).length;
}

/** Threads with a turn held at the gate while the visitor waits. */
export function listBlockedThreads(): ThreadListItem[] {
  return allThreads().filter((t) => t.blocking !== null);
}
