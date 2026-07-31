import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pocId: string; riskId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { pocId, riskId } = await params;
  const body = await req.json().catch(() => ({}));

  // v3: PoC update-risk endpoint
  const r = await djangoFetch(`/pocs/${pocId}/risks/${riskId}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ pocId: string; riskId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { pocId, riskId } = await params;

  // v3: PoC remove-risk endpoint
  const r = await djangoFetch(`/pocs/${pocId}/risks/${riskId}/`, {
    method: "DELETE",
  });
  return djangoJson(r);
}
