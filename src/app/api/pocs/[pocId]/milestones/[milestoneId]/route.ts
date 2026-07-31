import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

/** Update a PoC milestone's status. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ pocId: string; milestoneId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { pocId, milestoneId } = await params;
  const body = await req.json().catch(() => ({}));

  // v3: PoC milestone update endpoint
  const r = await djangoFetch(`/pocs/${pocId}/milestones/${milestoneId}/`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
