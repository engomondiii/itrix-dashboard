import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getNextAction } from "@/mocks/cockpitDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { leadId } = await params;

  if (!siteConfig.useMocks) {
    // v3: next best action — GET cockpit/leads/{id}/next-action/
    const r = await djangoFetch(`/cockpit/leads/${leadId}/next-action/`);
    return djangoJson(r);
  }

  const na = getNextAction(leadId);
  if (!na) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(na);
}
