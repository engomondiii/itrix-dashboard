"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useJourney } from "@/hooks/useJourney";
import { JOURNEY_STATE_DESCRIPTION } from "@/constants/journeyStates";

import { AdvanceControl } from "./AdvanceControl";
import { JourneyTimeline } from "./JourneyTimeline";
import { RevealLog } from "./RevealLog";
import { StateBadge } from "./StateBadge";

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-400">
      {children}
    </div>
  );
}

/** The per-lead journey monitor (Surface 2 v3.0). One machine, two views. */
export function JourneyPanel({ leadId }: { leadId: string }) {
  const { data: journey, isLoading, isError } = useJourney(leadId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journey</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex justify-center py-4">
            <Spinner className="size-4" />
          </div>
        )}
        {isError && !isLoading && (
          <p className="text-sec text-ink-400">Journey data isn’t available yet.</p>
        )}
        {journey && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <StateBadge state={journey.state} />
              {journey.valueDelivered && <Badge variant="neutral">Value delivered</Badge>}
              {journey.accountInviteAvailable && (
                <Badge variant="info">Invite-eligible</Badge>
              )}
            </div>
            <p className="text-sec text-ink-600">
              {JOURNEY_STATE_DESCRIPTION[journey.state]}
            </p>

            <div className="space-y-2">
              <SectionLabel>Reveals</SectionLabel>
              <RevealLog transitions={journey.transitions} />
            </div>

            <div className="space-y-2">
              <SectionLabel>Advance</SectionLabel>
              <AdvanceControl leadId={leadId} state={journey.state} />
            </div>

            <div className="space-y-2">
              <SectionLabel>History</SectionLabel>
              <JourneyTimeline transitions={journey.transitions} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
