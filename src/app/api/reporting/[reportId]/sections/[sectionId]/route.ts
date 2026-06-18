import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { removeSection, updateSection } from "@/mocks/reportingDb";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ reportId: string; sectionId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { reportId, sectionId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: report update-section endpoint
    const r = await djangoFetch(`/reporting/${reportId}/sections/${sectionId}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  const report = updateSection(reportId, sectionId, {
    title: body?.title,
    body: body?.body,
  });
  if (!report) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ reportId: string; sectionId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { reportId, sectionId } = await params;

  if (!siteConfig.useMocks) {
    // v3: report remove-section endpoint
    const r = await djangoFetch(`/reporting/${reportId}/sections/${sectionId}/`, {
      method: "DELETE",
    });
    return djangoJson(r);
  }

  const report = removeSection(reportId, sectionId);
  if (!report) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(report);
}
