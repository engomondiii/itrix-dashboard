"use client";

import Link from "next/link";

import { LeadTierBadge } from "@/components/leads/LeadTierBadge";
import { Spinner } from "@/components/ui/spinner";
import { ROUTES } from "@/constants/routes";
import { formatTimeAgo, leadDisplayName } from "@/lib/formatting";
import { useLeads } from "@/hooks/useLeads";

export function RecentLeadsFeed() {
  const { data, isLoading } = useLeads({
    sort: "submittedAt",
    dir: "desc",
    page: 1,
    pageSize: 8,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border-soft">
      {(data?.results ?? []).map((l) => (
        <li key={l.id}>
          <Link
            href={ROUTES.lead(l.id)}
            className="flex items-center gap-3 py-2 transition-colors hover:text-ink-primary"
          >
            <LeadTierBadge tier={l.tier} />
            <span className="truncate text-sec font-medium text-ink-primary">
              {leadDisplayName(l)}
            </span>
            <span className="ml-auto shrink-0 text-caption text-ink-secondary">
              {formatTimeAgo(l.submittedAt)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
