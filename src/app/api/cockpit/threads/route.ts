import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

/**
 * Live conversation oversight — TEAM PLANE ONLY.
 *
 * Includes ANONYMOUS threads, which is the point: a conversation exists from
 * the visitor's first sentence, long before a Lead record does, and this is the
 * only place any human can see that happening (Surface 2 v5.0 §03).
 *
 * Everything this returns is internal — coverage counts, loop state, stop
 * reasons, scan verdicts, blocking approvals. None of it has a route to a
 * client-plane payload, and it must not acquire one.
 */
export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const sp = new URL(req.url).searchParams;

  const r = await djangoFetch(`/cockpit/threads/?${sp}`);
  return djangoJson(r);
}
