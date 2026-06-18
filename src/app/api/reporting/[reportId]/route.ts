import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { deleteReport, getReport } from "@/mocks/reportingDb";

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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { reportId } = await params;

  if (!siteConfig.useMocks) {
    // v3: report delete endpoint
    const r = await djangoFetch(`/reporting/${reportId}/`, { method: "DELETE" });
    return NextResponse.json(await r.json().catch(() => ({})), { status: r.status });
  }

  if (!deleteReport(reportId)) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
