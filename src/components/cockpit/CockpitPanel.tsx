"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useCockpit, useNextAction } from "@/hooks/useCockpit";
import { nextActionLabel } from "@/constants/cockpit";

import { LadderStageTracker } from "./LadderStageTracker";
import { LicenseOutProbability } from "./LicenseOutProbability";
import { LiveThreadCard } from "./LiveThreadCard";
import { NextActionButton } from "./NextActionButton";
import { PitchEngagementCard } from "./PitchEngagementCard";
import { ReadinessMeters } from "./ReadinessMeters";
import { RiskFlags } from "./RiskFlags";
import { VisitorReadCard } from "./VisitorReadCard";

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-secondary">
      {children}
    </div>
  );
}

/**
 * The sales cockpit — reads the visitor. Every field here is internal-only.
 *
 * v5.0 composes the panel from named field components rather than inlining
 * them. That is not cosmetic: several of these fields (license-out probability,
 * risk flags, coverage, stop reasons) carry a "never leaves the team plane"
 * rule, and a rule attached to a named component travels with it. Inline
 * markup loses that the first time someone copies a block into a portal view.
 *
 * The panel answers three questions in order — what should we do next, who is
 * this, and where are they on the ladder — because that is the order a
 * concierge asks them in before a call.
 */
export function CockpitPanel({ leadId }: { leadId: string }) {
  const { data: cockpit, isLoading, isError } = useCockpit(leadId);
  const { data: nba } = useNextAction(leadId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cockpit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Badge variant="neutral">Internal only — never shown to the visitor</Badge>
        </div>

        {isLoading && (
          <div className="flex justify-center py-4">
            <Spinner className="size-4" />
          </div>
        )}
        {isError && !isLoading && (
          <p className="text-sec text-ink-secondary">Cockpit data isn’t available yet.</p>
        )}

        {cockpit && (
          <>
            {nba && (
              <div className="rounded-md bg-soft p-3">
                <SectionLabel>Next best action</SectionLabel>
                <p className="mt-1 text-sec font-medium text-ink-primary">
                  {nextActionLabel(nba.nextAction)}
                </p>
                <p className="text-caption text-ink-secondary">{nba.reason}</p>
                <NextActionButton
                  leadId={leadId}
                  state={cockpit.journeyState}
                  nextAction={nba.nextAction}
                />
              </div>
            )}

            <RiskFlags flags={cockpit.riskFlags} />

            <div className="space-y-2">
              <SectionLabel>Conversation</SectionLabel>
              <LiveThreadCard cockpit={cockpit} />
            </div>

            {/* Two readable columns once the card is wide; stacked on narrow. */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <SectionLabel>Visitor read</SectionLabel>
                <VisitorReadCard cockpit={cockpit} />
              </div>

              {cockpit.readiness && (
                <div className="space-y-2">
                  <SectionLabel>Readiness</SectionLabel>
                  <ReadinessMeters readiness={cockpit.readiness} />
                </div>
              )}
            </div>

            {cockpit.ladderStage && (
              <div className="space-y-2">
                <SectionLabel>Ladder stage</SectionLabel>
                <LadderStageTracker stage={cockpit.ladderStage} />
              </div>
            )}

            <div className="space-y-2">
              <SectionLabel>Pitch engagement</SectionLabel>
              <PitchEngagementCard pitch={cockpit.pitchEngagement} />
            </div>

            <LicenseOutProbability value={cockpit.licenseOutProbability} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
