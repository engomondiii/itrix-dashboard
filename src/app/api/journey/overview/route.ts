import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  // Journey-state distribution across all leads — GET journey/overview/
  const r = await djangoFetch(`/journey/overview/`);
  return djangoJson(r);
}
