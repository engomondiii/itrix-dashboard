import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";

/**
 * The support queue.
 *
 * A BLOCKING REQUEST HERE HAS CONSEQUENCES ELSEWHERE. Step 1 of the
 * customer-first precedence rule is "blocking support issue open → support
 * action is primary", so an open blocking row suppresses every commercial
 * next-best-action for that customer until it clears. The summary is returned
 * alongside the rows so a caller does not have to recount it and risk
 * disagreeing.
 */
export async function GET(req: Request) {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const clientId = new URL(req.url).searchParams.get("clientId") ?? undefined;

  // The shipped backend mounts the team-plane queue under cockpit/ —
  // /cockpit/support/queue/ — not at the spec's /support/queue/. The shipped
  // name binds (the same rule Backend v7.2 §14 applies to client/auth/*).
  const qs = clientId ? `?clientId=${encodeURIComponent(clientId)}` : "";
  const r = await djangoFetch(`/cockpit/support/queue/${qs}`);
  return djangoJson(r);
}
