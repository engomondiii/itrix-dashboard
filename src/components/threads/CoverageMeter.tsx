import { LISTENING_DIMENSIONS } from "@/constants/listeningDimensions";
import { cn } from "@/lib/utils";

/**
 * A compact read of how much of the ten listening dimensions a thread has
 * closed — covered / partial / unknown.
 *
 * Deliberately NOT a percentage. A percentage would invite reading coverage as
 * a score for the visitor, which is exactly what it is not: it measures what
 * the platform has managed to listen for, not how good a prospect someone is.
 * Three counts keep it descriptive.
 */
export function CoverageMeter({
  covered,
  partial,
  unknown,
  className,
}: {
  covered: number;
  partial: number;
  unknown: number;
  className?: string;
}) {
  const total = LISTENING_DIMENSIONS.length;
  const pct = (n: number) => `${(n / total) * 100}%`;

  return (
    <div className={cn("min-w-24 space-y-1", className)}>
      <div
        className="flex h-1.5 overflow-hidden rounded-full bg-soft"
        role="img"
        aria-label={`${covered} covered, ${partial} partial, ${unknown} unknown of ${total} dimensions`}
      >
        <div className="h-full bg-success" style={{ width: pct(covered) }} />
        <div className="h-full bg-warning" style={{ width: pct(partial) }} />
      </div>
      <div className="flex gap-1.5 text-micro tabular-nums text-ink-secondary">
        <span>{covered} covered</span>
        {partial > 0 && <span>· {partial} partial</span>}
      </div>
    </div>
  );
}
