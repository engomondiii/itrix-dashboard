import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getPitchAnalytics } from "@/mocks/cockpitDb";

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);

  if (!siteConfig.useMocks) {
    // v3: pitch analytics — GET analytics/pitch/
    const r = await djangoFetch(`/analytics/pitch/?${searchParams}`);
    return djangoJson(r);
  }

  const days = Number(searchParams.get("days") ?? 30);
  return NextResponse.json(getPitchAnalytics(Number.isFinite(days) ? days : 30));
}
