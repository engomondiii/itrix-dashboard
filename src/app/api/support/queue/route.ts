import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { djangoFetch, djangoJson } from "@/lib/server/proxy";
import { listSupportRequests, supportQueueSummary } from "@/mocks/supportDb";

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

  if (!siteConfig.useMocks) {
    // v6: GET support/queue/
    const qs = clientId ? `?clientId=${encodeURIComponent(clientId)}` : "";
    const r = await djangoFetch(`/support/queue/${qs}`);
    return djangoJson(r);
  }

  const results = listSupportRequests(clientId);
  return NextResponse.json({
    results,
    count: results.length,
    summary: supportQueueSummary(),
  });
}
