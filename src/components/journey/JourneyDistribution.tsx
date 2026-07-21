"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useJourneyOverview } from "@/hooks/useJourney";
import {
  JOURNEY_PROGRESSION,
  JOURNEY_STATE_LABEL,
  type JourneyState,
} from "@/constants/journeyStates";

/** Overview widget: how leads are distributed across journey states. */
export function JourneyDistribution() {
  const { data, isLoading } = useJourneyOverview();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Journey distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <Spinner className="size-4" />
          </div>
        </CardContent>
      </Card>
    );
  }
  // Hidden until there's data (e.g. real mode before a backend endpoint exists).
  if (!data || data.total === 0) return null;

  const states: JourneyState[] = [...JOURNEY_PROGRESSION, "DORMANT"];
  const max = Math.max(1, ...states.map((s) => data.distribution[s] ?? 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journey distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {states.map((s) => {
          const v = data.distribution[s] ?? 0;
          return (
            <div key={s}>
              <div className="flex justify-between text-caption text-ink-secondary">
                <span>{JOURNEY_STATE_LABEL[s]}</span>
                <span className="tabular-nums">{v}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft">
                <div
                  className="h-full rounded-full bg-ink-primary"
                  style={{ width: `${(v / max) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
