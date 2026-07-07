import {
  JOURNEY_EVENT_LABEL,
  JOURNEY_STATE_LABEL,
  REVEAL_SURFACE_LABEL,
} from "@/constants/journeyStates";
import type { JourneyTransition } from "@/types/journey";

function formatAt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/** Newest-first list of journey transitions (audit + timeline). */
export function JourneyTimeline({ transitions }: { transitions: JourneyTransition[] }) {
  if (transitions.length === 0) {
    return <p className="text-sec text-ink-400">No transitions yet.</p>;
  }

  return (
    <ol className="space-y-3">
      {transitions.map((t) => (
        <li key={t.id} className="relative border-l border-line pl-4">
          <span className="absolute top-1.5 -left-[3px] size-1.5 rounded-full bg-sapphire-500" />
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sec font-medium text-ink-800">
              {JOURNEY_EVENT_LABEL[t.event]}
            </span>
            <span className="text-micro text-ink-400">{formatAt(t.at)}</span>
          </div>
          <div className="text-caption text-ink-500">
            {JOURNEY_STATE_LABEL[t.fromState]} → {JOURNEY_STATE_LABEL[t.toState]}
            {t.reveal ? ` · revealed ${REVEAL_SURFACE_LABEL[t.reveal]}` : ""}
          </div>
        </li>
      ))}
    </ol>
  );
}
