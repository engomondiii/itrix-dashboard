import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

/** Open a PoC for a lead (creates the PoC record, moves status). */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { leadId } = await params;
  const body = await req.json().catch(() => ({}));

  // v3: lead PoC endpoint
  const r = await djangoFetch(`/leads/${leadId}/poc/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return djangoJson(r);
}
