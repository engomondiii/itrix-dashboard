import type { Tier } from "@/constants/tiers";
import { cn } from "@/lib/utils";

const COLOR: Record<Tier, string> = {
  1: "text-tier-1",
  2: "text-tier-2",
  3: "text-tier-3",
  4: "text-tier-4",
};

/** Score rendered in its tier color (Atelier table convention). */
export function LeadScoreBadge({ score, tier }: { score: number; tier: Tier }) {
  return (
    <span className={cn("font-semibold tabular-nums", COLOR[tier])}>{score}</span>
  );
}
