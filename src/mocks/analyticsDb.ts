import "server-only";

import { MOCK_LEADS } from "@/mocks/leads";
import { LEAD_STATUSES } from "@/constants/statuses";
import { PRODUCT_ROUTES } from "@/constants/products";
import { TIERS } from "@/constants/tiers";
import { slaState, slaDeadline } from "@/lib/sla/slaCalculator";
import { getSlaConfig } from "@/mocks/settingsDb";
import type {
  BottleneckPattern,
  FunnelStage,
  IndustryBreakdown,
  OverviewMetrics,
  ResponseTimeMetrics,
} from "@/types/analytics";
import type { ProductRoute } from "@/constants/products";
import type { Tier } from "@/constants/tiers";

const HOUR = 3600_000;
const DAY = 24 * HOUR;

/** Default reporting window, matching the DateRangeControl's default. */
export const DEFAULT_DAYS = 30;

/**
 * Leads submitted within the last `days`. Every analytics function windows on this,
 * so the 7d / 30d / 90d control actually changes the numbers instead of returning
 * the same static data for every range.
 */
function leadsWithin(days: number): typeof MOCK_LEADS {
  const cutoff = Date.now() - Math.max(1, days) * DAY;
  return MOCK_LEADS.filter((l) => +new Date(l.submittedAt) >= cutoff);
}

function overdueCount(rows: typeof MOCK_LEADS): number {
  return rows.filter(
    (l) =>
      l.tier <= 2 &&
      (l.status === "New" || l.status === "Contacted") &&
      slaState(l.submittedAt, l.tier, { hours: getSlaConfig() }) === "breached",
  ).length;
}

export function overview(days: number = DEFAULT_DAYS): OverviewMetrics {
  const rows = leadsWithin(days);

  const tierDistribution = Object.fromEntries(
    TIERS.map((t) => [t, rows.filter((l) => l.tier === t).length]),
  ) as Record<Tier, number>;

  const routeDistribution = Object.fromEntries(
    PRODUCT_ROUTES.map((r) => [r, rows.filter((l) => l.productRoute === r).length]),
  ) as Record<ProductRoute, number>;

  // Submissions per day for the last 7 days (the chart is always a week).
  const now = Date.now();
  const weeklySubmissions = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(now - (6 - i) * DAY);
    const key = day.toISOString().slice(0, 10);
    const count = MOCK_LEADS.filter((l) => l.submittedAt.slice(0, 10) === key).length;
    return { date: key.slice(5), count };
  });

  return {
    newLeads: rows.filter((l) => l.status === "New").length,
    tier1Count: tierDistribution[1],
    tier2Count: tierDistribution[2],
    overdueFollowUps: overdueCount(rows),
    tierDistribution,
    routeDistribution,
    weeklySubmissions,
  };
}

export function funnel(days: number = DEFAULT_DAYS): FunnelStage[] {
  const rows = leadsWithin(days);
  // Count of leads that reached at least each stage (cumulative down the funnel).
  return LEAD_STATUSES.filter((s) => s !== "Closed").map((status, i, arr) => {
    const reachedIdx = (st: string) => LEAD_STATUSES.indexOf(st as never);
    const count = rows.filter(
      (l) => l.status !== "Closed" && reachedIdx(l.status) >= LEAD_STATUSES.indexOf(status),
    ).length;
    const prev =
      i === 0
        ? count
        : rows.filter(
            (l) =>
              l.status !== "Closed" &&
              reachedIdx(l.status) >= LEAD_STATUSES.indexOf(arr[i - 1]),
          ).length;
    return { stage: status, count, conversion: prev ? count / prev : undefined };
  });
}

export function responseTime(days: number = DEFAULT_DAYS): ResponseTimeMetrics {
  const rows = leadsWithin(days);
  const t1 = rows.filter((l) => l.tier === 1);
  const t2 = rows.filter((l) => l.tier === 2);
  const breaches = (rows: typeof MOCK_LEADS) =>
    rows.filter(
      (l) =>
        (l.status === "New" || l.status === "Contacted") &&
        slaState(l.submittedAt, l.tier, { hours: getSlaConfig() }) === "breached",
    ).length;
  // Mock "avg response" = hours from submit to SLA deadline midpoint (illustrative).
  const avg = (rows: typeof MOCK_LEADS) => {
    if (rows.length === 0) return 0;
    const total = rows.reduce((acc, l) => {
      const d = slaDeadline(l.submittedAt, l.tier, getSlaConfig());
      return acc + (d ? (d.getTime() - +new Date(l.submittedAt)) / HOUR / 2 : 0);
    }, 0);
    return Math.round(total / rows.length);
  };
  const total = t1.length + t2.length;
  const breached = breaches(t1) + breaches(t2);
  return {
    tier1AvgHours: avg(t1),
    tier2AvgHours: avg(t2),
    tier1Breaches: breaches(t1),
    tier2Breaches: breaches(t2),
    complianceRate: total ? 1 - breached / total : 1,
  };
}

export function bottlenecks(days: number = DEFAULT_DAYS): BottleneckPattern[] {
  const counts = new Map<string, number>();
  for (const l of leadsWithin(days)) {
    counts.set(l.computeBottleneck, (counts.get(l.computeBottleneck) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count);
}

export function industries(days: number = DEFAULT_DAYS): IndustryBreakdown[] {
  const counts = new Map<string, number>();
  for (const l of leadsWithin(days)) {
    counts.set(l.industry, (counts.get(l.industry) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([industry, count]) => ({ industry, count }))
    .sort((a, b) => b.count - a.count);
}
