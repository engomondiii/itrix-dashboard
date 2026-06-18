import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { createEvaluationForLead } from "@/mocks/dealsDb";
import { getLead, markEvaluation } from "@/mocks/leadsDb";

/** Open a paid evaluation for a lead (creates the eval record, moves status). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { leadId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: lead paid-evaluation endpoint
    const r = await djangoFetch(`/leads/${leadId}/paid-eval/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  const lead = getLead(leadId);
  if (!lead) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  createEvaluationForLead(lead, {
    scope: typeof body?.scope === "string" ? body.scope : undefined,
    fee: typeof body?.fee === "string" ? body.fee : undefined,
    timeline: typeof body?.timeline === "string" ? body.timeline : undefined,
  });
  return NextResponse.json(markEvaluation(leadId, user.name));
}
