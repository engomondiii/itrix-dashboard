"use client";

import { PresentationIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { usePitchAnalytics } from "@/hooks/useCockpit";

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="text-micro text-ink-400">{label}</div>
      <div className="text-kpi font-semibold tabular-nums text-ink-900">{value}</div>
    </div>
  );
}

export function PitchEngagementChart() {
  const { data, isLoading, isError } = usePitchAnalytics();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="size-5" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <EmptyState
        icon={PresentationIcon}
        title="No pitch analytics"
        description="Pitch-room engagement will appear here."
      />
    );
  }

  const entries = Object.entries(data.byPitchType);
  const max = Math.max(1, ...entries.map(([, v]) => v));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label={`Pitches opened (${data.windowDays}d)`} value={data.totalPitchesOpened} />
        <Stat label="CTA clicks" value={data.totalCtaClicks} />
        <Stat label="Questions asked" value={data.totalQuestionsAsked} />
      </div>
      <div className="rounded-lg border border-line bg-surface p-4">
        <div className="mb-3 text-micro font-semibold uppercase tracking-[0.06em] text-ink-400">
          By pitch type
        </div>
        <div className="space-y-2">
          {entries.map(([type, v]) => (
            <div key={type}>
              <div className="flex justify-between text-caption text-ink-600">
                <span>{type}</span>
                <span className="tabular-nums">{v}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-sunken">
                <div
                  className="h-full rounded-full bg-sapphire-600"
                  style={{ width: `${(v / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-micro text-ink-400">
        Internal telemetry only — never surfaced to the visitor.
      </p>
    </div>
  );
}
