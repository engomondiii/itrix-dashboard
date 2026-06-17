import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch } from "@/lib/server/proxy";
import { getEvaluation } from "@/mocks/dealsDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ evaluationId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { evaluationId } = await params;
  if (!siteConfig.useMocks) {
    const r = await djangoFetch(`/evaluations/${evaluationId}/`);
    return NextResponse.json(await r.json(), { status: r.status });
  }
  const ev = getEvaluation(evaluationId);
  if (!ev) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(ev);
}
