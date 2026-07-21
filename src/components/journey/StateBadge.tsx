import { Badge } from "@/components/ui/badge";
import {
  JOURNEY_NUMBER,
  JOURNEY_STATE_INTENT,
  JOURNEY_STATE_LABEL,
  type JourneyState,
} from "@/constants/journeyStates";

/**
 * A journey state, numbered.
 *
 * Surface 2 v5.0 Phase 1 acceptance: "Every lead shows a numbered state." The
 * number is what makes the ENGAGED split legible — "Assessment" and "PoC" read
 * as unrelated labels, "7 · Assessment" and "8 · PoC" read as a ladder.
 *
 * DORMANT renders label-only because it has no number: a lead in nurture has
 * not reached rung zero, it has stepped off the ladder. A placeholder would
 * imply otherwise.
 *
 * This is the TEAM plane. The equivalent chip on Surface 1 is plain-language
 * and deliberately never numbered (Playbook v1.6 §16E) — a visitor is never
 * shown a stage number, a tier or a score.
 */
export function StateBadge({ state }: { state: JourneyState }) {
  const n = JOURNEY_NUMBER[state];

  if (n === null) {
    return <Badge variant={JOURNEY_STATE_INTENT[state]}>{JOURNEY_STATE_LABEL[state]}</Badge>;
  }

  return (
    <Badge variant={JOURNEY_STATE_INTENT[state]}>
      <span className="tabular-nums">{n}</span>
      <span aria-hidden="true" className="opacity-60">
        ·
      </span>
      {JOURNEY_STATE_LABEL[state]}
    </Badge>
  );
}
