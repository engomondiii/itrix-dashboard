import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);

  // v3: pitch analytics — GET analytics/pitch/
  const r = await djangoFetch(`/analytics/pitch/?${searchParams}`);
  return djangoJson(r);
}
