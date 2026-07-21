import { Badge } from "@/components/ui/badge";
import {
  GUARD_PATTERN_DESCRIPTION,
  GUARD_PATTERN_LABEL,
  type GuardPattern,
} from "@/types/streaming";

/**
 * Which prohibited pattern halted the stream.
 *
 * The pattern is the actionable part of a halt — the partial text was discarded
 * and is not recoverable, so "what nearly got said" is all an operator has to
 * work with. The description carries the rule it enforced, because a bare key
 * like `lookup_table_phrasing` means nothing to someone who has not read §19.5.
 */
export function MatchedPatternChip({ pattern }: { pattern: GuardPattern }) {
  return (
    <Badge variant="error" title={GUARD_PATTERN_DESCRIPTION[pattern]}>
      {GUARD_PATTERN_LABEL[pattern]}
    </Badge>
  );
}
