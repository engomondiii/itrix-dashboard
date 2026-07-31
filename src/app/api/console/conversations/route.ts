import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  // v3: console conversation list — GET console/conversations/
  const r = await djangoFetch(`/console/conversations/`);
  return djangoJson(r);
}
