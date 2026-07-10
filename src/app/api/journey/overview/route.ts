import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getStateDistribution } from "@/mocks/journeyDb";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (!siteConfig.useMocks) {
    // Journey-state distribution across all leads — GET journey/overview/
    const r = await djangoFetch(`/journey/overview/`);
    return djangoJson(r);
  }

  return NextResponse.json(getStateDistribution());
}
