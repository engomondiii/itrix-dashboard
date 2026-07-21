import { Badge } from "@/components/ui/badge";
import {
  SUPPRESSION_CLEARS_WHEN,
  SUPPRESSION_REASON_LABEL,
  type SuppressionReason,
} from "@/types/nba";

/**
 * Which customer-first condition suppressed commercial actions, in plain
 * language — and what clears it.
 *
 * BOTH HALVES MATTER. "Commercial actions suppressed" on its own reads as an
 * obstacle and invites working around it. Naming the condition and saying when
 * it lifts turns it into a next step: resolve the issue, and expansion becomes
 * available again. That framing is straight out of the §2.2 example.
 */
export function SuppressionReasonBadge({
  reason,
  showRemedy = true,
}: {
  reason: SuppressionReason;
  showRemedy?: boolean;
}) {
  return (
    <span className="space-y-1">
      <Badge variant="warning">
        Commercial actions suppressed — {SUPPRESSION_REASON_LABEL[reason].toLowerCase()}
      </Badge>
      {showRemedy && (
        <span className="block text-caption text-ink-secondary">
          Expansion becomes available when {SUPPRESSION_CLEARS_WHEN[reason]}
        </span>
      )}
    </span>
  );
}
