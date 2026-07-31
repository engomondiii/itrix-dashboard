import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { leadId } = await params;

  // v3: next best action — GET cockpit/leads/{id}/next-action/
  const r = await djangoFetch(`/cockpit/leads/${leadId}/next-action/`);
  return djangoJson(r);
}
