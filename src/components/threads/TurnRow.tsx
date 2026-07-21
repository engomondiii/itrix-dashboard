import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/formatting";
import type { StreamingStatus, ThreadTurn } from "@/types/thread";
import { cn } from "@/lib/utils";

const AUTHOR_LABEL: Record<ThreadTurn["author"], string> = {
  visitor: "Visitor",
  agent: "itriX",
  team: "Team",
};

const STATUS_LABEL: Record<StreamingStatus, string> = {
  pending: "Pending",
  streaming: "Streaming",
  settled: "Settled",
  halted: "Halted mid-stream",
  under_review: "Held for approval",
};

const STATUS_INTENT: Record<StreamingStatus, "neutral" | "info" | "warning" | "error"> = {
  pending: "neutral",
  streaming: "info",
  settled: "neutral",
  halted: "error",
  under_review: "warning",
};

/**
 * One turn, as the operator sees it.
 *
 * TWO TURNS HAVE NO BODY TO SHOW, and that is correct rather than a gap:
 *
 *   · `halted` — the stream guard matched a prohibited pattern mid-generation
 *     and the partial text was DISCARDED from the client. It is not stored and
 *     not recoverable here. What the operator gets instead is the pattern that
 *     matched, which is the actionable part.
 *   · `under_review` — the pre-flight envelope refused to stream a level-4+
 *     claim at all, so nothing was ever generated to show. The visitor saw the
 *     approved under-review wording and is waiting.
 *
 * Rendering an empty body as "(no content)" would read as a bug. Saying what
 * actually happened is the whole value of this view.
 */
export function TurnRow({ turn }: { turn: ThreadTurn }) {
  const isVisitor = turn.author === "visitor";
  const suppressed = turn.streamingStatus === "halted" || turn.streamingStatus === "under_review";

  return (
    <li
      className={cn(
        "rounded-md border p-3",
        isVisitor ? "border-border-soft bg-surface" : "border-border-soft bg-soft/60",
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="text-sec font-semibold text-ink-primary">
            {AUTHOR_LABEL[turn.author]}
          </span>
          <span className="font-mono text-micro text-ink-secondary">seq {turn.seq}</span>
          {turn.streamingStatus !== "settled" && (
            <Badge variant={STATUS_INTENT[turn.streamingStatus]}>
              {STATUS_LABEL[turn.streamingStatus]}
            </Badge>
          )}
        </span>
        <span className="text-micro text-ink-secondary">{formatDateTime(turn.createdAt)}</span>
      </div>

      {suppressed ? (
        <p className="mt-2 text-sec text-ink-secondary">
          {turn.streamingStatus === "halted" ? (
            <>
              The stream was halted and the partial text discarded before it reached the
              visitor.
              {turn.haltedPattern && (
                <>
                  {" "}
                  Matched pattern:{" "}
                  <code className="rounded bg-error-soft px-1 py-0.5 font-mono text-micro text-error-text">
                    {turn.haltedPattern}
                  </code>
                  .
                </>
              )}
            </>
          ) : (
            <>
              A level-{turn.envelopeLevel ?? 4} claim never streamed. The visitor is seeing
              the approved under-review wording and is waiting on this approval.
            </>
          )}
        </p>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sec text-ink-primary">{turn.body}</p>
      )}

      {(turn.citedChunkIds.length > 0 || turn.envelopeLevel !== null) && !suppressed && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {turn.envelopeLevel !== null && (
            <Badge variant="neutral">envelope L{turn.envelopeLevel}</Badge>
          )}
          {turn.citedChunkIds.map((id) => (
            <code
              key={id}
              className="rounded bg-soft px-1 py-0.5 font-mono text-micro text-ink-secondary"
            >
              {id}
            </code>
          ))}
        </div>
      )}
    </li>
  );
}
