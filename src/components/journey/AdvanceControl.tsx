"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdvanceJourney } from "@/hooks/useJourney";
import { canControlJourney } from "@/constants/permissions";
import {
  eventsFromState,
  JOURNEY_EVENT_LABEL,
  type JourneyState,
} from "@/constants/journeyStates";

/**
 * Guarded manual advance. Only Admin / Assessment Team see the controls; the
 * backend re-checks (`IsJourneyController`) on every write. The UI never sets
 * state directly — it fires a validated event.
 */
export function AdvanceControl({
  leadId,
  state,
}: {
  leadId: string;
  state: JourneyState;
}) {
  const { user } = useAuth();
  const advance = useAdvanceJourney(leadId);

  if (!canControlJourney(user?.role)) {
    return (
      <p className="text-caption text-ink-400">
        Advancing a journey is restricted to Admin / Assessment Team.
      </p>
    );
  }

  const events = eventsFromState(state);
  if (events.length === 0) {
    return (
      <p className="text-caption text-ink-400">No further transitions from this state.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {events.map((event) => (
        <Button
          key={event}
          size="sm"
          variant="outline"
          disabled={advance.isPending}
          onClick={() => advance.mutate({ event })}
        >
          {JOURNEY_EVENT_LABEL[event]}
        </Button>
      ))}
    </div>
  );
}
