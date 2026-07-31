import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { reportId } = await params;
  const r = await djangoFetch(`/reporting/${reportId}/`);
  return djangoJson(r);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ reportId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { reportId } = await params;

  // v3: report delete endpoint
  const r = await djangoFetch(`/reporting/${reportId}/`, { method: "DELETE" });
  return NextResponse.json(await r.json().catch(() => ({})), { status: r.status });
}
