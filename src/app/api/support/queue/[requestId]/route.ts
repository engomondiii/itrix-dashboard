import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { getSupportRequest } from "@/mocks/supportDb";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ requestId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { requestId } = await params;

  if (!siteConfig.useMocks) {
    // v6: GET support/queue/{id}/
    const r = await djangoFetch(`/support/queue/${requestId}/`);
    return djangoJson(r);
  }

  const request = getSupportRequest(requestId);
  if (!request) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(request);
}
