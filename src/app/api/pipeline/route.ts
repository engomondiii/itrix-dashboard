import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { MOCK_LEADS } from "@/mocks/leads";
import { LEAD_STATUSES } from "@/constants/statuses";
import { slaState } from "@/lib/sla/slaCalculator";
import { getSlaConfig } from "@/mocks/settingsDb";
import type { Lead } from "@/types/lead";
import type { PipelineBoard, PipelineCardData, PipelineStage } from "@/types/pipeline";

function isOverdue(l: Lead): boolean {
  if (l.tier > 2) return false;
  if (l.status !== "New" && l.status !== "Contacted") return false;
  return slaState(l.submittedAt, l.tier, { hours: getSlaConfig() }) === "breached";
}

function toCard(l: Lead): PipelineCardData {
  return {
    id: l.id,
    visitorName: l.visitorName,
    company: l.company,
    industry: l.industry,
    role: l.role,
    productRoute: l.productRoute,
    commercialPath: l.commercialPath,
    primaryPain: l.primaryPain,
    score: l.score,
    tier: l.tier,
    status: l.status,
    owner: l.owner,
    specialRights: l.specialRights,
    submittedAt: l.submittedAt,
    overdue: isOverdue(l),
  };
}

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (!siteConfig.useMocks) {
    const r = await djangoFetch("/pipeline/");
    return djangoJson(r);
  }

  const stages: PipelineStage[] = LEAD_STATUSES.map((status) => {
    const leads = MOCK_LEADS.filter((l) => l.status === status).map(toCard);
    return { status, count: leads.length, leads };
  });

  const board: PipelineBoard = { stages };
  return NextResponse.json(board);
}
