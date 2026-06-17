import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { listEvaluations } from "@/mocks/dealsDb";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    const r = await djangoFetch("/evaluations/");
    return NextResponse.json(await r.json(), { status: r.status });
  }
  const results = listEvaluations();
  return NextResponse.json({ results, count: results.length });
}
