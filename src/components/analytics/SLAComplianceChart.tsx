import { DataCard } from "@/components/ui/data-card";
import type { ResponseTimeMetrics } from "@/types/analytics";

export function SLAComplianceChart({ metrics }: { metrics: ResponseTimeMetrics }) {
  const pct = Math.round(metrics.complianceRate * 100);
  const breaches = metrics.tier1Breaches + metrics.tier2Breaches;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <DataCard
        label="SLA compliance"
        value={`${pct}%`}
        valueClassName={pct < 80 ? "text-warning" : "text-success"}
      />
      <DataCard label="Tier 1 avg" value={`${metrics.tier1AvgHours}h`} hint="target < 24h" />
      <DataCard label="Tier 2 avg" value={`${metrics.tier2AvgHours}h`} hint="target < 48h" />
      <DataCard
        label="Breaches"
        value={breaches}
        valueClassName={breaches > 0 ? "text-error" : undefined}
      />
    </div>
  );
}
