import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";
import { getStreamingGovernance } from "@/mocks/streamingDb";

/**
 * Stream-guard halts, envelope downgrades and the approvals currently blocking
 * a live visitor.
 *
 * A rising guard-hit rate is a retrieval or prompt DRIFT signal, not noise —
 * which is why the rate is returned alongside the hits rather than left for a
 * caller to compute from a page of results.
 */
export async function GET() {
  if (!(await getSessionUser())) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (!siteConfig.useMocks) {
    return notImplementedOnBackend(
      "Stream-guard reporting",
      "GET cockpit/streaming/guard-hits/ (cockpit/streaming/ returns summary + recent)",
    );
  }

  return NextResponse.json(getStreamingGovernance());
}
