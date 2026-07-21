import { Badge } from "@/components/ui/badge";
import {
  COVERAGE_STATUS_LABEL,
  DIMENSION_DESCRIPTION,
  DIMENSION_LABEL,
  OPPORTUNISTIC_DIMENSIONS,
  type CoverageStatus,
} from "@/constants/listeningDimensions";
import type { CoverageEntry } from "@/types/thread";

const STATUS_INTENT: Record<CoverageStatus, "success" | "warning" | "neutral"> = {
  covered: "success",
  partial: "warning",
  unknown: "neutral",
};

/**
 * The ten listening dimensions and where each one stands.
 *
 * TWO DIMENSIONS ARE MARKED "on signal only". `strategic_ambition` is raised
 * only when the visitor's own language opens the door, and
 * `confidentiality_sensitivity` is respected rather than probed — pre-NDA
 * discipline holds. An `unknown` on either is normal and is NOT a gap the loop
 * failed to close, so they are labelled rather than left to look like a
 * shortfall an operator should chase.
 *
 * INTERNAL-ONLY. `coverage_map` is on the client-plane deny-list; a visitor is
 * never shown how much of them we think we have gathered.
 */
export function CoverageMap({ entries }: { entries: CoverageEntry[] }) {
  return (
    <ul className="space-y-1.5">
      {entries.map((entry) => {
        const opportunistic = OPPORTUNISTIC_DIMENSIONS.has(entry.dimension);
        return (
          <li
            key={entry.dimension}
            className="flex items-start justify-between gap-3 border-b border-border-soft pb-1.5 last:border-0"
          >
            <span className="min-w-0">
              <span className="text-sec font-medium text-ink-primary">
                {DIMENSION_LABEL[entry.dimension]}
              </span>
              {opportunistic && (
                <span className="ml-1.5 text-micro text-ink-secondary">(on signal only)</span>
              )}
              <span className="block text-micro text-ink-secondary">
                {DIMENSION_DESCRIPTION[entry.dimension]}
              </span>
            </span>
            <Badge variant={STATUS_INTENT[entry.status]}>
              {COVERAGE_STATUS_LABEL[entry.status]}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
