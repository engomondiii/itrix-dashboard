import Link from "next/link";

import { LeadTierBadge } from "@/components/leads/LeadTierBadge";
import { LeadScoreBadge } from "@/components/leads/LeadScoreBadge";
import { LeadOwnerAvatar } from "@/components/leads/LeadOwnerAvatar";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { PipelineCardData } from "@/types/pipeline";

export function PipelineCard({ card }: { card: PipelineCardData }) {
  return (
    <Link
      href={ROUTES.lead(card.id)}
      className={cn(
        "relative block rounded-md border border-line bg-surface p-3 shadow-1 transition-colors hover:border-sapphire-300",
        card.overdue && "pl-4",
      )}
    >
      {card.overdue && (
        <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-error" />
      )}
      <div className="flex items-start justify-between gap-2">
        <span className="text-sec font-medium text-ink-900">
          {card.company ?? "—"}
        </span>
        <LeadTierBadge tier={card.tier} />
      </div>
      <div className="mt-1 text-caption text-ink-500">
        {card.primaryPain} · {card.productRoute}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <LeadOwnerAvatar owner={card.owner} />
        <LeadScoreBadge score={card.score} tier={card.tier} />
      </div>
    </Link>
  );
}
