import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { getLead } from "@/mocks/leadsDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { leadId } = await params;

  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/leads/${leadId}/`);
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const lead = getLead(leadId);
  if (!lead) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}
