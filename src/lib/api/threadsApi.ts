import { apiGet, type QueryParams } from "@/lib/api/client";
import { API } from "@/constants/routes";
import { JOURNEY_STATES, type JourneyState } from "@/constants/journeyStates";
import type { IdentityState } from "@/constants/shellContract";
import type {
  CoverageOverview,
  ThreadDetail,
  ThreadFilterState,
  ThreadListItem,
  ThreadTurn,
  TurnAuthor,
} from "@/types/thread";

/**
 * BOUNDARY NORMALISATION (the tree binds — BACKEND_GAPS §4). The shipped v7.1
 * thread row (`apps/cockpit/services/threads.py`) is flat: `threadId, title,
 * anonymous, leadId, company, journeyState, turnCount, visitorTurns, working,
 * lastActivityAt, createdAt, ownerKind`. The v7.0-shaped `ThreadListItem` this
 * surface was built against nests coverage/loop/attachments — casting the flat
 * row unchecked crashed the board inside the render. Everything the wire
 * carries passes through; everything it doesn't stays `undefined` and the
 * board renders "—" rather than inventing an overlay it was never sent.
 */

type WireThreadRow = Partial<ThreadListItem> & {
  threadId?: string;
  anonymous?: boolean;
  journeyState?: string;
};

function normalizeJourneyState(value: unknown): JourneyState | undefined {
  return (JOURNEY_STATES as readonly string[]).includes(String(value))
    ? (value as JourneyState)
    : undefined;
}

function normalizeThreadRow(raw: WireThreadRow): ThreadListItem {
  const state = raw.state ?? normalizeJourneyState(raw.journeyState);
  const identityState: IdentityState | undefined =
    raw.identityState ??
    (raw.anonymous == null ? undefined : raw.anonymous ? "anonymous" : "identified");

  return {
    ...raw,
    id: String(raw.id ?? raw.threadId ?? ""),
    title: raw.title || "Untitled thread",
    ownerKind: raw.ownerKind || "session",
    identityState,
    state,
    leadId: raw.leadId ?? null,
    createdAt: raw.createdAt ?? "",
    lastActivityAt: raw.lastActivityAt ?? raw.createdAt ?? "",
    // Objects pass through only when they are actually the expected shape.
    coverage: raw.coverage && typeof raw.coverage.covered === "number" ? raw.coverage : undefined,
    loop: raw.loop && typeof raw.loop.open === "boolean" ? raw.loop : undefined,
    attachments:
      raw.attachments && typeof raw.attachments.count === "number" ? raw.attachments : undefined,
  };
}

const WIRE_AUTHOR: Record<string, TurnAuthor> = {
  visitor: "visitor",
  agent: "agent",
  team: "team",
};

type WireTurn = Partial<ThreadTurn> & {
  senderKind?: string;
  claimLevel?: number | null;
  at?: string;
};

function normalizeTurn(raw: WireTurn, index: number): ThreadTurn {
  return {
    id: String(raw.id ?? index),
    seq: raw.seq ?? index,
    author: raw.author ?? WIRE_AUTHOR[String(raw.senderKind).toLowerCase()] ?? "agent",
    body: raw.body ?? "",
    streamingStatus: raw.streamingStatus ?? "settled",
    createdAt: raw.createdAt ?? raw.at ?? "",
    citedChunkIds: raw.citedChunkIds ?? [],
    envelopeLevel: raw.envelopeLevel ?? raw.claimLevel ?? null,
    haltedPattern: raw.haltedPattern ?? null,
    attachmentIds: raw.attachmentIds ?? [],
  };
}

type WireThreadDetail = Partial<ThreadDetail> &
  WireThreadRow & {
    turns?: WireTurn[];
    guardHits?: unknown[];
  };

function normalizeThreadDetail(raw: WireThreadDetail): ThreadDetail {
  const thread = normalizeThreadRow((raw.thread as WireThreadRow) ?? raw);
  if (thread.guardHalted === undefined && Array.isArray(raw.guardHits)) {
    thread.guardHalted = raw.guardHits.length > 0;
  }
  return {
    ...raw,
    thread,
    turns: (raw.turns ?? []).map(normalizeTurn),
    artifacts: raw.artifacts ?? [],
    coverageMap: raw.coverageMap ?? [],
    // Absence preserved on purpose — "telemetry not served" and "nothing
    // asked" are different facts, and the panel renders them differently.
    questionHistory: raw.questionHistory,
    disclosureCeiling: raw.disclosureCeiling,
  };
}

/** Only the active filters are sent, so an unfiltered board has a clean URL. */
export function threadQueryParams(filters: ThreadFilterState): QueryParams {
  return {
    identity: filters.identity === "all" ? undefined : filters.identity,
    state: filters.state === "all" ? undefined : filters.state,
    liveOnly: filters.liveOnly || undefined,
    hasAttachments: filters.hasAttachments || undefined,
    blockedOnApproval: filters.blockedOnApproval || undefined,
    guardHalted: filters.guardHalted || undefined,
  };
}

export async function getThreads(params: QueryParams = {}): Promise<ThreadListItem[]> {
  const data = await apiGet<{ results: WireThreadRow[] }>(API.cockpitThreads, params);
  return (data.results ?? []).map(normalizeThreadRow);
}

export async function getThread(threadId: string): Promise<ThreadDetail> {
  const raw = await apiGet<WireThreadDetail>(API.cockpitThread(threadId));
  return normalizeThreadDetail(raw);
}

export function getCoverageOverview() {
  return apiGet<CoverageOverview>(API.cockpitThreadsCoverage);
}
