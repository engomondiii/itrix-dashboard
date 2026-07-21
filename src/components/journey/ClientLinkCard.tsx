"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useJourney } from "@/hooks/useJourney";
import {
  JOURNEY_STATE_LABEL,
  hasReached,
  type JourneyState,
} from "@/constants/journeyStates";
import type { Lead } from "@/types/lead";

/**
 * The lead's 1:1 portal Client link. A Lead is promoted to a Client only once
 * the invite gate fires and the invite is accepted — that is, from NDA_REVIEW
 * (state 6) onward.
 *
 * v5.0: this used to test `CLIENT || ENGAGED`, an explicit two-state list that
 * silently stopped covering the ladder the moment ENGAGED split into
 * ASSESSMENT / POC / INTEGRATION. It is now a `hasReached` threshold, so every
 * state at or beyond 6 is covered and a future state 11 would be too.
 */
export function ClientLinkCard({ lead }: { lead: Lead }) {
  const { data: journey } = useJourney(lead.id);
  const state: JourneyState = journey?.state ?? lead.journeyState ?? "ARRIVED";
  // Reaching NDA_REVIEW means an account *should* exist; only a real `client`
  // record proves it does. Don't claim "Linked" without one.
  const expectsAccount = hasReached(state, "NDA_REVIEW");
  const linked = lead.client != null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client account</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {linked ? (
          <>
            <div className="flex items-center gap-2">
              <Badge variant="success">Linked</Badge>
              <span className="text-sec text-ink-secondary">{lead.client!.status}</span>
            </div>
            <p className="text-caption text-ink-secondary">
              Promoted to a portal client account (Surface 3) — the client works in the
              portal; the team works this lead.
            </p>
          </>
        ) : expectsAccount ? (
          <>
            <Badge variant="warning">Not linked</Badge>
            <p className="text-caption text-ink-secondary">
              The journey has reached {JOURNEY_STATE_LABEL[state]}, but no portal
              account is linked to this lead yet.
            </p>
          </>
        ) : (
          <p className="text-sec text-ink-secondary">
            No client account yet — created when the invite is accepted.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
