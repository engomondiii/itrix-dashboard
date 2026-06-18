import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { removePoCRisk, updatePoCRisk } from "@/mocks/dealsDb";
import { RISK_SEVERITIES, type RiskSeverity } from "@/types/poc";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pocId: string; riskId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { pocId, riskId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: PoC update-risk endpoint
    const r = await djangoFetch(`/pocs/${pocId}/risks/${riskId}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const rawSeverity = body?.severity != null ? String(body.severity) : undefined;
  const severity =
    rawSeverity && (RISK_SEVERITIES as readonly string[]).includes(rawSeverity)
      ? (rawSeverity as RiskSeverity)
      : undefined;
  const poc = updatePoCRisk(pocId, riskId, {
    description: body?.description,
    severity,
    mitigation: body?.mitigation,
  });
  if (!poc) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(poc);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ pocId: string; riskId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { pocId, riskId } = await params;

  if (!siteConfig.useMocks) {
    // v3: PoC remove-risk endpoint
    const r = await djangoFetch(`/pocs/${pocId}/risks/${riskId}/`, {
      method: "DELETE",
    });
    return NextResponse.json(await r.json(), { status: r.status });
  }

  const poc = removePoCRisk(pocId, riskId);
  if (!poc) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(poc);
}
