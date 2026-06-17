import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { getReport } from "@/mocks/reportingDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { reportId } = await params;
  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/reporting/${reportId}/`);
    return NextResponse.json(await r.json(), { status: r.status });
  }
  const report = getReport(reportId);
  if (!report) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}
