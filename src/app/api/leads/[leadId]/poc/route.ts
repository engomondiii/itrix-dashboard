import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { createPoCForLead } from "@/mocks/dealsDb";
import { getLead, markPoC } from "@/mocks/leadsDb";

/** Open a PoC for a lead (creates the PoC record, moves status). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { leadId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: lead PoC endpoint
    const r = await djangoFetch(`/leads/${leadId}/poc/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const lead = getLead(leadId);
  if (!lead) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  createPoCForLead(lead, {
    scope: typeof body?.scope === "string" ? body.scope : undefined,
    durationWeeks: Number(body?.durationWeeks) || undefined,
    successMetrics: typeof body?.successMetrics === "string" ? body.successMetrics : undefined,
    startDate: typeof body?.startDate === "string" ? body.startDate : undefined,
  });
  return NextResponse.json(markPoC(leadId, user.name));
}
