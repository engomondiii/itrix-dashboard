import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { responseTime } from "@/mocks/analyticsDb";

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const days = new URL(req.url).searchParams.get("days") || "30";
  if (!siteConfig.useMocks) {
    // v3: single /analytics/?days=N endpoint; extract the sla_compliance block.
    const r = await djangoFetch(`/analytics/?days=${encodeURIComponent(days)}`);
    if (!r.ok) return djangoJson(r);
    const d = await r.json();
    return NextResponse.json(d.sla_compliance ?? {});
  }
  return NextResponse.json(responseTime(Number(days)));
}
