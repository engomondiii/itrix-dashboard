import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { addPoCRisk } from "@/mocks/dealsDb";
import { RISK_SEVERITIES, type RiskSeverity } from "@/types/poc";

/** Add a risk to a PoC's register. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ pocId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { pocId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: PoC add-risk endpoint
    const r = await djangoFetch(`/pocs/${pocId}/risks/`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  const description = String(body?.description ?? "").trim();
  const severity = String(body?.severity ?? "");
  if (!description || !(RISK_SEVERITIES as readonly string[]).includes(severity)) {
    return NextResponse.json({ detail: "Invalid risk" }, { status: 400 });
  }
  const poc = addPoCRisk(pocId, {
    description,
    severity: severity as RiskSeverity,
    mitigation: body?.mitigation,
  });
  if (!poc) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(poc);
}
