import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

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

  // v3: PoC add-risk endpoint
  const r = await djangoFetch(`/pocs/${pocId}/risks/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
