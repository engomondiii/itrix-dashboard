import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ evaluationId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { evaluationId } = await params;
  const r = await djangoFetch(`/evaluations/${evaluationId}/`);
  return djangoJson(r);
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

  // v3: evaluation update endpoint
  const r = await djangoFetch(`/evaluations/${evaluationId}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
