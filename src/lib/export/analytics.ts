import { downloadCsv } from "@/lib/export/csv";
import type {
  BottleneckPattern,
  FunnelStage,
  IndustryBreakdown,
  OverviewMetrics,
  ResponseTimeMetrics,
} from "@/types/analytics";

export function exportFunnelCsv(stages: FunnelStage[]) {
  downloadCsv(
    "itrix-funnel.csv",
    ["Stage", "Count", "Conversion %"],
    stages.map((s) => [
      s.stage,
      s.count,
      s.conversion != null ? Math.round(s.conversion * 100) : "",
    ]),
  );
}

export function exportResponseTimeCsv(m: ResponseTimeMetrics) {
  downloadCsv(
    "itrix-response-time.csv",
    ["Metric", "Value"],
    [
      ["Tier 1 avg hours", m.tier1AvgHours],
      ["Tier 2 avg hours", m.tier2AvgHours],
      ["Tier 1 breaches", m.tier1Breaches],
      ["Tier 2 breaches", m.tier2Breaches],
      ["Compliance rate %", Math.round(m.complianceRate * 100)],
    ],
  );
}

export function exportBottlenecksCsv(
  bottlenecks: BottleneckPattern[],
  industries: IndustryBreakdown[],
) {
  downloadCsv(
    "itrix-bottlenecks.csv",
    ["Type", "Label", "Count"],
    [
      ...bottlenecks.map((b) => ["Bottleneck", b.phrase, b.count] as const),
      ...industries.map((i) => ["Industry", i.industry, i.count] as const),
    ].map((r) => [...r]),
  );
}

export function exportLeadQualityCsv(overview: OverviewMetrics) {
  const tiers = Object.entries(overview.tierDistribution);
  const routes = Object.entries(overview.routeDistribution);
  downloadCsv(
    "itrix-lead-quality.csv",
    ["Dimension", "Bucket", "Count"],
    [
      ...tiers.map(([t, n]) => ["Tier", `Tier ${t}`, n] as const),
      ...routes.map(([r, n]) => ["Route", r, n] as const),
    ].map((r) => [...r]),
  );
}
