"use client";

import Link from "next/link";
import { CheckIcon, ChevronsRightIcon } from "lucide-react";

import { LeadOwnerAvatar } from "@/components/leads/LeadOwnerAvatar";
import { LeadScoreBadge } from "@/components/leads/LeadScoreBadge";
import { LeadTierBadge } from "@/components/leads/LeadTierBadge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LEAD_STATUSES, type LeadStatus } from "@/constants/statuses";
import { ROUTES } from "@/constants/routes";
import { useMoveLead } from "@/hooks/usePipeline";
import { leadDisplayName } from "@/lib/formatting";
import { cn } from "@/lib/utils";
import type { PipelineCardData } from "@/types/pipeline";

export function PipelineCard({
  card,
  currentStatus,
}: {
  card: PipelineCardData;
  currentStatus: LeadStatus;
}) {
  const move = useMoveLead();

  return (
    <div
      className={cn(
        "relative rounded-md border border-border-soft bg-surface p-3 shadow-1 transition-colors hover:border-signature-soft",
        card.overdue && "pl-4",
      )}
    >
      {card.overdue && (
        <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-error" />
      )}
      {/* Stretched link: clicks on non-interactive areas open the lead. */}
      <Link
        href={ROUTES.lead(card.id)}
        aria-label={`Open ${leadDisplayName(card)}`}
        className="absolute inset-0 rounded-md"
      />
      <div className="pointer-events-none relative">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sec font-medium text-ink-primary">
            {leadDisplayName(card)}
          </span>
          <LeadTierBadge tier={card.tier} />
        </div>
        <div className="mt-1 text-caption text-ink-secondary">
          {[card.primaryPain, card.productRoute].filter(Boolean).join(" · ") || "—"}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <LeadOwnerAvatar owner={card.owner} />
          <div className="flex items-center gap-1.5">
            <LeadScoreBadge score={card.score} tier={card.tier} />
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Move to stage"
                className="pointer-events-auto inline-flex size-6 items-center justify-center rounded-md text-ink-secondary outline-none hover:bg-muted hover:text-ink-secondary focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ChevronsRightIcon className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="pointer-events-auto">
                {LEAD_STATUSES.map((s) => (
                  <DropdownMenuItem
                    key={s}
                    disabled={s === currentStatus || move.isPending}
                    onClick={() => move.mutate({ leadId: card.id, status: s })}
                  >
                    {s}
                    {s === currentStatus && <CheckIcon className="ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
