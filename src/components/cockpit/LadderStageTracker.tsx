import { LADDER_STAGES } from "@/constants/cockpit";
import { cn } from "@/lib/utils";

/**
 * Where this relationship sits on the named commercial ladder:
 * Review → Assessment → PoC → Integration → License-out.
 *
 * Sourced from `journey_number`, not from a separate field, so the ladder and
 * the journey state cannot disagree. That mattered more after the ENGAGED
 * split: three ladder rungs used to map onto one journey state, which is
 * exactly why the state had to be split.
 *
 * Realized value runs alongside this from the first paid rung — the ladder is
 * not the whole relationship, and after first payment it is not even the most
 * important part of it.
 */
export function LadderStageTracker({ stage }: { stage?: string }) {
  if (!stage) return null;
  const activeIndex = LADDER_STAGES.indexOf(stage as (typeof LADDER_STAGES)[number]);

  return (
    <ol className="flex flex-wrap items-center gap-1">
      {LADDER_STAGES.map((s, i) => {
        const reached = activeIndex >= 0 && i <= activeIndex;
        const current = i === activeIndex;
        return (
          <li key={s} className="flex items-center gap-1">
            <span
              className={cn(
                "rounded-pill px-2 py-0.5 text-micro",
                current
                  ? "bg-ink-primary font-semibold text-ink-inverse"
                  : reached
                    ? "bg-tint text-ink-primary"
                    : "bg-soft text-ink-secondary",
              )}
            >
              {s}
            </span>
            {i < LADDER_STAGES.length - 1 && (
              <span aria-hidden="true" className="text-ink-muted">
                ›
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
