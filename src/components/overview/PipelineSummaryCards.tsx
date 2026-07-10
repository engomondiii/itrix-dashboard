import Link from "next/link";

import { DataCard } from "@/components/ui/data-card";
import { ROUTES } from "@/constants/routes";
import type { OverviewMetrics } from "@/types/analytics";

/** Each tile is a drill-down — operators expect to click the number and land on the list. */
function TileLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </Link>
  );
}

export function PipelineSummaryCards({ m }: { m: OverviewMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <TileLink href={ROUTES.leads}>
        <DataCard label="New leads" value={m.newLeads} />
      </TileLink>
      <TileLink href={ROUTES.leadsTier(1)}>
        <DataCard label="Tier 1" value={m.tier1Count} valueClassName="text-sapphire-600" />
      </TileLink>
      <TileLink href={ROUTES.leadsTier(2)}>
        <DataCard label="Tier 2" value={m.tier2Count} />
      </TileLink>
      <TileLink href={ROUTES.followUpOverdue}>
        <DataCard
          label="Overdue SLA"
          value={m.overdueFollowUps}
          valueClassName={m.overdueFollowUps > 0 ? "text-error" : undefined}
        />
      </TileLink>
    </div>
  );
}
