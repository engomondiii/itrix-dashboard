import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ pocId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { pocId } = await params;
  const r = await djangoFetch(`/pocs/${pocId}/`);
  return djangoJson(r);
}

/** Update a PoC's status. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pocId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { pocId } = await params;
  const body = await req.json().catch(() => ({}));

  // v3: PoC update endpoint
  const r = await djangoFetch(`/pocs/${pocId}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
