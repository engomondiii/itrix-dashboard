"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useCockpit, useNextAction } from "@/hooks/useCockpit";
import { nextActionLabel } from "@/constants/cockpit";

import { NextActionButton } from "./NextActionButton";
import { PitchEngagementCard } from "./PitchEngagementCard";

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="text-micro font-semibold uppercase tracking-[0.06em] text-ink-400">
      {children}
    </div>
  );
}

function Meter({ label, value }: { label: string; value?: number }) {
  const v = value ?? 0;
  return (
    <div>
      <div className="flex justify-between text-caption text-ink-500">
        <span>{label}</span>
        <span className="tabular-nums">{v}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
        <div className="h-full rounded-full bg-sapphire-600" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

/** The sales cockpit — reads the visitor. Every field here is internal-only. */
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
          <p className="text-sec text-ink-400">Cockpit data isn’t available yet.</p>
        )}
        {cockpit && (
          <>
            {nba && (
              <div className="rounded-md bg-sapphire-50 p-3">
                <SectionLabel>Next best action</SectionLabel>
                <p className="mt-1 text-sec font-medium text-sapphire-700">
                  {nextActionLabel(nba.nextAction)}
                </p>
                <p className="text-caption text-ink-500">{nba.reason}</p>
                <NextActionButton
                  leadId={leadId}
                  state={cockpit.journeyState}
                  nextAction={nba.nextAction}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <SectionLabel>Visitor read</SectionLabel>
              {cockpit.visitorType && (
                <p className="text-sec text-ink-700">
                  <span className="text-ink-400">Type:</span> {cockpit.visitorType}
                </p>
              )}
              {cockpit.pain && (
                <p className="text-sec text-ink-700">
                  <span className="text-ink-400">Pain:</span> {cockpit.pain}
                </p>
              )}
              {cockpit.gain && (
                <p className="text-sec text-ink-700">
                  <span className="text-ink-400">Gain:</span> {cockpit.gain}
                </p>
              )}
              {cockpit.buyerPsychology && (
                <p className="text-caption text-ink-500">{cockpit.buyerPsychology}</p>
              )}
              {cockpit.objectionSignals && cockpit.objectionSignals.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {cockpit.objectionSignals.map((o) => (
                    <Badge key={o} variant="warning">
                      {o}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {cockpit.readiness && (
              <div className="space-y-2">
                <SectionLabel>Readiness</SectionLabel>
                <Meter label="NDA" value={cockpit.readiness.nda} />
                <Meter label="Assessment" value={cockpit.readiness.assessment} />
                <Meter label="PoC" value={cockpit.readiness.poc} />
              </div>
            )}

            <div className="space-y-2">
              <SectionLabel>Pitch engagement</SectionLabel>
              <PitchEngagementCard pitch={cockpit.pitchEngagement} />
            </div>

            {typeof cockpit.licenseOutProbability === "number" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <SectionLabel>License-out probability</SectionLabel>
                  <Badge variant="gold">Directional</Badge>
                </div>
                <Meter label="Likelihood" value={cockpit.licenseOutProbability} />
                <p className="text-micro text-ink-400">
                  Internal directional signal only — never a prediction, never shown to the
                  visitor.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
