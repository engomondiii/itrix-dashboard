import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

/** Update one KPI on an evaluation (metric / target / result). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ evaluationId: string; kpiId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { evaluationId, kpiId } = await params;
  const body = await req.json().catch(() => ({}));

  // v3: evaluation KPI update endpoint
  const r = await djangoFetch(`/evaluations/${evaluationId}/kpis/${kpiId}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
