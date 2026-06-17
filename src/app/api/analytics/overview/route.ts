import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { overview } from "@/mocks/analyticsDb";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    // v3: ONE endpoint GET /analytics/?days=30 returns all 7 blocks.
    const r = await djangoFetch("/analytics/?days=30");
    if (!r.ok) return NextResponse.json(await r.json(), { status: r.status });
    const d = await r.json();
    // Field names per the analytics serializer — reconcile at cutover.
    return NextResponse.json({
      ...d.overview,
      routeDistribution: d.route_distribution ?? d.overview?.routeDistribution,
      weeklySubmissions: d.submission_trend ?? d.overview?.weeklySubmissions,
    });
  }
  return NextResponse.json(overview());
}
