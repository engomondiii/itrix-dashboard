import { Badge } from "@/components/ui/badge";
import { PENDING_STAGE_LABEL, type PendingStageState } from "@/types/thread";

/**
 * The stage the visitor's pending indicator is showing, and how long it has
 * held (Surface 2 v6.0 §6.2).
 *
 * A stage stuck on `checking` is a blocking approval seen from the visitor's
 * side — the number here and the wait on the approval queue are the same
 * seconds. Surfacing it in the thread view means an operator watching a live
 * conversation sees the visitor's wait without switching to the queue.
 */
export function PendingStageRow({ pending }: { pending: PendingStageState }) {
  // Long enough that the visitor's own indicator has offered a retry
  // (Surface 1 PENDING_TIMEOUT_MS defaults to 20s).
  const stuck = pending.heldForSeconds >= 20;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={stuck ? (pending.stage === "checking" ? "error" : "warning") : "info"}>
        {PENDING_STAGE_LABEL[pending.stage]}
      </Badge>
      <span className="text-caption tabular-nums text-ink-secondary">
        held {pending.heldForSeconds}s
      </span>
      {stuck && pending.stage === "checking" && (
        <span className="text-micro text-ink-secondary">
          — a blocking approval, seen from the visitor&rsquo;s side
        </span>
      )}
    </div>
  );
}
