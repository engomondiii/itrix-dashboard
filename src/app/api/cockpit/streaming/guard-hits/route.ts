import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

/**
 * Stream-guard halts, envelope downgrades and the approvals currently blocking
 * a live visitor.
 *
 * A rising guard-hit rate is a retrieval or prompt DRIFT signal, not noise —
 * which is why the rate is returned alongside the hits rather than left for a
 * caller to compute from a page of results.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const r = await djangoFetch("/cockpit/streaming/guard-hits/");
  return djangoJson(r);
}
