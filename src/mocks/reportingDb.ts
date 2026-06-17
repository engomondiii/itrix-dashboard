import "server-only";

import { bottlenecks, funnel, overview, responseTime } from "@/mocks/analyticsDb";
import type { MonthlyReport } from "@/types/report";

function buildReport(month: string): MonthlyReport {
  const o = overview();
  const f = funnel();
  const rt = responseTime();
  const bn = bottlenecks();

  return {
    id: `rpt-${month}`,
    month,
    generatedAt: new Date().toISOString(),
    sections: [
      {
        id: "s1",
        title: "Funnel summary",
        body: `${o.newLeads} new leads this period. Tier 1 (Strategic): ${o.tier1Count}; Tier 2 (Qualified): ${o.tier2Count}. ${o.overdueFollowUps} follow-ups are past SLA.`,
      },
      {
        id: "s2",
        title: "Conversion by stage",
        body: f.map((s) => `${s.stage}: ${s.count}`).join(" → "),
      },
      {
        id: "s3",
        title: "SLA compliance",
        body: `${Math.round(rt.complianceRate * 100)}% of Tier 1/2 leads within SLA. Tier 1 breaches: ${rt.tier1Breaches}; Tier 2 breaches: ${rt.tier2Breaches}.`,
      },
      {
        id: "s4",
        title: "Top bottleneck themes",
        body: bn
          .slice(0, 3)
          .map((b) => `${b.phrase} (${b.count})`)
          .join("; "),
      },
      {
        id: "s5",
        title: "Action items for next period",
        body: "Clear overdue Tier 1/2 follow-ups; move NDA-stage leads into paid evaluation; refresh Knowledge Core for the top bottleneck themes.",
      },
    ],
  };
}

export function listReports(): MonthlyReport[] {
  return [buildReport("2026-06"), buildReport("2026-05")];
}

export function getReport(id: string): MonthlyReport | null {
  return listReports().find((r) => r.id === id) ?? null;
}
