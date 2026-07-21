import "server-only";

import type {
  BlockingApprovalItem,
  EnvelopeDowngrade,
  GuardHit,
  GuardPattern,
  StreamingGovernanceRead,
} from "@/types/streaming";
import { listThreads } from "@/mocks/threadsDb";

/**
 * Mock streaming-governance store, derived from the thread board.
 *
 * The threads that carry `guardHalted` and `blocking` are the same rows the
 * board shows, so an operator can move between the two views without the
 * numbers changing under them. Inventing an independent population here would
 * make the console impossible to trust the first time it disagreed.
 */

const NOW = Date.parse("2026-07-21T11:00:00Z");

const AGENTS = ["Concierge", "Diagnosis", "Pitch", "Proof"];

function hash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export function getStreamingGovernance(): StreamingGovernanceRead {
  const threads = listThreads();

  const blocking: BlockingApprovalItem[] = threads
    .filter((t) => t.blocking)
    .map((t) => ({
      approvalId: t.blocking!.approvalId,
      threadId: t.id,
      threadTitle: t.title,
      claimLevel: t.blocking!.claimLevel,
      waitingSeconds: t.blocking!.waitingSeconds,
      agent: "Concierge",
    }))
    // Visitor wait time first — that is the ordering rule for the queue.
    .sort((a, b) => b.waitingSeconds - a.waitingSeconds);

  const guardHits: GuardHit[] = threads
    .filter((t) => t.guardHalted)
    .map((t, i) => {
      const seed = Math.abs(hash(t.id));
      const patterns: GuardPattern[] = [
        "benchmark_figure",
        "guarantee_language",
        "lookup_table_phrasing",
        "inferred_identity",
      ];
      return {
        id: `hit-${t.id}`,
        threadId: t.id,
        threadTitle: t.title,
        agent: AGENTS[seed % AGENTS.length],
        stateKey: t.state.toLowerCase(),
        plane:
          t.identityState === "anonymous"
            ? ("anonymous" as const)
            : ("client" as const),
        pattern: patterns[seed % patterns.length],
        discardedChars: 40 + (seed % 260),
        at: new Date(NOW - (8 + i * 17) * 60_000).toISOString(),
      };
    });

  // A couple of envelope downgrades, on the deepest threads — those are where
  // retrieval is most likely to surface higher-claim content.
  const downgrades: EnvelopeDowngrade[] = threads
    .filter((t) => (t.journeyNumber ?? 1) >= 7)
    .slice(0, 3)
    .map((t, i) => ({
      id: `dg-${t.id}`,
      threadId: t.id,
      threadTitle: t.title,
      agent: AGENTS[Math.abs(hash(t.id)) % AGENTS.length],
      requestedLevel: 4,
      allowedLevel: 3,
      at: new Date(NOW - (25 + i * 40) * 60_000).toISOString(),
    }));

  const streamedTurns = Math.max(1, threads.length * 4);
  return {
    blocking,
    guardHits,
    downgrades,
    guardHitRate: Math.round((guardHits.length / streamedTurns) * 1000) / 10,
  };
}

/** Blocking approvals only — used by the queue banner without the rest. */
export function listBlockingApprovals(): BlockingApprovalItem[] {
  return getStreamingGovernance().blocking;
}
