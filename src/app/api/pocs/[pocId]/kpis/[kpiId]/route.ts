import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

/** Update one KPI on a PoC. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pocId: string; kpiId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { pocId, kpiId } = await params;
  const body = await req.json().catch(() => ({}));

  // v3: PoC KPI update endpoint
  const r = await djangoFetch(`/pocs/${pocId}/kpis/${kpiId}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
