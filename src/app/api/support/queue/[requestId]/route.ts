import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { requestId } = await params;

  // Shipped name: the team-plane queue lives under cockpit/.
  const r = await djangoFetch(`/cockpit/support/queue/${requestId}/`);
  return djangoJson(r);
}
