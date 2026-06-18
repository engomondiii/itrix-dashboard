import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { updateEvaluationKpi } from "@/mocks/dealsDb";

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

  if (!siteConfig.useMocks) {
    // v3: evaluation KPI update endpoint
    const r = await djangoFetch(`/evaluations/${evaluationId}/kpis/${kpiId}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const ev = updateEvaluationKpi(evaluationId, kpiId, {
    metric: body?.metric,
    target: body?.target,
    result: body?.result,
  });
  if (!ev) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(ev);
}
