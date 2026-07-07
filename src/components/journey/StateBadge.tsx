import { Badge } from "@/components/ui/badge";
import {
  JOURNEY_STATE_INTENT,
  JOURNEY_STATE_LABEL,
  type JourneyState,
} from "@/constants/journeyStates";

export function StateBadge({ state }: { state: JourneyState }) {
  return <Badge variant={JOURNEY_STATE_INTENT[state]}>{JOURNEY_STATE_LABEL[state]}</Badge>;
}
