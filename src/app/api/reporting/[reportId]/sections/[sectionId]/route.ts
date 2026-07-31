import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ reportId: string; sectionId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { reportId, sectionId } = await params;
  const body = await req.json().catch(() => ({}));

  // v3: report update-section endpoint
  const r = await djangoFetch(`/reporting/${reportId}/sections/${sectionId}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ reportId: string; sectionId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { reportId, sectionId } = await params;

  // v3: report remove-section endpoint
  const r = await djangoFetch(`/reporting/${reportId}/sections/${sectionId}/`, {
    method: "DELETE",
  });
  return djangoJson(r);
}
