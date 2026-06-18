import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getEvaluation, setEvaluationStatus } from "@/mocks/dealsDb";
import { EVALUATION_STATUSES, type EvaluationStatus } from "@/types/evaluation";

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
    return djangoJson(r);
  }
  const ev = getEvaluation(evaluationId);
  if (!ev) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(ev);
}

/** Update an evaluation's status. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ evaluationId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { evaluationId } = await params;
  const body = await req.json().catch(() => ({}));

  if (!siteConfig.useMocks) {
    // v3: evaluation update endpoint
    const r = await djangoFetch(`/evaluations/${evaluationId}/`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return djangoJson(r);
  }

  const status = String(body?.status ?? "");
  if (!(EVALUATION_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ detail: "Invalid status" }, { status: 400 });
  }
  const ev = setEvaluationStatus(evaluationId, status as EvaluationStatus, user.name);
  if (!ev) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(ev);
}
