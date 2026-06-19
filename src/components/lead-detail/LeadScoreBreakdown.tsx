import { SCORING_CATEGORIES, SCORING_WEIGHTS } from "@/constants/scoring";
import type { ScoreBreakdown } from "@/types/lead";

export function LeadScoreBreakdown({ breakdown }: { breakdown: ScoreBreakdown }) {
  return (
    <div className="space-y-2.5">
      {SCORING_CATEGORIES.map((cat) => {
        const def = SCORING_WEIGHTS[cat];
        const val = breakdown?.[cat] ?? 0;
        const pct = Math.min(100, (val / def.weight) * 100);
        return (
          <div key={cat}>
            <div className="flex items-center justify-between text-caption text-ink-500">
              <span>{def.label}</span>
              <span className="tabular-nums">
                {val}/{def.weight}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
              <div className="h-full rounded-full bg-sapphire-600" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
