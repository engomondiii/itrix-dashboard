import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getJourney } from "@/mocks/journeyDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { leadId } = await params;

  if (!siteConfig.useMocks) {
    // v3: journey monitor read — GET journey/leads/{id}/
    const r = await djangoFetch(`/journey/leads/${leadId}/`);
    return djangoJson(r);
  }

  const journey = getJourney(leadId);
  if (!journey) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(journey);
}
