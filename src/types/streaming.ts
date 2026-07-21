/**
 * Streaming governance as the operator sees it (Architecture v2.6 §19.8,
 * Backend v6.0 §06).
 *
 * v2.5 ran governance as the final pipeline stage on a completed message.
 * Streaming renders text before the message is complete, so a single terminal
 * gate is no longer sufficient. The three-part model, all parts required:
 *
 *   1. PRE-FLIGHT ENVELOPE — before a single token streams, the turn is bound
 *      to a claim ceiling. A turn requiring level-4/5 approval does not stream
 *      at all: the visitor immediately sees the approved under-review wording.
 *      Nothing about a high-risk claim is ever rendered provisionally.
 *   2. STREAM GUARD — a deterministic matcher over the emerging token stream.
 *      On a match the stream HALTS, the partial text is discarded from the
 *      client, and the turn is re-routed to the approval queue. A hard stop,
 *      not a warning.
 *   3. SETTLE — the full Claim-Card pipeline on the completed message.
 *
 * A rising guard-hit rate is treated as retrieval or prompt drift, not noise.
 */

/**
 * The prohibited pattern families the guard matches.
 *
 * SINGLE-SOURCED WITH THE BACKEND. The same set is consumed by
 * `prohibited_language_checker` (at settle) and `stream_guard` (mid-stream), so
 * a pattern cannot be enforced at one and missed at the other. This surface
 * displays the shared set precisely so a divergence would be visible — that is
 * the point of showing it (Surface 2 v5.0 §5.2).
 */
export const GUARD_PATTERNS = [
  "benchmark_figure",
  "guarantee_language",
  "pricing",
  "exclusivity_terms",
  "competitor_claim",
  "mechanism_disclosure",
  "lookup_table_phrasing",
  "inferred_identity",
] as const;
export type GuardPattern = (typeof GUARD_PATTERNS)[number];

export const GUARD_PATTERN_LABEL: Record<GuardPattern, string> = {
  benchmark_figure: "Benchmark figure",
  guarantee_language: "Guarantee language",
  pricing: "Pricing",
  exclusivity_terms: "Exclusivity terms",
  competitor_claim: "Competitor claim",
  mechanism_disclosure: "Mechanism disclosure",
  lookup_table_phrasing: "“Lookup-table” phrasing",
  inferred_identity: "Inferred-identity assertion",
};

/** What each family exists to stop, so a halt is interpretable at a glance. */
export const GUARD_PATTERN_DESCRIPTION: Record<GuardPattern, string> = {
  benchmark_figure: "An unapproved performance number reached the token stream.",
  guarantee_language: "A guaranteed improvement was about to be asserted.",
  pricing: "Pricing is never public and never emitted by an agent.",
  exclusivity_terms: "Exclusivity is never discussed on a public surface.",
  competitor_claim: "A named-competitor comparison needs approval.",
  mechanism_disclosure: "Patent mechanism detail was about to be disclosed.",
  lookup_table_phrasing:
    "ALPHA Core is always “table-free index-ordered algebraic execution”, never “lookup-table execution”.",
  inferred_identity: "The turn was about to tell the visitor what we infer about them.",
};

/** One halted stream. */
export interface GuardHit {
  id: string;
  threadId: string;
  threadTitle: string;
  agent: string;
  stateKey: string;
  plane: "anonymous" | "client" | "team";
  pattern: GuardPattern;
  /**
   * The prohibited wording the guard actually matched — what the model was
   * about to say before the stream was halted.
   *
   * THE MOST SENSITIVE FIELD ON THIS SURFACE. The backend's own docstring for
   * `stream_metrics.recent_hits()` says it "must never appear anywhere else".
   * It is rendered to ADMIN / ASSESSMENT operators only, behind an explicit
   * reveal, and it must never be copied into a thread intervention, a follow-up
   * draft, or any client-plane payload — the whole point of the halt was that
   * the visitor never saw it.
   *
   * Null when the backend withheld it, which is a valid answer, not an error.
   */
  matchedText: string | null;
  /** How much provisional text was discarded from the client. */
  discardedChars: number;
  at: string; // ISO
}

/**
 * A turn the pre-flight envelope refused to stream.
 *
 * Not a failure — the envelope working. A level-4/5 claim never streams, so the
 * visitor saw the approved under-review wording immediately and the turn went
 * to the queue. Recorded because a rising rate means retrieval is pulling
 * higher-claim content than the plane should be reaching.
 */
export interface EnvelopeDowngrade {
  id: string;
  threadId: string;
  threadTitle: string;
  agent: string;
  requestedLevel: number;
  allowedLevel: number;
  at: string; // ISO
}

/** An approval with a visitor sitting in front of the conversation. */
export interface BlockingApprovalItem {
  approvalId: string;
  threadId: string;
  threadTitle: string;
  claimLevel: number;
  /** The VISITOR's wait, not the approval's age — the queue orders by this. */
  waitingSeconds: number;
  agent: string;
}

export interface StreamingGovernanceRead {
  blocking: BlockingApprovalItem[];
  guardHits: GuardHit[];
  downgrades: EnvelopeDowngrade[];
  /** Guard hits per 100 streamed turns, for the drift signal. */
  guardHitRate: number;
}
