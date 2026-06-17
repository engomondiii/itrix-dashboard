import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { funnel } from "@/mocks/analyticsDb";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    // v3: single /analytics/?days=30 endpoint; extract the funnel block.
    const r = await djangoFetch("/analytics/?days=30");
    if (!r.ok) return NextResponse.json(await r.json(), { status: r.status });
    const d = await r.json();
    return NextResponse.json({ stages: d.funnel ?? [] });
  }
  return NextResponse.json({ stages: funnel() });
}
