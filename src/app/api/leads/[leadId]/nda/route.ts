import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { markNda } from "@/mocks/leadsDb";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { leadId } = await params;

  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/leads/${leadId}/nda/`, { method: "POST" });
    return djangoJson(r);
  }

  const lead = markNda(leadId, user.name);
  if (!lead) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}
