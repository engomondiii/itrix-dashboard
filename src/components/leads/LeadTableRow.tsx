"use client";

import Link from "next/link";

import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { LeadTierBadge } from "@/components/leads/LeadTierBadge";
import { LeadScoreBadge } from "@/components/leads/LeadScoreBadge";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { LeadProductRouteBadge } from "@/components/leads/LeadProductRouteBadge";
import { LeadOwnerAvatar } from "@/components/leads/LeadOwnerAvatar";
import { ROUTES } from "@/constants/routes";
import { formatDate, leadDisplayName, leadSubtitle } from "@/lib/formatting";
import type { LeadListItem } from "@/types/lead";

export function LeadTableRow({
  lead,
  selected,
  onToggle,
}: {
  lead: LeadListItem;
  selected: boolean;
  onToggle: () => void;
}) {
  // A lead from an anonymous review has no company or name — never render an empty,
  // unclickable link. `leadDisplayName` always yields something to click.
  const name = leadDisplayName(lead);
  const subtitle = leadSubtitle(lead);
  const anonymous = !lead.company?.trim() && !lead.visitorName?.trim();

  return (
    <TableRow data-selected={selected} className="data-[selected=true]:bg-tint">
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`Select ${name}`}
        />
      </TableCell>
      <TableCell>
        <Link
          href={ROUTES.lead(lead.id)}
          className={
            anonymous
              ? "font-medium text-ink-secondary italic hover:text-ink-primary"
              : "font-medium text-ink-primary hover:text-ink-primary"
          }
        >
          {name}
        </Link>
        {subtitle && <div className="text-caption text-ink-secondary">{subtitle}</div>}
      </TableCell>
      <TableCell className="hidden text-ink-secondary lg:table-cell">{lead.industry}</TableCell>
      <TableCell className="hidden md:table-cell">
        <LeadProductRouteBadge route={lead.productRoute} />
      </TableCell>
      <TableCell className="hidden text-ink-secondary xl:table-cell">{lead.primaryPain}</TableCell>
      <TableCell>
        <LeadTierBadge tier={lead.tier} />
      </TableCell>
      <TableCell className="text-right">
        <LeadScoreBadge score={lead.score} tier={lead.tier} />
      </TableCell>
      <TableCell>
        <LeadStatusBadge status={lead.status} />
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <LeadOwnerAvatar owner={lead.owner} />
      </TableCell>
      <TableCell className="hidden text-right text-caption tabular-nums text-ink-secondary sm:table-cell">
        {formatDate(lead.submittedAt)}
      </TableCell>
    </TableRow>
  );
}
