import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { escalate } from "@/mocks/leadsDb";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { leadId } = await params;

  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/leads/${leadId}/escalate/`, { method: "POST" });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const lead = escalate(leadId, user.name);
  if (!lead) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}
