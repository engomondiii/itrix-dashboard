"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAdvanceJourney } from "@/hooks/useJourney";
import { canControlJourney } from "@/constants/permissions";
import { eventForNextAction, nextActionLabel } from "@/constants/cockpit";
import { targetForEvent, type JourneyState } from "@/constants/journeyStates";

/**
 * Makes the cockpit's recommendation actionable. Only rendered when the action
 * maps to a journey event that is legal from the lead's current state — waiting
 * actions ("await diagnosis") and off-machine ones ("propose evaluation") stay
 * advisory. The backend re-checks permission and the transition regardless.
 */
export function NextActionButton({
  leadId,
  state,
  nextAction,
}: {
  leadId: string;
  state: JourneyState;
  nextAction: string;
}) {
  const { user } = useAuth();
  const advance = useAdvanceJourney(leadId);

  const event = eventForNextAction(nextAction);
  // Never offer a transition the state machine would reject.
  if (!event || !targetForEvent(state, event)) return null;

  if (!canControlJourney(user?.role)) {
    return (
      <p className="mt-2 text-micro text-ink-secondary">
        Admin / Assessment Team can perform this action.
      </p>
    );
  }

  return (
    <Button
      size="sm"
      className="mt-2"
      disabled={advance.isPending}
      onClick={() => advance.mutate({ event })}
    >
      {nextActionLabel(nextAction)}
    </Button>
  );
}
