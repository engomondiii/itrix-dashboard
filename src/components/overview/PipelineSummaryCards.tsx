import { DataCard } from "@/components/ui/data-card";
import type { OverviewMetrics } from "@/types/analytics";

export function PipelineSummaryCards({ m }: { m: OverviewMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <DataCard label="New leads" value={m.newLeads} />
      <DataCard label="Tier 1" value={m.tier1Count} valueClassName="text-sapphire-600" />
      <DataCard label="Tier 2" value={m.tier2Count} />
      <DataCard
        label="Overdue SLA"
        value={m.overdueFollowUps}
        valueClassName={m.overdueFollowUps > 0 ? "text-error" : undefined}
      />
    </div>
  );
}
