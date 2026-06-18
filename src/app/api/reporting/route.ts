import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { generateReport, listReports } from "@/mocks/reportingDb";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  if (!siteConfig.useMocks) {
    const r = await djangoFetch("/reporting/");
    return NextResponse.json(await r.json(), { status: r.status });
  }
  const results = listReports();
  return NextResponse.json({ results, count: results.length });
}

/** Generate a new monthly report. */
export async function POST(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: report generate endpoint
    const r = await djangoFetch("/reporting/generate/", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const month = typeof body?.month === "string" ? body.month : undefined;
  return NextResponse.json(generateReport(month), { status: 201 });
}
