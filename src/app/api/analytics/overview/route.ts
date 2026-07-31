import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const days = new URL(req.url).searchParams.get("days") || "30";
  // v3: ONE endpoint GET /analytics/?days=N returns all 7 blocks.
  const r = await djangoFetch(`/analytics/?days=${encodeURIComponent(days)}`);
  if (!r.ok) return djangoJson(r);
  const d = await r.json();
  // Field names per the analytics serializer — reconcile at cutover.
  return NextResponse.json({
    ...d.overview,
    routeDistribution: d.route_distribution ?? d.overview?.routeDistribution,
    weeklySubmissions: d.submission_trend ?? d.overview?.weeklySubmissions,
  });
}
