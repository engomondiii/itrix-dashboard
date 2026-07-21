import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { LeadTierBadge } from "@/components/leads/LeadTierBadge";
import { LeadScoreBadge } from "@/components/leads/LeadScoreBadge";
import { LeadSpecialRightsBadge } from "@/components/leads/LeadSpecialRightsBadge";
import { ROUTES } from "@/constants/routes";
import { leadDisplayName } from "@/lib/formatting";
import type { Lead } from "@/types/lead";

export function LeadDetailHeader({ lead }: { lead: Lead }) {
  return (
    <div className="mb-6">
      <Link
        href={ROUTES.leads}
        className="inline-flex items-center gap-1 text-caption text-ink-secondary hover:text-ink-secondary"
      >
        <ArrowLeftIcon className="size-3.5" />
        All leads
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-page-title font-semibold text-ink-primary">
          {leadDisplayName(lead)}
        </h1>
        <LeadTierBadge tier={lead.tier} />
        <span className="text-sec text-ink-secondary">
          Score <LeadScoreBadge score={lead.score} tier={lead.tier} />
        </span>
        <LeadSpecialRightsBadge rights={lead.specialRights} />
      </div>
      <p className="mt-1 text-sec text-ink-secondary">
        {lead.visitorName ? `${lead.visitorName} · ` : ""}
        {lead.role} · {lead.industry}
      </p>
    </div>
  );
}
