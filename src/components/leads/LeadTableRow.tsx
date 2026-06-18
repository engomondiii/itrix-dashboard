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
import { formatDate } from "@/lib/formatting";
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
  return (
    <TableRow data-selected={selected} className="data-[selected=true]:bg-sapphire-100">
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`Select ${lead.company ?? lead.id}`}
        />
      </TableCell>
      <TableCell>
        <Link
          href={ROUTES.lead(lead.id)}
          className="font-medium text-ink-900 hover:text-sapphire-600"
        >
          {lead.company ?? "—"}
        </Link>
        <div className="text-caption text-ink-400">{lead.visitorName ?? lead.role}</div>
      </TableCell>
      <TableCell className="hidden text-ink-500 lg:table-cell">{lead.industry}</TableCell>
      <TableCell className="hidden md:table-cell">
        <LeadProductRouteBadge route={lead.productRoute} />
      </TableCell>
      <TableCell className="hidden text-ink-500 xl:table-cell">{lead.primaryPain}</TableCell>
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
      <TableCell className="hidden text-right text-caption tabular-nums text-ink-400 sm:table-cell">
        {formatDate(lead.submittedAt)}
      </TableCell>
    </TableRow>
  );
}
