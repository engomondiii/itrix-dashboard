import "server-only";

import { bottlenecks, funnel, overview, responseTime } from "@/mocks/analyticsDb";
import type { MonthlyReport, ReportSection } from "@/types/report";

/** Build the standard auto-generated sections from current analytics. */
function buildSections(): ReportSection[] {
  const o = overview();
  const f = funnel();
  const rt = responseTime();
  const bn = bottlenecks();

  return [
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
  ];
}

function buildReport(id: string, month: string): MonthlyReport {
  return {
    id,
    month,
    generatedAt: new Date().toISOString(),
    sections: buildSections(),
  };
}

let store: MonthlyReport[] | null = null;
function db(): MonthlyReport[] {
  if (!store) {
    store = [
      buildReport("rpt-2026-06", "2026-06"),
      buildReport("rpt-2026-05", "2026-05"),
    ];
  }
  return store;
}

export function listReports(): MonthlyReport[] {
  return db();
}

export function getReport(id: string): MonthlyReport | null {
  return db().find((r) => r.id === id) ?? null;
}

let seq = 0;
export function generateReport(month?: string): MonthlyReport {
  const m =
    month && /^\d{4}-\d{2}$/.test(month)
      ? month
      : new Date().toISOString().slice(0, 7);
  const report = buildReport(`rpt-${m}-${(seq += 1)}`, m);
  db().unshift(report);
  return report;
}

export function deleteReport(id: string): boolean {
  const arr = db();
  const i = arr.findIndex((r) => r.id === id);
  if (i === -1) return false;
  arr.splice(i, 1);
  return true;
}

let sectionSeq = 0;
export function addSection(
  reportId: string,
  input: { title: string; body: string },
): MonthlyReport | null {
  const r = db().find((x) => x.id === reportId);
  if (!r) return null;
  r.sections.push({
    id: `sec-new-${(sectionSeq += 1)}`,
    title: input.title.trim(),
    body: input.body,
  });
  return r;
}

export function updateSection(
  reportId: string,
  sectionId: string,
  patch: { title?: string; body?: string },
): MonthlyReport | null {
  const r = db().find((x) => x.id === reportId);
  if (!r) return null;
  const s = r.sections.find((x) => x.id === sectionId);
  if (!s) return null;
  if (patch.title != null) s.title = patch.title.trim();
  if (patch.body != null) s.body = patch.body;
  return r;
}

export function removeSection(
  reportId: string,
  sectionId: string,
): MonthlyReport | null {
  const r = db().find((x) => x.id === reportId);
  if (!r) return null;
  const i = r.sections.findIndex((x) => x.id === sectionId);
  if (i === -1) return null;
  r.sections.splice(i, 1);
  return r;
}
