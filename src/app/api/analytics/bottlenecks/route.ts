import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { bottlenecks, industries } from "@/mocks/analyticsDb";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    // v3: single /analytics/?days=30 endpoint; extract the patterns + industry blocks.
    const r = await djangoFetch("/analytics/?days=30");
    if (!r.ok) return NextResponse.json(await r.json(), { status: r.status });
    const d = await r.json();
    return NextResponse.json({
      bottlenecks: d.patterns ?? [],
      industries: d.industry_breakdown ?? [],
    });
  }
  return NextResponse.json({ bottlenecks: bottlenecks(), industries: industries() });
}
