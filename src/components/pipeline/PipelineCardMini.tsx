import Link from "next/link";

import { LeadTierBadge } from "@/components/leads/LeadTierBadge";
import { ROUTES } from "@/constants/routes";
import type { PipelineCardData } from "@/types/pipeline";

/** Compact pipeline card for dense lists (e.g. overview snapshots). */
export function PipelineCardMini({ card }: { card: PipelineCardData }) {
  return (
    <Link
      href={ROUTES.lead(card.id)}
      className="flex items-center justify-between gap-2 rounded-md border border-line bg-surface px-2.5 py-1.5 text-sec transition-colors hover:border-sapphire-300"
    >
      <span className="truncate font-medium text-ink-800">{card.company ?? "—"}</span>
      <LeadTierBadge tier={card.tier} />
    </Link>
  );
}
