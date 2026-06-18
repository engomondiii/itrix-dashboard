import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { addSection } from "@/mocks/reportingDb";

/** Add a section to a report. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { reportId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: report add-section endpoint
    const r = await djangoFetch(`/reporting/${reportId}/sections/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const title = String(body?.title ?? "").trim();
  const text = String(body?.body ?? "");
  if (!title || !text.trim()) {
    return NextResponse.json({ detail: "Invalid section" }, { status: 400 });
  }
  const report = addSection(reportId, { title, body: text });
  if (!report) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}
