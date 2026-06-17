import { Badge } from "@/components/ui/badge";
import type { Tier } from "@/constants/tiers";

const VARIANT: Record<Tier, "tier-1" | "tier-2" | "tier-3" | "tier-4"> = {
  1: "tier-1",
  2: "tier-2",
  3: "tier-3",
  4: "tier-4",
};

export function LeadTierBadge({ tier }: { tier: Tier }) {
  return <Badge variant={VARIANT[tier]}>{`T${tier}`}</Badge>;
}
