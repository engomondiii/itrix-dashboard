import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { updatePoCKpi } from "@/mocks/dealsDb";

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

  if (!siteConfig.useMocks) {
    // v3: PoC KPI update endpoint
    const r = await djangoFetch(`/pocs/${pocId}/kpis/${kpiId}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  const poc = updatePoCKpi(pocId, kpiId, {
    metric: body?.metric,
    baseline: body?.baseline,
    target: body?.target,
    result: body?.result,
  });
  if (!poc) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(poc);
}
