import { NextResponse } from "next/server";

import { siteConfig } from "@/config/site.config";
import { getSessionUser } from "@/lib/server/session";
import { notImplementedOnBackend } from "@/lib/server/proxy";
import { canAdminGovernance } from "@/constants/permissions";
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
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  if (!siteConfig.useMocks) {
    return notImplementedOnBackend(
      "Stream-guard reporting",
      "GET cockpit/streaming/guard-hits/ (cockpit/streaming/ returns summary + recent)",
    );
  }

  const data = getStreamingGovernance();

  /**
   * matchedText IS FILTERED BY ROLE HERE, NOT IN THE COMPONENT. Backend v7.0
   * §3.2: a non-elevated token never receives the field — server-side, not a
   * dashboard courtesy. The mock layer honours the same contract so a
   * non-elevated session in mock mode cannot see the wording in the network
   * tab that the UI declined to render. They still get `pattern`, which is
   * enough to understand the event without reproducing the claim.
   */
  if (!canAdminGovernance(user.role)) {
    return NextResponse.json({
      ...data,
      guardHits: data.guardHits.map((hit) => ({ ...hit, matchedText: null })),
    });
  }

  return NextResponse.json(data);
}
