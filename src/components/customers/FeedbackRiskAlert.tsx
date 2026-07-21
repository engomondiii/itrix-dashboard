import { HeartPulseIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatting";
import type { FeedbackPulse } from "@/types/customer";

/** A pulse at or below this is treated as a trust signal worth acting on. */
const RISK_THRESHOLD = 3;

/**
 * The private satisfaction pulse.
 *
 * THREE RULES HOLD HERE, all of them from Playbook v1.6 §12I:
 *   · It is PRIVATE — it goes to the customer-success owner and nowhere else,
 *     which is why this component exists only on the team plane.
 *   · The score is NEVER rendered back to the customer as a judgement about
 *     them, never used in copy addressed to them.
 *   · A low score is a TRUST SIGNAL, which is step 4 of the customer-first
 *     precedence rule — it suppresses commercial actions, so it is surfaced as
 *     something to act on rather than a metric to watch.
 *
 * A request to be followed up on is shown prominently: the customer explicitly
 * asked for a human, and that is not a queue item to age.
 */
export function FeedbackRiskAlert({ feedback }: { feedback: FeedbackPulse[] }) {
  const latest = feedback[0];
  if (!latest) {
    return <p className="text-sec text-ink-secondary">No feedback yet.</p>;
  }

  const atRisk = latest.score <= RISK_THRESHOLD;

  return (
    <div
      className={
        atRisk
          ? "space-y-2 rounded-md border border-warning/40 bg-warning-soft p-3"
          : "space-y-2"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <HeartPulseIcon
          className={atRisk ? "size-4 text-warning-text" : "size-4 text-ink-secondary"}
          aria-hidden="true"
        />
        <span className="text-sec font-medium text-ink-primary tabular-nums">
          {latest.score} / 5
        </span>
        {atRisk && <Badge variant="warning">Trust signal</Badge>}
        {latest.followUpRequested && (
          <Badge variant="error">Asked for a follow-up</Badge>
        )}
        <span className="text-micro text-ink-secondary">{formatDate(latest.at)}</span>
      </div>

      {latest.comment && (
        <p className={atRisk ? "text-sec text-warning-text" : "text-sec text-ink-secondary"}>
          “{latest.comment}”
        </p>
      )}

      <p className="text-micro text-ink-secondary">
        Private to the customer-success owner. Never shown back to the customer, and
        never used in copy addressed to them.
      </p>
    </div>
  );
}
